import sanitizeHtml from 'sanitize-html'

const allowedTags = [
  'p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'code', 'pre',
]

export function sanitizeArticleHtml(html) {
  return sanitizeHtml(String(html || ''), {
    allowedTags,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          ...(attribs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}),
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: 'img',
        attribs: { ...attribs, loading: 'lazy' },
      }),
    },
  })
}

export function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

export function normalizeTags(value) {
  const tags = Array.isArray(value)
    ? value
    : String(value || '').split(/[，,]/)
  return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 12)
}

export function stripHtml(value) {
  return sanitizeHtml(String(value || ''), { allowedTags: [], allowedAttributes: {} }).trim()
}
