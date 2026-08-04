import { useState } from 'react'
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

const customerReviews = [
  { name: 'Daniel R.', avatar: '/customer-avatars/customer-01.webp', roleKey: 'review1Role', titleKey: 'review1Title', quoteKey: 'review1Quote' },
  { name: 'Olivia M.', avatar: '/customer-avatars/customer-02.webp', roleKey: 'review2Role', titleKey: 'review2Title', quoteKey: 'review2Quote' },
  { name: 'Ethan C.', avatar: '/customer-avatars/customer-03.webp', roleKey: 'review3Role', titleKey: 'review3Title', quoteKey: 'review3Quote' },
  { name: 'Sophia K.', avatar: '/customer-avatars/customer-04.webp', roleKey: 'review4Role', titleKey: 'review4Title', quoteKey: 'review4Quote' },
  { name: 'Marcus J.', avatar: '/customer-avatars/customer-05.webp', roleKey: 'review5Role', titleKey: 'review5Title', quoteKey: 'review5Quote' },
  { name: 'Hannah L.', avatar: '/customer-avatars/customer-06.webp', roleKey: 'review6Role', titleKey: 'review6Title', quoteKey: 'review6Quote' },
  { name: 'Dr. Adrian W.', avatar: '/customer-avatars/customer-07.webp', roleKey: 'review7Role', titleKey: 'review7Title', quoteKey: 'review7Quote' },
  { name: 'Grace T.', avatar: '/customer-avatars/customer-08.webp', roleKey: 'review8Role', titleKey: 'review8Title', quoteKey: 'review8Quote' },
]

function Advantages() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [reviewsExpanded, setReviewsExpanded] = useState(false)
  const { t } = useLang()
  const activeTopic = evidenceTopics[activeIndex]

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

      <div className="advantage-proof-console">
        <div className="advantage-proof-media" key={activeTopic.code}>
          <div className={`advantage-proof-collage is-${activeTopic.images.length} topic-${activeIndex}`}>
            {activeTopic.images.map((src, imageIndex) => (
              <figure className={`advantage-proof-frame frame-${imageIndex + 1}`} key={src}>
                <img
                  src={src}
                  alt={`${t(activeTopic.titleKey)} ${imageIndex + 1}`}
                  loading={imageIndex === 0 ? 'eager' : 'lazy'}
                  decoding="async"
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
              <img src={item.src} alt="" loading="lazy" decoding="async" />
              <span>{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="advantage-certifications-stage">
        <div className={`advantage-certifications customer-reviews${reviewsExpanded ? ' is-expanded' : ''}`}>
          <div className="advantage-certifications-heading">
            <div>
              <span>{t('reviewEyebrow')}</span>
              <h3>{t('reviewTitle')}</h3>
            </div>
            <div className="customer-reviews-intro">
              <p>{t('reviewSub')}</p>
              <button
                type="button"
                className="customer-reviews-toggle"
                aria-expanded={reviewsExpanded}
                aria-controls="customer-review-content"
                onClick={() => setReviewsExpanded((current) => !current)}
              >
                <span>{t(reviewsExpanded ? 'reviewCollapse' : 'reviewExpand')}</span>
                <i aria-hidden="true">{reviewsExpanded ? '−' : '+'}</i>
              </button>
            </div>
          </div>

          <div className="customer-review-content" id="customer-review-content">
            <div className="customer-review-overview" aria-hidden={reviewsExpanded}>
              <div className="customer-rating-score">
                <span>{t('reviewScoreLabel')}</span>
                <strong>5.0</strong>
                <div className="customer-review-stars" aria-label={t('reviewFiveStars')}>★★★★★</div>
              </div>
              <div className="customer-rating-summary">
                <span>AMAZON CUSTOMER REVIEWS</span>
                <strong>{t('reviewSummary')}</strong>
                <p>{t('reviewSummarySub')}</p>
              </div>
              <div className="customer-review-privacy">
                <span>PRIVACY / 01</span>
                <p>{t('reviewPrivacy')}</p>
              </div>
            </div>

            <div className="customer-reviews-grid" aria-hidden={!reviewsExpanded}>
              {customerReviews.map((review, index) => (
                <article className="customer-review-card" key={review.name}>
                  <div className="customer-review-card-topline">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div className="customer-review-stars" aria-label={t('reviewFiveStars')}>★★★★★</div>
                  </div>
                  <blockquote>
                    <strong>{t(review.titleKey)}</strong>
                    <p>“{t(review.quoteKey)}”</p>
                  </blockquote>
                  <footer>
                    <img src={review.avatar} alt="" loading="lazy" decoding="async" />
                    <div>
                      <strong>{review.name}</strong>
                      <span>{t(review.roleKey)}</span>
                    </div>
                    <em>{t('reviewVerified')}</em>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Advantages
