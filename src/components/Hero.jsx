import { useState, useEffect, useRef } from 'react'
import { useLang } from '../i18n'
import SpotlightHome from './SpotlightHome'

function Hero() {
  const [current, setCurrent] = useState(0)
  const [showSpotlight, setShowSpotlight] = useState(false)
  const { t } = useLang()
  const videoRef = useRef(null)

    const slides = [
    {
      titleKey: 'heroTitle1', subKey: 'heroSub1',
      bg: 'video', video: '/hero-video.mp4'
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      if (!showSpotlight) {
        setCurrent(p => (p + 1) % slides.length)
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [showSpotlight])

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY === 0 && videoRef.current && !showSpotlight) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [showSpotlight])

  useEffect(() => {
    if (videoRef.current && !showSpotlight) {
      if (slides[current].bg === 'video') {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [current, showSpotlight])

  const goTo = (dir) => {
    if (showSpotlight) {
      setShowSpotlight(false)
    } else {
      setCurrent(p => (p + dir + slides.length) % slides.length)
    }
  }

  const toggleSpotlight = () => {
    setShowSpotlight(prev => !prev)
  }

  const scrollToProducts = () => {
    const el = document.getElementById('products')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleVideoEnd = () => {
    if (videoRef.current) videoRef.current.pause()
  }

  const slide = slides[current]

  if (showSpotlight) {
    return (
      <section className="hero-section">
        <SpotlightHome onMouseLeave={() => setShowSpotlight(false)} />
        <button className="hero-arrow hero-arrow-left" onClick={() => goTo(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={toggleSpotlight}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
        </button>
      </section>
    )
  }

  return (
    <section className="hero-section">
      <div className="hero-bg">
        {slide.bg === 'video' ? (
          <video ref={videoRef} className="hero-bg-video" autoPlay muted playsInline onEnded={handleVideoEnd}>
            <source src={slide.video} type="video/mp4" />
          </video>
        ) : (
          <div className="hero-bg-gradient" style={{ background: slide.gradient }}></div>
        )}
      </div>
      <div className="hero-content">
        <h1>{t(slide.titleKey)}</h1>
        <p>{t(slide.subKey)}</p>
        <a className="hero-btn" onClick={scrollToProducts}>{t('learnMore')}</a>
      </div>
      <button className="hero-arrow hero-arrow-left" onClick={() => goTo(-1)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
      </button>
      <button className="hero-arrow hero-arrow-right" onClick={toggleSpotlight}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
      </button>
      
    </section>
  )
}

export default Hero










