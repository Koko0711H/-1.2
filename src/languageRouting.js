const SUPPORTED_LANGUAGES = new Set(['zh', 'en'])
const LANGUAGE_STORAGE_KEY = 'flydeer-language'

export function normalizeLanguage(value, fallback = 'en') {
  return SUPPORTED_LANGUAGES.has(value) ? value : fallback
}

export function getInitialLanguage(fallback = 'en') {
  if (typeof window === 'undefined') return fallback

  const queryLanguage = new URLSearchParams(window.location.search).get('lang')
  if (SUPPORTED_LANGUAGES.has(queryLanguage)) return queryLanguage

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (SUPPORTED_LANGUAGES.has(storedLanguage)) return storedLanguage
  } catch {
    // Language still works when storage is unavailable.
  }

  return fallback
}

export function syncLanguageToUrl(language) {
  if (typeof window === 'undefined') return

  const normalizedLanguage = normalizeLanguage(language)
  document.documentElement.lang = normalizedLanguage === 'zh' ? 'zh-CN' : 'en'

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage)
  } catch {
    // URL propagation remains available when storage is unavailable.
  }

  const currentUrl = new URL(window.location.href)
  if (currentUrl.searchParams.get('lang') === normalizedLanguage) return

  currentUrl.searchParams.set('lang', normalizedLanguage)
  window.history.replaceState(
    window.history.state,
    '',
    `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`,
  )
}

export function withLanguage(url, language) {
  if (!url || url.startsWith('#') || typeof window === 'undefined') return url

  const targetUrl = new URL(url, window.location.href)
  if (!['http:', 'https:'].includes(targetUrl.protocol)) return url

  targetUrl.searchParams.set('lang', normalizeLanguage(language))
  return targetUrl.href
}

