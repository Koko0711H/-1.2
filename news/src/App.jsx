import { useEffect, useMemo, useState } from 'react'
import BrandLogo from '../../src/components/BrandLogo'
import { getInitialLanguage, syncLanguageToUrl, withLanguage } from '../../src/languageRouting'
import { fetchArticleBySlug, fetchArticles, mediaUrl } from './api'

const copy = {
  zh: {
    home: '首页',
    products: '产品中心',
    showroom: '网上展厅',
    about: '关于我们',
    cases: '项目案例',
    news: '新闻动态',
    service: '销售与服务',
    menuOpen: '打开导航菜单',
    menuClose: '关闭导航菜单',
    heroKicker: 'FLYDEER POWER / KNOWLEDGE SYSTEM',
    heroTitle: '动力知识，\n服务每一次可靠运行',
    heroBody: '从机组原理、功率选型到维护保养，以清晰、可验证的技术内容帮助项目作出稳妥判断。',
    heroStatus: '知识库持续更新',
    sectionKicker: 'NEWS & KNOWLEDGE',
    sectionTitle: '最新内容',
    search: '搜索文章、关键词或应用场景',
    all: '全部内容',
    loading: '正在读取新闻内容…',
    emptyTitle: '首期内容正在整理',
    emptyBody: '发电机组科普素材录入后台并发布后，将自动显示在这里。',
    errorTitle: '新闻内容暂时无法读取',
    errorBody: '静态新闻文件尚未生成，或本机后台连接不可用。请在后台生成静态新闻后重新部署。',
    noResultTitle: '没有找到匹配内容',
    noResultBody: '请更换关键词或返回全部分类。',
    read: '阅读全文',
    minutes: '分钟阅读',
    back: '返回新闻列表',
    source: '资料来源',
    relatedCta: '需要适合项目的动力方案？',
    relatedBody: '提供负载、使用环境和运行要求，我们将协助完成机组选型与配置。',
    quote: '联系销售与服务',
    contentMissing: '文章不存在或尚未发布。',
    footer: '深柴能源 · 动力知识与企业资讯',
  },
  en: {
    home: 'Home',
    products: 'Products',
    showroom: 'Online Showroom',
    about: 'About Us',
    cases: 'Projects',
    news: 'News',
    service: 'Sales & Service',
    menuOpen: 'Open navigation menu',
    menuClose: 'Close navigation menu',
    heroKicker: 'FLYDEER POWER / KNOWLEDGE SYSTEM',
    heroTitle: 'Power knowledge for\nevery dependable operation',
    heroBody: 'Clear, verifiable guidance on generator fundamentals, system selection, and lifecycle maintenance.',
    heroStatus: 'Knowledge base in progress',
    sectionKicker: 'NEWS & KNOWLEDGE',
    sectionTitle: 'Latest insights',
    search: 'Search articles, topics, or applications',
    all: 'All',
    loading: 'Loading news…',
    emptyTitle: 'The first articles are being prepared',
    emptyBody: 'Published generator-set knowledge will appear here automatically.',
    errorTitle: 'News is temporarily unavailable',
    errorBody: 'Static news has not been generated, or the local CMS is unavailable. Generate and redeploy the news data.',
    noResultTitle: 'No matching articles',
    noResultBody: 'Try another keyword or return to all categories.',
    read: 'Read article',
    minutes: 'min read',
    back: 'Back to news',
    source: 'Source',
    relatedCta: 'Need a power solution for your project?',
    relatedBody: 'Share your load, environment, and operating requirements for configuration support.',
    quote: 'Contact Sales & Service',
    contentMissing: 'This article does not exist or has not been published.',
    footer: 'FLYDEER POWER · Knowledge and company updates',
  },
}

