import { useLang } from '../i18n'
import imgConstruction from '../assets/images/industry-construction.jpg'
import imgSchool from '../assets/images/industry-school.jpg'
import imgHospital from '../assets/images/industry-hospital.jpg'
import imgMall from '../assets/images/industry-mall.jpg'
import imgDatacenter from '../assets/images/industry-datacenter.jpg'
import imgFarm from '../assets/images/industry-farm.jpg'
import imgSports from '../assets/images/industry-sports.jpg'
import imgLogistics from '../assets/images/industry-logistics.jpg'

const industryImgs = {
  construction: imgConstruction,
  school: imgSchool,
  hospital: imgHospital,
  mall: imgMall,
  datacenter: imgDatacenter,
  farm: imgFarm,
  sports: imgSports,
  logistics: imgLogistics,
  mine: '/case-mine.jpg',
}

function Industry() {
  const { t } = useLang()

  const items = [
    { titleKey: 'ind1Title', subKey: 'ind1Sub', img: 'construction' },
    { titleKey: 'ind2Title', subKey: 'ind2Sub', img: 'school' },
    { titleKey: 'ind3Title', subKey: 'ind3Sub', img: 'hospital' },
    { titleKey: 'ind4Title', subKey: 'ind4Sub', img: 'mall' },
    { titleKey: 'ind5Title', subKey: 'ind5Sub', img: 'datacenter' },
    { titleKey: 'ind6Title', subKey: 'ind6Sub', img: 'sports' },
    { titleKey: 'ind7Title', subKey: 'ind7Sub', img: 'logistics' },
    { titleKey: 'ind8Title', subKey: 'ind8Sub', img: 'farm' },
    { titleKey: 'ind9Title', subKey: 'ind9Sub', img: 'mine' },
  ]

  const angleStep = 360 / items.length

  return (
    <section className="industry-section" id="industry">
      <div className="section-title">
        <div className="section-heading-meta">
          <span>03 / APPLICATION FIELDS</span>
          <span>CONTINUOUS DUTY · STANDBY POWER</span>
        </div>
        <div className="section-heading-copy">
          <h2>{t('industryTitle')}</h2>
          <p>{t('industrySub')}</p>
        </div>
      </div>
      <div
        className="industry-ring-stage"
        role="region"
        aria-label={t('industryTitle')}
      >
        <div className="industry-ring">
          {items.map((item, index) => (
            <article
              className="industry-ring-card"
              style={{
                '--card-angle': `${index * angleStep}deg`,
              }}
              key={item.titleKey}
            >
              <span className="industry-ring-index">{String(index + 1).padStart(2, '0')}</span>
              <img
                src={industryImgs[item.img]}
                alt={t(item.titleKey)}
                className="industry-ring-image"
              />
              <span className="industry-ring-overlay">
                <span className="industry-ring-type">APPLICATION FIELD</span>
                <h3>{t(item.titleKey)}</h3>
                <p>{t(item.subKey)}</p>
              </span>
            </article>
          ))}
        </div>
        <div className="industry-ring-focus">
          <span>{String(items.length).padStart(2, '0')} APPLICATION FIELDS</span>
          <strong>CONTINUOUS ROTATION</strong>
        </div>
      </div>
    </section>
  )
}

export default Industry
