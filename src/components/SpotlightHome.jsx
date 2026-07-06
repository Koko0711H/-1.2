import { useState, useEffect, useRef, useCallback } from 'react'
import { useLang } from '../i18n'

function SpotlightHome({ onMouseLeave }) {
  const { t } = useLang()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const smoothMouseRef = useRef({ x: 0, y: 0, radius: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)
  const animationRef = useRef(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const isMouseInsideRef = useRef(false)
  const hasEnteredRef = useRef(false)
  
  const baseImgRef = useRef(new Image())
  const revealImgRef = useRef(new Image())
  const particlesRef = useRef([])
  const maskCanvasRef = useRef(null)
  const energyPathsRef = useRef([])

  useEffect(() => {
    maskCanvasRef.current = document.createElement('canvas')
    
    // Initialize particles
    const particles = []
    const particleCount = 60
    for (let i = 0; i < particleCount; i++) {
      const isLarge = i < particleCount * 0.2
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: isLarge ? Math.random() * 6 + 3 : Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * (isLarge ? 0.5 : 2),
        speedY: (Math.random() - 0.5) * (isLarge ? 0.5 : 2),
        opacity: 0,
        targetOpacity: Math.random() * 0.6 + 0.2,
        fadeSpeed: Math.random() * 0.02 + 0.005,
        isLarge: isLarge,
        color: isLarge ? 'rgba(200, 220, 255, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        pulseSpeed: Math.random() * 0.05 + 0.02,
        pulseOffset: Math.random() * Math.PI * 2
      })
    }
    particlesRef.current = particles
    
            // Energy paths (Closed loops)
    const paths = [
      // �����ܵ� - ���ֲ���
      [
        {x: 0.25, y: 0.2}, {x: 0.3, y: 0.2}, {x: 0.35, y: 0.2}, 
        {x: 0.4, y: 0.2}, {x: 0.45, y: 0.2}, {x: 0.5, y: 0.2},
        {x: 0.5, y: 0.25}, {x: 0.5, y: 0.3}, {x: 0.5, y: 0.35},
        {x: 0.45, y: 0.35}, {x: 0.4, y: 0.35}, {x: 0.35, y: 0.35},
        {x: 0.3, y: 0.35}, {x: 0.25, y: 0.35}, {x: 0.25, y: 0.3},
        {x: 0.25, y: 0.25}
      ],
      // �в��������� - ���ֲ���
      [
        {x: 0.3, y: 0.4}, {x: 0.35, y: 0.4}, {x: 0.4, y: 0.4}, 
        {x: 0.45, y: 0.4}, {x: 0.45, y: 0.45}, {x: 0.4, y: 0.45},
        {x: 0.35, y: 0.45}, {x: 0.3, y: 0.45}
      ],
      // �ײ�����/���� - ��������1.5����λ
      [
        {x: 0.25, y: 0.6}, {x: 0.3, y: 0.6}, {x: 0.35, y: 0.6}, 
        {x: 0.4, y: 0.6}, {x: 0.45, y: 0.6}, {x: 0.5, y: 0.6},
        {x: 0.55, y: 0.6}, {x: 0.6, y: 0.6}, {x: 0.65, y: 0.6},
        {x: 0.65, y: 0.65}, {x: 0.6, y: 0.65}, {x: 0.55, y: 0.65},
        {x: 0.5, y: 0.65}, {x: 0.45, y: 0.65}, {x: 0.4, y: 0.65},
        {x: 0.35, y: 0.65}, {x: 0.3, y: 0.65}, {x: 0.25, y: 0.65}
      ]
    ]
    energyPathsRef.current = paths
    
    let loadedCount = 0
    const onImageLoad = () => {
      loadedCount++
      if (loadedCount === 2) setImagesLoaded(true)
    }

    baseImgRef.current.src = '/generator-base.jpg'
    revealImgRef.current.src = '/generator-reveal.jpg'
    baseImgRef.current.onload = onImageLoad
    revealImgRef.current.onload = onImageLoad
  }, [])

  const lerp = (a, b, t) => a + (b - a) * t

  const drawEnergyEffects = useCallback((ctx, time, width, height) => {
    const paths = energyPathsRef.current
    const speed = 0.015 // Faster flow speed
    
    paths.forEach((pathPoints, pathIndex) => {
      const scaledPoints = pathPoints.map(p => ({ x: p.x * width, y: p.y * height }))
      
      ctx.save()
      
      // Draw main path glow (background)
      ctx.beginPath()
      ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y)
      for (let i = 1; i < scaledPoints.length; i++) {
        const p0 = scaledPoints[i - 1]
        const p1 = scaledPoints[i]
        const cp1x = p0.x + (p1.x - p0.x) * 0.5
        const cp1y = p0.y
        const cp2x = p0.x + (p1.x - p0.x) * 0.5
        const cp2y = p1.y
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1.x, p1.y)
      }
      
      // Pipe background
      ctx.strokeStyle = 'rgba(120, 50, 10, 0.6)'
      ctx.lineWidth = 20
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      
      // Draw moving energy pulses
      const totalPoints = 10 
      for (let i = 0; i < totalPoints; i++) {
        const offset = (time * speed + (i / totalPoints) + pathIndex * 0.2) % 1
        const t = offset
        
        // Calculate position along path
        const index = Math.floor(t * (scaledPoints.length - 1))
        const nextIndex = Math.min(index + 1, scaledPoints.length - 1)
        const localT = (t * (scaledPoints.length - 1)) - index
        
        const p1 = scaledPoints[index]
        const p2 = scaledPoints[nextIndex]
        
        const x = p1.x + (p2.x - p1.x) * localT
        const y = p1.y + (p2.y - p1.y) * localT
        
        // Draw pulse
        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 100, 20, 0.9)' // Deep Orange color
        ctx.fill()
        
        // Glow
        ctx.shadowBlur = 10
        ctx.shadowColor = 'rgba(255, 150, 50, 1)'
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 220, 100, 1)' // Yellowish core
        ctx.fill()
        ctx.shadowBlur = 0
      }
      
      ctx.restore()
    })
  }, [])

  const drawParticles = useCallback((ctx, mouseX, mouseY, time) => {
    const particles = particlesRef.current
    particles.forEach(particle => {
      if (particle.opacity < particle.targetOpacity) particle.opacity += particle.fadeSpeed
      
      const dx = particle.x - mouseX
      const dy = particle.y - mouseY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 100 && distance > 0) {
        const force = (100 - distance) / 100 * 0.5
        particle.x += (dx / distance) * force
        particle.y += (dy / distance) * force
      }
      
      particle.x += particle.speedX
      particle.y += particle.speedY
      
      if (particle.x < 0 || particle.x > ctx.canvas.width) particle.speedX *= -1
      if (particle.y < 0 || particle.y > ctx.canvas.height) particle.speedY *= -1
      
      const pulse = Math.sin(time * particle.pulseSpeed + particle.pulseOffset) * 0.3 + 0.7
      ctx.save()
      ctx.globalAlpha = particle.opacity * pulse
      
      if (particle.isLarge) {
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 2)
        gradient.addColorStop(0, 'rgba(200, 220, 255, 0.8)')
        gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)')
        gradient.addColorStop(1, 'rgba(200, 220, 255, 0)')
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.fill()
      }
      ctx.restore()
    })
  }, [])

  const draw = useCallback(() => {
    if (!imagesLoaded) return
    const canvas = canvasRef.current
    const container = containerRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !container || !maskCanvas) return
    
    const ctx = canvas.getContext('2d')
    const maskCtx = maskCanvas.getContext('2d')
    const rect = container.getBoundingClientRect()
    
    canvas.width = rect.width
    canvas.height = rect.height
    maskCanvas.width = rect.width
    maskCanvas.height = rect.height
    
    const mouse = mouseRef.current
    const smooth = smoothMouseRef.current
    const last = lastMouseRef.current
    const vel = velocityRef.current
    const time = timeRef.current
    const isInside = isMouseInsideRef.current
    
    vel.x = mouse.x - last.x
    vel.y = mouse.y - last.y
    last.x = mouse.x
    last.y = mouse.y
    
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y)
    const baseRadius = 150
    const radiusBoost = Math.min(speed * 0.5, 50)
    const targetRadius = isInside ? (baseRadius + radiusBoost) : 0
    
    if (!hasEnteredRef.current && isInside) {
      smooth.x = mouse.x
      smooth.y = mouse.y
      hasEnteredRef.current = true
    }
    
    if (isInside) {
      smooth.x = lerp(smooth.x, mouse.x, 0.1)
      smooth.y = lerp(smooth.y, mouse.y, 0.1)
    }
    
    const radiusLerpFactor = isInside ? 0.08 : 0.15
    const currentRadius = lerp(smooth.radius, targetRadius, radiusLerpFactor)
    smooth.radius = currentRadius
    timeRef.current += 0.02

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(baseImgRef.current, 0, 0, canvas.width, canvas.height)

    if (currentRadius > 2) {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
      maskCtx.drawImage(revealImgRef.current, 0, 0, maskCanvas.width, maskCanvas.height)
      
      const maskGradient = maskCtx.createRadialGradient(
        smooth.x, smooth.y, 0,
        smooth.x, smooth.y, currentRadius
      )
      maskGradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
      maskGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)')
      maskGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      maskCtx.globalCompositeOperation = 'destination-in'
      maskCtx.fillStyle = maskGradient
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
      
      ctx.drawImage(maskCanvas, 0, 0)

      const outerGlow = ctx.createRadialGradient(
        smooth.x, smooth.y, currentRadius * 0.8,
        smooth.x, smooth.y, currentRadius * 1.2
      )
      outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
      outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(smooth.x, smooth.y, currentRadius * 1.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Draw energy effects inside the spotlight
      ctx.save()
      ctx.beginPath()
      ctx.arc(smooth.x, smooth.y, currentRadius, 0, Math.PI * 2)
      ctx.clip()
      drawEnergyEffects(ctx, time, canvas.width, canvas.height)
      ctx.restore()
    }

    drawParticles(ctx, smooth.x, smooth.y, time)
    animationRef.current = requestAnimationFrame(draw)
  }, [imagesLoaded, drawParticles, drawEnergyEffects])

  useEffect(() => {
    if (!imagesLoaded) return
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      isMouseInsideRef.current = true
    }
    
    const handleMouseEnter = (e) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      smoothMouseRef.current.x = mouseRef.current.x
      smoothMouseRef.current.y = mouseRef.current.y
      isMouseInsideRef.current = true
      hasEnteredRef.current = true
    }
    
    const handleMouseLeave = () => {
      isMouseInsideRef.current = false
      hasEnteredRef.current = false
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [imagesLoaded, draw])

  return (
    <div ref={containerRef} className="spotlight-home" style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      cursor: 'none',
      backgroundColor: '#0a1628'
    }}>
      {!imagesLoaded && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontSize: '1.5rem' }}>
          Loading...
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: imagesLoaded ? 1 : 0
        }}
      />
      <div className="spotlight-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          {t('spotlightTitle')}
        </h1>
        <p style={{ fontSize: '1.5rem', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          {t('spotlightSub')}
        </p>
        <div className="spotlight-hint" style={{
          position: 'absolute',
          bottom: '50px',
          fontSize: '1rem',
          opacity: 0.8
        }}>
          {t('spotlightHint')}
        </div>
      </div>
    </div>
  )
}

export default SpotlightHome

















