import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'

const projectCases = [
  {
    image: '/case-archive/rail-hub.webp',
    zh: {
      category: '交通枢纽 / 连续运行',
      desc: '站场运行、旅客服务与调度系统，需要可靠的备用电力保障。',
      context: 'TRANSPORT HUB',
    },
    en: {
      category: 'TRANSPORT / CONTINUOUS DUTY',
      desc: 'Station operations, passenger services and dispatch systems rely on dependable backup power.',
      context: 'TRANSPORT HUB',
    },
  },
  {
    image: '/case-archive/public-service.webp',
    zh: {
      category: '公共建筑 / 备用保障',
      desc: '政务办公与公共服务负载，需要清晰、可控的应急供电覆盖。',
      context: 'CIVIC SERVICES',
    },
    en: {
      category: 'CIVIC / BACKUP COVERAGE',
      desc: 'Public service and administrative workloads require controlled emergency power coverage.',
      context: 'CIVIC SERVICES',
    },
  },
  {
    image: '/case-archive/mountain-hospitality.webp',
    zh: {
      category: '文旅酒店 / 静音运行',
      desc: '客房、接待与配套设施，需要低噪且稳定的应急供电支持。',
      context: 'HOSPITALITY',
    },
    en: {
      category: 'HOSPITALITY / QUIET DUTY',
      desc: 'Guest rooms and service facilities call for quiet, dependable emergency power.',
      context: 'HOSPITALITY',
    },
  },
  {
    image: '/case-archive/railway-museum.webp',
    zh: {
      category: '文化设施 / 重点负载',
      desc: '展陈、安防与访客服务等关键负载，需要在断电时保持稳定运行。',
      context: 'CULTURAL FACILITY',
    },
    en: {
      category: 'CULTURAL / CRITICAL LOADS',
      desc: 'Exhibition, security and visitor-service loads need to remain stable during interruptions.',
      context: 'CULTURAL FACILITY',
    },
  },
  {
    image: '/case-archive/green-energy.webp',
    zh: {
      category: '绿色能源 / 园区配套',
      desc: '分布式能源设施与生产配套系统，需要稳定的持续供电支持。',
      context: 'GREEN ENERGY',
    },
    en: {
      category: 'GREEN ENERGY / SITE SUPPORT',
      desc: 'Distributed energy assets and supporting operations require stable, continuous power.',
      context: 'GREEN ENERGY',
    },
  },
  {
    image: '/case-archive/transport-design.webp',
    zh: {
      category: '专业总部 / 办公备电',
      desc: '设计协同、数字办公与服务系统，需要可靠的后备电力。',
      context: 'ENGINEERING OFFICE',
    },
    en: {
      category: 'ENGINEERING / OFFICE BACKUP',
      desc: 'Engineering collaboration and digital workplace systems require dependable backup power.',
      context: 'ENGINEERING OFFICE',
    },
  },
  {
    image: '/case-archive/industrial-process.webp',
    zh: {
      category: '工业工艺 / 过程连续',
      desc: '泵组、通风与控制系统等工艺负载，需要受控的连续供电保障。',
      context: 'PROCESS PLANT',
    },
    en: {
      category: 'PROCESS / CONTINUITY',
      desc: 'Pumps, ventilation and control systems need controlled continuity of supply.',
      context: 'PROCESS PLANT',
    },
  },
  {
    image: '/case-archive/power-generation.webp',
    zh: {
      category: '能源设施 / 辅助供电',
      desc: '大型能源设施的辅助与安全负载，需要可依赖的电力支持。',
      context: 'ENERGY FACILITY',
    },
    en: {
      category: 'ENERGY / AUXILIARY POWER',
      desc: 'Auxiliary and safety loads at major energy facilities require reliable power support.',
      context: 'ENERGY FACILITY',
    },
  },
  {
    image: '/case-archive/retail-complex.webp',
    zh: {
      category: '商业综合体 / 高峰保障',
      desc: '照明、零售与客户服务系统，需要在高峰运营中保持供电连续。',
      context: 'RETAIL COMPLEX',
    },
    en: {
      category: 'RETAIL / PEAK COVERAGE',
      desc: 'Lighting, retail and customer-service systems need continuity during peak operation.',
      context: 'RETAIL COMPLEX',
    },
  },
  {
    image: '/case-archive/airport-terminal.webp',
    zh: {
      category: '航空枢纽 / 多层韧性',
      desc: '航站楼与地面配套系统，需要具备多层级的供电韧性。',
      context: 'AIRPORT TERMINAL',
    },
    en: {
      category: 'AVIATION / RESILIENT POWER',
      desc: 'Terminal buildings and ground-support systems require multi-layered power resilience.',
      context: 'AIRPORT TERMINAL',
    },
  },
  {
    image: '/case-archive/telecom-center.webp',
    zh: {
      category: '通信中心 / 在线保障',
      desc: '网络与数据业务对运行连续性要求高，需要可靠的后备电力体系。',
      context: 'TELECOM CENTER',
    },
    en: {
      category: 'TELECOM / NETWORK UPTIME',
      desc: 'Network and data workloads depend on continuous uptime and dependable backup power.',
      context: 'TELECOM CENTER',
    },
  },
  {
    image: '/case-archive/manufacturing-campus.webp',
    zh: {
      category: '制造园区 / 生产连续',
      desc: '生产与物流链路需要规划化的备用供电，降低运营中断风险。',
      context: 'MANUFACTURING CAMPUS',
    },
    en: {
      category: 'MANUFACTURING / CONTINUITY',
      desc: 'Production and logistics operations need planned backup power to reduce interruption risk.',
      context: 'MANUFACTURING CAMPUS',
    },
  },
]

