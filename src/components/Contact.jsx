import { useEffect, useRef, useState } from 'react'
import { links, cvs } from '../data.js'

function BakuClock() {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Baku', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => { const id = setInterval(() => setTime(fmt()), 1000); return () => clearInterval(id) }, [])
  return <span>{time}</span>
}

export default function Contact({ t, name, go }) {
  const [copied, setCopied] = useState(null) // null | 'ok' | 'fail'
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async () => {
    let ok = true
    try { await navigator.clipboard.writeText(links.email) } catch { ok = false }
    setCopied(ok ? 'ok' : 'fail')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), ok ? 1800 : 4000)
  }

  const socials = [
    ['GitHub', links.github, 'saidmuradkhan'],
    ['GitLab', links.gitlab, 'saidmuradkhan414'],
    ['LinkedIn', links.linkedin, 'Said Muradkhan'],
    ['CV', links.cv, 'Full-Stack PDF ↓'],
  ]

  return (
    <footer id="contact" className="contact">
      <div className="wrap">
        <p className="mono sec-index" data-reveal>({t.index}) — {t.kicker}</p>
        <h2 className="contact-title" data-reveal>
          <span>{t.title1}</span>
          <span className="accent-text">{t.title2}</span>
        </h2>
        <p className="contact-text" data-reveal>{t.text}</p>

        <div className="mail-row" data-reveal>
          <a href={`mailto:${links.email}`} className="mail" data-cursor="✉">{links.email}</a>
          <button className="btn" onClick={copy} aria-live="polite" data-magnetic>{copied === 'ok' ? t.copied : copied === 'fail' ? `Copy failed — ${links.email}` : t.copy}</button>
          <a href={`mailto:${links.email}`} className="btn btn-fill" data-magnetic>{t.send} →</a>
        </div>

        <div className="socials" data-reveal>
          {socials.map(([name, href, handle]) => (
            <a key={name} href={href} target={name === 'CV' ? undefined : '_blank'} rel="noreferrer" download={name === 'CV' ? '' : undefined} className={`social ${name === 'LinkedIn' ? 'is-linkedin' : name === 'GitHub' ? 'is-github' : name === 'GitLab' ? 'is-gitlab' : ''}`}>
              <span className="mono" lang="en">{name}</span>
              <strong>{handle}</strong>
              <span className="arr" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>

        <p className="cv-other mono" data-reveal>
          <span>{t.cvOther}:</span>
          {cvs.slice(1).map((cv) => <a key={cv.key} href={cv.file} download>{cv.label} ↓</a>)}
        </p>

        <div className="foot mono">
          <span>© {new Date().getFullYear()} {name.first} {name.last}</span>
          <span>{t.local}: <BakuClock /></span>
          <span className="hide-sm">{t.built}</span>
          <button onClick={() => go('top')} className="to-top">{t.top} ↑</button>
        </div>
      </div>
    </footer>
  )
}
