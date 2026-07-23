import { useEffect, useRef } from 'react'
import { useLang } from '../i18n'

function Hero() {
  const { lang, t } = useLang()
  const heroSectionRef = useRef(null)
  const videoRef = useRef(null)
  const hasLeftHeroRef = useRef(false)

  const slide = {
    titleKey: 'heroTitle1',
    subKey: 'heroSub1',
    video: '/hero-power-range-sharp4k.mp4'
  }

  useEffect(() => {
    const section = heroSectionRef.current
    if (!section) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio <= 0.2) {
        hasLeftHeroRef.current = true
        return
      }

      if (entry.intersectionRatio >= 0.6 && hasLeftHeroRef.current && videoRef.current) {
        hasLeftHeroRef.current = false
        videoRef.current.currentTime = 0
        videoRef.current.play().catch(() => {})
      }
    }, { threshold: [0.2, 0.6] })

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handlePageShow = (event) => {
      if (!event.persisted || !videoRef.current) return
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  const scrollToProducts = () => {
    const el = document.getElementById('products')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleVideoEnd = () => {
    if (videoRef.current) videoRef.current.pause()
  }

  return (
    <section ref={heroSectionRef} className="hero-section">
      <div className="hero-bg">
        <video ref={videoRef} className="hero-bg-video" autoPlay muted playsInline onEnded={handleVideoEnd}>
          <source src={slide.video} type="video/mp4" />
        </video>
      </div>
      <div className={`hero-content hero-content-brand is-${lang}`}>
        <h1 className="hero-company-title" aria-label={t(slide.titleKey)}>
          <span className="hero-company-solid" aria-hidden="true">{t('heroBrandLead')}</span>
          <span className="hero-company-outline" aria-hidden="true">{t('heroBrandTail')}</span>
        </h1>
        <p>{t(slide.subKey)}</p>
        <button type="button" className="hero-btn" onClick={scrollToProducts}>{t('heroCta')}</button>
      </div>
    </section>
  )
}

export default Hero