const timelineGroups = Array.from({ length: projectCases.length / 2 }, (_, index) => ({
  projects: projectCases.slice(index * 2, index * 2 + 2),
}))

function Cases() {
  const { lang } = useLang()
  const copyKey = lang === 'zh' ? 'zh' : 'en'
  const sectionRef = useRef(null)
  const recordRefs = useRef([])
  const [timelineProgress, setTimelineProgress] = useState(0)
  const [recordProgresses, setRecordProgresses] = useState([])

  useEffect(() => {
    let frameId = null

    const updateTimeline = () => {
      const section = sectionRef.current
      if (!section) return

      const { top, height } = section.getBoundingClientRect()
      const viewport = window.innerHeight || 1
      const progressRange = height + viewport * 0.45
      const progress = Math.max(0, Math.min(100, ((viewport * 0.78 - top) / progressRange) * 100))

      setTimelineProgress(Math.round(progress * 10) / 10)

      const revealStart = viewport * 0.94
      const revealEnd = viewport * 0.77
      const nextRecordProgresses = recordRefs.current.map((record) => {
        if (!record) return 0
        const recordTop = record.getBoundingClientRect().top
        return Math.max(0, Math.min(1, (revealStart - recordTop) / (revealStart - revealEnd)))
      })

      setRecordProgresses((current) => {
        const hasChanged = current.length !== nextRecordProgresses.length
          || nextRecordProgresses.some((value, index) => Math.abs(value - (current[index] ?? 0)) > 0.01)
        return hasChanged ? nextRecordProgresses : current
      })
    }

    const requestUpdate = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(() => {
        frameId = null
        updateTimeline()
      })
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <section
      className="cases-section"
      id="cases"
      ref={sectionRef}
      style={{ '--timeline-progress': timelineProgress }}
    >
      <div className="cases-archive">
        <div className="section-title">
          <div className="section-heading-meta">
            <span>05 / PROJECT CASES</span>
            <span>12 REAL PROJECT CASES · TRANSPORT · CIVIC · ENERGY · INDUSTRY</span>
          </div>
          <div className="section-heading-copy">
            <h2>{lang === 'zh' ? '项目案例' : 'Project Cases'}</h2>
            <p>{lang === 'zh' ? '甄选真实项目案例，覆盖多元实际应用场景，以稳定实践印证可靠供电能力。' : 'A curated selection of real project cases across diverse operating environments, demonstrating dependable power in practice.'}</p>
          </div>
        </div>

        <div className="cases-timeline">
          <svg className="case-timeline-curve" viewBox="0 0 100 600" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <filter id="case-timeline-glow" x="-80%" y="-10%" width="260%" height="120%">
                <feGaussianBlur stdDeviation="0.65" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path className="case-timeline-route" pathLength="100" d="M50 0C22 35 78 65 50 100S22 165 50 200S78 265 50 300S22 365 50 400S78 465 50 500S22 565 50 600" />
            <path className="case-timeline-energy" pathLength="100" d="M50 0C22 35 78 65 50 100S22 165 50 200S78 265 50 300S22 365 50 400S78 465 50 500S22 565 50 600" />
            <path className="case-timeline-flow" pathLength="100" d="M50 0C22 35 78 65 50 100S22 165 50 200S78 265 50 300S22 365 50 400S78 465 50 500S22 565 50 600" />
          </svg>
          {timelineGroups.map(({ projects }, groupIndex) => {
            const insertionProgress = recordProgresses[groupIndex] ?? 0
            const isRevealed = insertionProgress > 0.02
            const recordStyle = {
              '--card-opacity': insertionProgress.toFixed(3),
              '--card-scale': (0.94 + insertionProgress * 0.06).toFixed(3),
              '--card-shift-left': `${Math.round((insertionProgress - 1) * 164)}px`,
              '--card-shift-right': `${Math.round((1 - insertionProgress) * 164)}px`,
            }
            return (
              <div
                className={`case-timeline-record${isRevealed ? ' is-revealed' : ''}`}
                key={projects[0].image}
              ref={(node) => { recordRefs.current[groupIndex] = node }}
              style={recordStyle}
            >
                {projects.map((item, sideIndex) => {
                  const copy = item[copyKey]
                  const cardIndex = groupIndex * 2 + sideIndex
                  const side = sideIndex === 0 ? 'left' : 'right'
                  return (
                    <article className={`case-card case-timeline-card case-timeline-card--${side}`} key={item.image} aria-label={copy.category}>
                      <img
                        src={item.image}
                        alt={copy.category}
                        className="case-img-photo"
                        loading={cardIndex > 2 ? 'lazy' : 'eager'}
                        decoding="async"
                      />
                      <div className="case-card-shade" aria-hidden="true" />
                      <span className="case-card-index">{String(cardIndex + 1).padStart(2, '0')}</span>
                      <div className="case-info">
                        <span className="case-record-label">{copy.category}</span>
                        <p>{copy.desc}</p>
                        <span className="case-context">{copy.context}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Cases
