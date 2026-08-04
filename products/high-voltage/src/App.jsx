import { useRef, useState, useEffect, Suspense, useMemo, useCallback, createContext, useContext } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import "./App.css"
import { getInitialLanguage, syncLanguageToUrl, withLanguage } from "./languageRouting"
import ProductNavigation from "../../shared/ProductNavigation"
import { PRODUCT_SITES, ProductBrowseMenu } from "../../shared/ProductBrowseMenu"

// Error display for debugging
window.addEventListener("error", (e) => {
  const div = document.createElement("div");
  div.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:#ff3333;color:white;padding:20px;font-size:14px;font-family:monospace;word-break:break-all";
  div.textContent = "JS Error: " + (e.message || e.error?.message || e.type);
  document.body.prepend(div);
  console.error("Caught error:", e);
});
window.addEventListener("unhandledrejection", (e) => {
  const div = document.createElement("div");
  div.style.cssText = "position:fixed;top:40px;left:0;right:0;z-index:9999;background:#0a2850;color:white;padding:20px;font-size:14px;font-family:monospace;word-break:break-all";
  div.textContent = "Promise Error: " + (e.reason?.message || String(e.reason));
  document.body.prepend(div);
});



const STAGES = [
  { id: "home", label: "高压配电系统", cam: [-2, 1.5, 5], target: [0, 0, 0], fov: 40, rot: 0 },
  { id: "allinone", label: "集成成套", cam: [0, 5, 7.5], target: [0, 0, 0], fov: 26, rot: -1.5 },
  { id: "engine", label: "模块化柜体", cam: [0, 1.5, 6], target: [0, 0, 0], fov: 28, rot: 0 },
  { id: "airflow", label: "运行防护", cam: [-7.5, 5, 4.5], target: [0, 0, 0], fov: 24, rot: 1.5 },
  { id: "chassis", label: "工程交付", cam: [-5.5, -1.5, 1.8], target: [0, 0.5, 0], fov: 30, rot: 3.0 },
]


function ModelGroup({ url, progress }) {
  const groupRef = useRef()
  const [scene, setScene] = useState(null)
  const rot = useRef(0)
  const { size } = useThree()
  useEffect(() => {
    let c = false
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath("/product-assets/shared/draco/")
    loader.setDRACOLoader(dracoLoader)
    loader.load(url, (g) => {
      if (c) return
      const s = g.scene
      s.traverse((ch) => { if (ch.isMesh) { ch.castShadow = true; ch.receiveShadow = true } })
      const box = new THREE.Box3().setFromObject(s)
      s.position.sub(box.getCenter(new THREE.Vector3()))
      setScene(s)
    }, () => {}, () => {})
    return () => { c = true; dracoLoader.dispose() }
  }, [url])
  useFrame(() => {
    if (groupRef.current) {
      const total = STAGES.length - 1
      const si = Math.min(Math.floor(progress * total), total - 1)
      const ni = Math.min(si + 1, total)
      const lp = Math.min(Math.max((progress * total) % 1, 0), 1)
      const siStage = STAGES[si], niStage = STAGES[ni]
      if (!siStage || !niStage) return
      const target = siStage.rot + (niStage.rot - siStage.rot) * lp
      rot.current += (target - rot.current) * 0.08
      groupRef.current.rotation.y = rot.current
    }
  })
  if (!scene) return null
  return <group ref={groupRef}><primitive object={scene} scale={size.width <= 900 ? 3.1 : 2.5} /></group>
}

