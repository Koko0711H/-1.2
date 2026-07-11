import { useEffect, useRef } from 'react'
import { useLang } from '../i18n'

function Advantages() {
  const ref = useRef(null)
  const { t } = useLang()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const items = el.querySelectorAll('.advantage-card')
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

  const advs = [
    { icon: '🏆', title: 'adv1Title', desc: 'adv1Desc' },
    { icon: '💡', title: 'adv2Title', desc: 'adv2Desc' },
    { icon: '🛡️', title: 'adv3Title', desc: 'adv3Desc' },
    { icon: '🌍', title: 'adv4Title', desc: 'adv4Desc' },
  ]

  const advantageImages = [
    '/advantage-1.jpg',
    '/advantage-2.jpg',
    '/advantage-3.jpg',
    '/advantage-4.jpg',
  ]

  return (
    <section className="advantages-section">
      <div className="section-title">
        <h2>{t('advTitle')}</h2>
        <div className="underline"></div>
        <p>{t('advSub')}</p>
      </div>
      <div className="advantages-grid" ref={ref}>
        {advs.map((item, index) => (
          <div
            className="advantage-card fade-up"
            key={index}
            style={{ backgroundImage: `url(${advantageImages[index]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="advantage-icon"><span>{item.icon}</span></div>
            <h3>{t(item.title)}</h3>
            <p>{t(item.desc)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Advantages
