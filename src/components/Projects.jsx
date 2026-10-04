import { useRef, useState } from 'react'
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

function Card({ p, i, view, live, l }) {
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
    <article className="pcard" ref={ref} onPointerMove={onMove} onPointerLeave={reset} data-reveal>
      <div className="pcard-top">
        <span className="mono">{String(i + 1).padStart(2, '0')} / {p.kind}</span>
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
            <a href={p.live} target="_blank" rel="noreferrer" className="btn btn-fill pcard-link" data-cursor="↗">
              {live} <span aria-hidden="true">↗</span>
            </a>
          )}
          <a href={p.url} target="_blank" rel="noreferrer" className={`btn pcard-link${p.live ? '' : ' btn-fill'}`} data-cursor="↗">
            {view} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  )
}

export default function Projects({ t }) {
  return (
    <section id="projects" className="section">
      <div className="wrap">
        <SectionHead index={t.index} title={t.title} sub={t.sub} />
        <div className="pgrid">
          {t.items.map((p, i) => <Card key={p.name} p={p} i={i} view={t.view} live={t.live} l={t.vis} />)}
        </div>
      </div>
    </section>
  )
}
