import { useState } from 'react'
import { useLang } from '../i18n'

function Cases() {
  const { t } = useLang()
  const [paused, setPaused] = useState(false)

  const cases = [
    { title: 'case1Title', desc: 'case1Desc', loc: 'case1Loc', img: '/case-park.jpg' },
    { title: 'case2Title', desc: 'case2Desc', loc: 'case2Loc', img: '/case-datacenter.jpg' },
    { title: 'case3Title', desc: 'case3Desc', loc: 'case3Loc', img: '/case-construction.jpg' },
    { title: 'case4Title', desc: 'case4Desc', loc: 'case4Loc', img: '/case-hospital.jpg' },
    { title: 'case5Title', desc: 'case5Desc', loc: 'case5Loc', img: '/case-farm.jpg' },
    { title: 'case6Title', desc: 'case6Desc', loc: 'case6Loc', img: '/case-mine.jpg' },
  ]

  const allCases = [...cases, ...cases]

  return (
    <section className="cases-section" id="cases">
      <div className="section-title">
        <h2>{t('casesTitle')}</h2>
        <div className="underline"></div>
        <p>{t('casesSub')}</p>
      </div>
      <div
        className="cases-scroll"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className={`cases-track ${paused ? 'paused' : ''}`}>
          {allCases.map((item, index) => (
            <div className="case-card" key={index}>
              <div className={`case-img ${item.bg || ''}`}>
                {item.img ? (
                  <img src={item.img} alt={t(item.title)} className="case-img-photo" />
                ) : (
                  <span style={{ fontSize: 48 }}>{item.icon}</span>
                )}
              </div>
              <div className="case-info">
                <h3>{t(item.title)}</h3>
                <p>{t(item.desc)}</p>
                <span className="location">{t(item.loc)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Cases