function CameraController({ progress }) {
  const { camera, gl, size } = useThree()
  const pos = useRef(new THREE.Vector3())
  const cameraPoint = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  const fov = useRef(42)
  const controlsRef = useRef()
  const lastUser = useRef(0)
  useEffect(() => {
    const c = new OrbitControls(camera, gl.domElement)
    c.enableZoom = false; c.enablePan = false; c.enableRotate = false
    c.target.set(0, 0, 0); c.update()
    controlsRef.current = c
    const onStart = () => { lastUser.current = Date.now() }
    const onEnd = () => { lastUser.current = Date.now() }
    c.addEventListener("start", onStart); c.addEventListener("end", onEnd)
    return () => { c.removeEventListener("start", onStart); c.removeEventListener("end", onEnd); c.dispose() }
  }, [camera, gl])
  useFrame(() => {
    const total = STAGES.length - 1
    const si = Math.min(Math.floor(progress * total), total - 1)
    const ni = Math.min(si + 1, total)
    const lp = Math.min(Math.max((progress * total) % 1, 0), 1)
    const s = STAGES[si], n = STAGES[ni]
    if (!s || !n) return
    cameraPoint.current.set(
      s.cam[0] + (n.cam[0] - s.cam[0]) * lp,
      s.cam[1] + (n.cam[1] - s.cam[1]) * lp,
      s.cam[2] + (n.cam[2] - s.cam[2]) * lp
    )
    target.current.set(
      s.target[0] + (n.target[0] - s.target[0]) * lp,
      s.target[1] + (n.target[1] - s.target[1]) * lp,
      s.target[2] + (n.target[2] - s.target[2]) * lp
    )
    const aspect = size.height > 0 ? size.width / size.height : 1.65
    const mobileFit = size.width <= 900 ? Math.max(1, Math.min(1.18, 1.2 / aspect)) : 1
    pos.current.copy(target.current).add(cameraPoint.current.sub(target.current).multiplyScalar(mobileFit))
    fov.current = s.fov + (n.fov - s.fov) * lp
    const timeSinceUser = Date.now() - lastUser.current
    if (timeSinceUser > 2000) {
      camera.position.lerp(pos.current, 0.06)
      controlsRef.current?.target?.lerp(target.current, 0.06)
      camera.fov += (fov.current - camera.fov) * 0.06
      camera.updateProjectionMatrix()
    }
    controlsRef.current?.update()
  })
  return null
}

function Particles() {
  const COUNT = 100
  const ref = useRef()
  const speeds = useRef(new Float32Array(COUNT))
  const offsets = useRef(new Float32Array(COUNT))
  const basePos = useRef(new Float32Array(COUNT * 3))
  const sizes = useRef(new Float32Array(COUNT))

  const [geo] = useState(() => {
    const pos = new Float32Array(COUNT * 3)
    const siz = new Float32Array(COUNT)
    const spd = new Float32Array(COUNT)
    const off = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const radius = 1.5 + Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      siz[i] = 0.02 + Math.random() * 0.05
      spd[i] = 0.2 + Math.random() * 0.4
      off[i] = Math.random() * Math.PI * 2
    }
    speeds.current = spd
    offsets.current = off
    basePos.current = new Float32Array(pos)
    sizes.current = siz

    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    g.setAttribute("size", new THREE.BufferAttribute(siz, 1))
    return g
  })

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const posAttr = ref.current.geometry.attributes.position
    const arr = posAttr.array
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      arr[i3 + 1] = basePos.current[i3 + 1] + Math.sin(t * speeds.current[i] + offsets.current[i]) * 0.4
      const angle = t * 0.03
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const bx = basePos.current[i3]
      const bz = basePos.current[i3 + 2]
      arr[i3] = bx * cos - bz * sin
      arr[i3 + 2] = bx * sin + bz * cos
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.04}
        color="#ffffff"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function ScrollLightAtmosphere({ progress }) {
  const glows = [
    { x: 82, y: 16, strength: 0.9 },
    { x: 18, y: 24, strength: 0.82 },
    { x: 76, y: 72, strength: 0.94 },
    { x: 22, y: 76, strength: 0.86 },
    { x: 50, y: 18, strength: 0.9 },
  ]
  const scaled = Math.min(Math.max(progress * STAGES.length, 0), glows.length - 1)
  const fromIndex = Math.floor(scaled)
  const toIndex = Math.min(fromIndex + 1, glows.length - 1)
  const localProgress = scaled - fromIndex
  const blend = localProgress * localProgress * (3 - 2 * localProgress)
  const from = glows[fromIndex]
  const to = glows[toIndex]
  const mix = (key) => from[key] + (to[key] - from[key]) * blend
  const driftX = Math.sin(progress * Math.PI * 3) * 1.2
  const driftY = Math.cos(progress * Math.PI * 2.5) * 0.8
  const leave = Math.min(Math.max((0.965 - progress) / 0.035, 0), 1)
  const visibility = leave

  return (
    <div className="scroll-light-atmosphere" style={{ opacity: visibility }} aria-hidden="true">
      <span
        className="screen-light-halo"
        style={{
          "--light-x": `${mix("x") + driftX}%`,
          "--light-y": `${mix("y") + driftY}%`,
          opacity: mix("strength")
        }}
      />
    </div>
  )
}

