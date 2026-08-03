import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const newsAdminRoot = fileURLToPath(new URL('..', import.meta.url))

function csv(value, fallback) {
  return String(value || fallback)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function loadConfig(overrides = {}) {
  const dataDir = resolve(overrides.dataDir || process.env.DATA_DIR || '.data')
  const port = Number(overrides.port || process.env.PORT || 3001)
  const host = overrides.host || process.env.HOST || '127.0.0.1'
  const trustProxyValue = overrides.trustProxy ?? process.env.TRUST_PROXY ?? false
  const staticExportDir = overrides.staticExportDir || resolve(newsAdminRoot, '../public/news-data')
  return {
    host,
    port,
    dataDir,
    staticExportDir,
    logger: overrides.logger ?? true,
    trustProxy: trustProxyValue === 'true' ? true : trustProxyValue === 'false' ? false : trustProxyValue,
    publicBaseUrl: String(overrides.publicBaseUrl || process.env.PUBLIC_BASE_URL || `http://${host}:${port}`).replace(/\/$/, ''),
    sitePreviewUrl: String(overrides.sitePreviewUrl || process.env.SITE_PREVIEW_URL || 'http://127.0.0.1:4173/news/'),
    allowedOrigins: overrides.allowedOrigins || csv(
      process.env.SITE_ORIGINS,
      'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173',
    ),
    sessionDays: Number(overrides.sessionDays || process.env.SESSION_DAYS || 7),
    cookieSecure: overrides.cookieSecure ?? process.env.COOKIE_SECURE === 'true',
    uploadSizeLimit: Number(overrides.uploadSizeLimit || process.env.UPLOAD_SIZE_LIMIT || 10 * 1024 * 1024),
    backupSizeLimit: Number(overrides.backupSizeLimit || process.env.BACKUP_SIZE_LIMIT || 250 * 1024 * 1024),
    restoreSizeLimit: Number(overrides.restoreSizeLimit || process.env.RESTORE_SIZE_LIMIT || 250 * 1024 * 1024),
  }
}
