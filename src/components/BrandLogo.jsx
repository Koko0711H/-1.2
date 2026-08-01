import { useEffect, useRef, useState } from 'react'

const primaryLogo = '/logo.svg'
const retryLogo = '/logo.svg?brand-retry=20260801-energy'

function BrandLogo({ imageClassName = '', alt = 'FLYDEER POWER 深柴能源' }) {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const retryTimerRef = useRef(null)

  useEffect(() => () => {
    if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current)
  }, [])

  const handleError = () => {
    setLoaded(false)
    if (attempt > 0 || retryTimerRef.current) return
    retryTimerRef.current = window.setTimeout(() => {
      retryTimerRef.current = null
      setAttempt(1)
    }, 320)
  }

  return (
    <span className={`brand-logo-media${loaded ? ' is-ready' : ''}`}>
      <span className="brand-logo-fallback" aria-hidden="true">
        <strong>FLYDEER</strong>
        <small>深柴能源</small>
      </span>
      <img
        key={attempt}
        src={attempt === 0 ? primaryLogo : retryLogo}
        alt={alt}
        className={`brand-logo-image ${imageClassName}`.trim()}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </span>
  )
}

export default BrandLogo
