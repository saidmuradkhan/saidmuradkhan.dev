import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../hooks.jsx'

const SRC = '/said-portrait.webp'
const GAP = 4
const ASSEMBLE_MS = 1300
const TRAVEL = 0.55
const PHOTO_AT = 0.7

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
  const scale = Math.max(w / img.width, h / img.height)
  const dw = img.width * scale
  ctx.drawImage(img, (w - dw) / 2, 0, dw, img.height * scale)
  const { data } = ctx.getImageData(0, 0, w, h)
  const dots = []
  for (let y = GAP / 2; y < h; y += GAP) {
    for (let x = GAP / 2; x < w; x += GAP) {
      const i = (Math.floor(y) * w + Math.floor(x)) * 4
      if (data[i + 3] < 140) continue
      const angle = Math.random() * Math.PI * 2
      const spread = Math.max(w, h) * (0.5 + Math.random() * 0.6)
      dots.push({
        tx: x,
        ty: y,
        sx: w / 2 + Math.cos(angle) * spread,
        sy: h / 2 + Math.sin(angle) * spread,
        delay: (y / h) * 0.25 + Math.random() * 0.2,
        swirl: (Math.random() - 0.5) * 120,
        rgb: [data[i], data[i + 1], data[i + 2]],
      })
    }
  }
  return dots
}

export default function Portrait({ alt, start, className = '' }) {
  const box = useRef(null)
  const canvas = useRef(null)
  const [showPhoto, setShowPhoto] = useState(false)

  useEffect(() => {
    if (!start) return
    if (reducedMotion()) {
      setShowPhoto(true)
      return
    }

    const el = box.current
    const c = canvas.current
    const ctx = c.getContext('2d')
    const img = new Image()
    let raf, cancelled = false

    const play = () => {
      if (cancelled) return
      const dpr = Math.min(devicePixelRatio || 1, 2)
      const w = el.clientWidth
      const h = el.clientHeight
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const dots = sample(img, w, h)
      const accent = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1fce75')
      const begin = performance.now()
      let photoShown = false

      const frame = (now) => {
        const elapsed = (now - begin) / ASSEMBLE_MS
        let done = true
        ctx.clearRect(0, 0, w, h)
        for (const d of dots) {
          const t = Math.min(Math.max((elapsed - d.delay) / TRAVEL, 0), 1)
          if (t < 1) done = false
          const e = easeOut(t)
          const curl = Math.sin(e * Math.PI) * d.swirl * (1 - e)
          const x = d.sx + (d.tx - d.sx) * e + curl
          const y = d.sy + (d.ty - d.sy) * e - curl * 0.4
          const mix = Math.min(t * 2, 1)
          const r = Math.round(accent[0] + (d.rgb[0] - accent[0]) * mix)
          const g = Math.round(accent[1] + (d.rgb[1] - accent[1]) * mix)
          const b = Math.round(accent[2] + (d.rgb[2] - accent[2]) * mix)
          ctx.globalAlpha = 0.3 + 0.7 * e
          ctx.fillStyle = `rgb(${r},${g},${b})`
          const size = GAP * (0.4 + 0.65 * e)
          ctx.fillRect(x - size / 2, y - size / 2, size, size)
        }
        if (!photoShown && elapsed >= PHOTO_AT) {
          photoShown = true
          setShowPhoto(true)
        }
        if (!done) raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    img.onload = play
    img.onerror = () => setShowPhoto(true)
    img.src = SRC

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [start])

  return (
    <figure className={`portrait ${className}${showPhoto ? ' is-photo' : ''}`} ref={box}>
      <canvas ref={canvas} aria-hidden="true" />
      <img src={SRC} alt={alt} width="720" height="941" decoding="async" fetchPriority="high" />
    </figure>
  )
}
