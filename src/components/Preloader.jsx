import { useEffect, useState } from 'react'
import { reducedMotion } from '../hooks.jsx'

const KEY = 'pl-seen'
let decided
function seenBefore() {
  if (decided !== undefined) return decided
  decided = false
  if (typeof window === 'undefined') return decided
  try {
    decided = !!window.sessionStorage.getItem(KEY)
    window.sessionStorage.setItem(KEY, '1')
  } catch { /* storage blocked: treat as first visit */ }
  return decided
}

export default function Preloader({ label, name, onDone }) {
  const [n, setN] = useState(0)
  const [phase, setPhase] = useState('count')

  useEffect(() => {
    if (seenBefore()) {
      onDone()
      setPhase('gone')
      return
    }
    const dur = reducedMotion() ? 1 : 1500
    const start = performance.now()
    let raf, doneTimer
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      cancelAnimationFrame(raf)
      setN(100)
      doneTimer = setTimeout(() => { setPhase('leave'); onDone() }, 250)
    }
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1)
      setN(Math.round(100 * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
      else finish()
    }
    raf = requestAnimationFrame(tick)
    const fallback = setTimeout(finish, dur + 1500)
    return () => { cancelAnimationFrame(raf); clearTimeout(fallback); clearTimeout(doneTimer) }
  }, [])

  useEffect(() => {
    if (phase !== 'leave') return
    const id = setTimeout(() => setPhase('gone'), 1000)
    return () => clearTimeout(id)
  }, [phase])

  if (phase === 'gone') return null
  return (
    <div className={`preloader ${phase === 'leave' ? 'leave' : ''}`} aria-hidden="true">
      <div className="pre-name">
        {`${name.first} ${name.last}`.toUpperCase().split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${i * 40}ms` }}>{c === ' ' ? ' ' : c}</span>
        ))}
      </div>
      <div className="pre-bottom">
        <span className="mono">{label}…</span>
        <span className="pre-count">{n}<small>%</small></span>
      </div>
      <div className="pre-mark" aria-hidden="true"><b>{'{'}</b><i /><i /><i /><b>{'}'}</b></div>
      <div className="pre-bar" style={{ transform: `scaleX(${n / 100})` }} />
    </div>
  )
}
