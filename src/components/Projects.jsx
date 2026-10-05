import { useEffect, useRef, useState } from 'react'
import SectionHead from './SectionHead.jsx'

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
      <div className="vis-bar mono"><i /><i /><i /><span>~/{p.name}</span></div>
      {p.terminal.map((line, i) => (
        <p key={i} className={line.startsWith('$') ? 'cmd' : line.startsWith('#') ? 'note' : ''}>{line}</p>
      ))}
    </div>
  )
}

const visuals = { seatmap: SeatMap, route: RouteMap, cart: MiniCart, mixer: Mixer, term: Terminal }

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={dir < 0 ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const pad = (n) => String(n).padStart(2, '0')

function Spotlight({ p, n, total, t, onStep }) {
  const Vis = visuals[p.vis]
  const touchX = useRef(null)

  // A horizontal swipe on phones moves to the next or previous project.
  const onTouchStart = (e) => {
    touchX.current = e.target.closest('input, button') ? null : e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > 60) onStep(dx < 0 ? 1 : -1)
  }

  return (
    <article className="spot" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} aria-live="polite">
      <div className="spot-vis">{Vis && <Vis l={t.vis} p={p} />}</div>
      <div className="spot-body">
        <div className="spot-meta mono">
          <span>{pad(n)} / {pad(total)}</span>
          <span>{p.kind} · {p.year}</span>
        </div>
        <h3>{p.name}{p.clone && <span className="clone"> clone</span>}{p.wip && <span className="clone wip"> in progress</span>}</h3>
        <div className="features">
          {p.features.map((f) => <span key={f}>{f}</span>)}
        </div>
        <p className="spot-desc">{p.desc}</p>
        <div className="stack">
          {p.stack.map((s) => <span key={s} className="mono">{s}</span>)}
        </div>
        <div className="spot-foot">
          <div className="pcard-actions">
            {p.live && (
              <a href={p.live} target="_blank" rel="noreferrer" className="btn btn-fill" data-cursor="↗"
                title={p.preview ? t.previewNote : undefined}>
                {t.live} <span aria-hidden="true">↗</span>
              </a>
            )}
            <a href={p.url} target="_blank" rel="noreferrer" className={`btn${p.live ? '' : ' btn-fill'}`} data-cursor="↗">
              {t.view} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="spot-nav">
            <button className="spot-arrow" onClick={() => onStep(-1)} aria-label={t.prev} data-cursor="←"><Arrow dir={-1} /></button>
            <button className="spot-arrow" onClick={() => onStep(1)} aria-label={t.next} data-cursor="→"><Arrow dir={1} /></button>
          </div>
        </div>
        {p.preview && <span className="pcard-note mono">{t.previewNote}</span>}
      </div>
    </article>
  )
}

export default function Projects({ t }) {
  const [active, setActive] = useState(0)
  const picker = useRef(null)
  const total = t.items.length
  const step = (d) => setActive((i) => (i + d + total) % total)

  // Keep the selected tab visible when the picker scrolls sideways on small screens.
  useEffect(() => {
    const strip = picker.current
    const tab = strip?.children[active]
    if (!tab || strip.scrollWidth <= strip.clientWidth) return
    strip.scrollTo({ left: tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' })
  }, [active])

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
  }

  return (
    <section id="projects" className="section">
      <div className="wrap">
        <SectionHead index={t.index} title={t.title} sub={t.sub} />
        <div className="showcase" data-reveal>
          <Spotlight key={t.items[active].name} p={t.items[active]} n={active + 1} total={total} t={t} onStep={step} />
          <div className="picker" ref={picker} role="tablist" aria-label={t.title} onKeyDown={onKey}>
            {t.items.map((p, i) => (
              <button key={p.name} role="tab" aria-selected={i === active} tabIndex={i === active ? 0 : -1}
                className={i === active ? 'on' : ''} onClick={() => setActive(i)}>
                <span className="mono">{pad(i + 1)}{p.live && <i className="live-dot" />}</span>
                <strong>{p.name}</strong>
                <span>{p.kind}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
