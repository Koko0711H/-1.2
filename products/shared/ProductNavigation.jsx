import { useEffect, useState } from "react"
import BrandLogo from "../../src/components/BrandLogo"
import "../../src/mobile-header.css"
import "./product-mobile.css"

function SocialLinks({ localize }) {
  const contactHref = localize("/#contact")
  return (
    <>
      <a className="social-icon" href={contactHref} aria-label="Facebook">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
      </a>
      <a className="social-icon" href={contactHref} aria-label="LinkedIn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
      </a>
      <a className="social-icon" href={contactHref} aria-label="Douyin">
        <svg width="30" height="30" viewBox="0 0 48 48" fill="currentColor"><path d="M33.5 8.5c1.5 3 4 5 7 5.5v4.5c-2.5 0-5-1-7-3v13c0 6.5-5 11.5-11.5 11.5S10.5 35 10.5 28.5 15.5 17 22 17v4.5c-4 0-7 3-7 7s3 7 7 7 7-3 7-7V8.5h4.5z"/></svg>
      </a>
    </>
  )
}

function QuoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
    </svg>
  )
}

export default function ProductNavigation({ lang, setLang, t, localize }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMenu = () => setMobileOpen(false)
  const navItems = [
    { href: "/", label: t("navHome") },
    { href: "/#products", label: t("navProducts") },
    { href: "/products/open-frame-500/", label: lang === "zh" ? "网上展厅" : "Online Showroom", active: true },
    { href: "/about/index.html", label: t("navAbout") },
    { href: "/#cases", label: t("navCases") },
    { href: "/news/", label: t("navNews") },
    { href: "/#contact", label: t("navService") },
  ]

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMenu()
    }
    const closeOnDesktop = () => {
      if (window.innerWidth > 900) closeMenu()
    }

    document.body.classList.toggle("product-mobile-menu-open", mobileOpen)
    window.addEventListener("keydown", closeOnEscape)
    window.addEventListener("resize", closeOnDesktop)

    return () => {
      document.body.classList.remove("product-mobile-menu-open")
      window.removeEventListener("keydown", closeOnEscape)
      window.removeEventListener("resize", closeOnDesktop)
    }
  }, [mobileOpen])

  return (
    <header className={`navbar${mobileOpen ? " mobile-open" : ""}`}>
      <div className="navbar-inner">
        <a className="nav-logo-link" href={localize("/")} aria-label={lang === "zh" ? "深柴能源首页" : "FLYDEER POWER home"}>
          <BrandLogo imageClassName="nav-logo" />
        </a>
        <nav className="nav-links" id="product-primary-navigation" aria-label={lang === "zh" ? "主导航" : "Primary navigation"}>
          {navItems.map((item) => (
            <a
              key={item.href}
              className={item.active ? "active" : ""}
              aria-current={item.active ? "page" : undefined}
              href={localize(item.href)}
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
          <div className="product-mobile-actions">
            <a className="product-mobile-quote" href={localize("/#contact")} onClick={closeMenu}>
              <QuoteIcon />
              {lang === "zh" ? "获取报价" : "Get Quote"}
            </a>
            <div className="product-mobile-contact">
              <a href="tel:+8618205938836">+86 182 0593 8836</a>
              <a href="mailto:flydeerpower@googlel.com">flydeerpower@googlel.com</a>
            </div>
          </div>
        </nav>
        <div className="header-right">
          <button type="button" className={`lang-btn${lang === "zh" ? " active" : ""}`} aria-pressed={lang === "zh"} onClick={() => setLang("zh")}>中文</button>
          <button type="button" className={`lang-btn${lang === "en" ? " active" : ""}`} aria-pressed={lang === "en"} onClick={() => setLang("en")}>English</button>
          <SocialLinks localize={localize} />
          <a className="quote-btn" href={localize("/#contact")}><QuoteIcon />{lang === "zh" ? "获取报价" : "Get Quote"}</a>
        </div>
        <button
          type="button"
          className="product-mobile-menu-toggle"
          aria-label={mobileOpen
            ? (lang === "zh" ? "关闭导航菜单" : "Close navigation menu")
            : (lang === "zh" ? "打开导航菜单" : "Open navigation menu")}
          aria-controls="product-primary-navigation"
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
        className="product-mobile-menu-backdrop"
        aria-label={lang === "zh" ? "关闭导航菜单" : "Close navigation menu"}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={closeMenu}
      />
    </header>
  )
}
