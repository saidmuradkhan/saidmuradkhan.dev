import { useEffect, useRef, useState } from 'react'
import { isTouch, reducedMotion } from '../hooks.jsx'

export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const [label, setLabel] = useState('')
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (isTouch() || reducedMotion()) return
    document.documentElement.classList.add('has-cursor')
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }
    const lag = { ...pos }
    let raf
    const move = (e) => {
      pos.x = e.clientX; pos.y = e.clientY
      const target = e.target.closest?.('a, button, [data-cursor], input')
      document.documentElement.classList.toggle('cursor-native', !!e.target.closest?.('input, textarea, [contenteditable], .terminal'))
      setHover(!!target)
      setLabel(target?.dataset?.cursor || '')
    }
    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.16
      lag.y += (pos.y - lag.y) * 0.16
      if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      if (ring.current) ring.current.style.transform = `translate(${lag.x}px, ${lag.y}px)`
      raf = requestAnimationFrame(loop)
    }
    const hide = () => document.documentElement.classList.add('cursor-out')
    const show = () => document.documentElement.classList.remove('cursor-out')
    window.addEventListener('pointermove', move)
    document.addEventListener('mouseleave', hide)
    document.addEventListener('mouseenter', show)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseleave', hide)
      document.removeEventListener('mouseenter', show)
      document.documentElement.classList.remove('has-cursor', 'cursor-native')
    }
  }, [])

  if (isTouch() || reducedMotion()) return null
  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className={`cursor-ring ${hover ? 'hover' : ''} ${label ? 'label' : ''}`} aria-hidden="true">
        <span>{label}</span>
      </div>
    </>
  )
}
