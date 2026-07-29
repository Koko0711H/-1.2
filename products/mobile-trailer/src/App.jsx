import { useRef, useState, useEffect, Suspense, useMemo, useCallback, createContext, useContext } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import "./App.css"
import { getInitialLanguage, syncLanguageToUrl, withLanguage } from "./languageRouting"

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
  { id: "home", label: "深柴动力", cam: [-2, 1.5, 5], target: [0, 0, 0], fov: 40, rot: 0,
    subtitle: "FLYDEER POWER · 始于 2004",
    desc: "专业柴油发电机组研发制造商，专注为客户提供可靠的电力解决方案" },
  { id: "allinone", label: "行车驻车双保险", cam: [0, 5, 7.5], target: [0, 0, 0], fov: 26, rot: -1.5,
    subtitle: "行车制动 · 驻车锁止",
    desc: "行车制动系统：采用惯性制动导向，主车制动时自动触发，牵引杆推力转化为制动力，灵敏可靠。驻车制动系统：停车自动锁止，杜绝溜车隐患" },
  { id: "engine", label: "动力系统稳定输出", cam: [0, 1.5, 6], target: [0, 0, 0], fov: 28, rot: 0,
    subtitle: "多元动力 · 按需匹配",
    desc: "提供全系列发动机品牌选择，满足不同应用场景，稳定输出每一瓦特" },
  { id: "airflow", label: "全地形移动", cam: [-7.5, 5, 4.5], target: [0, 0, 0], fov: 24, rot: 1.5,
    subtitle: "全地形移动 · 电力随行",
    desc: "既可置于室内，也可直接摆放于室外。配备道路版行驶系统，可满足道路拖车行驶需求，真正做到电力随行；体积小，移动方便，操作灵活，为地点分散的用户迅速提供紧急供电，并且能快速安装、通用性强、货期短的拖车静音电源" },
  { id: "chassis", label: "极致静音", cam: [-5.5, -1.5, 1.8], target: [0, 0.5, 0], fov: 30, rot: 3.0,
    subtitle: "多重隔音 · 静音体验",
    desc: "依托多项隔音手段打造静音箱体，实现发电机组的静音体验" },
]


function ModelGroup({ url, progress }) {
  const groupRef = useRef()
  const [scene, setScene] = useState(null)
  const rot = useRef(0)
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
  return <group ref={groupRef}><primitive object={scene} scale={2.5} /></group>
}

