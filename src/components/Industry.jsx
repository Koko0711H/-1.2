import { useState } from 'react'
import { useLang } from '../i18n'
import imgConstruction from '../assets/images/industry-construction.jpg'
import imgSchool from '../assets/images/industry-school.jpg'
import imgHospital from '../assets/images/industry-hospital.jpg'
import imgMall from '../assets/images/industry-mall.jpg'
import imgDatacenter from '../assets/images/industry-datacenter.jpg'
import imgFarm from '../assets/images/industry-farm.jpg'
import imgSports from '../assets/images/industry-sports.jpg'

const industryImgs = {
  construction: imgConstruction,
  school: imgSchool,
  hospital: imgHospital,
  mall: imgMall,
  datacenter: imgDatacenter,
  farm: imgFarm,
  sports: imgSports,
}

function Industry() {
  const { t } = useLang()
  const [paused, setPaused] = useState(false)

  const items = [
    { titleKey: 'ind1Title', subKey: 'ind1Sub', img: 'construction' },
    { titleKey: 'ind2Title', subKey: 'ind2Sub', img: 'school' },
    { titleKey: 'ind3Title', subKey: 'ind3Sub', img: 'hospital' },
    { titleKey: 'ind4Title', subKey: 'ind4Sub', img: 'mall' },
    { titleKey: 'ind5Title', subKey: 'ind5Sub', img: 'datacenter' },
    { titleKey: 'ind6Title', subKey: 'ind6Sub', img: 'sports' },
    { titleKey: 'ind8Title', subKey: 'ind8Sub', img: 'farm' },
  ]

  const allItems = [...items, ...items]

  return (
    <section className="industry-section" id="industry">
      <div className="section-title">
        <h2>{t('industryTitle')}</h2>
        <div className="underline"></div>
        <p>{t('industrySub')}</p>
      </div>
      <div
        className="industry-scroll"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className={`industry-track ${paused ? 'paused' : ''}`}>
          {allItems.map((item, i) => (
            <div className="industry-card" key={i}>
              <img
                src={industryImgs[item.img]}
                alt={t(item.titleKey)}
                className="industry-card-bg"
              />
              <div className="industry-card-overlay">
                <h3>{t(item.titleKey)}</h3>
                <p>{t(item.subKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Industry