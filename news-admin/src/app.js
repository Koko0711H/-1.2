import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import fastifyStatic from '@fastify/static'
import archiver from 'archiver'
import { fileTypeFromBuffer } from 'file-type'
import { constants as fsConstants } from 'node:fs'
import { copyFile, mkdir, mkdtemp, readdir, rm, stat, unlink, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import unzipper from 'unzipper'

import { loadConfig } from './config.js'
import { articleFromRow, openDatabase } from './database.js'
import { normalizeSlug, normalizeTags, sanitizeArticleHtml, stripHtml } from './content.js'
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  validatePassword,
  verifyPassword,
} from './security.js'

const SESSION_COOKIE = 'flydeer_admin_session'
const IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

function nowIso() {
  return new Date().toISOString()
}

function cleanText(value, max = 500) {
  return stripHtml(value).slice(0, max)
}

function publicUrl(value, baseUrl) {
  if (!value || /^https?:\/\//i.test(value)) return value || ''
  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`
}

function publicBody(value, baseUrl) {
  return String(value || '').replace(
    /(src=["'])\/uploads\//gi,
    `$1${baseUrl}/uploads/`,
  )
}

function toPublicArticle(article, baseUrl, includeBody = true) {
  const publicArticle = {
    ...article,
    coverUrl: publicUrl(article.coverUrl, baseUrl),
  }
  if (includeBody) publicArticle.bodyHtml = publicBody(article.bodyHtml, baseUrl)
  else delete publicArticle.bodyHtml
  return publicArticle
}

function articleInput(payload, existing = {}) {
  const language = payload.language ?? existing.language ?? 'zh'
  const title = cleanText(payload.title ?? existing.title, 160)
  const slug = normalizeSlug(payload.slug ?? existing.slug ?? title)
  if (!['zh', 'en'].includes(language)) throw new Error('语言只能选择中文或英文')
  if (!title) throw new Error('请输入文章标题')
  if (!slug) throw new Error('请输入有效的文章链接标识')

  const categoryName = cleanText(payload.categoryName ?? existing.categoryName, 80)
  return {
    language,
    title,
    slug,
    summary: cleanText(payload.summary ?? existing.summary, 500),
    bodyHtml: sanitizeArticleHtml(payload.bodyHtml ?? existing.bodyHtml),
    coverUrl: String(payload.coverUrl ?? existing.coverUrl ?? '').trim().slice(0, 1000),
    categoryName,
    categorySlug: normalizeSlug(payload.categorySlug ?? existing.categorySlug ?? categoryName),
    tags: normalizeTags(payload.tags ?? existing.tags),
    author: cleanText(payload.author ?? existing.author, 80),
    readingTime: Math.max(1, Math.min(120, Number(payload.readingTime ?? existing.readingTime ?? 1) || 1)),
    seoTitle: cleanText(payload.seoTitle ?? existing.seoTitle, 180),
    seoDescription: cleanText(payload.seoDescription ?? existing.seoDescription, 320),
    featured: Boolean(payload.featured ?? existing.featured),
  }
}

function articleValues(article, timestamp) {
  return {
    ...article,
    tagsJson: JSON.stringify(article.tags),
    featuredNumber: article.featured ? 1 : 0,
    timestamp,
  }
}

async function directoryStats(directory) {
  let bytes = 0
  let files = 0
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      const child = await directoryStats(path)
      bytes += child.bytes
      files += child.files
    } else if (entry.isFile()) {
      bytes += (await stat(path)).size
      files += 1
    }
  }
  return { bytes, files }
}

async function archiveBuffer(dataDir, articles, sourceBaseUrl, maximumBytes) {
  const manifest = Buffer.from(JSON.stringify({
    version: 1,
    exportedAt: nowIso(),
    sourceBaseUrl,
    articles,
  }, null, 2))
  const uploads = await directoryStats(join(dataDir, 'uploads'))
  if (manifest.length + uploads.bytes + uploads.files * 512 > maximumBytes) {
    const error = new Error('新闻数据超过单次备份容量限制')
    error.code = 'BACKUP_TOO_LARGE'
    throw error
  }
  return new Promise((resolvePromise, reject) => {
    const chunks = []
    const archive = archiver('zip', { zlib: { level: 9 } })
    archive.on('data', (chunk) => chunks.push(chunk))
    archive.on('warning', reject)
    archive.on('error', reject)
    archive.on('end', () => resolvePromise(Buffer.concat(chunks)))
    archive.append(manifest, { name: 'manifest.json' })
    archive.directory(join(dataDir, 'uploads'), 'uploads')
    archive.finalize()
  })
}

function safeUploadPath(dataDir, entryPath) {
  const normalized = String(entryPath).replace(/\\/g, '/')
  if (!normalized.startsWith('uploads/') || normalized.includes('../')) return null
  const target = resolve(dataDir, normalized)
  const root = `${resolve(dataDir)}${sep}`
  return target.startsWith(root) ? target : null
}

async function readEntryWithLimit(entry, maximumBytes) {
  const declaredSize = Number(entry.uncompressedSize ?? entry.vars?.uncompressedSize ?? 0)
  if (declaredSize > maximumBytes) throw new Error('备份解压后的内容超过限制')
  const stream = entry.stream()
  const chunks = []
  let total = 0
  for await (const chunk of stream) {
    total += chunk.length
    if (total > maximumBytes) {
      stream.destroy()
      throw new Error('备份解压后的内容超过限制')
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function buildApp(overrides = {}) {
  const config = loadConfig(overrides)
  const uploadsDir = join(config.dataDir, 'uploads')
  const adminDir = fileURLToPath(new URL('../admin', import.meta.url))
  await mkdir(uploadsDir, { recursive: true })

  const db = openDatabase(config.dataDir)
  const adminOrigin = new URL(config.publicBaseUrl).origin
  const app = Fastify({
    logger: config.logger,
    trustProxy: config.trustProxy,
    bodyLimit: 2 * 1024 * 1024,
  })

  await app.register(cookie)
  await app.register(cors, {
    credentials: false,
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true)
      return callback(null, false)
    },
  })
  await app.register(rateLimit, { global: false })
  await app.register(multipart, {
    limits: { fileSize: config.restoreSizeLimit, files: 1 },
  })
  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
  })
  await app.register(fastifyStatic, {
    root: adminDir,
    prefix: '/admin/',
    decorateReply: false,
  })

  app.addHook('onClose', async () => db.close())

  app.addHook('preHandler', async (request, reply) => {
    const path = request.url.split('?', 1)[0]
    const isAdminRequest = path.startsWith('/api/admin/')
      || path === '/api/setup'
      || path.startsWith('/api/auth/')
    if (!isAdminRequest) return
    const origin = request.headers.origin
    if (origin && origin !== adminOrigin) {
      return reply.code(403).send({ error: '后台操作只允许从管理页面发起' })
    }
  })

  const createSession = (reply, adminId) => {
    const token = createSessionToken()
    const createdAt = nowIso()
    const expiresAt = new Date(Date.now() + config.sessionDays * 86400000).toISOString()
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(createdAt)
    db.prepare(`
      INSERT INTO sessions (token_hash, admin_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(hashSessionToken(token), adminId, expiresAt, createdAt)
    reply.setCookie(SESSION_COOKIE, token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: config.cookieSecure,
      maxAge: config.sessionDays * 86400,
    })
  }

  const authenticate = async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE]
    if (!token) return reply.code(401).send({ error: '请先登录' })
    const row = db.prepare(`
      SELECT admins.id, admins.email
      FROM sessions
      JOIN admins ON admins.id = sessions.admin_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?
    `).get(hashSessionToken(token), nowIso())
    if (!row) {
      reply.clearCookie(SESSION_COOKIE, { path: '/' })
      return reply.code(401).send({ error: '登录已失效，请重新登录' })
    }
    request.admin = row
  }

  const allArticleRows = () => db.prepare('SELECT * FROM articles ORDER BY updated_at DESC').all()

  app.get('/health', async () => ({ ok: true, service: 'flydeer-news-admin' }))
  app.get('/api/public-config', async () => ({ sitePreviewUrl: config.sitePreviewUrl }))
  app.get('/admin', async (_request, reply) => reply.redirect('/admin/'))

  app.get('/api/setup/status', async () => ({
    needsSetup: !db.prepare('SELECT 1 FROM admins LIMIT 1').get(),
  }))

  app.post('/api/setup', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    if (db.prepare('SELECT 1 FROM admins LIMIT 1').get()) {
      return reply.code(409).send({ error: '后台已经完成初始化' })
    }
    const email = String(request.body?.email || '').trim().toLowerCase()
    const password = request.body?.password
    if (!/^\S+@\S+\.\S+$/.test(email)) return reply.code(400).send({ error: '请输入有效邮箱' })
    if (!validatePassword(password)) {
      return reply.code(400).send({ error: '密码至少 10 位，并包含大写字母、小写字母和数字' })
    }
    const result = db.prepare(`
      INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)
    `).run(email, hashPassword(password), nowIso())
    createSession(reply, Number(result.lastInsertRowid))
    return reply.code(201).send({ data: { email } })
  })

  app.post('/api/auth/login', {
    config: { rateLimit: { max: 8, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const email = String(request.body?.email || '').trim().toLowerCase()
    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email)
    if (!admin || !verifyPassword(request.body?.password, admin.password_hash)) {
      return reply.code(401).send({ error: '邮箱或密码不正确' })
    }
    createSession(reply, admin.id)
    return { data: { email: admin.email } }
  })

  app.post('/api/auth/logout', { preHandler: authenticate }, async (request, reply) => {
    const token = request.cookies[SESSION_COOKIE]
    if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashSessionToken(token))
    reply.clearCookie(SESSION_COOKIE, { path: '/' })
    return { ok: true }
  })

  app.get('/api/auth/me', { preHandler: authenticate }, async (request) => ({ data: request.admin }))

  app.get('/api/articles', async (request) => {
    const language = ['zh', 'en'].includes(request.query?.language) ? request.query.language : 'zh'
    const slug = normalizeSlug(request.query?.slug)
    const page = Math.max(1, Number(request.query?.page) || 1)
    const pageSize = Math.max(1, Math.min(50, Number(request.query?.pageSize) || 20))
    const total = slug
      ? 1
      : db.prepare(`
          SELECT COUNT(*) AS count FROM articles
          WHERE status = 'published' AND language = ?
        `).get(language).count
    const rows = slug
      ? db.prepare(`
          SELECT * FROM articles
          WHERE status = 'published' AND language = ? AND slug = ?
          ORDER BY published_at DESC
        `).all(language, slug)
      : db.prepare(`
          SELECT * FROM articles
          WHERE status = 'published' AND language = ?
          ORDER BY featured DESC, published_at DESC, updated_at DESC
          LIMIT ? OFFSET ?
        `).all(language, pageSize, (page - 1) * pageSize)
    return {
      data: rows
        .map(articleFromRow)
        .map((article) => toPublicArticle(article, config.publicBaseUrl, Boolean(slug))),
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: slug ? (rows.length ? 1 : 0) : Math.ceil(total / pageSize),
          total: slug ? rows.length : total,
        },
      },
    }
  })

  app.get('/api/admin/articles', { preHandler: authenticate }, async () => ({
    data: allArticleRows().map(articleFromRow),
  }))

  app.get('/api/admin/articles/:id', { preHandler: authenticate }, async (request, reply) => {
    const article = articleFromRow(db.prepare('SELECT * FROM articles WHERE id = ?').get(request.params.id))
    if (!article) return reply.code(404).send({ error: '文章不存在' })
    return { data: article }
  })

  app.post('/api/admin/articles', { preHandler: authenticate }, async (request, reply) => {
    try {
      const article = articleInput(request.body || {})
      const values = articleValues(article, nowIso())
      const result = db.prepare(`
        INSERT INTO articles (
          language, title, slug, summary, body_html, cover_url,
          category_name, category_slug, tags_json, author, reading_time,
          seo_title, seo_description, featured, status, created_at, updated_at
        ) VALUES (
          @language, @title, @slug, @summary, @bodyHtml, @coverUrl,
          @categoryName, @categorySlug, @tagsJson, @author, @readingTime,
          @seoTitle, @seoDescription, @featuredNumber, 'draft', @timestamp, @timestamp
        )
      `).run(values)
      const created = articleFromRow(db.prepare('SELECT * FROM articles WHERE id = ?').get(result.lastInsertRowid))
      return reply.code(201).send({ data: created })
    } catch (error) {
      const message = String(error.message || '')
      if (message.includes('UNIQUE constraint')) return reply.code(409).send({ error: '该链接标识已被使用' })
      return reply.code(400).send({ error: message || '文章保存失败' })
    }
  })

  app.put('/api/admin/articles/:id', { preHandler: authenticate }, async (request, reply) => {
    const existing = articleFromRow(db.prepare('SELECT * FROM articles WHERE id = ?').get(request.params.id))
    if (!existing) return reply.code(404).send({ error: '文章不存在' })
    try {
      const values = { ...articleValues(articleInput(request.body || {}, existing), nowIso()), id: existing.id }
      db.prepare(`
        UPDATE articles SET
          language = @language, title = @title, slug = @slug, summary = @summary,
          body_html = @bodyHtml, cover_url = @coverUrl, category_name = @categoryName,
          category_slug = @categorySlug, tags_json = @tagsJson, author = @author,
          reading_time = @readingTime, seo_title = @seoTitle,
          seo_description = @seoDescription, featured = @featuredNumber,
          status = 'draft', updated_at = @timestamp
        WHERE id = @id
      `).run(values)
      return { data: articleFromRow(db.prepare('SELECT * FROM articles WHERE id = ?').get(existing.id)) }
    } catch (error) {
      const message = String(error.message || '')
      if (message.includes('UNIQUE constraint')) return reply.code(409).send({ error: '该链接标识已被使用' })
      return reply.code(400).send({ error: message || '文章保存失败' })
    }
  })

  app.delete('/api/admin/articles/:id', { preHandler: authenticate }, async (request, reply) => {
    const result = db.prepare('DELETE FROM articles WHERE id = ?').run(request.params.id)
    if (!result.changes) return reply.code(404).send({ error: '文章不存在' })
    return reply.code(204).send()
  })

  app.post('/api/admin/articles/:id/publish', { preHandler: authenticate }, async (request, reply) => {
    const timestamp = nowIso()
    const result = db.prepare(`
      UPDATE articles
      SET status = 'published', published_at = COALESCE(published_at, ?), updated_at = ?
      WHERE id = ?
    `).run(timestamp, timestamp, request.params.id)
    if (!result.changes) return reply.code(404).send({ error: '文章不存在' })
    return { data: articleFromRow(db.prepare('SELECT * FROM articles WHERE id = ?').get(request.params.id)) }
  })

  app.post('/api/admin/articles/:id/unpublish', { preHandler: authenticate }, async (request, reply) => {
    const result = db.prepare(`
      UPDATE articles SET status = 'draft', updated_at = ? WHERE id = ?
    `).run(nowIso(), request.params.id)
    if (!result.changes) return reply.code(404).send({ error: '文章不存在' })
    return { data: articleFromRow(db.prepare('SELECT * FROM articles WHERE id = ?').get(request.params.id)) }
  })

  app.post('/api/admin/uploads', {
    preHandler: authenticate,
    bodyLimit: config.uploadSizeLimit + 1024 * 1024,
  }, async (request, reply) => {
    try {
      const part = await request.file({ limits: { fileSize: config.uploadSizeLimit } })
      if (!part) return reply.code(400).send({ error: '请选择图片文件' })
      const buffer = await part.toBuffer()
      const detected = await fileTypeFromBuffer(buffer)
      const extension = detected && IMAGE_TYPES.get(detected.mime)
      if (!extension) return reply.code(400).send({ error: '仅支持 JPG、PNG、WebP 或 GIF 图片' })
      const filename = `${randomUUID()}.${extension}`
      await writeFile(join(uploadsDir, filename), buffer, { flag: 'wx' })
      return reply.code(201).send({
        data: {
          url: `/uploads/${filename}`,
          absoluteUrl: `${config.publicBaseUrl}/uploads/${filename}`,
          filename: basename(part.filename || filename),
          size: buffer.length,
        },
      })
    } catch (error) {
      if (error?.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.code(413).send({ error: '图片超过上传大小限制' })
      }
      throw error
    }
  })

  app.get('/api/admin/backup', { preHandler: authenticate }, async (_request, reply) => {
    const articles = allArticleRows().map(articleFromRow)
    let zip
    try {
      zip = await archiveBuffer(config.dataDir, articles, config.publicBaseUrl, config.backupSizeLimit)
    } catch (error) {
      if (error.code === 'BACKUP_TOO_LARGE') return reply.code(413).send({ error: error.message })
      throw error
    }
    const date = new Date().toISOString().slice(0, 10)
    reply
      .type('application/zip')
      .header('content-disposition', `attachment; filename="flydeer-news-${date}.zip"`)
    return reply.send(zip)
  })

  app.post('/api/admin/restore', {
    preHandler: authenticate,
    bodyLimit: config.restoreSizeLimit + 1024 * 1024,
  }, async (request, reply) => {
    const part = await request.file({ limits: { fileSize: config.restoreSizeLimit } })
    if (!part) return reply.code(400).send({ error: '请选择备份文件' })
    const archive = await unzipper.Open.buffer(await part.toBuffer())
    if (archive.files.length > 5000) return reply.code(400).send({ error: '备份文件条目过多' })
    const manifestEntry = archive.files.find((entry) => entry.path === 'manifest.json' && entry.type === 'File')
    if (!manifestEntry) return reply.code(400).send({ error: '备份文件缺少 manifest.json' })
    let manifest
    try {
      manifest = JSON.parse((await readEntryWithLimit(manifestEntry, 5 * 1024 * 1024)).toString('utf8'))
    } catch {
      return reply.code(400).send({ error: '备份清单格式不正确' })
    }
    if (manifest.version !== 1 || !Array.isArray(manifest.articles)) {
      return reply.code(400).send({ error: '不支持的备份版本' })
    }

    let cleanArticles
    try {
      cleanArticles = manifest.articles.map((source) => {
        const sourceBaseUrl = String(manifest.sourceBaseUrl || '').replace(/\/$/, '')
        const bodyHtml = sourceBaseUrl
          ? String(source.bodyHtml || '').replaceAll(`${sourceBaseUrl}/uploads/`, '/uploads/')
          : source.bodyHtml
        const coverUrl = sourceBaseUrl && String(source.coverUrl || '').startsWith(`${sourceBaseUrl}/uploads/`)
          ? String(source.coverUrl).slice(sourceBaseUrl.length)
          : source.coverUrl
        return { source, clean: articleInput({ ...source, bodyHtml, coverUrl }) }
      })
    } catch (error) {
      return reply.code(400).send({ error: `备份文章无效：${error.message}` })
    }

    const stagingDir = await mkdtemp(join(config.dataDir, '.restore-'))
    let restoredImages = 0
    let restoredBytes = 0
    const validatedFiles = []
    try {
      for (const entry of archive.files) {
        if (entry.type !== 'File' || !entry.path.startsWith('uploads/')) continue
        const target = safeUploadPath(config.dataDir, entry.path)
        if (!target) {
          const error = new Error('备份文件包含不安全路径')
          error.statusCode = 400
          throw error
        }
        const buffer = await readEntryWithLimit(entry, config.restoreSizeLimit - restoredBytes)
        restoredBytes += buffer.length
        const detected = await fileTypeFromBuffer(buffer)
        const expectedExtension = detected && IMAGE_TYPES.get(detected.mime)
        const actualExtension = extname(entry.path).slice(1).toLowerCase()
        if (!expectedExtension || actualExtension !== expectedExtension) {
          const error = new Error(`备份包含无效图片：${basename(entry.path)}`)
          error.statusCode = 400
          throw error
        }
        const stagedPath = join(stagingDir, basename(entry.path))
        await writeFile(stagedPath, buffer, { flag: 'wx' })
        validatedFiles.push({ target, stagedPath })
      }
    } catch (error) {
      await rm(stagingDir, { recursive: true, force: true })
      if (error.message.includes('超过限制')) return reply.code(413).send({ error: error.message })
      if (error.statusCode === 400) return reply.code(400).send({ error: error.message })
      throw error
    }

    const upsert = db.prepare(`
      INSERT INTO articles (
        language, title, slug, summary, body_html, cover_url,
        category_name, category_slug, tags_json, author, reading_time,
        seo_title, seo_description, featured, status, published_at, created_at, updated_at
      ) VALUES (
        @language, @title, @slug, @summary, @bodyHtml, @coverUrl,
        @categoryName, @categorySlug, @tagsJson, @author, @readingTime,
        @seoTitle, @seoDescription, @featuredNumber, @status, @publishedAt, @createdAt, @updatedAt
      )
      ON CONFLICT(slug, language) DO UPDATE SET
        title = excluded.title, summary = excluded.summary, body_html = excluded.body_html,
        cover_url = excluded.cover_url, category_name = excluded.category_name,
        category_slug = excluded.category_slug, tags_json = excluded.tags_json,
        author = excluded.author, reading_time = excluded.reading_time,
        seo_title = excluded.seo_title, seo_description = excluded.seo_description,
        featured = excluded.featured, status = excluded.status,
        published_at = excluded.published_at, updated_at = excluded.updated_at
    `)
    const restoreArticles = db.transaction((articles) => {
      for (const { source, clean } of articles) {
        const timestamp = nowIso()
        upsert.run({
          ...articleValues(clean, timestamp),
          status: source.status === 'published' ? 'published' : 'draft',
          publishedAt: source.status === 'published' ? (source.publishedAt || timestamp) : null,
          createdAt: source.createdAt || timestamp,
          updatedAt: source.updatedAt || timestamp,
        })
      }
    })
    const createdTargets = []
    try {
      for (const file of validatedFiles) {
        await mkdir(dirname(file.target), { recursive: true })
        try {
          await copyFile(file.stagedPath, file.target, fsConstants.COPYFILE_EXCL)
          createdTargets.push(file.target)
        } catch (error) {
          if (error.code !== 'EEXIST') throw error
        }
        restoredImages += 1
      }
      restoreArticles(cleanArticles)
      return { data: { articles: manifest.articles.length, images: restoredImages } }
    } catch (error) {
      await Promise.all(createdTargets.map((target) => unlink(target).catch(() => {})))
      throw error
    } finally {
      await rm(stagingDir, { recursive: true, force: true })
    }
  })

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error)
    if (error?.code === 'FST_REQ_FILE_TOO_LARGE') {
      return reply.code(413).send({ error: '文件超过允许大小' })
    }
    if (error instanceof SyntaxError) return reply.code(400).send({ error: '请求内容格式不正确' })
    return reply.code(error.statusCode || 500).send({ error: error.statusCode ? error.message : '服务器暂时无法处理请求' })
  })

  return app
}
