import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import archiver from 'archiver'

import { buildApp } from '../src/app.js'

function sessionCookie(response) {
  const header = response.headers['set-cookie']
  return String(Array.isArray(header) ? header[0] : header).split(';', 1)[0]
}

async function createTestApp(t, overrides = {}) {
  const dataDir = await mkdtemp(join(tmpdir(), 'flydeer-news-admin-'))
  const app = await buildApp({
    dataDir,
    logger: false,
    publicBaseUrl: 'http://127.0.0.1:3001',
    allowedOrigins: ['http://127.0.0.1:4173'],
    ...overrides,
  })

  t.after(async () => {
    await app.close()
    await rm(dataDir, { recursive: true, force: true })
  })

  return { app, dataDir }
}

async function setupAdmin(app) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/setup',
    payload: {
      email: 'editor@flydeer.local',
      password: 'StrongPass2026!',
    },
  })
  assert.equal(response.statusCode, 201)
  return sessionCookie(response)
}

async function createZip(entries) {
  return new Promise((resolve, reject) => {
    const chunks = []
    const archive = archiver('zip')
    archive.on('data', (chunk) => chunks.push(chunk))
    archive.on('error', reject)
    archive.on('end', () => resolve(Buffer.concat(chunks)))
    for (const [name, value] of entries) archive.append(value, { name })
    archive.finalize()
  })
}

test('setup, article draft and publish flow stays private until published', async (t) => {
  const { app } = await createTestApp(t)

  const initialStatus = await app.inject({ method: 'GET', url: '/api/setup/status' })
  assert.deepEqual(initialStatus.json(), { needsSetup: true })

  const weakPassword = await app.inject({
    method: 'POST',
    url: '/api/setup',
    payload: { email: 'editor@flydeer.local', password: '12345678' },
  })
  assert.equal(weakPassword.statusCode, 400)

  const cookie = await setupAdmin(app)

  const unauthorized = await app.inject({ method: 'GET', url: '/api/admin/articles' })
  assert.equal(unauthorized.statusCode, 401)

  const forbiddenOrigin = await app.inject({
    method: 'GET',
    url: '/api/admin/articles',
    headers: { cookie, origin: 'http://127.0.0.1:4173' },
  })
  assert.equal(forbiddenOrigin.statusCode, 403)

  const created = await app.inject({
    method: 'POST',
    url: '/api/admin/articles',
    headers: { cookie },
    payload: {
      language: 'zh',
      title: '柴油发电机组功率怎么选？',
      slug: 'how-to-size-a-diesel-generator',
      summary: '了解备用功率、常用功率、kW与kVA。',
      bodyHtml: '<h2>功率不是简单相加</h2><p>需要核对负载性质。</p><script>alert(1)</script>',
      categoryName: '发电机组基础知识',
      tags: ['功率选型', 'kVA'],
      author: '深柴能源技术团队',
      readingTime: 6,
      seoTitle: '柴油发电机组功率选型指南',
      seoDescription: '介绍柴油发电机组的功率选型方法。',
      featured: true,
    },
  })
  assert.equal(created.statusCode, 201)
  const article = created.json().data
  assert.equal(article.status, 'draft')
  assert.doesNotMatch(article.bodyHtml, /script/i)

  const publicDrafts = await app.inject({ method: 'GET', url: '/api/articles?language=zh' })
  assert.equal(publicDrafts.statusCode, 200)
  assert.equal(publicDrafts.json().data.length, 0)

  const published = await app.inject({
    method: 'POST',
    url: `/api/admin/articles/${article.id}/publish`,
    headers: { cookie },
  })
  assert.equal(published.statusCode, 200)
  assert.equal(published.json().data.status, 'published')

  const publicArticles = await app.inject({ method: 'GET', url: '/api/articles?language=zh' })
  assert.equal(publicArticles.statusCode, 200)
  assert.equal(publicArticles.json().data.length, 1)
  assert.equal(publicArticles.json().data[0].slug, article.slug)
  assert.equal(publicArticles.json().data[0].bodyHtml, undefined)

  const publicDetail = await app.inject({
    method: 'GET',
    url: `/api/articles?language=zh&slug=${article.slug}`,
  })
  assert.equal(publicDetail.json().data.length, 1)
  assert.match(publicDetail.json().data[0].bodyHtml, /功率不是简单相加/)

  const edited = await app.inject({
    method: 'PUT',
    url: `/api/admin/articles/${article.id}`,
    headers: { cookie },
    payload: { summary: 'Updated draft summary' },
  })
  assert.equal(edited.statusCode, 200)
  assert.equal(edited.json().data.status, 'draft')

  const publicAfterEdit = await app.inject({ method: 'GET', url: '/api/articles?language=zh' })
  assert.equal(publicAfterEdit.json().data.length, 0)
})

