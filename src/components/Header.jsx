import { useState, useEffect } from 'react'
import { useLang } from '../i18n'

function Header() {
  const [atTop, setAtTop] = useState(true)
  const { lang, setLang, t } = useLang()

  useEffect(() => {
    const heroHeight = window.innerHeight - 70
    const onScroll = () => setAtTop(window.scrollY < heroHeight * 0.6)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`header brand-header ${atTop ? 'is-top' : 'is-scrolled'}`}>
      <div className="header-inner">
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src="/logo.png"
            alt="FlyDeer 深柴动力"
            className="logo-img"
          />
        </div>
        <nav className="nav-links">
          {[
            { key: 'navHome', action: 'top' },
            { key: 'navProducts', action: 'products' },
            { key: 'navIndustry', href: 'https://shenchai1-5-3.pages.dev/' },
            { key: 'navAbout', href: 'https://3-0-1.pages.dev/' },
            { key: 'navCases', action: 'cases' },
            { key: 'navService', action: 'contact' },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href || `#${item.action}`}
              onClick={(event) => item.href
                ? undefined
                : (event.preventDefault(), item.action === 'top'
                  ? window.scrollTo({ top: 0, behavior: 'smooth' })
                  : scrollTo(item.action))
              }
            >
              {t(item.key)}
            </a>
          ))}
        </nav>
        <div className="header-right">
          <span
            className={`lang-btn ${lang === 'zh' ? 'active' : ''}`}
            onClick={() => setLang('zh')}
          >中文</span>
          <span
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >English</span>
          <a className="social-icon" href="#">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a className="social-icon" href="#">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a className="social-icon" href="#">
<svg width="30" height="30" viewBox="0 0 48 48" fill="currentColor">
              <path d="M33.5 8.5c1.5 3 4 5 7 5.5v4.5c-2.5 0-5-1-7-3v13c0 6.5-5 11.5-11.5 11.5S10.5 35 10.5 28.5 15.5 17 22 17v4.5c-4 0-7 3-7 7s3 7 7 7 7-3 7-7V8.5h4.5z"/>
            </svg>
          </a>
          <a className="quote-btn" href="#contact">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:6}}>
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            {t('getQuote')}
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
