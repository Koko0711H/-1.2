const NEWS_API_URL = (import.meta.env.VITE_NEWS_API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')

function normalizeRelation(value) {
  return value?.data ?? value ?? null
}

function normalizeArticle(entry) {
  const fields = entry?.attributes ?? entry ?? {}
  const cover = normalizeRelation(fields.cover) ?? (fields.coverUrl ? { url: fields.coverUrl } : null)
  const category = normalizeRelation(fields.category) ?? (fields.categoryName ? {
    name: fields.categoryName,
    slug: fields.categorySlug,
  } : null)
  const tags = normalizeRelation(fields.tags)

  return {
    ...fields,
    id: entry?.documentId ?? entry?.id ?? fields.documentId ?? fields.id,
    documentId: entry?.documentId ?? fields.documentId,
    cover,
    category,
    tags: Array.isArray(tags) ? tags.map((tag) => typeof tag === 'string' ? { name: tag } : tag) : [],
  }
}

function createParams(language, slug) {
  const params = new URLSearchParams()
  params.set('language', language)
  if (slug) params.set('slug', slug)
  return params
}

async function request(path, params, signal) {
  const response = await fetch(`${NEWS_API_URL}${path}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`News API returned ${response.status}`)
  }

  return response.json()
}

export async function fetchArticles(language, signal) {
  const params = createParams(language)
  params.set('pageSize', '50')
  const articles = []
  let page = 1
  let pagination = null

  do {
    params.set('page', String(page))
    const payload = await request('/api/articles', params, signal)
    articles.push(...(payload.data ?? []).map(normalizeArticle))
    pagination = payload.meta?.pagination ?? null
    page += 1
  } while (pagination && page <= pagination.pageCount)

  return {
    articles,
    pagination,
  }
}

export async function fetchArticleBySlug(slug, language, signal) {
  const params = createParams(language, slug)
  const payload = await request('/api/articles', params, signal)
  const article = payload.data?.[0]
  return article ? normalizeArticle(article) : null
}

export function mediaUrl(media) {
  const rawUrl = media?.url ?? media?.attributes?.url
  if (!rawUrl) return ''
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl
  return `${NEWS_API_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`
}