test('image upload validates the real file type and serves the stored image', async (t) => {
  const { app, dataDir } = await createTestApp(t)
  const cookie = await setupAdmin(app)
  const boundary = '----flydeer-test-boundary'
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  const payload = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="cover.png"\r\nContent-Type: image/png\r\n\r\n`),
    png,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ])

  const uploaded = await app.inject({
    method: 'POST',
    url: '/api/admin/uploads',
    headers: {
      cookie,
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
    payload,
  })
  assert.equal(uploaded.statusCode, 201)
  const upload = uploaded.json().data
  assert.match(upload.url, /^\/uploads\/[a-f0-9-]+\.png$/)
  assert.deepEqual(await readFile(join(dataDir, upload.url.replace(/^\//, ''))), png)

  const served = await app.inject({ method: 'GET', url: upload.url })
  assert.equal(served.statusCode, 200)
  assert.equal(served.headers['content-type'], 'image/png')
})

test('public article list exposes stable pagination', async (t) => {
  const { app } = await createTestApp(t)
  const cookie = await setupAdmin(app)
  for (let index = 1; index <= 3; index += 1) {
    const created = await app.inject({
      method: 'POST',
      url: '/api/admin/articles',
      headers: { cookie },
      payload: {
        language: 'zh',
        title: `分页测试文章 ${index}`,
        slug: `pagination-test-${index}`,
        bodyHtml: '<p>正文</p>',
      },
    })
    await app.inject({
      method: 'POST',
      url: `/api/admin/articles/${created.json().data.id}/publish`,
      headers: { cookie },
    })
  }

  const firstPage = await app.inject({ method: 'GET', url: '/api/articles?language=zh&page=1&pageSize=2' })
  assert.equal(firstPage.json().data.length, 2)
  assert.deepEqual(firstPage.json().meta.pagination, { page: 1, pageSize: 2, pageCount: 2, total: 3 })

  const secondPage = await app.inject({ method: 'GET', url: '/api/articles?language=zh&page=2&pageSize=2' })
  assert.equal(secondPage.json().data.length, 1)
})

test('backup export refuses data beyond the configured memory limit', async (t) => {
  const { app } = await createTestApp(t, { backupSizeLimit: 100 })
  const cookie = await setupAdmin(app)
  const backup = await app.inject({
    method: 'GET',
    url: '/api/admin/backup',
    headers: { cookie },
  })
  assert.equal(backup.statusCode, 413)
})

test('backup export can be restored into a fresh data directory', async (t) => {
  const source = await createTestApp(t)
  const sourceCookie = await setupAdmin(source.app)
  const created = await source.app.inject({
    method: 'POST',
    url: '/api/admin/articles',
    headers: { cookie: sourceCookie },
    payload: {
      language: 'zh',
      title: '备份测试文章',
      slug: 'backup-test-article',
      summary: '确认备份恢复可以保留文章。',
      bodyHtml: '<p>备份正文</p><img src="http://127.0.0.1:3001/uploads/legacy.png">',
      coverUrl: 'http://127.0.0.1:3001/uploads/legacy.png',
    },
  })
  assert.equal(created.statusCode, 201)

  const backup = await source.app.inject({
    method: 'GET',
    url: '/api/admin/backup',
    headers: { cookie: sourceCookie },
  })
  assert.equal(backup.statusCode, 200)
  assert.match(backup.headers['content-type'], /zip/)

  const target = await createTestApp(t, { publicBaseUrl: 'https://news.example.com' })
  const targetCookie = await setupAdmin(target.app)
  const boundary = '----flydeer-restore-boundary'
  const payload = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="backup.zip"\r\nContent-Type: application/zip\r\n\r\n`),
    backup.rawPayload,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ])

  const restored = await target.app.inject({
    method: 'POST',
    url: '/api/admin/restore',
    headers: {
      cookie: targetCookie,
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
    payload,
  })
  assert.equal(restored.statusCode, 200)
  assert.equal(restored.json().data.articles, 1)

  const articles = await target.app.inject({
    method: 'GET',
    url: '/api/admin/articles',
    headers: { cookie: targetCookie },
  })
  const restoredArticle = articles.json().data[0]
  assert.equal(restoredArticle.slug, 'backup-test-article')
  assert.match(restoredArticle.bodyHtml, /src="\/uploads\/legacy\.png"/)
  assert.equal(restoredArticle.coverUrl, '/uploads/legacy.png')

  await target.app.inject({
    method: 'POST',
    url: `/api/admin/articles/${restoredArticle.id}/publish`,
    headers: { cookie: targetCookie },
  })
  const publicDetail = await target.app.inject({
    method: 'GET',
    url: '/api/articles?language=zh&slug=backup-test-article',
  })
  assert.match(publicDetail.json().data[0].bodyHtml, /https:\/\/news\.example\.com\/uploads\/legacy\.png/)
  assert.equal(publicDetail.json().data[0].coverUrl, 'https://news.example.com/uploads/legacy.png')
})

test('restore rejects non-image files inside uploads', async (t) => {
  const { app } = await createTestApp(t)
  const cookie = await setupAdmin(app)
  const zip = await createZip([
    ['manifest.json', JSON.stringify({ version: 1, articles: [] })],
    ['uploads/payload.html', '<script>document.cookie</script>'],
  ])
  const boundary = '----flydeer-invalid-restore-boundary'
  const payload = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="backup.zip"\r\nContent-Type: application/zip\r\n\r\n`),
    zip,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ])

  const restored = await app.inject({
    method: 'POST',
    url: '/api/admin/restore',
    headers: {
      cookie,
      'content-type': `multipart/form-data; boundary=${boundary}`,
    },
    payload,
  })
  assert.equal(restored.statusCode, 400)
  assert.match(restored.json().error, /无效图片/)
})
