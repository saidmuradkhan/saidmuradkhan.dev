import { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { content } from './data.js'
import { useMagnetic, useReveal, reducedMotion } from './hooks.jsx'
import Preloader from './components/Preloader.jsx'
import Cursor from './components/Cursor.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import About from './components/About.jsx'
import Work from './components/Work.jsx'
import Projects from './components/Projects.jsx'
import Skills from './components/Skills.jsx'
import Education from './components/Education.jsx'
import Contact from './components/Contact.jsx'

const read = (k, fallback) => { try { return localStorage.getItem(k) || fallback } catch { return fallback } }
const save = (k, v) => { try { localStorage.setItem(k, v) } catch { /* private mode */ } }
const THEME_COLOR = { dark: '#0a0a0b', light: '#f2eee7' }
// Same order as public/theme.js: saved choice, otherwise the OS preference.
const initialTheme = () => {
  const stored = read('theme', '')
  if (stored === 'light' || stored === 'dark') return stored
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

export default function App() {
  const [theme, setTheme] = useState(initialTheme)
  const [loaded, setLoaded] = useState(false)
  const lenis = useRef(null)
  const t = content

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', THEME_COLOR[theme]))
  }, [theme])
  // persist only an explicit choice, so first-time visitors keep following the OS setting
  const chooseTheme = (v) => { setTheme(v); save('theme', v) }

  useEffect(() => {
    if (reducedMotion()) return
    const l = new Lenis({
      lerp: 0.09,
      // Let the terminal scroll natively, but only once it actually has overflowing output;
      // otherwise the wheel/touch belongs to the page.
      prevent: (node) => node.classList?.contains('term-body') && node.scrollHeight > node.clientHeight + 1,
    })
    lenis.current = l
    let raf
    const loop = (time) => { l.raf(time); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); l.destroy() }
  }, [])

  useEffect(() => {
    if (loaded) lenis.current?.start()
    else lenis.current?.stop()
  }, [loaded])

  const go = useCallback((id, { instant = false } = {}) => {
    const el = id === 'top' ? 0 : document.getElementById(id)
    const behavior = instant ? 'instant' : 'smooth'
    if (lenis.current) lenis.current.scrollTo(el, instant ? { immediate: true, force: true } : { offset: 0, duration: 1.4 })
    else if (el) el.scrollIntoView({ behavior })
    else window.scrollTo({ top: 0, behavior })
  }, [])

  // Honour links like /#projects once the preloader has handed over.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!loaded || !id) return
    if (document.getElementById(id)) go(id, { instant: true })
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [loaded, go])

  useReveal([loaded])
  useMagnetic()

  return (
    <>
      <Preloader label={t.loading} name={t.name} onDone={() => setLoaded(true)} />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Header t={t} theme={theme} setTheme={chooseTheme} go={go} />
      <main>
        <Hero t={t.hero} name={t.name} ready={loaded} go={go} />
        <Marquee />
        <About t={t.about} term={t.term} go={go} />
        <Work t={t.work} />
        <Projects t={t.projects} />
        <Skills t={t.skills} />
        <Education t={t.edu} />
      </main>
      <Contact t={t.contact} name={t.name} go={go} />
    </>
  )
}
