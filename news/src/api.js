const STRAPI_URL = (import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '')

function normalizeRelation(value) {
  return value?.data ?? value ?? null
}

function normalizeArticle(entry) {
  const fields = entry?.attributes ?? entry ?? {}
  const cover = normalizeRelation(fields.cover)
  const category = normalizeRelation(fields.category)
  const tags = normalizeRelation(fields.tags)

  return {
    ...fields,
    id: entry?.documentId ?? entry?.id ?? fields.documentId ?? fields.id,
    documentId: entry?.documentId ?? fields.documentId,
    cover,
    category,
    tags: Array.isArray(tags) ? tags : [],
  }
}

function createParams(language) {
  const params = new URLSearchParams()
  params.set('locale', language)
  params.set('status', 'published')
  params.set('populate[cover]', 'true')
  params.set('populate[category]', 'true')
  params.set('populate[tags]', 'true')
  return params
}

async function request(path, params, signal) {
  const response = await fetch(`${STRAPI_URL}${path}?${params.toString()}`, {
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
  params.set('sort[0]', 'featured:desc')
  params.set('sort[1]', 'publishedAt:desc')
  params.set('pagination[pageSize]', '50')
  const payload = await request('/api/articles', params, signal)

  return {
    articles: (payload.data ?? []).map(normalizeArticle),
    pagination: payload.meta?.pagination ?? null,
  }
}

export async function fetchArticleBySlug(slug, language, signal) {
  const params = createParams(language)
  params.set('filters[slug][$eq]', slug)
  params.set('pagination[pageSize]', '1')
  const payload = await request('/api/articles', params, signal)
  const article = payload.data?.[0]
  return article ? normalizeArticle(article) : null
}

export function mediaUrl(media) {
  const rawUrl = media?.url ?? media?.attributes?.url
  if (!rawUrl) return ''
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl
  return `${STRAPI_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`
}
