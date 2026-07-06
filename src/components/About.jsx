import { useEffect, useRef } from 'react'
import { useLang } from '../i18n'

function About() {
  const ref = useRef(null)
  const { t } = useLang()

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
          <h2>{t('aboutTitle')}</h2>
          <div className="underline"></div>
          <p>{t('aboutSub')}</p>
        </div>
        <div className="about-content">
          <div className="about-text fade-up">
            <h3>{t('aboutH3')}</h3>
            <p>{t('aboutP1')}</p>
            <p>{t('aboutP2')}</p>
          </div>
          <div className="about-image fade-up">
            <img src="/factory.jpg" alt={t('aboutImgAlt')} />
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
    </section>
  )
}

export default About