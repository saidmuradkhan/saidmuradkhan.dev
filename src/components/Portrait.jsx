import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../hooks.jsx'

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
    let w, h, dots = [], accent, raf, start = 0, settledAt = 0

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2)
      w = el.clientWidth
      h = Math.round(w * RATIO)
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dots = sample(img, w, h)
    }

    const draw = (now) => {
      const elapsed = (now - start) / ASSEMBLE_MS
      let done = true
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        const t = Math.min(Math.max((elapsed - d.delay) / TRAVEL, 0), 1)
        if (t < 1) done = false
        const e = easeOut(t)
        const curl = Math.sin(e * Math.PI) * d.swirl
        const x = d.sx + (d.tx - d.sx) * e + curl * (1 - e)
        const y = d.sy + (d.ty - d.sy) * e - curl * 0.4 * (1 - e)
        const mix = Math.min(t * 1.4, 1)
        const r = Math.round(accent[0] + (d.rgb[0] - accent[0]) * mix)
        const g = Math.round(accent[1] + (d.rgb[1] - accent[1]) * mix)
        const b = Math.round(accent[2] + (d.rgb[2] - accent[2]) * mix)
        ctx.globalAlpha = 0.25 + 0.75 * e
        ctx.fillStyle = `rgb(${r},${g},${b})`
        const size = GAP * (0.35 + 0.5 * e)
        ctx.fillRect(x - size / 2, y - size / 2, size, size)
      }
      return done
    }

    const frame = (now) => {
      const done = draw(now)
      if (done && !settledAt) settledAt = now
      if (settledAt && now - settledAt > HOLD_MS) {
        setShowPhoto(true)
        return
      }
      raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      accent = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1fce75')
      resize()
      start = performance.now()
      raf = requestAnimationFrame(frame)
    }, { threshold: 0.35 })

    img.onload = () => io.observe(el)
    img.onerror = () => setShowPhoto(true)
    img.src = SRC

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  return (
    <figure className={`portrait${showPhoto ? ' is-photo' : ''}`} ref={box}>
      <canvas ref={canvas} aria-hidden="true" />
      <img src={SRC} alt={alt} width="720" height="941" loading="lazy" decoding="async" />
    </figure>
  )
}
