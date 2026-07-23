import { useState, useEffect, useRef } from 'react'
import { useLang } from '../i18n'

const productKeys = [
  { tag: 'prod1Tag', name: 'prod1Name', desc: 'prod1Desc', detail: 'prod1Detail', type: 'video', src: '/silent-generator.mp4', hasRichDetail: true, moreLink: 'https://1-5-7.pages.dev/' },
  { tag: 'prod2Tag', name: 'prod2Name', desc: 'prod2Desc', detail: 'prod2Detail', type: 'video', src: '/open-frame.mp4', hasRichDetail: true, moreLink: 'https://shenchai1-5-6.pages.dev/' },
  { tag: 'prod2Tag', name: 'prod2SmallName', desc: 'prod2Desc', detail: 'prod2Detail', type: 'video', src: '/open-frame-small.mp4', hasRichDetail: true, moreLink: 'https://shenchai1-5-3.pages.dev/' },
  { tag: 'prod3Tag', name: 'prod3Name', desc: 'prod3Desc', detail: 'prod3Detail', type: 'video', src: '/mobile-trailer.mp4', hasRichDetail: true, moreLink: 'https://1-5-8.pages.dev/' },
  { tag: 'prod4Tag', name: 'prod4Name', desc: 'prod4Desc', detail: 'prod4Detail', type: 'video', src: '/high-voltage.mp4', moreLink: 'https://1-5-9.pages.dev/' },
]

function RichDetail() {
  const { t } = useLang()
  return (
    <div className="rich-detail">
      <p style={{ fontSize: "14px", color: "var(--text-light)", lineHeight: 1.8, marginBottom: 16, padding: "12px", background: "var(--light-bg)", borderRadius: "6px" }}>{t("prod1Detail")}</p>
      <div className="rich-item">
        <img src="/prod1-detail-1.jpg" alt={t("rich1Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich1Title")}</h4>
          <p>{t("rich1Desc")}</p>
        </div>
      </div>
      <div className="rich-item">
        <img src="/prod1-detail-2.jpg" alt={t("rich2Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich2Title")}</h4>
          <p>{t("rich2Desc")}</p>
        </div>
      </div>
      <div className="rich-item">
        <img src="/prod1-detail-3.jpg" alt={t("rich3Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich3Title")}</h4>
          <p>{t("rich3Desc")}</p>
        </div>
      </div>
      <div className="rich-item">
        <img src="/prod1-detail-4.jpg" alt={t("rich4Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich4Title")}</h4>
          <p>{t("rich4Desc")}</p>
        </div>
      </div>
    </div>
  )
}

