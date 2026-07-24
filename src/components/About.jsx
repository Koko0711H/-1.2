import { useEffect, useRef } from 'react'
import { useLang } from '../i18n'
import { withLanguage } from '../languageRouting'

function About() {
  const ref = useRef(null)
  const { lang, t } = useLang()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const items = el.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
        else e.target.classList.remove('visible')
      }),
      { threshold: 0.15 }
    )
    items.forEach(i => observer.observe(i))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="about-section" id="about">
      <div className="about-inner" ref={ref}>
        <div className="section-title">
          <div className="section-heading-meta">
            <span>04 / COMPANY PROFILE</span>
            <span>SHENCHAI POWER · SINCE 2002</span>
          </div>
          <div className="section-heading-copy">
            <h2>{t('aboutTitle')}</h2>
            <p>{t('aboutSub')}</p>
          </div>
        </div>
        <div className="about-cover-stage">
          <div className="about-cover-panel">
            <div className="about-content">
              <div className="about-text fade-up">
                <h3>{t('aboutH3')}</h3>
                <p>{t('aboutP1')}</p>
                <p>{t('aboutP2')}</p>
                <a className="about-page-btn" href={withLanguage('https://3-0-1.pages.dev/', lang)}>
                  {t('aboutPageBtn')}
                </a>
              </div>
              <div className="about-image fade-up">
                <img src="/flydeer-building.png" alt={t('aboutImgAlt')} />
                <span className="about-image-caption">SHENCHAI POWER / HEADQUARTERS</span>
              </div>
            </div>
            <div className="stats-bar">
              {[
                { num: '20+', label: 'stat1' },
                { num: '500+', label: 'stat2' },
                { num: '50+', label: 'stat3' },
                { num: 'ISO', label: 'stat4' },
              ].map((s, i) => (
                <div className="stat-item fade-up" key={i}>
                  <span className="number">{s.num}</span>
                  <span className="label">{t(s.label)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
