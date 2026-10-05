import { useRef, useState } from 'react'
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

const pad = (n) => String(n).padStart(2, '0')

// Tile sizes follow the grid areas in styles.css (a0…a6): wide tiles put the visual
// beside the text, tall ones above it, small ones skip it.
const sizes = ['wide', 'small', 'small', 'tall', 'tall', 'wide', 'wide']

function Tile({ p, i, t }) {
  const ref = useRef(null)
  const size = sizes[i] || 'small'
  const Vis = size === 'small' ? null : visuals[p.vis]

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <article ref={ref} className={`tile tile-${size}`} style={{ gridArea: `a${i}` }} onPointerMove={onMove} data-reveal>
      {Vis && <div className="tile-vis"><Vis l={t.vis} p={p} /></div>}
      <div className="tile-body">
        <div className="tile-meta mono">
          <span>{pad(i + 1)} / {p.kind}</span>
          {p.live && <span className="tile-live"><i className="live-dot" /> live</span>}
        </div>
        <h3>{p.name}{p.clone && <span className="clone"> clone</span>}{p.wip && <span className="clone wip"> in progress</span>}</h3>
        <div className="features">
          {p.features.map((f) => <span key={f}>{f}</span>)}
        </div>
        <p className="tile-desc">{p.desc}</p>
        <div className="tile-stack mono">{p.stack.join(' · ')}</div>
        <div className="tile-foot">
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
          {p.preview && <span className="pcard-note mono">{t.previewNote}</span>}
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
        <div className="bento">
          {t.items.map((p, i) => <Tile key={p.name} p={p} i={i} t={t} />)}
        </div>
      </div>
    </section>
  )
}
