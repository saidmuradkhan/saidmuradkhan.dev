import { useEffect, useRef, useState } from 'react'
import { isTouch, reducedMotion } from '../hooks.jsx'

const SRC = '/said-portrait.webp'
const RATIO = 941 / 720
const GAP = 4
const ASSEMBLE_MS = 2200
const HOLD_MS = 450
const TRAVEL = 0.4

const easeOut = (t) => 1 - Math.pow(1 - t, 3)

function hexToRgb(color) {
  const hex = color.replace('#', '')
  const n = parseInt(hex.length === 3 ? hex.replace(/./g, '$&$&') : hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function sample(img, w, h) {
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  const ctx = off.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)
  const dots = []
  for (let y = GAP / 2; y < h; y += GAP) {
    for (let x = GAP / 2; x < w; x += GAP) {
      const i = (Math.floor(y) * w + Math.floor(x)) * 4
      if (data[i + 3] < 140) continue
      const angle = Math.random() * Math.PI * 2
      const spread = Math.max(w, h) * (0.55 + Math.random() * 0.7)
      dots.push({
        tx: x,
        ty: y,
        sx: w / 2 + Math.cos(angle) * spread,
        sy: h / 2 + Math.sin(angle) * spread,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        delay: (y / h) * 0.35 + Math.random() * 0.25,
        swirl: (Math.random() - 0.5) * 140,
        rgb: [data[i], data[i + 1], data[i + 2]],
      })
    }
  }
  return dots
}

export default function Portrait({ alt }) {
  const box = useRef(null)
  const canvas = useRef(null)
  const [showPhoto, setShowPhoto] = useState(false)

  useEffect(() => {
    if (reducedMotion()) {
      setShowPhoto(true)
      return
    }

    const el = box.current
    const c = canvas.current
    const ctx = c.getContext('2d')
    const img = new Image()
    const mouse = { x: -9999, y: -9999, inside: false }
    let w, h, dpr, dots = [], accent, raf, start = 0, mode = 'idle', settledAt = 0

    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2)
      w = el.clientWidth
      h = Math.round(w * RATIO)
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (img.complete) dots = sample(img, w, h)
    }

    const drawAssemble = (now) => {
      const elapsed = (now - start) / ASSEMBLE_MS
      let done = true
      for (const d of dots) {
        const t = Math.min(Math.max((elapsed - d.delay) / TRAVEL, 0), 1)
        if (t < 1) done = false
        const e = easeOut(t)
        const curl = Math.sin(e * Math.PI) * d.swirl
        d.x = d.sx + (d.tx - d.sx) * e + curl * (1 - e)
        d.y = d.sy + (d.ty - d.sy) * e - curl * 0.4 * (1 - e)
        const mix = Math.min(t * 1.4, 1)
        const r = Math.round(accent[0] + (d.rgb[0] - accent[0]) * mix)
        const g = Math.round(accent[1] + (d.rgb[1] - accent[1]) * mix)
        const b = Math.round(accent[2] + (d.rgb[2] - accent[2]) * mix)
        ctx.globalAlpha = 0.25 + 0.75 * e
        ctx.fillStyle = `rgb(${r},${g},${b})`
        const size = GAP * (0.35 + 0.5 * e)
        ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size)
      }
      return done
    }

    const drawPhysics = () => {
      let moving = false
      for (const d of dots) {
        const dx = d.x - mouse.x
        const dy = d.y - mouse.y
        const dist = Math.hypot(dx, dy) || 1
        if (mouse.inside && dist < 90) {
          const force = (1 - dist / 90) * 6
          d.vx += (dx / dist) * force
          d.vy += (dy / dist) * force
        }
        d.vx = (d.vx + (d.tx - d.x) * 0.06) * 0.82
        d.vy = (d.vy + (d.ty - d.y) * 0.06) * 0.82
        d.x += d.vx
        d.y += d.vy
        if (Math.abs(d.vx) + Math.abs(d.vy) > 0.05 || Math.abs(d.tx - d.x) > 0.5) moving = true
        ctx.globalAlpha = 1
        ctx.fillStyle = `rgb(${d.rgb[0]},${d.rgb[1]},${d.rgb[2]})`
        ctx.fillRect(d.x - GAP * 0.42, d.y - GAP * 0.42, GAP * 0.85, GAP * 0.85)
      }
      return !moving
    }

    const frame = (now) => {
      ctx.clearRect(0, 0, w, h)
      if (mode === 'assemble') {
        if (drawAssemble(now)) {
          mode = 'hold'
          settledAt = now
        }
      } else {
        const still = drawPhysics()
        if (mode === 'hold' && now - settledAt > HOLD_MS) {
          mode = 'photo'
          setShowPhoto(true)
        }
        if (mode === 'interactive' && still && !mouse.inside) {
          mode = 'photo'
          setShowPhoto(true)
        }
        if (mode === 'photo' && still) {
          raf = null
          return
        }
      }
      raf = requestAnimationFrame(frame)
    }

    const run = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const begin = () => {
      accent = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1fce75')
      resize()
      mode = 'assemble'
      start = performance.now()
      run()
    }

    const onMove = (e) => {
      const r = c.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onEnter = (e) => {
      if (mode === 'assemble') return
      onMove(e)
      mouse.inside = true
      mode = 'interactive'
      setShowPhoto(false)
      run()
    }
    const onLeave = () => {
      mouse.inside = false
      mouse.x = mouse.y = -9999
      run()
    }

    let started = false
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started && img.complete) {
        started = true
        begin()
        io.disconnect()
      }
    }, { threshold: 0.35 })

    img.onload = () => io.observe(el)
    img.src = SRC

    const interactive = !isTouch()
    if (interactive) {
      el.addEventListener('pointerenter', onEnter)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
    }

    let lastW = 0
    const onResize = () => {
      if (el.clientWidth === lastW || !started) return
      lastW = el.clientWidth
      resize()
      for (const d of dots) {
        d.x = d.tx
        d.y = d.ty
      }
      if (mode !== 'assemble') {
        ctx.clearRect(0, 0, w, h)
        drawPhysics()
      }
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', onResize)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <figure className={`portrait${showPhoto ? ' is-photo' : ''}`} ref={box} data-cursor="✦">
      <canvas ref={canvas} aria-hidden="true" />
      <img src={SRC} alt={alt} width="720" height="941" loading="lazy" decoding="async" />
    </figure>
  )
}
