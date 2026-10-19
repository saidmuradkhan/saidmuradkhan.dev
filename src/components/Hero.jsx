import { useEffect, useState } from 'react'
import DotField from './DotField.jsx'
import Portrait from './Portrait.jsx'
import { links } from '../data.js'

function Typer({ words }) {
  const [i, setI] = useState(0)
  const [text, setText] = useState('')
  const [del, setDel] = useState(false)

  useEffect(() => {
    const word = words[i % words.length]
    let id
    if (!del && text === word) id = setTimeout(() => setDel(true), 1800)
    else if (del && text === '') { setDel(false); setI((v) => v + 1) }
    else id = setTimeout(() => setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)), del ? 35 : 70)
    return () => clearTimeout(id)
  }, [text, del, i, words])

  return <span className="typer">{text}<i className="caret" /></span>
}

const Letters = ({ word, delay = 0 }) => (
  <span className="word" aria-label={word}>
    {word.split('').map((c, i) => (
      <span key={i} className="ch" style={{ transitionDelay: `${delay + i * 45}ms` }} aria-hidden="true">
        <span>{c}</span>
      </span>
    ))}
  </span>
)

export default function Hero({ t, name, ready, go }) {
  return (
    <section id="top" className={`hero ${ready ? 'ready' : ''}`}>
      <DotField />
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap hero-inner hero-grid">
        <div className="hero-copy">
          <p className="eyebrow mono"><span className="pulse" /> {t.eyebrow}</p>
          <h1 className="hero-title">
            <Letters key={name.first} word={name.first} delay={100} />{' '}
            <Letters key={name.last} word={name.last} delay={300} />
          </h1>
          <p className="hero-role"><span className="mono">&gt;</span> <Typer words={t.roles} /></p>
          <p className="hero-lead">{t.lead}</p>
          <div className="hero-cta">
            <a href="#projects" className="btn btn-fill" data-magnetic onClick={(e) => { e.preventDefault(); go('projects') }}>
              {t.ctaWork} <span aria-hidden="true">→</span>
            </a>
            <a href={links.cv} className="btn" download data-magnetic>{t.ctaCv} <span aria-hidden="true">↓</span></a>
            <a href={links.github} className="btn btn-icon is-github" target="_blank" rel="noreferrer" aria-label="GitHub" data-magnetic>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" /></svg>
              <span className="btn-label">GitHub</span>
            </a>
            <a href={links.gitlab} className="btn btn-icon is-gitlab" target="_blank" rel="noreferrer" aria-label="GitLab" data-magnetic>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="m23.6 9.59-.03-.09L20.3.97a.85.85 0 0 0-.34-.4.87.87 0 0 0-1 .05.87.87 0 0 0-.29.44l-2.2 6.75H7.53L5.33 1.06a.86.86 0 0 0-.29-.44.87.87 0 0 0-1-.05.85.85 0 0 0-.34.4L.43 9.5l-.03.09a6.07 6.07 0 0 0 2.01 7.01l.01.01.03.02 4.97 3.73 2.46 1.86 1.5 1.13a1.01 1.01 0 0 0 1.22 0l1.5-1.13 2.46-1.86 5-3.75.01-.01a6.07 6.07 0 0 0 2.02-7.01Z" /></svg>
              <span className="btn-label">GitLab</span>
            </a>
            <a href={links.linkedin} className="btn btn-icon is-linkedin" target="_blank" rel="noreferrer" aria-label="LinkedIn" data-magnetic>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
              <span className="btn-label">LinkedIn</span>
            </a>
          </div>
        </div>
        <div className="hero-card">
          <Portrait alt={`${name.first} ${name.last}`} start={ready} />
          <div className="hero-card-foot mono">
            <span><i className="pulse" /> Baku, Azerbaijan</span>
            <span>{name.first} {name.last}</span>
          </div>
        </div>
      </div>
      <div className="wrap hero-foot mono">
        <span className="avail"><i /> {t.available}</span>
        <span className="coords">40.3777° N, 49.892° E</span>
        <button className="scroll-hint" onClick={() => go('about')}>{t.scroll} <span className="arrow">↓</span></button>
      </div>
    </section>
  )
}
