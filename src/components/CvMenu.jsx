import { useEffect, useRef, useState } from 'react'
import { cvs } from '../data.js'

// Split button: the main part downloads the default (Full-Stack) CV, the arrow opens the other versions.
export default function CvMenu({ t }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const [main] = cvs

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div className={`cv-split ${open ? 'open' : ''}`} ref={ref}>
      <a href={main.file} className="btn cv-main" download>{t.ctaCv} <span aria-hidden="true">↓</span></a>
      <button type="button" className="btn cv-toggle" aria-label={t.cvMenu} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div className="cv-menu" role="menu">
          <p className="cv-menu-head mono">{t.cvPick}</p>
          {cvs.map((cv) => (
            <a key={cv.key} href={cv.file} download role="menuitem" className="cv-item" onClick={() => setOpen(false)}>
              <span>{cv.label}</span>
              <span className="mono">{cv.note || 'PDF'} ↓</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
