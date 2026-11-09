import { useEffect, useRef, useState } from 'react'
import SectionHead from './SectionHead.jsx'
import { Counter } from '../hooks.jsx'

// Words light up one by one as the statement scrolls through the viewport.
function ScrollText({ html }) {
  const ref = useRef(null)
  const [lit, setLit] = useState(0)
  const words = html.split(' ').map((w) => ({ em: /<\/?em>/.test(w), text: w.replace(/<\/?em>/g, '') }))
  // words between <em> and </em> inherit emphasis
  let inEm = false
  words.forEach((w, i) => {
    const raw = html.split(' ')[i]
    if (raw.includes('<em>')) inEm = true
    w.em = inEm
    if (raw.includes('</em>')) inEm = false
  })

  useEffect(() => {
    const onScroll = () => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)
      setLit(Math.round(Math.min(Math.max(p, 0), 1) * words.length))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [words.length])

  return (
    <p className="about-big" ref={ref}>
      {words.map((w, i) => (
        <span key={i} className={`${i < lit ? 'lit' : ''} ${w.em ? 'em' : ''}`}>{w.text} </span>
      ))}
    </p>
  )
}

function Terminal({ term, go }) {
  const [lines, setLines] = useState([{ k: 'out', v: term.welcome }])
  const [val, setVal] = useState('')
  const [hist, setHist] = useState([])
  const [hi, setHi] = useState(-1)
  const out = useRef(null)
  const input = useRef(null)

  useEffect(() => { setLines([{ k: 'out', v: term.welcome }]) }, [term])
  useEffect(() => { if (out.current) out.current.scrollTop = out.current.scrollHeight }, [lines])

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase()
    if (!cmd) return
    setHist((h) => [cmd, ...h])
    setHi(-1)
    if (cmd === 'clear') { setLines([]); return }
    if (cmd === 'cls') { setLines([]); return }
    const map = { help: term.help, whoami: term.whoami, skills: term.skills, projects: term.projects, contact: term.contact, hire: term.hire, sudo: '🔒 nice try.', ls: 'about.md  work/  projects/  cv.pdf' }
    const reply = map[cmd] ?? term.unknown + cmd
    setLines((l) => [...l, { k: 'in', v: raw }, { k: cmd in map ? 'out' : 'err', v: reply }])
    if (cmd === 'hire') setTimeout(() => go('contact'), 900)
    if (cmd === 'projects') setTimeout(() => go('projects'), 1200)
  }

  const onKey = (e) => {
    if (e.key === 'Enter') { run(val); setVal('') }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const n = Math.min(hi + 1, hist.length - 1); if (hist[n]) { setHi(n); setVal(hist[n]) } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const n = hi - 1; setHi(Math.max(n, -1)); setVal(n >= 0 ? hist[n] : '') }
  }

  const chips = ['help', 'whoami', 'skills', 'hire']

  return (
    <div className="terminal" data-reveal onClick={() => input.current?.focus({ preventScroll: true })}>
      <div className="term-bar">
        <i /><i /><i />
        <span className="mono">said@portfolio — zsh</span>
      </div>
      <div className="term-body mono" ref={out}>
        {lines.map((l, i) => (
          <div key={i} className={`tl ${l.k}`}>{l.k === 'in' ? <><b>❯</b> {l.v}</> : l.v}</div>
        ))}
        <div className="tl in">
          <b>❯</b>
          <input
            ref={input}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={onKey}
            spellCheck="false"
            autoComplete="off"
            aria-label="Terminal input"
          />
        </div>
      </div>
      <div className="term-chips">
        {chips.map((c) => (
          <button key={c} className="mono" onClick={(e) => { e.stopPropagation(); run(c) }}>{c}</button>
        ))}
      </div>
    </div>
  )
}

export default function About({ t, term, go }) {
  return (
    <section id="about" className="section">
      <div className="wrap">
        <SectionHead index={t.index} title={t.title} />
        <ScrollText html={t.big} />
        <div className="about-grid">
          <div className="about-text" data-reveal>
            <p>{t.p1}</p>
            <p>{t.p2}</p>
            <div className="stats">
              {t.stats.map((s) => (
                <div key={s.label} className="stat">
                  <strong><Counter to={s.n} suffix={s.s} /></strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="term-hint mono">↳ {t.terminalHint}</p>
            <Terminal term={term} go={go} />
          </div>
        </div>
      </div>
    </section>
  )
}