function CameraController({ progress }) {
  const { camera, gl } = useThree()
  const pos = useRef(new THREE.Vector3())
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
    pos.current.set(
      s.cam[0] + (n.cam[0] - s.cam[0]) * lp,
      s.cam[1] + (n.cam[1] - s.cam[1]) * lp,
      s.cam[2] + (n.cam[2] - s.cam[2]) * lp
    )
    target.current.set(
      s.target[0] + (n.target[0] - s.target[0]) * lp,
      s.target[1] + (n.target[1] - s.target[1]) * lp,
      s.target[2] + (n.target[2] - s.target[2]) * lp
    )
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

function LightingController({ progress }) {
  const keyRef = useRef()
  const fillRef = useRef()
  const rimRef = useRef()
  const sweepRef = useRef()
  const rigs = useMemo(() => [
    { key: [6, 9, 6], fill: [-5, 4, 3], rim: [0, 5, -7], sweep: [-7, 7, 2], power: [4.8, 1.7, 2.2, 3.2] },
    { key: [-7, 9, 4], fill: [6, 4, -3], rim: [0, 6, 7], sweep: [7, 8, 0], power: [5.3, 1.5, 2.5, 3.7] },
    { key: [7, 6, -4], fill: [-5, 8, 5], rim: [-3, 3, 7], sweep: [-7, 5, -5], power: [5.0, 1.8, 2.7, 3.4] },
    { key: [-8, 7, -2], fill: [5, 9, 5], rim: [7, 3, -7], sweep: [1, 10, 7], power: [5.4, 1.6, 2.4, 3.8] },
    { key: [2, 4, 8], fill: [-7, 5, -2], rim: [7, 7, 1], sweep: [0, 1, 7], power: [4.9, 1.9, 2.8, 3.3] },
  ], [])
  const keyPos = useRef(new THREE.Vector3(...rigs[0].key))
  const fillPos = useRef(new THREE.Vector3(...rigs[0].fill))
  const rimPos = useRef(new THREE.Vector3(...rigs[0].rim))
  const sweepPos = useRef(new THREE.Vector3(...rigs[0].sweep))

  useFrame(() => {
    const scaled = Math.min(Math.max(progress, 0), 0.9999) * (rigs.length - 1)
    const fromIndex = Math.floor(scaled)
    const toIndex = Math.min(fromIndex + 1, rigs.length - 1)
    const raw = scaled - fromIndex
    const blend = raw * raw * (3 - 2 * raw)
    const from = rigs[fromIndex]
    const to = rigs[toIndex]
    const move = (ref, current, a, b) => {
      if (!ref.current) return
      current.set(
        a[0] + (b[0] - a[0]) * blend,
        a[1] + (b[1] - a[1]) * blend,
        a[2] + (b[2] - a[2]) * blend
      )
      ref.current.position.lerp(current, 0.1)
    }

    move(keyRef, keyPos.current, from.key, to.key)
    move(fillRef, fillPos.current, from.fill, to.fill)
    move(rimRef, rimPos.current, from.rim, to.rim)
    move(sweepRef, sweepPos.current, from.sweep, to.sweep)

    const refs = [keyRef, fillRef, rimRef, sweepRef]
    refs.forEach((ref, index) => {
      if (!ref.current) return
      const target = from.power[index] + (to.power[index] - from.power[index]) * blend
      ref.current.intensity += (target - ref.current.intensity) * 0.1
    })
  })

  return (
    <>
      <directionalLight ref={keyRef} position={rigs[0].key} intensity={rigs[0].power[0]} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight ref={fillRef} position={rigs[0].fill} intensity={rigs[0].power[1]} color="#ffffff" />
      <directionalLight ref={rimRef} position={rigs[0].rim} intensity={rigs[0].power[2]} color="#ffffff" />
      <spotLight ref={sweepRef} position={rigs[0].sweep} intensity={rigs[0].power[3]} color="#ffffff" angle={0.52} penumbra={0.78} distance={30} decay={1.35} />
    </>
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
  const enter = Math.min(Math.max((progress - 0.012) / 0.045, 0), 1)
  const leave = Math.min(Math.max((0.965 - progress) / 0.035, 0), 1)
  const visibility = enter * leave

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

const LINE_PATH = "M2.30809 318.07Q21.0208 316.441 50.1395 311.552Q108.449 301.761 160.401 285.447Q187.503 276.937 211.151 264.212Q225.389 256.551 250.01 240.238Q275.87 223.104 291.318 214.863Q317.146 201.086 347.378 191.695Q407.665 172.97 460.721 167.081Q495.936 163.173 558.47 163.173Q585.817 163.173 628.557 141.714Q654.353 128.763 708.923 94.4123Q742.671 73.1683 758.993 63.6874Q786.229 47.8662 806.111 39.6039Q862.305 16.252 914.714 7.87042Q961.797 0.340553 1040.78 0.0125411Q1117.18 -0.304734 1171.71 7.40653Q1227.48 15.2934 1289.78 35.6259Q1321.15 45.8667 1370.62 65.0861Q1407.99 79.6092 1425.84 85.4202Q1454.72 94.8298 1481 99.0339Q1520.17 105.3 1617.15 102.785Q1665.69 101.526 1706.36 99.0087"

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
          <div key={s.id} className={"st-item" + (i === currentIdx ? " active" : "")} onClick={() => onSelect(i)}>
            <p className="table-name">{t("stage_" + s.id)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContentOverlay({ stages, currentIdx, progress, ready }) {
  const { t } = useLang();

  const visible = ready && progress > 0.005
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
            <img className="module-img" src="/product-assets/mobile-trailer/images/braking.jpg" alt="行车驻车双保险" />
          </div>
        )}
        {isE && (
          <div>
            <img className="engine-img" src="/product-assets/mobile-trailer/images/allinone.jpg" alt="动力系统" />
            <div className="engine-text-block">
              <p className="engine-desc-text">{t("engineDesc")}</p>
            </div>
          </div>
        )}
        {isAf && (
          <div className="airflow-top-right text-block-animate">
            <img className="module-img" src="/product-assets/mobile-trailer/images/chassis.png" alt="全地形移动" />
            <p className="airflow-desc-text">{t("airflowDesc")}</p>
          </div>
        )}
        {isC && (
          <div className="chassis-right text-block-animate">
            <img className="module-img chassis-img" src="/product-assets/mobile-trailer/images/silence.jpg" alt="极致静音" />
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
          <h2 className={"content-title" + (isHome ? " home-title" : "") + (isAllinone ? " allinone-title" : "") + (isEngine ? " engine-title" : "") + (isAirflow ? " airflow-title" : "") + (isChassis ? " chassis-title" : "")}>{t("stage_" + s.id)}</h2>
          <p className={"content-subtitle" + (isHome ? " home-subtitle" : "") + (isAllinone ? " allinone-subtitle" : "") + (isEngine ? " engine-subtitle" : "") + (isAirflow ? " airflow-subtitle" : "") + (isChassis ? " chassis-subtitle" : "")}>{t("sub_" + s.id)}</p>
        </div>
      </div>
      {stages.map((stage, idx) => renderRightContent(stage, idx))}
    </div>
  )
}

function SocialLinks() {
  return <>
    <a className="social-icon" href="#" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
    <a className="social-icon" href="#" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
    <a className="social-icon" href="#" aria-label="抖音"><svg width="30" height="30" viewBox="0 0 48 48" fill="currentColor"><path d="M33.5 8.5c1.5 3 4 5 7 5.5v4.5c-2.5 0-5-1-7-3v13c0 6.5-5 11.5-11.5 11.5S10.5 35 10.5 28.5 15.5 17 22 17v4.5c-4 0-7 3-7 7s3 7 7 7 7-3 7-7V8.5h4.5z"/></svg></a>
  </>
}

function QuoteIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
}

function Navbar() {
  const { lang, setLang, t } = useLang();
  return (
    <header className="navbar">
      <div className="navbar-inner">
      <a className="nav-logo-link" href={withLanguage("/", lang)} aria-label={lang === "zh" ? "深柴动力首页" : "FLYDEER POWER home"}><img className="nav-logo" src="/logo.png" alt="FLYDEER POWER 深柴动力" /></a>
      <nav className="nav-links">
        <a href={withLanguage("/", lang)}>{t("navHome")}</a>
        <a href={withLanguage("/#products", lang)}>{t("navProducts")}</a>
        <a className="active" aria-current="page" href={withLanguage("/products/open-frame-500/", lang)}>{lang === "zh" ? "网上展厅" : "Online Showroom"}</a>
        <a href={withLanguage("/about/", lang)}>{t("navAbout")}</a>
        <a href={withLanguage("/#cases", lang)}>{t("navCases")}</a>
        <a href={withLanguage("/#contact", lang)}>{t("navService")}</a>
      </nav>
      <div className="header-right">
        <button type="button" className={"lang-btn" + (lang === "zh" ? " active" : "")} aria-pressed={lang === "zh"} onClick={() => setLang("zh")}>中文</button>
        <button type="button" className={"lang-btn" + (lang === "en" ? " active" : "")} aria-pressed={lang === "en"} onClick={() => setLang("en")}>English</button>
        <SocialLinks />
        <a className="quote-btn" href={withLanguage("/#contact", lang)}><QuoteIcon />{lang === "zh" ? "获取报价" : "Get Quote"}</a>
      </div>
      </div>
    </header>
  );
}


const PRODUCT_SITES = [
  { label: "静音型发电机组", url: "/products/silent/" },
  { label: "开架型发电机组", url: "/products/open-frame-1200/" },
  { label: "开架型发电机组（小）", url: "/products/open-frame-500/" },
  { label: "移动拖车式发电机组", url: "/products/mobile-trailer/" },
  { label: "高压配电系统", url: "/products/high-voltage/" },
]

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
                {site.label}
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
            ? "告诉我们功率、工况与交付需求，深柴动力团队将为您提供选型与技术支持。"
            : "Share your power, operating and delivery requirements. Our team will support product selection and engineering decisions."}
        </p>
        <div className="inquiry-actions">
          <a className="inquiry-primary" href={withLanguage("/#contact", lang)} tabIndex={visible ? 0 : -1}>
            {zh ? "获取项目报价" : "Request a Quote"}
          </a>
          <a className="inquiry-secondary" href={withLanguage("/#products", lang)} tabIndex={visible ? 0 : -1}>
            {zh ? "返回产品中心" : "Explore Products"}
          </a>
        </div>
      </div>
      <footer className="inquiry-site-footer">
        <span>© 2026 FLYDEER POWER</span>
        <span>{zh ? "深柴动力 · 可靠动力解决方案" : "FLYDEER POWER · Reliable Power Solutions"}</span>
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
            <ModelGroup url="/product-assets/mobile-trailer/generator.glb" progress={progress} />
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
        <div className="tech-tags">
          <div className="tech-tag">IP23<span className="label">PROTECTION</span></div>
          <div className="tech-tag">-20 ~ 55°C<span className="label">OPERATING TEMP.</span></div>
          <div className="tech-tag">75 ~ 78 dB(A) @ 1m<span className="label">NOISE LEVEL</span></div>
          <div className="tech-tag">5000h<span className="label">SERVICE LIFE</span></div>
        </div>
        <ContentOverlay stages={STAGES} currentIdx={currentStage} progress={progress} ready={ready} />
        <StateTable stages={STAGES} currentIdx={currentStage} onSelect={goToStage} />
<ScrollHint show={ready} progress={progress} />
      </div>
      <div className="bottom-info">© 2026 深柴动力</div>
      <div className="bottom-info-left">SCP · 500kW Series</div>

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
    navCases: "项目案例", navService: "销售与服务", scroll: "滚动探索",
    homeTitle: "移动拖车式发电机",
    homeIntro1: "深柴动力是一家集柴油发电机组研发、生产、销售和服务于一体的综合性企业。公司拥有现代化生产基地，年产能超过5000台套",
    homeIntro2: "依托自主技术、完善的质量体系与市场化创新机制，深柴动力已发展成为国内领先的柴油发电机组制造商",
    allinoneDesc: "行车制动系统：采用惯性制动导向，主车制动时自动触发，牵引杆推力转化为制动力，灵敏可靠。驻车制动系统：停车自动锁止，杜绝溜车隐患",
    engineDesc: "提供全系列发动机品牌选择，满足不同应用场景",
    airflowDesc: "既可置于室内，也可直接摆放于室外。配备道路版行驶系统，可满足道路拖车行驶需求，真正做到电力随行；体积小，移动方便，操作灵活，为地点分散的用户迅速提供紧急供电，并且能快速安装、通用性强、货期短的拖车静音电源",
    chassisDesc: "依托多项隔音手段打造静音箱体，实现发电机组的静音体验",
    homeBigTitle: "移动拖车式发电机",
    stage_home: "深柴动力",
    stage_allinone: "行车驻车双保险",
    stage_engine: "动力系统稳定输出",
    stage_airflow: "全地形移动",
    stage_chassis: "极致静音",
    subHome: "FLYDEER POWER · 始于 2004",
    sub_home: "FLYDEER POWER · 始于 2004",
    sub_allinone: "行车制动 · 驻车锁止",
    sub_engine: "多元动力 · 按需匹配",
    sub_airflow: "全地形移动 · 电力随行",
    sub_chassis: "多重隔音 · 静音体验",
  },
  en: {
    navHome: "Home", navProducts: "Products", navAbout: "About Us",
    navCases: "Projects", navService: "Sales & Service", scroll: "SCROLL",
    homeTitle: "Mobile Trailer Generator",
    homeIntro1: "FLYDEER POWER is a comprehensive enterprise integrating R&D, production, sales and service of diesel generator sets. With a modern manufacturing base, annual capacity exceeds 5,000 units.",
    homeIntro2: "Backed by state-owned strength combined with market-oriented innovation, FLYDEER POWER has become a leading diesel generator set manufacturer in China.",
    allinoneDesc: "Driving brake system: Uses inertia-guided braking. It activates automatically when the towing vehicle brakes, converting drawbar thrust into braking force for responsive, reliable braking. Parking brake system: Locks automatically when parked to eliminate the risk of unintended rolling.",
    engineDesc: "Full range of engine brands available to meet diverse application scenarios.",
    airflowDesc: "Suitable for both indoor placement and direct outdoor use. Equipped with a road-ready mobility system for on-road towing, it delivers power wherever needed. Compact, easy to move, and flexible to operate, it provides rapid emergency power for users at dispersed locations, with quick installation, broad compatibility, and short lead times.",
    chassisDesc: "Multiple soundproofing measures create a quiet enclosure for a truly quiet generator experience.",
    homeBigTitle: "Mobile Trailer Generator",
    stage_home: "FLYDEER POWER",
    stage_allinone: "Driving & Parking Dual-Safety",
    stage_engine: "Engine System",
    stage_airflow: "All-Terrain Mobile",
    stage_chassis: "Ultimate Silence",
    subHome: "FLYDEER POWER · Since 2004",
    sub_home: "FLYDEER POWER · Since 2004",
    sub_allinone: "Driving Brake · Automatic Parking Lock",
    sub_engine: "Multiple Power · On Demand",
    sub_airflow: "All-Terrain Mobility · Power On the Move",
    sub_chassis: "Multi-Layer Soundproofing · Quiet Operation",
  }
};

const LanguageContext = createContext();
function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => getInitialLanguage("en"));

  useEffect(() => {
    syncLanguageToUrl(lang);
    document.title = lang === "zh"
      ? "深柴动力｜3D 产品展厅"
      : "FLYDEER POWER | 3D Product Showroom";
  }, [lang]);

  const t = useCallback((key) => T[lang][key] || key, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}
function useLang() {
  return useContext(LanguageContext);
}
