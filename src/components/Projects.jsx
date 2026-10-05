import { useCallback, useEffect, useRef, useState } from 'react'
import SectionHead from './SectionHead.jsx'
import { isTouch } from '../hooks.jsx'

// Mini, playable seat map — a nod to the iTicket clone.
function SeatMap({ l }) {
  const taken = new Set([3, 4, 11, 12, 20, 27, 28, 35])
  const [sel, setSel] = useState(new Set([18, 19]))
  const toggle = (i) => {
    if (taken.has(i)) return
    setSel((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })
  }
  return (
    <div className="vis seatmap" onClick={(e) => e.stopPropagation()}>
      <div className="stage mono">{l.stage}</div>
      <div className="seats">
        {Array.from({ length: 40 }, (_, i) => (
          <button
            key={i}
            className={`seat ${taken.has(i) ? 'taken' : ''} ${sel.has(i) ? 'sel' : ''}`}
            onClick={() => toggle(i)}
            aria-label={`Seat ${i + 1}`}
            data-cursor={taken.has(i) ? '✕' : sel.has(i) ? '−' : '+'}
          />
        ))}
      </div>
      <div className="seat-sum mono">
        <span>{sel.size} × 25 ₼</span>
        <strong>{sel.size * 25} ₼</strong>
      </div>
    </div>
  )
}

// Animated shipping route — a nod to the Carify clone.
function RouteMap({ l }) {
  const [price, setPrice] = useState(18000)
  const ship = Math.round(1450 + price * 0.035)
  return (
    <div className="vis route" onClick={(e) => e.stopPropagation()}>
      <svg viewBox="0 0 320 150" aria-hidden="true">
        <path id="rt" d="M20 110 C 90 20, 170 20, 200 70 S 280 120, 300 40" className="route-path" />
        <path d="M20 110 C 90 20, 170 20, 200 70 S 280 120, 300 40" className="route-dash" />
        <circle r="5" className="route-car">
          <animateMotion dur="5s" repeatCount="indefinite"><mpath href="#rt" /></animateMotion>
        </circle>
        <circle cx="20" cy="110" r="4" className="route-pin" />
        <circle cx="300" cy="40" r="4" className="route-pin" />
        <text x="12" y="132" className="route-label">Busan</text>
        <text x="180" y="96" className="route-label">Poti</text>
        <text x="278" y="26" className="route-label">{l.baku}</text>
      </svg>
      <label className="calc mono">
        <span>{l.car} ${price.toLocaleString('en-US')}</span>
        <input type="range" min="5000" max="60000" step="500" value={price} onChange={(e) => setPrice(+e.target.value)}
          style={{ '--fill': `${((price - 5000) / 55000) * 100}%` }} aria-label={l.car} />
        <span>≈ ${ship.toLocaleString('en-US')} {l.ship}</span>
      </label>
    </div>
  )
}

function MiniCart({ l }) {
  const items = [
    { name: 'Sony WH-1000XM5', price: 699 },
    { name: 'Apple Watch S9', price: 999 },
    { name: 'MX Master 3S', price: 249 },
  ]
  const [qty, setQty] = useState([1, 0, 2])
  const change = (i, d) => setQty((q) => q.map((v, j) => (j === i ? Math.min(5, Math.max(0, v + d)) : v)))
  const total = items.reduce((sum, it, i) => sum + it.price * qty[i], 0)
  const goal = 1500
  return (
    <div className="vis minicart" onClick={(e) => e.stopPropagation()}>
      <ul>
        {items.map((it, i) => (
          <li key={it.name} className={qty[i] ? '' : 'off'}>
            <span>{it.name}</span>
            <span className="qty mono">
              <button onClick={() => change(i, -1)} aria-label={`${l.less} ${it.name}`} data-cursor="−">−</button>
              <b>{qty[i]}</b>
              <button onClick={() => change(i, 1)} aria-label={`${l.more} ${it.name}`} data-cursor="+">+</button>
            </span>
            <span className="mono">{it.price * qty[i]} ₼</span>
          </li>
        ))}
      </ul>
      <div className="cart-foot mono">
        <div className="bar"><i style={{ width: `${Math.min(100, (total / goal) * 100)}%` }} /></div>
        <span>{total >= goal ? l.freeShip : `${goal - total} ₼ ${l.toFree}`}</span>
        <strong>{total} ₼</strong>
      </div>
    </div>
  )
}

function Mixer({ l }) {
  const ings = [
    { name: 'Rum', c: 55 }, { name: 'Lime', c: 35 }, { name: 'Mint', c: 75 },
    { name: 'Sugar', c: 20 }, { name: 'Soda', c: 10 },
  ]
  const [on, setOn] = useState(new Set([0, 1]))
  const toggle = (i) => setOn((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })
  const layers = ings.filter((_, i) => on.has(i))
  return (
    <div className="vis mixer" onClick={(e) => e.stopPropagation()}>
      <div className="glass" aria-hidden="true">
        {layers.map((g) => (
          <span key={g.name} style={{ height: `${100 / ings.length}%`, background: `color-mix(in srgb, var(--accent) ${g.c}%, var(--bg-3))` }} />
        ))}
      </div>
      <div className="mix-side">
        <div className="chips">
          {ings.map((g, i) => (
            <button key={g.name} className={on.has(i) ? 'on' : ''} onClick={() => toggle(i)} aria-pressed={on.has(i)} data-cursor={on.has(i) ? '−' : '+'}>
              {g.name}
            </button>
          ))}
        </div>
        <span className="mono">{on.size === ings.length ? `Mojito ✓` : `${on.size}/${ings.length} ${l.ingredients}`}</span>
      </div>
    </div>
  )
}

