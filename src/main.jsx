import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import NotFound from './components/NotFound.jsx'
import './fonts.css'
import './styles.css'

class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { console.error(error) }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="boot-fail">
        <p className="mono">Something went wrong</p>
        <h1>This page didn't load properly.</h1>
        <a className="btn btn-fill" href="/">Reload</a>
      </div>
    )
  }
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

const path = window.location.pathname.replace(/[/]index[.]html$/, '/').replace(/[/]+$/, '') || '/'
const isHome = path === '/'

// index.html is prerendered (SSR) for crawlers only; the client discards it and re-renders from scratch.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {isHome ? <App /> : <NotFound />}
    </ErrorBoundary>
  </StrictMode>,
)