function OpenFrameRichDetail() {
  const { t } = useLang()
  return (
    <div className="rich-detail">
      <p style={{ fontSize: "14px", color: "var(--text-light)", lineHeight: 1.8, marginBottom: 16, padding: "12px", background: "var(--light-bg)", borderRadius: "6px" }}>{t("prod2Detail")}</p>
      <div className="rich-item">
        <img src="/prod2-detail-1.png" alt={t("rich2_1Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich2_1Title")}</h4>
          <p>{t("rich2_1Desc")}</p>
        </div>
      </div>
      <div className="rich-item">
        <img src="/prod2-detail-2.jpg" alt={t("rich2_2Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich2_2Title")}</h4>
          <p>{t("rich2_2Desc")}</p>
        </div>
      </div>
      <div className="rich-item">
        <img src="/prod2-detail-3.jpg" alt={t("rich2_3Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich2_3Title")}</h4>
          <p>{t("rich2_3Desc")}</p>
        </div>
      </div>
    </div>
  )
}
function MobileTrailerRichDetail() {
  const { t } = useLang()
  return (
    <div className="rich-detail">
      <p style={{ fontSize: "14px", color: "var(--text-light)", lineHeight: 1.8, marginBottom: 16, padding: "12px", background: "var(--light-bg)", borderRadius: "6px" }}>{t("prod3Detail")}</p>
      <div className="rich-item">
        <img src="/prod3-detail-1.jpg" alt={t("rich3_1Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich3_1Title")}</h4>
          <p>{t("rich3_1Desc")}</p>
        </div>
      </div>
      <div className="rich-item">
        <img src="/prod3-detail-2.jpg" alt={t("rich3_2Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich3_2Title")}</h4>
          <p>{t("rich3_2Desc")}</p>
        </div>
      </div>
      <div className="rich-item">
        <img src="/prod3-detail-3.jpg" alt={t("rich3_3Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich3_3Title")}</h4>
          <p>{t("rich3_3Desc")}</p>
        </div>
      </div>
      <div className="rich-item">
        <img src="/prod3-detail-4.jpg" alt={t("rich3_4Title")} className="rich-img" />
        <div className="rich-text">
          <h4>{t("rich3_4Title")}</h4>
          <p>{t("rich3_4Desc")}</p>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ item, index }) {
  const ref = useRef(null)
  const videoRef = useRef(null)
  const { t } = useLang()
  const isLeft = index % 2 === 0
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('visible')
        else el.classList.remove('visible')
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleMouseEnter = () => {
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <article ref={ref} className={`product-showcase ${isLeft ? 'from-left' : 'from-right'}`}>
      <span className="product-card-index" aria-hidden="true">SC / {String(index + 1).padStart(2, '0')}</span>
      <div className="product-showcase-text">
        <span className="product-tag">{t(item.tag)}</span>
        <h3>{t(item.name)}</h3>
        <p className="product-page-hint">{t('productPageHint')}</p>
        <p>{t(item.desc)}</p>
        <div className={`product-detail ${expanded ? 'open' : ''}`}>
          {item.hasRichDetail && item.name === "prod1Name" ? (
            <RichDetail />
          ) : item.hasRichDetail && (item.name === "prod2Name" || item.name === "prod2SmallName") ? (
            <OpenFrameRichDetail />
          ) : item.hasRichDetail && item.name === "prod3Name" ? (
            <MobileTrailerRichDetail />
          ) : (
            <p>{t(item.detail)}</p>
          )}
        </div>
        <div className="product-showcase-btns">
          <button type="button" className="btn-outline product-learn-btn product-expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? t('foldBtn') : t('expandBtn')}
            <span className={`expand-arrow ${expanded ? 'up' : ''}`}>▾</span>
          </button>
          <a
            className="btn-outline product-more-btn"
            href={item.moreLink || '#'}
            onClick={(event) => {
              if (!item.moreLink) event.preventDefault()
            }}
          >
            {t('moreDetailsBtn')}
          </a>
        </div>
      </div>
      <div
        className="product-showcase-img"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: item.type === 'video' ? 'pointer' : 'default' }}
      >
        <div className="product-media-labels" aria-hidden="true">
          <span>PRODUCT MOTION FILE</span>
          <span>HOVER TO RUN</span>
        </div>
        {item.type === 'video' ? (
          <video
            ref={videoRef}
            className="product-video"
            muted
            playsInline
            preload="metadata"
          >
            <source src={item.src} type="video/mp4" />
          </video>
        ) : (
          <img src={item.src} alt={t(item.name)} className="product-showcase-photo" />
        )}
      </div>
    </article>
  )
}

function Products() {
  const { t } = useLang()
  return (
    <section className="products-explore-section" id="products">
      <div className="section-title">
        <div className="section-heading-meta">
          <span>02 / PRODUCT SYSTEMS</span>
          <span>5 PRODUCT FAMILIES · 100KW—3000KW</span>
        </div>
        <div className="section-heading-copy">
          <h2>{t('productsTitle')}</h2>
          <p>{t('productsSub')}</p>
        </div>
      </div>
      <div className="products-explore-list">
        {productKeys.map((p, i) => <ProductCard key={i} item={p} index={i} />)}
      </div>
    </section>
  )
}

export default Products

