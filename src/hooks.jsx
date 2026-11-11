import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Marks every [data-reveal] element with data-shown once it enters the viewport.
// (An attribute, not a class: React rewrites className on re-render and would drop it.)
export function useReveal(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]:not([data-shown])')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.dataset.shown = ''; io.unobserve(e.target) }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

// Elements with [data-magnetic] drift slightly toward the pointer while it is over them.
// The shift is capped so a button never slides into its neighbour.
const MAX_SHIFT = 6
const clamp = (v) => Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, v))

export function useMagnetic() {
  useEffect(() => {
    if (isTouch()) return
    let els = []
    let dirty = true // re-query only after the DOM changed, not on every pointermove
    const mo = new MutationObserver(() => { dirty = true })
    mo.observe(document.body, { childList: true, subtree: true })
    let last = null
    let raf = 0

    const frame = () => {
      raf = 0
      if (!last) return
      if (dirty) { els = [...document.querySelectorAll('[data-magnetic]')]; dirty = false }
      const { clientX, clientY } = last
      // read every rect first, write styles afterwards (no layout thrashing)
      const hits = els.map((el) => {
        // measure the resting position, not the already-shifted one
        const r = el.getBoundingClientRect()
        const left = r.left - (+el.dataset.mx || 0)
        const top = r.top - (+el.dataset.my || 0)
        const inside = clientX >= left && clientX <= left + r.width && clientY >= top && clientY <= top + r.height
        return { el, r, left, top, inside }
      })
      hits.forEach(({ el, r, left, top, inside }) => {
        if (!inside) {
          if (el.dataset.mx) { el.style.transform = ''; delete el.dataset.mx; delete el.dataset.my }
          return
        }
        const x = clamp(((clientX - left) / r.width - 0.5) * 2 * MAX_SHIFT)
        const y = clamp(((clientY - top) / r.height - 0.5) * 2 * MAX_SHIFT)
        el.dataset.mx = x; el.dataset.my = y
        el.style.transform = `translate(${x}px, ${y}px)`
      })
    }
    const onMove = (e) => {
      last = e
      if (!raf) raf = requestAnimationFrame(frame)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      mo.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])
}

export function useInView(threshold = 0.4) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen]
}

export function Counter({ to, suffix = '' }) {
  const [ref, seen] = useInView(0.6)
  const [n, setN] = useState(to) // final value in SSR/initial markup so crawlers see real numbers
  // reset to 0 before the first paint on the client, so the count-up never flashes the final value first
  useLayoutEffect(() => { if (!reducedMotion()) setN(0) }, [])
  useEffect(() => {
    if (!seen) return
    if (reducedMotion()) { setN(to); return }
    setN(0)
    let raf
    const start = performance.now()
    const tick = (t) => {
      const p = Math.min((t - start) / 1400, 1)
      setN(Math.round(to * (1 - Math.pow(1 - p, 4))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to])
  return <span ref={ref}>{n}{suffix}</span>
}
