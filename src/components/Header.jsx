import { useState, useEffect } from 'react'
import { useLang } from '../i18n'
import { withLanguage } from '../languageRouting'
import BrandLogo from './BrandLogo'

function Header() {
  const [activeSection, setActiveSection] = useState('top')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { lang, setLang, t } = useLang()

  useEffect(() => {
    const sectionIds = ['top', 'products', 'about', 'cases', 'contact']
    const onScroll = () => {
      const marker = window.scrollY + 120
      let current = 'top'
      sectionIds.forEach((id) => {
        const section = document.getElementById(id)
        if (section && section.offsetTop <= marker) current = id
      })
      setActiveSection(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    const closeOnDesktop = () => {
      if (window.innerWidth > 900) setMobileOpen(false)
    }

    document.body.classList.toggle('mobile-menu-open', mobileOpen)
    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeOnDesktop)

    return () => {
      document.body.classList.remove('mobile-menu-open')
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', closeOnDesktop)
    }
  }, [mobileOpen])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      setMobileOpen(false)
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className={`header brand-header${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="header-inner">
        <a
          className="logo"
          href="#top"
          aria-label={lang === 'zh' ? '深柴能源首页' : 'FLYDEER POWER home'}
          onClick={(event) => {
            event.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <BrandLogo imageClassName="logo-img" />
        </a>
        <nav className="nav-links" id="primary-navigation" aria-label={lang === 'zh' ? '主导航' : 'Primary navigation'}>
          {[
            { key: 'navHome', action: 'top' },
            { key: 'navProducts', action: 'products' },
            { key: 'navIndustry', href: '/products/open-frame-500/' },
            { key: 'navAbout', action: 'about', href: '/about/' },
            { key: 'navCases', action: 'cases' },
            { key: 'navService', action: 'contact' },
          ].map((item, i) => (
            <a
              key={i}
              className={item.action === activeSection ? 'active' : ''}
              aria-current={item.action === activeSection ? 'page' : undefined}
              href={item.href ? withLanguage(item.href, lang) : `#${item.action}`}
              onClick={(event) => item.href
                ? setMobileOpen(false)
                : (event.preventDefault(), item.action === 'top'
                  ? (setMobileOpen(false), window.scrollTo({ top: 0, behavior: 'smooth' }))
                  : scrollTo(item.action))
              }
            >
              {t(item.key)}
            </a>
          ))}
          <div className="mobile-nav-actions">
            <a className="mobile-quote-btn" href="#contact" onClick={() => setMobileOpen(false)}>
              {t('getQuote')}
            </a>
            <div className="mobile-nav-social">
              <a href="#contact" onClick={() => setMobileOpen(false)}>Facebook</a>
              <a href="#contact" onClick={() => setMobileOpen(false)}>LinkedIn</a>
              <a href="#contact" onClick={() => setMobileOpen(false)}>Douyin</a>
            </div>
          </div>
        </nav>
        <div className="header-right">
          <button
            type="button"
            className={`lang-btn ${lang === 'zh' ? 'active' : ''}`}
            aria-pressed={lang === 'zh'}
            onClick={() => setLang('zh')}
          >中文</button>
          <button
            type="button"
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            aria-pressed={lang === 'en'}
            onClick={() => setLang('en')}
          >English</button>
          <a className="social-icon" href="#contact" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a className="social-icon" href="#contact" aria-label="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a className="social-icon" href="#contact" aria-label="Douyin">
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
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={mobileOpen
            ? (lang === 'zh' ? '关闭导航菜单' : 'Close navigation menu')
            : (lang === 'zh' ? '打开导航菜单' : 'Open navigation menu')}
          aria-controls="primary-navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <button
        type="button"
        className="mobile-menu-backdrop"
        aria-label={lang === 'zh' ? '关闭导航菜单' : 'Close navigation menu'}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={() => setMobileOpen(false)}
      />
    </header>
  )
}

export default Header
