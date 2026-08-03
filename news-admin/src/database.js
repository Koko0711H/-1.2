import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

function parseJson(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function articleFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    language: row.language,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    bodyHtml: row.body_html,
    coverUrl: row.cover_url,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    tags: parseJson(row.tags_json, []),
    author: row.author,
    readingTime: row.reading_time,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    featured: Boolean(row.featured),
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function openDatabase(dataDir) {
  mkdirSync(dataDir, { recursive: true })
  const databasePath = join(dataDir, 'news.sqlite')
  mkdirSync(dirname(databasePath), { recursive: true })
  const db = new Database(databasePath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL DEFAULT 'zh',
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      body_html TEXT NOT NULL DEFAULT '',
      cover_url TEXT NOT NULL DEFAULT '',
      category_name TEXT NOT NULL DEFAULT '',
      category_slug TEXT NOT NULL DEFAULT '',
      tags_json TEXT NOT NULL DEFAULT '[]',
      author TEXT NOT NULL DEFAULT '',
      reading_time INTEGER NOT NULL DEFAULT 1,
      seo_title TEXT NOT NULL DEFAULT '',
      seo_description TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(slug, language)
    );

    CREATE INDEX IF NOT EXISTS idx_articles_public
      ON articles(status, language, published_at DESC);
  `)
  return db
}