function Header({ lang, setLang }) {
  const [open, setOpen] = useState(false)
  const t = copy[lang]

  useEffect(() => {
    const onEscape = (event) => event.key === 'Escape' && setOpen(false)
    const onResize = () => window.innerWidth > 900 && setOpen(false)
    document.body.classList.toggle('news-menu-open', open)
    window.addEventListener('keydown', onEscape)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.classList.remove('news-menu-open')
      window.removeEventListener('keydown', onEscape)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const navItems = [
    { href: '/', label: t.home },
    { href: '/#products', label: t.products },
    { href: '/products/open-frame-500/', label: t.showroom },
    { href: '/about/index.html', label: t.about },
    { href: '/#cases', label: t.cases },
    { href: '/news/', label: t.news, active: true },
    { href: '/#contact', label: t.service },
  ]

  return (
    <header className={`news-header${open ? ' is-open' : ''}`}>
      <div className="news-header-inner">
        <a className="news-logo" href={withLanguage('/', lang)} aria-label={lang === 'zh' ? '深柴能源首页' : 'FLYDEER POWER home'}>
          <BrandLogo imageClassName="news-logo-image" />
        </a>
        <nav className="news-nav" id="news-primary-navigation" aria-label={lang === 'zh' ? '主导航' : 'Primary navigation'}>
          {navItems.map((item) => (
            <a
              key={item.href}
              className={item.active ? 'active' : ''}
              aria-current={item.active ? 'page' : undefined}
              href={withLanguage(item.href, lang)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="news-header-actions">
          <button className={lang === 'zh' ? 'active' : ''} type="button" onClick={() => setLang('zh')} aria-pressed={lang === 'zh'}>中文</button>
          <button className={lang === 'en' ? 'active' : ''} type="button" onClick={() => setLang('en')} aria-pressed={lang === 'en'}>English</button>
        </div>
        <button
          className="news-menu-toggle"
          type="button"
          aria-label={open ? t.menuClose : t.menuOpen}
          aria-expanded={open}
          aria-controls="news-primary-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <button className="news-menu-backdrop" type="button" aria-label={t.menuClose} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} />
    </header>
  )
}

function Hero({ lang }) {
  const t = copy[lang]
  return (
    <section className="news-hero" aria-labelledby="news-hero-title">
      <div className="news-hero-grid" aria-hidden="true" />
      <div className="news-hero-inner">
        <div className="news-hero-copy">
          <p className="news-kicker">{t.heroKicker}</p>
          <h1 id="news-hero-title">{t.heroTitle.split('\n').map((line) => <span key={line}>{line}</span>)}</h1>
          <p className="news-hero-body">{t.heroBody}</p>
        </div>
        <div className="news-diagnostic" aria-label={t.heroStatus}>
          <span className="news-diagnostic-pulse" />
          <div><small>SYSTEM / KNOWLEDGE</small><strong>{t.heroStatus}</strong></div>
          <b>READY</b>
        </div>
      </div>
    </section>
  )
}

function StatePanel({ title, body, loading = false }) {
  return (
    <div className={`news-state${loading ? ' is-loading' : ''}`} role="status">
      <span className="news-state-mark" aria-hidden="true" />
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  )
}

function formatDate(value, lang) {
  if (!value) return ''
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', {
    year: 'numeric', month: 'short', day: '2-digit',
  }).format(new Date(value))
}

function NewsCard({ article, lang }) {
  const t = copy[lang]
  const cover = mediaUrl(article.cover)
  const href = withLanguage(`/news/?slug=${encodeURIComponent(article.slug)}`, lang)
  return (
    <article className="news-card">
      <a className="news-card-media" href={href} tabIndex={-1} aria-hidden="true">
        {cover ? <img src={cover} alt="" loading="lazy" decoding="async" /> : <span>FLYDEER / KNOWLEDGE</span>}
      </a>
      <div className="news-card-content">
        <div className="news-card-meta">
          <span>{article.category?.name ?? (lang === 'zh' ? '动力知识' : 'Power Knowledge')}</span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, lang)}</time>
        </div>
        <h3><a href={href}>{article.title}</a></h3>
        <p>{article.summary}</p>
        <div className="news-card-footer">
          <span>{article.readingTime ?? 3} {t.minutes}</span>
          <a href={href}>{t.read}<b aria-hidden="true">↗</b></a>
        </div>
      </div>
    </article>
  )
}

function NewsIndex({ lang }) {
  const t = copy[lang]
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    setArticles([])
    setCategory('all')
    setQuery('')
    fetchArticles(lang, controller.signal)
      .then(({ articles: nextArticles }) => {
        setArticles(nextArticles)
        setStatus('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('Unable to load news articles', error)
          setStatus('error')
        }
      })
    return () => controller.abort()
  }, [lang])

  const categories = useMemo(() => {
    const values = new Map()
    articles.forEach((article) => {
      if (article.category?.slug) values.set(article.category.slug, article.category.name)
    })
    return [...values.entries()]
  }, [articles])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return articles.filter((article) => {
      const categoryMatches = category === 'all' || article.category?.slug === category
      const queryMatches = !normalizedQuery || `${article.title} ${article.summary} ${article.category?.name ?? ''}`.toLocaleLowerCase().includes(normalizedQuery)
      return categoryMatches && queryMatches
    })
  }, [articles, category, query])

  return (
    <main className="news-main">
      <div className="news-section-heading">
        <div><p>{t.sectionKicker}</p><h2>{t.sectionTitle}</h2></div>
        <label className="news-search">
          <span aria-hidden="true">⌕</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} />
        </label>
      </div>
      {categories.length > 0 && (
        <div className="news-filter" aria-label={lang === 'zh' ? '新闻分类' : 'News categories'}>
          <button className={category === 'all' ? 'active' : ''} type="button" onClick={() => setCategory('all')}>{t.all}</button>
          {categories.map(([slug, name]) => <button className={category === slug ? 'active' : ''} type="button" key={slug} onClick={() => setCategory(slug)}>{name}</button>)}
        </div>
      )}
      {status === 'loading' && <StatePanel title={t.loading} loading />}
      {status === 'error' && <StatePanel title={t.errorTitle} body={t.errorBody} />}
      {status === 'ready' && articles.length === 0 && <StatePanel title={t.emptyTitle} body={t.emptyBody} />}
      {status === 'ready' && articles.length > 0 && filtered.length === 0 && <StatePanel title={t.noResultTitle} body={t.noResultBody} />}
      {status === 'ready' && filtered.length > 0 && <div className="news-grid">{filtered.map((article) => <NewsCard key={article.documentId ?? article.id} article={article} lang={lang} />)}</div>}
    </main>
  )
}

