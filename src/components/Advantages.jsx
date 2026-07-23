import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'

const evidenceTopics = [
  {
    code: 'MFG / 01',
    titleKey: 'adv1Title',
    descKey: 'adv1Desc',
    labelKey: 'adv1Label',
    images: [
      '/why-manufacturing-floor.webp',
      '/why-manufacturing-trailers.webp',
      '/why-manufacturing-sets.webp',
    ],
  },
  {
    code: 'QA / 02',
    titleKey: 'adv2Title',
    descKey: 'adv2Desc',
    labelKey: 'adv2Label',
    images: [
      '/why-validation-center.webp',
      '/why-validation-workshop.webp',
    ],
  },
  {
    code: 'DLV / 03',
    titleKey: 'adv3Title',
    descKey: 'adv3Desc',
    labelKey: 'adv3Label',
    images: [
      '/why-delivery-installation.webp',
      '/why-delivery-commissioning.webp',
    ],
  },
  {
    code: 'ENG / 04',
    titleKey: 'adv4Title',
    descKey: 'adv4Desc',
    labelKey: 'adv4Label',
    images: [
      '/why-engineering-site.webp',
      '/why-engineering-lifting.webp',
      '/why-engineering-restricted.webp',
    ],
  },
]

const archiveImages = evidenceTopics.flatMap((topic, topicIndex) =>
  topic.images.map((src, imageIndex) => ({
    src,
    topicIndex,
    imageIndex,
    titleKey: topic.titleKey,
  })),
)

const certificationItems = [
  { code: 'QMS / 01', standard: 'ISO 9001:2015', titleKey: 'advCert1Title', image: '/why-certificate-iso9001.webp' },
  { code: 'EMS / 02', standard: 'ISO 14001:2015', titleKey: 'advCert2Title', image: '/why-certificate-iso14001.webp' },
  { code: 'OHS / 03', standard: 'ISO 45001:2018', titleKey: 'advCert3Title', image: '/why-certificate-iso45001.webp' },
  { code: 'MD / 04', standard: '2006/42/EC', titleKey: 'advCert4Title', image: '/why-certificate-machinery.webp' },
  { code: 'QA / 05', standard: 'GB/T 19001 · ISO 9001', titleKey: 'advCert5Title', image: '/why-certificate-quality.webp' },
  { code: 'ECM / 06', standard: 'EN ISO 12100 · EN 60204-1', titleKey: 'advCert6Title', image: '/why-certificate-conformity.webp' },
]

function Advantages() {
  const ref = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { t } = useLang()
  const activeTopic = evidenceTopics[activeIndex]

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const items = el.querySelectorAll('.advantage-proof-reason')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      }),
      { threshold: 0.18 },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="advantages-section" id="advantages">
      <div className="section-title advantages-title">
        <div className="section-heading-meta">
          <span>{t('advMetaLeft')}</span>
          <span>{t('advMetaRight')}</span>
        </div>
        <div className="section-heading-copy">
          <h2>{t('advTitle')}</h2>
          <p>{t('advSub')}</p>
        </div>
      </div>

      <div className="advantage-proof-console" ref={ref}>
        <div className="advantage-proof-media" key={activeTopic.code}>
          <div className={`advantage-proof-collage is-${activeTopic.images.length} topic-${activeIndex}`}>
            {activeTopic.images.map((src, imageIndex) => (
              <figure className={`advantage-proof-frame frame-${imageIndex + 1}`} key={src}>
                <img
                  src={src}
                  alt={`${t(activeTopic.titleKey)} ${imageIndex + 1}`}
                  loading={imageIndex === 0 ? 'eager' : 'lazy'}
                />
                <figcaption>
                  <span>{String(imageIndex + 1).padStart(2, '0')}</span>
                  <span>{t(activeTopic.labelKey)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="advantage-proof-status">
            <span>{t('advRecordLabel')}</span>
            <strong>{activeTopic.code}</strong>
          </div>
        </div>

        <div className="advantage-proof-reasons" aria-label={t('advReasonRailLabel')}>
          <div className="advantage-proof-rail-heading">
            <span>{t('advReasonRailLabel')}</span>
            <span>04</span>
          </div>
          {evidenceTopics.map((topic, index) => (
            <button
              className={`advantage-proof-reason${activeIndex === index ? ' active' : ''}`}
              type="button"
              aria-pressed={activeIndex === index}
              key={topic.code}
              onClick={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              style={{ '--reason-delay': `${index * 90}ms` }}
            >
              <span className="advantage-proof-code">{topic.code}</span>
              <span className="advantage-proof-copy">
                <strong>{t(topic.titleKey)}</strong>
                <span>{t(topic.descKey)}</span>
              </span>
              <span className="advantage-proof-mark" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </div>

      <div className="advantage-proof-archive">
        <div className="advantage-proof-archive-label">
          <span>{t('advArchiveLabel')}</span>
          <span>10 / {t('advArchiveCount')}</span>
        </div>
        <div className="advantage-proof-thumbnails">
          {archiveImages.map((item, index) => (
            <button
              className={activeIndex === item.topicIndex ? 'active' : ''}
              type="button"
              key={item.src}
              aria-label={`${t(item.titleKey)} ${item.imageIndex + 1}`}
              onClick={() => setActiveIndex(item.topicIndex)}
            >
              <img src={item.src} alt="" loading="lazy" />
              <span>{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="advantage-certifications-stage">
        <div className="advantage-certifications">
        <div className="advantage-certifications-heading">
          <div>
            <span>{t('advCertEyebrow')}</span>
            <h3>{t('advCertTitle')}</h3>
          </div>
          <p>{t('advCertSub')}</p>
        </div>
        <div className="advantage-certifications-grid">
          {certificationItems.map((item) => (
            <article className="advantage-certificate" key={item.code}>
              <figure>
                <img src={item.image} alt={`${t(item.titleKey)} · ${item.standard}`} loading="lazy" />
              </figure>
              <div className="advantage-certificate-meta">
                <span>{item.code}</span>
                <strong>{item.standard}</strong>
                <p>{t(item.titleKey)}</p>
              </div>
            </article>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}

export default Advantages