function Preloader({ loaded }) {
  const [pct, setPct] = useState(0)
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    if (!loaded) {
      const t = setInterval(() => setPct(p => Math.min(p + Math.random() * 15, 100)), 300)
      return () => clearInterval(t)
    }
    setPct(100)
    setTimeout(() => setHidden(true), 800)
  }, [loaded])
  if (hidden) return null
  return (
    <aside className="preloader" style={{ opacity: pct >= 100 ? 0 : 1, pointerEvents: pct >= 100 ? "none" : "auto" }}>
      <div className="gear-loader">
        <svg className="gear-rotator" viewBox="0 0 120 120" width="100" height="100">
          <path d="M60 8c-3.3 0-6.5.4-9.5 1.2l-2.5-6.2c-.8-2-3-3-5-2.2l-6.2 2.5c-2 .8-3 3-2.2 5l2.3 5.7c-3.6 2-6.8 4.5-9.5 7.5l-5.8-2.3c-2-.8-4.2.2-5 2.2l-2.5 6.2c-.8 2 .2 4.2 2.2 5l5.7 2.3c-.9 3.2-1.4 6.5-1.4 9.9s.5 6.7 1.4 9.9l-5.7 2.3c-2 .8-3 3-2.2 5l2.5 6.2c.8 2 3 3 5 2.2l5.8-2.3c2.7 3 5.9 5.5 9.5 7.5l-2.3 5.7c-.8 2 .2 4.2 2.2 5l6.2 2.5c2 .8 4.2-.2 5-2.2l2.5-6.2c3 .8 6.2 1.2 9.5 1.2s6.5-.4 9.5-1.2l2.5 6.2c.8 2 3 3 5 2.2l6.2-2.5c2-.8 3-3 2.2-5l-2.3-5.7c3.6-2 6.8-4.5 9.5-7.5l5.8 2.3c2 .8 4.2-.2 5-2.2l2.5-6.2c.8-2-.2-4.2-2.2-5l-5.7-2.3c.9-3.2 1.4-6.5 1.4-9.9s-.5-6.7-1.4-9.9l5.7-2.3c2-.8 3-3 2.2-5l-2.5-6.2c-.8-2-3-3-5-2.2l-5.8 2.3c-2.7-3-5.9-5.5-9.5-7.5l2.3-5.7c.8-2-.2-4.2-2.2-5l-6.2-2.5c-2-.8-4.2.2-5 2.2L69.5 9.2C66.5 8.4 63.3 8 60 8zm0 15c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
          <circle cx="60" cy="47" r="14" fill="none" stroke="rgba(10,40,80,0.72)" strokeWidth="2" strokeDasharray={`${pct/100 * 88} 88`} transform="rotate(-90 60 47)"/>
        </svg>
      </div>
      <div className="progress-num"><p>{Math.round(pct)}%</p></div>
    </aside>
  )
}