function InlineNodes({ nodes = [] }) {
  return nodes.map((node, index) => {
    if (node.type === 'link') return <a key={index} href={node.url} target={node.url?.startsWith('http') ? '_blank' : undefined} rel="noreferrer"><InlineNodes nodes={node.children} /></a>
    let content = node.text ?? ''
    if (node.code) content = <code>{content}</code>
    if (node.bold) content = <strong>{content}</strong>
    if (node.italic) content = <em>{content}</em>
    if (node.underline) content = <u>{content}</u>
    if (node.strikethrough) content = <s>{content}</s>
    return <span key={index}>{content}</span>
  })
}

function Blocks({ blocks = [] }) {
  return blocks.map((block, index) => {
    if (block.type === 'paragraph') return <p key={index}><InlineNodes nodes={block.children} /></p>
    if (block.type === 'heading') {
      const Heading = `h${Math.min(Math.max(block.level ?? 2, 2), 6)}`
      return <Heading key={index}><InlineNodes nodes={block.children} /></Heading>
    }
    if (block.type === 'quote') return <blockquote key={index}><InlineNodes nodes={block.children} /></blockquote>
    if (block.type === 'code') return <pre key={index}><code>{block.children?.map((child) => child.text).join('') ?? ''}</code></pre>
    if (block.type === 'image') {
      const src = mediaUrl(block.image)
      return src ? <figure key={index}><img src={src} alt={block.image?.alternativeText ?? ''} loading="lazy" decoding="async" />{block.image?.caption && <figcaption>{block.image.caption}</figcaption>}</figure> : null
    }
    if (block.type === 'list') {
      const List = block.format === 'ordered' ? 'ol' : 'ul'
      return <List key={index}>{block.children?.map((item, itemIndex) => <li key={itemIndex}><InlineNodes nodes={item.children} /></li>)}</List>
    }
    return null
  })
}

