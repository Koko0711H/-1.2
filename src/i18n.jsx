import { createContext, useContext, useState, useCallback } from 'react'

const translations = {
  // ===== Navigation =====
  navHome: { en: 'Home', zh: '首页' },
  navAbout: { en: 'About Us', zh: '关于我们' },
  navProducts: { en: 'Products', zh: '产品中心' },
  navCases: { en: 'Projects', zh: '项目案例' },
  navNews: { en: 'News', zh: '新闻资讯' },
  navService: { en: 'Sales & Service', zh: '销售与服务' },
  home2Title: { en: 'Energy Solutions', zh: '能源解决方案' },
  home2Sub: { en: 'Intelligent power systems for every scenario', zh: '面向每一场景的智能电力系统' },
  home2Placeholder: { en: 'Page under construction — Coming Soon', zh: '页面建设中 — 敬请期待' },
  home3Title: { en: 'Global Service', zh: '全球服务' },
  home3Sub: { en: 'Reliable power partner across 50+ countries', zh: '覆盖50+国家的可靠电力合作伙伴' },
  home3Placeholder: { en: 'Page under construction — Coming Soon', zh: '页面建设中 — 敬请期待' },
  navIndustry: { en: 'Online Showroom', zh: '网上展厅' },
  getQuote: { en: 'Get Quote', zh: '获取报价' },

  // ===== Hero =====
  heroTitle1: { en: 'Smart Equipment Manufacturer', zh: '专注电力行业的智能装备制造商' },
  heroSub1: { en: 'Custom Energy Solutions', zh: '定制专属能源解决方案' },
  heroTitle2: { en: 'Full Range Generator Sets', zh: '柴油发电机组全系列解决方案' },
  heroSub2: { en: 'Power from 30KW to 2000KW', zh: '功率覆盖 30KW - 2000KW' },
  heroTitle3: { en: 'Your Trusted Power Partner', zh: '全球客户的可靠电力合作伙伴' },
  heroSub3: { en: 'Exported to 50+ Countries', zh: '产品远销 50 多个国家和地区' },
  learnMore: { en: 'Learn More', zh: '了解更多' },
  getQuoteBtn: { en: 'Get Quote', zh: '获取报价' },

  // ===== Products =====
  productsTitle: { en: 'Explore Products', zh: '探索产品' },
  productsSub: { en: 'Smart Equipment Manufacturer for the Power Industry', zh: '专注电力行业的智能装备制造商' },
  prod1Tag: { en: '30KW-600KW', zh: '30KW-600KW' },
  prod1Name: { en: 'Silent Generator Set', zh: '静音型发电机组' },
  prod1Desc: { en: 'Fully enclosed silent enclosure design, noise level as low as 65dB, suitable for residential areas, hospitals, hotels and other noise-sensitive locations.', zh: '采用全封闭静音箱体设计，噪音低至65dB，适用于住宅区、医院、酒店等噪音敏感场所。' },
  prod2Tag: { en: '100KW-2000KW', zh: '100KW-2000KW' },
  prod2Name: { en: 'Open-Frame Generator Set', zh: '开架型发电机组' },
  prod2SmallName: { en: 'Open-Frame Generator Set (Small)', zh: '开架型发电机组（小）' },
  prod2Desc: { en: 'Classic open-frame design with excellent heat dissipation, suitable for industrial plants, mines, construction sites and other scenarios.', zh: '经典开架式设计，散热性能优异，适用于工业厂房、矿山、建筑工地等场景。' },
  prod3Tag: { en: '30KW-500KW', zh: '30KW-500KW' },
  prod3Name: { en: 'Mobile Trailer Generator Set', zh: '移动拖车式发电机组' },
  prod3Desc: { en: 'Equipped with professional trailer chassis, flexible and mobile, suitable for outdoor construction, field operations, emergency rescue and other scenarios.', zh: '配备专业拖车底盘，机动灵活，适用于户外施工、野外作业、应急救援等场景。' },
  prod4Tag: { en: '10KV-35KV', zh: '10KV-35KV' },
  prod4Name: { en: 'High Voltage Distribution System', zh: '高压配电系统' },
  prod4Desc: { en: 'Complete high-voltage power distribution solution with intelligent monitoring, reliable protection, suitable for industrial parks, mines and large commercial complexes.', zh: '完整高压配电解决方案，配备智能监控和可靠保护系统，适用于工业园区、矿山及大型商业综合体。' },
  learnMore: { en: 'Learn More', zh: '了解更多' },
  prod1Detail: { en: 'Features: Low noise as low as 65dB, ATS automatic transfer switch, remote monitoring, power range 30KW-600KW. Applications: hospitals, hotels, residential areas, offices, studios.', zh: '特点：噪音低至65dB、支持ATS自动切换、远程监控系统、功率覆盖30KW-600KW。应用场景：医院、酒店、住宅区、办公场所、录音棚等对噪音敏感的环境。' },
  rich1Title: { en: 'ALL-IN-ONE', zh: 'ALL-IN-ONE' },
  rich1Desc: { en: 'Design & Quick Deployment: Modular layout, "fully tested before leaving the factory, add fuel and connect cables on-site to run, reducing deployment time from weeks to days"', zh: '设计与快速部署：模块化布局，"出厂前整机测试，抵达现场后添加燃料连接电缆即可运行，将部署时间从数周缩短至几天"' },
  rich2Title: { en: 'Airflow Design', zh: '气流设计' },
  rich2Desc: { en: 'Adopts angled guide air intake structure for smoother airflow, lower exhaust resistance, and higher heat dissipation efficiency.', zh: '采用斜向导流进气结构，进气更加顺畅、排气阻力低、散热效率高。' },
  rich3Title: { en: 'Vibration Damping Structure', zh: '减震设计结构' },
  rich3Desc: { en: 'Reinforced chassis structure, efficient vibration damping system, IP55 chassis protection rating. Designed for harsh operating environments, ensuring stable structure in all conditions.', zh: '强化底盘结构、高效减震系统、底盘IP55防护等级。为您考虑到了恶劣工况的使用环境，确保在任何情况下机组结构都能稳定运行。' },
  rich4Title: { en: 'Stable Power Output', zh: '动力系统稳定输出' },
  rich4Desc: { en: 'Diverse power sources, matched on demand — full range of engine brand options to meet different application scenarios.', zh: '多元动力，按需匹配——提供全系列发动机品牌选择，满足不同应用场景' },
  prod2Detail: { en: 'Features: Open-frame design, excellent heat dissipation, easy maintenance, parallel operation support, power range 100KW-2000KW. Applications: factories, mines, construction sites, outdoor events.', zh: '特点：开架式设计散热优异、维护便捷、支持多机并联、功率覆盖100KW-2000KW。应用场景：工厂、矿山、建筑工地、户外活动等大功率需求场景。' },
  prod3Detail: { en: 'Features: Professional trailer chassis, road-legal, quick deployment, all-terrain tires, power range 30KW-500KW. Applications: emergency rescue, field operations, temporary construction.', zh: '特点：专业拖车底盘、合法上路、快速部署、全地形轮胎、功率覆盖30KW-500KW。应用场景：应急救援、野外作业、临时施工等需要快速机动供电的场景。' },
  prod4Detail: { en: 'Features: 10KV-35KV rated voltage, intelligent monitoring, automatic protection, modular design. Applications: industrial parks, mines, large commercial complexes, data centers.', zh: '特点：额定电压10KV-35KV、智能监控系统、自动保护装置、模块化设计便于扩展。应用场景：工业园区、矿山、大型商业综合体、数据中心等高可靠性供电场景。' },
  learnMoreBtn: { en: 'Learn More >', zh: '了解更多 >' },
  expandBtn: { en: 'Expand', zh: '展开' },
  moreDetailsBtn: { en: 'Learn More', zh: '了解更多' },
  productPageHint: { en: 'Click “Learn More” to browse the dedicated 3D product page', zh: '点击“了解更多”浏览3D产品专属页面' },
  foldBtn: { en: 'Fold', zh: '收起' },

  // ===== Open-Frame Rich Detail =====
  rich2_1Title: { en: 'ALL-IN-ONE', zh: 'ALL-IN-ONE' },
  rich2_1Desc: { en: 'Adopting the "All in One" design philosophy, integrating engine, generator, radiator, cooling system, power output system and intelligent control system into an integrated open-frame generator set.', zh: '采用"All in One"的设计理念，将发动机、发电机、散热器、冷却系统、动力输出系统和智能控制系统集成在一起，形成一体化的开放式发电机组。' },
  rich2_2Title: { en: 'Stable Power Output', zh: '动力系统稳定输出' },
  rich2_2Desc: { en: 'Diverse power sources, matched on demand — full range of engine brand options to meet different application scenarios.', zh: '多元动力，按需匹配——提供全系列发动机品牌选择，满足不同应用场景' },
  rich2_3Title: { en: 'Strong Load Capacity', zh: '负载能力强' },
  rich2_3Desc: { en: 'Connected to power via ATS, achieving automatic switching between mains and backup power. Multiple generator sets can be paralleled to further meet power supply demands. Capable of prolonged full-load operation, with short transient voltage recovery time, strong nonlinear load capacity, and excellent electromagnetic compatibility.', zh: '通过ATS与电源相连，实现市电与备用电源之间的自动切换，还可实现多台发电机组并联，进一步满足发电机组的供电需求；可长时间满负荷作业，发电机具备瞬态电压恢复时间短，带非线性负载能力强，电磁兼容性强等特点。' },
  // ===== Mobile Trailer Rich Detail =====
  rich3_1Title: { en: 'All-Terrain Mobility', zh: '全地形移动' },
  rich3_1Desc: { en: 'Can be placed indoors or outdoors. Equipped with road-grade towing system to meet road trailer requirements, truly achieving power on the go. Compact size, easy to move, flexible operation, providing rapid emergency power for dispersed users, with quick installation, strong versatility and short lead times.', zh: '既可置于室内，也可直接摆放于室外。配备道路版行驶系统，可满足道路拖车行驶需求，真正做到电力随行；体积小，移动方便，操作灵活，为地点分散的用户迅速提供紧急供电，并且能快速安装、通用性强、货期短的拖车静音电源' },
  rich3_2Title: { en: 'Stable Power Output', zh: '动力系统稳定输出' },
  rich3_2Desc: { en: 'Diverse power sources, matched on demand - full range of engine brand options to meet different application scenarios.', zh: '多元动力，按需匹配——提供全系列发动机品牌选择，满足不同应用场景' },
  rich3_3Title: { en: 'Dual Braking Safety', zh: '行车驻车双保险' },
  rich3_3Desc: { en: 'Driving braking system: inertia braking guidance, automatically triggered during towing, converting drawbar thrust into braking force, sensitive and reliable. Parking braking system: automatic locking when parked, eliminating rolling risks.', zh: '行车制动系统：采用惯性制动导向，主车制动时自动触发，牵引杆推力转化为制动力，灵敏可靠。驻车制动系统：停车自动锁止，杜绝溜车隐患' },
  rich3_4Title: { en: 'Ultra Quiet', zh: '极致静音' },
  rich3_4Desc: { en: 'Utilizing multiple soundproofing methods to create a silent enclosure, achieving a quiet experience for the generator set.', zh: '依托多项隔音手段打造静音箱体，实现发电机组的静音体验' },
  getQuoteBtn2: { en: 'Get Quote >', zh: '获取报价 >' },

  // ===== Industry =====
  industryTitle: { en: 'Industry Focus', zh: '聚焦行业' },
  industrySub: { en: 'Product solutions for different fields', zh: '了解不同领域的产品解决方案' },
  ind1Title: { en: 'Construction Site', zh: '建筑工地' },
  ind1Sub: { en: 'Reliable power for construction projects', zh: '为建筑工地提供可靠电力保障' },
  ind2Title: { en: 'School', zh: '学校' },
  ind2Sub: { en: 'Ensuring uninterrupted learning environment', zh: '保障教学环境电力不间断' },
  ind3Title: { en: 'Hospital', zh: '医院' },
  ind3Sub: { en: 'Critical power backup for life safety', zh: '为医疗设备提供关键备用电力' },
  ind4Title: { en: 'Shopping Center', zh: '大型商圈' },
  ind4Sub: { en: 'Reliable power for commercial operations', zh: '为商圈运营提供可靠后备电力' },
  ind5Title: { en: 'Data Center', zh: '数据中心' },
  ind5Sub: { en: 'Ensuring 24/7 uninterrupted server operation', zh: '确保服务器7×24小时不间断运行' },
  ind6Title: { en: 'Sports Event', zh: '体育赛事' },
  ind6Sub: { en: 'Reliable power supply for major events', zh: '保障大型赛事活动电力供应' },
  ind7Title: { en: 'Logistics Park', zh: '物流园区' },
  ind7Sub: { en: 'Efficient power for logistics operations', zh: '为物流园区提供高效电力支持' },
  ind8Title: { en: 'Farm', zh: '养殖场' },
  ind8Sub: { en: 'Stable power for agricultural facilities', zh: '为养殖设施提供稳定电力' },
  consultBtn: { en: 'Consult Now >', zh: '立即咨询 >' },

  // ===== About =====
  aboutTitle: { en: 'About ShenChai Power', zh: '关于深柴电力' },
  aboutSub: { en: 'A Trusted Generator Set Manufacturer', zh: '值得信赖的发电机组制造商' },
  aboutH3: { en: '20 Years of Excellence', zh: '二十年专注，铸就行业品牌' },
  aboutP1: { en: 'ShenChai Power is a comprehensive enterprise integrating R&D, production, sales and service of diesel generator sets. The company has a modern production base with an annual capacity of over 5,000 units.', zh: '深柴电力是一家集柴油发电机组研发、生产、销售和服务于一体的综合性企业。公司拥有现代化生产基地，年产能超过5000台套。' },
  aboutP2: { en: 'Leveraging the strength of state-owned enterprises and combining it with market-driven innovation, ShenChai Power has grown into a leading manufacturer of diesel generator sets.', zh: '依托国企实力，结合市场化创新机制，深柴电力已发展成为国内领先的柴油发电机组制造商。' },
  aboutImgAlt: { en: 'ShenChai Power Production Base', zh: '深柴电力生产基地' },
  stat1: { en: '20+ Years', zh: '20+ 年行业经验' },
  stat2: { en: '500+ Clients', zh: '500+ 服务客户' },
  stat3: { en: '50+ Countries', zh: '50+ 出口国家' },
  stat4: { en: 'ISO Certified', zh: 'ISO 权威认证' },

  // ===== Advantages =====
  advTitle: { en: 'Why Choose Us', zh: '为什么选择我们' },
  advSub: { en: 'Professional team, quality assurance, trustworthy partner', zh: '专业团队，品质保障，值得信赖的合作伙伴' },
  adv1Title: { en: 'Strict Quality', zh: '严格品控' },
  adv1Desc: { en: 'Each unit undergoes rigorous testing before leaving the factory, ensuring every product meets industry standards.', zh: '每台机组出厂前经过严格测试，确保每台产品都达到行业标准。' },
  adv2Title: { en: 'Advanced Technology', zh: '技术先进' },
  adv2Desc: { en: 'Professional R&D team, continuous technological innovation, adopting internationally advanced engine and alternator technology.', zh: '拥有专业研发团队，持续技术创新，采用国际先进的发动机和发电机技术。' },
  adv3Title: { en: 'Complete Service', zh: '完善服务' },
  adv3Desc: { en: 'Full lifecycle service from pre-sales consultation, design, installation, training to after-sales maintenance.', zh: '提供售前咨询、方案设计、安装调试、培训指导到售后维护的全生命周期服务。' },
  adv4Title: { en: 'Global Supply', zh: '全球供应' },
  adv4Desc: { en: 'Products exported to 50+ countries and regions with a comprehensive global sales and service network.', zh: '产品远销50多个国家和地区，建立了完善的全球销售和服务网络。' },

  // ===== Cases =====
  casesTitle: { en: 'Project Cases', zh: '项目案例' },
  casesSub: { en: 'Successful projects worldwide, your trusted partner', zh: '遍布全球的成功项目，值得信赖的合作伙伴' },
  case1Title: { en: 'Industrial Park Backup Power Project', zh: '某大型工业园区备用电力项目' },
  case1Desc: { en: 'Provided complete backup power solution for a large industrial park in South China, with multiple 1000KW units in parallel operation.', zh: '为华南地区某大型工业园区提供全套备用电力解决方案，配备多台1000KW机组并联运行。' },
  case1Loc: { en: 'Guangzhou, China', zh: '广东省广州市' },
  case2Title: { en: 'Overseas Data Center Power Solution', zh: '海外数据中心供电方案' },
  case2Desc: { en: 'High-reliability power system for a large data center in Southeast Asia, with N+1 redundancy ensuring 24/7 operation.', zh: '为东南亚某大型数据中心提供高可靠性供电系统，采用N+1冗余配置，保障7×24小时运行。' },
  case2Loc: { en: 'Singapore', zh: '新加坡' },
  case3Title: { en: 'Construction Site Temporary Power', zh: '大型建筑工程临时供电' },
  case3Desc: { en: 'Temporary construction power solution for a municipal key project, with mobile generator sets meeting high-power demands.', zh: '为某市政重点工程项目提供临时施工用电方案，配备移动式发电机组满足大功率需求。' },
  case3Loc: { en: 'Shenzhen, China', zh: '深圳市南山区' },
  case4Title: { en: 'Hospital Backup Power System', zh: '医院应急供电系统' },
  case4Desc: { en: 'Provided uninterruptible power supply system for a Grade-A hospital, ensuring critical medical equipment operates without interruption.', zh: '为某三甲医院提供不间断供电系统，确保关键医疗设备持续运行。' },
  case4Loc: { en: 'Shanghai, China', zh: '上海市' },
  case5Title: { en: 'Livestock Farm Power Solution', zh: '大型养殖场电力保障方案' },
  case5Desc: { en: 'Delivered stable power solution for a large-scale livestock farm, supporting ventilation, heating and automated feeding systems.', zh: '为大型养殖场提供稳定电力方案，支持通风、供暖及自动化饲养系统。' },
  case5Loc: { en: 'Henan, China', zh: '河南省' },
  case6Title: { en: 'Mining Site Power Supply', zh: '矿山作业供电项目' },
  case6Desc: { en: 'Supplied heavy-duty generator sets for an open-pit mining operation, with dust-proof and weather-resistant configurations.', zh: '为露天矿山作业提供重型发电机组，配备防尘防恶劣天气配置。' },
  case6Loc: { en: 'Inner Mongolia, China', zh: '内蒙古自治区' },

  // ===== Contact =====
  contactEyebrow: { en: 'SALES & SERVICE', zh: '销售与服务' },
  contactTitle: { en: 'Contact Us', zh: '联系我们' },
  contactLead: { en: 'From product selection to after-sales support, we provide a complete power solution for your business.', zh: '从产品选型到售后服务，为您提供全流程电力解决方案。' },
  contactAddr: { en: 'Address', zh: '公司地址' },
  contactAddrVal: { en: 'C1006, Cangshan Smart Industrial Park, Fuzhou, Fujian, China', zh: '福建省福州市仓山智能产业园C区1006' },
  contactPhone: { en: 'Phone', zh: '联系电话' },
  contactEmail: { en: 'Email', zh: '电子邮箱' },
  contactHours: { en: 'Working Hours', zh: '工作时间' },
  contactHoursVal: { en: 'Mon-Sat 8:30 - 18:00', zh: '周一至周六 8:30 - 18:00' },
  contactRdBase: { en: 'R&D Base', zh: '研发基地' },
  contactRdBaseVal: { en: 'Shenyang, Liaoning', zh: '辽宁沈阳' },
  contactProdBase: { en: 'Production Base', zh: '生产基地' },
  contactProdBaseVal: { en: 'Shenyang, Liaoning & Ningde, Fujian', zh: '辽宁沈阳、福建宁德' },
  contactOpsCenter: { en: 'Operations Center', zh: '运营中心' },
  contactOpsCenterVal: { en: 'Fuzhou, Fujian', zh: '福建福州' },
  formEyebrow: { en: 'ONLINE SERVICE', zh: '在线服务' },
  formTitle: { en: 'Online Inquiry', zh: '在线留言' },
  formLead: { en: 'Tell us what you need and our team will get back to you shortly.', zh: '填写您的需求，我们的专业团队会尽快与您联系。' },
  formName: { en: 'Your Name', zh: '您的姓名' },
  formNamePh: { en: 'Please enter your name', zh: '请输入您的姓名' },
  formPhone: { en: 'Phone Number', zh: '联系电话' },
  formPhonePh: { en: 'Please enter your phone number', zh: '请输入您的联系电话' },
  formEmail: { en: 'Email Address', zh: '电子邮箱' },
  formEmailPh: { en: 'Please enter your email', zh: '请输入您的电子邮箱' },
  formMsg: { en: 'Message', zh: '留言内容' },
  formMsgPh: { en: 'Describe your requirements...', zh: '请描述您的需求...' },
  formSubmit: { en: 'Submit Inquiry', zh: '提交留言' },
  formThanks: { en: 'Thank you for your inquiry! We will contact you shortly.', zh: '感谢您的咨询！我们会尽快与您联系。' },

  // ===== Footer =====
  footerAbout: { en: 'About', zh: '关于我们' },
  footerProducts: { en: 'Products', zh: '产品中心' },
  footerContact: { en: 'Contact', zh: '联系方式' },
  footerCopyright: { en: '? 2026 ShenChai Power. All Rights Reserved.', zh: '? 2026 深柴电力 版权所有' },
  footerProd1: { en: 'Silent Generator Sets', zh: '静音型机组' },
  footerProd2: { en: 'Open-Frame Sets', zh: '开架型机组' },
  footerProd3: { en: 'Mobile Sets', zh: '移动式机组' },
  footerProd4: { en: 'Container Sets', zh: '集装箱式机组' },
  footerAboutLink1: { en: 'Company Profile', zh: '公司简介' },
  footerAboutLink2: { en: 'Core Advantages', zh: '核心优势' },
  footerAboutLink3: { en: 'Project Cases', zh: '项目案例' },
  footerAboutLink4: { en: 'Contact Us', zh: '联系我们' },
  spotlightTitle: { en: 'Explore Our Technology', zh: '探索我们的技术' },
  spotlightSub: { en: 'Move your mouse to reveal the internal structure', zh: '移动鼠标揭示内部结构' },
  spotlightHint: { en: 'Hover to explore', zh: '悬停探索' },
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en' ? 'zh' : 'en')
  }, [])

  const t = useCallback((key) => {
    return translations[key]?.[lang] || key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