function Terminal({ p }) {
  return (
    <div className="vis term" aria-hidden="true">
      {p.terminal.map((line, i) => (
        <p key={i} className={line.startsWith('$') ? 'cmd' : line.startsWith('#') ? 'note' : ''}>{line}</p>
      ))}
    </div>
  )
}

const visuals = { seatmap: SeatMap, route: RouteMap, cart: MiniCart, mixer: Mixer, term: Terminal }

function Card({ p, n, view, live, l, previewNote }) {
  const ref = useRef(null)
  const onMove = (e) => {
    if (isTouch()) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    ref.current.style.setProperty('--mx', `${x * 100}%`)
    ref.current.style.setProperty('--my', `${y * 100}%`)
    ref.current.style.transform = `perspective(1100px) rotateY(${(x - 0.5) * 6}deg) rotateX(${(0.5 - y) * 6}deg)`
  }
  const reset = () => { ref.current.style.transform = '' }
  const Vis = visuals[p.vis]

  return (
    <article className="pcard" ref={ref} onPointerMove={onMove} onPointerLeave={reset}>
      <div className="pcard-top">
        <span className="mono">{String(n).padStart(2, '0')} / {p.kind}</span>
        <span className="mono">{p.year}</span>
      </div>
      {Vis && <Vis l={l} p={p} />}
      <div className="pcard-body">
        <h3>{p.name}{p.clone && <span className="clone"> clone</span>}{p.wip && <span className="clone wip"> in progress</span>}</h3>
        <div className="features">
          {p.features.map((f) => <span key={f}>{f}</span>)}
        </div>
        <p>{p.desc}</p>
        <div className="stack">
          {p.stack.map((s) => <span key={s} className="mono">{s}</span>)}
        </div>
        <div className="pcard-actions">
          {p.live && (
            <a href={p.live} target="_blank" rel="noreferrer" className="btn btn-fill pcard-link" data-cursor="↗"
              title={p.preview ? previewNote : undefined}>
              {live} <span aria-hidden="true">↗</span>
            </a>
          )}
          <a href={p.url} target="_blank" rel="noreferrer" className={`btn pcard-link${p.live ? '' : ' btn-fill'}`} data-cursor="↗">
            {view} <span aria-hidden="true">↗</span>
          </a>
        </div>
        {p.preview && <span className="pcard-note mono">{previewNote}</span>}
      </div>
    </article>
  )
}

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={dir < 0 ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Projects({ t }) {
  const [group, setGroup] = useState('all')
  const [view, setView] = useState({ first: 0, count: 1, start: true, end: false })
  const track = useRef(null)
  const items = group === 'all' ? t.items : t.items.filter((p) => p.group === group)

  // Width of one card plus the gap — how far a single arrow click moves the track.
  const step = () => {
    const el = track.current
    const card = el.firstElementChild
    if (!card) return el.clientWidth
    return card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0)
  }

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    const s = step()
    const max = el.scrollWidth - el.clientWidth
    setView({
      first: Math.round(el.scrollLeft / s),
      count: Math.max(1, Math.round(el.clientWidth / s)),
      start: el.scrollLeft <= 2,
      end: el.scrollLeft >= max - 2,
    })
  }, [])

  useEffect(() => {
    track.current.scrollTo({ left: 0 })
    measure()
  }, [group, measure])

  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const slide = (dir) => track.current.scrollBy({ left: dir * step(), behavior: 'smooth' })
  const goTo = (i) => track.current.scrollTo({ left: i * step(), behavior: 'smooth' })
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); slide(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); slide(-1) }
  }

  const counts = { all: t.items.length }
  t.items.forEach((p) => { counts[p.group] = (counts[p.group] || 0) + 1 })
  const lastVisible = view.end ? items.length - 1 : view.first + view.count - 1

  return (
    <section id="projects" className="section">
      <div className="wrap">
        <SectionHead index={t.index} title={t.title} sub={t.sub} />
        <div className="ptools" data-reveal>
          <div className="ptabs" role="tablist" aria-label={t.filterLabel}>
            {Object.entries(t.groups).map(([key, label]) => (
              <button key={key} role="tab" aria-selected={group === key} className={group === key ? 'on' : ''}
                onClick={() => setGroup(key)}>
                {label} <span className="mono">{counts[key] || 0}</span>
              </button>
            ))}
          </div>
          <div className="parrows">
            <button className="parrow" onClick={() => slide(-1)} disabled={view.start} aria-label={t.prev} data-cursor="←"><Arrow dir={-1} /></button>
            <button className="parrow" onClick={() => slide(1)} disabled={view.end} aria-label={t.next} data-cursor="→"><Arrow dir={1} /></button>
          </div>
        </div>
        <div className="ptrack" ref={track} onScroll={measure} onKeyDown={onKey} tabIndex={0}
          role="region" aria-label={t.title} data-reveal>
          {items.map((p) => (
            <Card key={p.name} p={p} n={t.items.indexOf(p) + 1} view={t.view} live={t.live} l={t.vis} previewNote={t.previewNote} />
          ))}
        </div>
        <div className="pdots">
          {items.map((p, i) => (
            <button key={p.name} className={i >= view.first && i <= lastVisible ? 'on' : ''} onClick={() => goTo(i)}
              aria-label={p.name} />
          ))}
        </div>
      </div>
    </section>
  )
}