function ArticleDetail({ slug, lang }) {
  const t = copy[lang]
  const [article, setArticle] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    fetchArticleBySlug(slug, lang, controller.signal)
      .then((nextArticle) => {
        setArticle(nextArticle)
        setStatus(nextArticle ? 'ready' : 'missing')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('Unable to load news article', error)
          setStatus('error')
        }
      })
    return () => controller.abort()
  }, [slug, lang])

  if (status === 'loading') return <main className="news-detail-shell"><StatePanel title={t.loading} loading /></main>
  if (status === 'error') return <main className="news-detail-shell"><StatePanel title={t.errorTitle} body={t.errorBody} /></main>
  if (status === 'missing' || !article) return <main className="news-detail-shell"><StatePanel title={t.contentMissing} body="" /></main>

  const cover = mediaUrl(article.cover)
  return (
    <main className="news-detail-shell">
      <article className="news-article">
        <a className="news-back" href={withLanguage('/news/', lang)}>← {t.back}</a>
        <header className="news-article-header">
          <div className="news-article-meta"><span>{article.category?.name ?? t.news}</span><time dateTime={article.publishedAt}>{formatDate(article.publishedAt, lang)}</time><span>{article.readingTime ?? 3} {t.minutes}</span></div>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
        </header>
        {cover && <figure className="news-article-cover"><img src={cover} alt={article.cover?.alternativeText ?? article.title} /></figure>}
        <div className="news-article-layout">
          <aside><span>FLYDEER / KNOWLEDGE</span><strong>{article.author ?? 'FLYDEER POWER'}</strong><i /></aside>
          <div className="news-article-body">
            {article.bodyHtml
              ? <div className="news-prose" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
              : <Blocks blocks={article.body} />}
            {article.sourceName && <p className="news-source">{t.source}：{article.sourceUrl ? <a href={article.sourceUrl} target="_blank" rel="noreferrer">{article.sourceName}</a> : article.sourceName}</p>}
          </div>
        </div>
        {article.tags?.length > 0 && <div className="news-tags">{article.tags.map((tag) => <span key={tag.documentId ?? tag.id ?? tag.name}>{tag.name}</span>)}</div>}
      </article>
      <section className="news-detail-cta">
        <div><p>PROJECT SUPPORT</p><h2>{t.relatedCta}</h2><span>{t.relatedBody}</span></div>
        <a href={withLanguage('/#contact', lang)}>{t.quote}<b aria-hidden="true">↗</b></a>
      </section>
    </main>
  )
}

function Footer({ lang }) {
  return <footer className="news-footer"><span>© 2026 FLYDEER POWER</span><span>{copy[lang].footer}</span><a href={withLanguage('/', lang)}>{copy[lang].home} ↑</a></footer>
}

export default function App() {
  const [lang, setLang] = useState(() => getInitialLanguage('en'))
  const slug = new URLSearchParams(window.location.search).get('slug')

  useEffect(() => {
    syncLanguageToUrl(lang)
    document.title = lang === 'zh' ? '深柴能源｜新闻动态' : 'FLYDEER POWER | News'
  }, [lang])

  return (
    <div className="news-site">
      <Header lang={lang} setLang={setLang} />
      {slug ? <ArticleDetail slug={slug} lang={lang} /> : <><Hero lang={lang} /><NewsIndex lang={lang} /></>}
      <Footer lang={lang} />
    </div>
  )
}
