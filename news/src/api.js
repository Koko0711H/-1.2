const NEWS_SOURCE = import.meta.env.VITE_NEWS_SOURCE || (import.meta.env.DEV ? 'api' : 'static')
const NEWS_API_URL = (import.meta.env.VITE_NEWS_API_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')
const STATIC_NEWS_URL = '/news-data/articles.json'

let staticNewsPromise

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

async function loadStaticNews(signal) {
  if (!staticNewsPromise) {
    staticNewsPromise = fetch(STATIC_NEWS_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    }).then((response) => {
      if (!response.ok) throw new Error(`Static news returned ${response.status}`)
      return response.json()
    }).catch((error) => {
      staticNewsPromise = null
      throw error
    })
  }
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  const payload = await staticNewsPromise
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  return payload
}

export async function fetchArticles(language, signal) {
  if (NEWS_SOURCE === 'static') {
    const payload = await loadStaticNews(signal)
    const articles = (payload.data ?? [])
      .filter((article) => article.language === language)
      .map(normalizeArticle)
    return {
      articles,
      pagination: { page: 1, pageSize: articles.length, pageCount: articles.length ? 1 : 0, total: articles.length },
    }
  }

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
  if (NEWS_SOURCE === 'static') {
    const payload = await loadStaticNews(signal)
    const article = (payload.data ?? []).find((entry) => entry.language === language && entry.slug === slug)
    return article ? normalizeArticle(article) : null
  }

  const params = createParams(language, slug)
  const payload = await request('/api/articles', params, signal)
  const article = payload.data?.[0]
  return article ? normalizeArticle(article) : null
}

export function mediaUrl(media) {
  const rawUrl = media?.url ?? media?.attributes?.url
  if (!rawUrl) return ''
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl
  if (NEWS_SOURCE === 'static') return rawUrl
  return `${NEWS_API_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`
}
