import { copyFile, mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'

const STATIC_MEDIA_PREFIX = '/news-data/uploads/'

function validRelativeUploadPath(value) {
  let decoded
  try {
    decoded = decodeURIComponent(String(value || '')).replace(/\\/g, '/')
  } catch {
    return null
  }
  const segments = decoded.split('/')
  if (!decoded || segments.some((segment) => !segment || segment === '.' || segment === '..')) return null
  return decoded
}

function localUploadPath(value, publicBaseUrl) {
  const raw = String(value || '').trim()
  if (!raw) return null
  let pathname
  if (raw.startsWith('/uploads/')) {
    pathname = raw
  } else {
    try {
      const url = new URL(raw)
      const base = new URL(publicBaseUrl)
      if (url.origin !== base.origin) return null
      pathname = url.pathname
    } catch {
      return null
    }
  }
  if (!pathname.startsWith('/uploads/')) return null
  return validRelativeUploadPath(pathname.slice('/uploads/'.length))
}

function staticMediaUrl(relativePath) {
  return `${STATIC_MEDIA_PREFIX}${relativePath.split('/').map(encodeURIComponent).join('/')}`
}

function rewriteMediaUrl(value, publicBaseUrl, referencedImages) {
  const uploadPath = localUploadPath(value, publicBaseUrl)
  if (!uploadPath) return value
  referencedImages.add(uploadPath)
  return staticMediaUrl(uploadPath)
}

function rewriteArticle(article, publicBaseUrl, referencedImages) {
  const bodyHtml = String(article.bodyHtml || '').replace(
    /(src\s*=\s*)(["'])([^"']+)\2/gi,
    (match, prefix, quote, url) => `${prefix}${quote}${rewriteMediaUrl(url, publicBaseUrl, referencedImages)}${quote}`,
  )
  return {
    ...article,
    coverUrl: rewriteMediaUrl(article.coverUrl, publicBaseUrl, referencedImages),
    bodyHtml,
  }
}

function safeSourcePath(uploadsDir, relativePath) {
  const root = `${resolve(uploadsDir)}${sep}`
  const source = resolve(uploadsDir, relativePath)
  if (!source.startsWith(root)) throw new Error('静态发布发现不安全的图片路径')
  return source
}

async function replaceDirectory(stagingDir, outputDir) {
  const previousDir = `${outputDir}.previous-${randomUUID()}`
  let previousExists = false
  try {
    try {
      await rename(outputDir, previousDir)
      previousExists = true
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    await rename(stagingDir, outputDir)
  } catch (error) {
    if (previousExists) {
      await rm(outputDir, { recursive: true, force: true }).catch(() => {})
      await rename(previousDir, outputDir).catch(() => {})
    }
    await rm(stagingDir, { recursive: true, force: true }).catch(() => {})
    throw error
  }
  if (previousExists) await rm(previousDir, { recursive: true, force: true }).catch(() => {})
}

export async function exportStaticNews({ articles, uploadsDir, outputDir, publicBaseUrl }) {
  const referencedImages = new Set()
  const exportedArticles = articles.map((article) => rewriteArticle(article, publicBaseUrl, referencedImages))
  const parentDir = dirname(outputDir)
  await mkdir(parentDir, { recursive: true })
  const stagingDir = await mkdtemp(join(parentDir, '.news-data-staging-'))

  try {
    const exportUploadsDir = join(stagingDir, 'uploads')
    await mkdir(exportUploadsDir, { recursive: true })
    for (const imagePath of referencedImages) {
      const source = safeSourcePath(uploadsDir, imagePath)
      const destination = resolve(exportUploadsDir, imagePath)
      const relativeDestination = relative(exportUploadsDir, destination)
      if (relativeDestination.startsWith('..') || resolve(destination) === resolve(exportUploadsDir)) {
        throw new Error('静态发布发现不安全的目标路径')
      }
      await mkdir(dirname(destination), { recursive: true })
      try {
        await copyFile(source, destination)
      } catch (error) {
        if (error.code === 'ENOENT') {
          const missing = new Error(`文章引用的图片不存在：${imagePath}`)
          missing.code = 'STATIC_IMAGE_MISSING'
          throw missing
        }
        throw error
      }
    }

    await writeFile(join(stagingDir, 'articles.json'), `${JSON.stringify({
      version: 1,
      generatedAt: new Date().toISOString(),
      data: exportedArticles,
    }, null, 2)}\n`, 'utf8')
    await replaceDirectory(stagingDir, outputDir)
  } catch (error) {
    await rm(stagingDir, { recursive: true, force: true }).catch(() => {})
    throw error
  }

  return {
    articles: exportedArticles.length,
    images: referencedImages.size,
    path: 'public/news-data',
  }
}