function StateTable({ stages, currentIdx, onSelect }) {
  const { t } = useLang();
  return (
    <div className="statetable-container">
      <div className="statetable-content">
        <div className="backgroundLine" />
        {stages.map((s, i) => (
          <button type="button" key={s.id} className={"st-item" + (i === currentIdx ? " active" : "")} onClick={() => onSelect(i)}>
            <p className="table-name">{t("stage_" + s.id)}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function ContentOverlay({ stages, currentIdx, ready }) {
  const { t } = useLang();

  const visible = ready
  if (currentIdx < 0 || currentIdx >= stages.length) return null
  const s = stages[currentIdx]
  const isHome = s.id === "home"
  const isAllinone = s.id === "allinone"
  const isEngine = s.id === "engine"
  const isAirflow = s.id === "airflow"
  const isChassis = s.id === "chassis"

  const getAnimClass = (idx) => {
    if (idx === currentIdx) return "anim-active"
    if (idx === currentIdx - 1) return "anim-exit"
    return "anim-hidden"
  }

  const renderRightContent = (stage, idx) => {
    const ac = getAnimClass(idx)
    const isH = stage.id === "home"
    const isA = stage.id === "allinone"
    const isE = stage.id === "engine"
    const isAf = stage.id === "airflow"
    const isC = stage.id === "chassis"

    return (
      <div className={"anim-block " + ac} key={stage.id}>
        {isH && (
          <>
            <div className="home-top-right"><span className="home-big-title">{t("homeBigTitle")}</span></div>
            <div className="home-bottom-right text-block-animate">
              <p className="home-intro-text">{t("homeIntro1")}</p>
              <p className="home-intro-text">{t("homeIntro2")}</p>
            </div>
          </>
        )}
        {isA && (
          <div className="allinone-top-right text-block-animate">
            <p className="allinone-desc-text">{t("allinoneDesc")}</p>
          </div>
        )}
        {isE && (
          <div>
            <div className="engine-text-block">
              <p className="engine-desc-text">{t("engineDesc")}</p>
            </div>
          </div>
        )}
        {isAf && (
          <div className="airflow-top-right text-block-animate">
            <p className="airflow-desc-text">{t("airflowDesc")}</p>
          </div>
        )}
        {isC && (
          <div className="chassis-right text-block-animate">
            <p className="chassis-desc-text">{t("chassisDesc")}</p>
          </div>
        )}
        {!isH && !isA && !isE && !isAf && !isC && (
          <div className="content-right">
            <p className="content-desc">{stage.desc}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={"content-overlay" + (visible ? " visible" : "")}>
      <div className={"content-glow glow-" + s.id} />
      <div className="section-number"><span className="current">{String(currentIdx + 1).padStart(2, "0")}</span><span className="total"> / {String(stages.length).padStart(2, "0")}</span></div>
      <div className={"content-left" + (isHome ? " home-left" : "") + (isAllinone ? " allinone-left" : "") + (isEngine ? " engine-left" : "") + (isAirflow ? " airflow-left" : "") + (isChassis ? " chassis-left" : "")}>
        <div className="title-box" key={s.id}>
          <h2 className={"content-title" + (isHome ? " home-title" : "") + (isAllinone ? " allinone-title" : "") + (isEngine ? " engine-title" : "") + (isAirflow ? " airflow-title" : "") + (isChassis ? " chassis-title" : "")}>{isHome ? t("homeTitle") : t("stage_" + s.id)}</h2>
          <p className={"content-subtitle" + (isHome ? " home-subtitle" : "") + (isAllinone ? " allinone-subtitle" : "") + (isEngine ? " engine-subtitle" : "") + (isAirflow ? " airflow-subtitle" : "") + (isChassis ? " chassis-subtitle" : "")}>{t("sub_" + s.id)}</p>
        </div>
      </div>
      {stages.map((stage, idx) => renderRightContent(stage, idx))}
    </div>
  )
}

function TechTags() {
  return (
    <div className="tech-tags">
      <div className="tech-tag">HV<span className="label">POWER DISTRIBUTION</span></div>
      <div className="tech-tag">MODULAR<span className="label">SYSTEM ARCHITECTURE</span></div>
      <div className="tech-tag">CONTROLLED<span className="label">OPERATION</span></div>
      <div className="tech-tag">PROJECT<span className="label">ENGINEERING</span></div>
    </div>
  )
}

function FooterInfo() {
  return (
    <>
      <div className="bottom-info">© 2026 FLYDEER POWER</div>
      <div className="bottom-info-left">HV DISTRIBUTION SYSTEM</div>
    </>
  )
}

function Navbar() {
  const { lang, setLang, t } = useLang();
  return <ProductNavigation lang={lang} setLang={setLang} t={t} localize={(href) => withLanguage(href, lang)} />
}


function ProductSwitcher({ hidden }) {
  const [open, setOpen] = useState(false)
  const { lang } = useLang()
  const currentPath = typeof window === "undefined" ? "" : window.location.pathname

  return (
    <div className={"product-switcher" + (hidden ? " is-hidden" : "")}>
      <button
        type="button"
        className="product-switcher-toggle"
        onClick={() => setOpen((visible) => !visible)}
        aria-expanded={open}
      >
        <span>产品切换</span>
        <span className={"product-switcher-arrow" + (open ? " open" : "")} aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="product-switcher-menu">
          {PRODUCT_SITES.map((site) => {
              const isCurrent = typeof window !== "undefined" &&
                new URL(site.url, window.location.origin).pathname === currentPath
            return (
              <a
                key={site.url}
                href={withLanguage(site.url, lang)}
                className={isCurrent ? "active" : ""}
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {lang === "zh" ? site.label : site.labelEn}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ScrollHint({ show, progress }) {
  const { t } = useLang();
  if (progress > 0.02) return null
  return (
    <div className={"scroll-hint" + (show ? " show" : "")}>
      <div className="scroll-line" />
      <span>{t("scroll")}</span>
      <span className="scroll-arrow" aria-hidden="true" />
    </div>
  )
}


function InquiryFooter({ visible }) {
  const { lang } = useLang()
  const zh = lang === "zh"

  return (
    <section className={"inquiry-footer" + (visible ? " is-visible" : "")} aria-hidden={!visible}>
      <div className="inquiry-footer-inner">
        <p className="inquiry-brand">FLYDEER POWER</p>
        <h2>{zh ? "为您的项目，匹配可靠动力方案。" : "Reliable power, configured for your project."}</h2>
        <p className="inquiry-copy">
          {zh
            ? "告诉我们功率、工况与交付需求，深柴能源团队将为您提供选型与技术支持。"
            : "Share your power, operating and delivery requirements. Our team will support product selection and engineering decisions."}
        </p>
        <div className="inquiry-actions">
          <a className="inquiry-primary" href={withLanguage("/#contact", lang)} tabIndex={visible ? 0 : -1}>
            {zh ? "获取项目报价" : "Request a Quote"}
          </a>
          <a className="inquiry-secondary" href={withLanguage("/#products", lang)} tabIndex={visible ? 0 : -1}>
            {zh ? "返回产品中心" : "Explore Products"}
          </a>
          <ProductBrowseMenu lang={lang} localize={(href) => withLanguage(href, lang)} visible={visible} />
        </div>
      </div>
      <footer className="inquiry-site-footer">
        <span>© 2026 FLYDEER POWER</span>
        <span>{zh ? "深柴能源 · 可靠动力解决方案" : "FLYDEER POWER · Reliable Power Solutions"}</span>
        <a href={withLanguage("/", lang)} tabIndex={visible ? 0 : -1}>
          {zh ? "返回主站 ↑" : "Main Site ↑"}
        </a>
      </footer>
    </section>
  )
}

export default function App() {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const modelReady = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      const dh = document.documentElement.scrollHeight - window.innerHeight
      setProgress(dh > 0 ? Math.min(Math.max(window.scrollY / dh, 0), 1) : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const sh = useMemo(() => (typeof window !== "undefined" && window.innerWidth < 768 ? "500vh" : "600vh"), [])
  const currentStage = Math.min(Math.floor(progress * STAGES.length), STAGES.length - 1)

  const goToStage = useCallback((idx) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const targetProgress = idx === STAGES.length - 1
      ? 0.84
      : (idx + 0.5) / STAGES.length
    const target = targetProgress * max
    window.scrollTo({ top: target, behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => modelReady.current = true, 500)
      return () => clearTimeout(t)
    }
  }, [ready])

  return (
    <LanguageProvider>
    <div className="app">
      <div className="scroll-progress" style={{ width: progress * 100 + '%' }} />
      <div className="scroll-progress-track" />
      <div className="tech-grid" style={{ opacity: Math.min(progress / 0.1, 1) * 0.28 }} />
      <div className="scene">
        <Canvas
          camera={{ position: [0, 5, 20], fov: 40, near: 0.5, far: 40 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          shadows
          onCreated={(state) => {
            state.scene.background = null
            state.gl.setClearColor("#0a0a0a", 0)
            setReady(true)
          }}>
          <ambientLight intensity={0.95} color="#ffffff" />
          <hemisphereLight args={["#ffffff", "#ffffff", 0.48]} />
          <Suspense fallback={null}>
            <ModelGroup url="/product-assets/high-voltage/generator.glb" progress={progress} />
          </Suspense>
          <Particles />
          <directionalLight position={[6, 9, 6]} intensity={4.8} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
          <directionalLight position={[-5, 4, 3]} intensity={1.7} color="#ffffff" />
          <directionalLight position={[0, 5, -7]} intensity={2.2} color="#ffffff" />
          <CameraController progress={progress} />
        </Canvas>
        <ScrollLightAtmosphere progress={progress} />
      </div>

      <div className="deco-line-left" />
      <div className="deco-line-right" />
      <Preloader loaded={ready} />

      <div className="ui-layer">
        <TechTags />
        <ContentOverlay stages={STAGES} currentIdx={currentStage} progress={progress} ready={ready} />
        <StateTable stages={STAGES} currentIdx={currentStage} onSelect={goToStage} />
<ScrollHint show={ready} progress={progress} />
      </div>
      <FooterInfo />

      <ProductSwitcher hidden={progress > 0.02} />
      <Navbar />
      <InquiryFooter visible={progress > 0.88} />
      <div className="scroll-spacer" style={{ height: sh }} />
    </div>
    </LanguageProvider>
  )
}


// ===== Translation System =====
const T = {
  zh: {
    navHome: "首页", navProducts: "产品中心", navAbout: "关于我们",
    navCases: "项目案例", navNews: "新闻动态", navService: "销售与服务", scroll: "滚动探索",
    homeTitle: "高压配电系统",
    homeIntro1: "面向大功率发电与高压配电场景，将柜体、控制与保护单元纳入统一系统设计。",
    homeIntro2: "结合项目负载、接入条件与运行需求，提供清晰、可靠、便于维护的成套方案。",
    allinoneDesc: "从一次系统到控制逻辑进行协同配置，减少现场接口复杂度，提高成套交付效率。",
    engineDesc: "模块化柜体布局兼顾扩展、检修与设备间组织，便于按项目容量进行组合配置。",
    airflowDesc: "围绕隔离、联锁、监测与操作路径进行系统化设计，增强日常运行的可控性。",
    chassisDesc: "结合现场空间、进出线方向与安装条件完成工程配置，支持后续调试与技术协同。",
    homeBigTitle: "高压配电系统",
    stage_home: "系统总览",
    stage_allinone: "集成成套",
    stage_engine: "模块化柜体",
    stage_airflow: "运行防护",
    stage_chassis: "工程交付",
    subHome: "HIGH-VOLTAGE POWER DISTRIBUTION",
    sub_home: "HIGH-VOLTAGE POWER DISTRIBUTION",
    sub_allinone: "INTEGRATED SYSTEM",
    sub_engine: "MODULAR ARCHITECTURE",
    sub_airflow: "CONTROLLED OPERATION",
    sub_chassis: "PROJECT ENGINEERING",
  },
  en: {
    navHome: "Home", navProducts: "Products", navAbout: "About Us",
    navCases: "Projects", navNews: "News", navService: "Sales & Service", scroll: "SCROLL",
    homeTitle: "High-Voltage Distribution System",
    homeIntro1: "For high-output generation and distribution projects, cabinets, controls, and protection units are engineered as one coordinated system.",
    homeIntro2: "System configuration is matched to project loads, connection conditions, and operating requirements for clear and maintainable delivery.",
    allinoneDesc: "Primary distribution and control logic are configured together to simplify site interfaces and improve delivery efficiency.",
    engineDesc: "A modular cabinet architecture supports expansion, maintenance access, and project-specific capacity combinations.",
    airflowDesc: "Isolation, interlocking, monitoring, and operating paths are planned together for controlled daily operation.",
    chassisDesc: "Configuration follows site space, cable routing, and installation conditions, with support for commissioning and technical coordination.",
    homeBigTitle: "High-Voltage Distribution System",
    stage_home: "System Overview",
    stage_allinone: "Integrated System",
    stage_engine: "Modular Cabinets",
    stage_airflow: "Operational Safety",
    stage_chassis: "Project Delivery",
    subHome: "HIGH-VOLTAGE POWER DISTRIBUTION",
    sub_home: "HIGH-VOLTAGE POWER DISTRIBUTION",
    sub_allinone: "INTEGRATED SYSTEM",
    sub_engine: "MODULAR ARCHITECTURE",
    sub_airflow: "CONTROLLED OPERATION",
    sub_chassis: "PROJECT ENGINEERING",
  }
};

const LanguageContext = createContext();
function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => getInitialLanguage("en"));

  useEffect(() => {
    syncLanguageToUrl(lang);
    document.title = lang === "zh"
      ? "深柴能源｜3D 产品展厅"
      : "FLYDEER POWER | 3D Product Showroom";
  }, [lang]);

  const t = useCallback((key) => T[lang][key] || key, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}
function useLang() {
  return useContext(LanguageContext);
}
