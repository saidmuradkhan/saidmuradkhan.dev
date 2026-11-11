try {
  var d = document.documentElement
  var t = localStorage.getItem('theme')
  if (t !== 'light' && t !== 'dark') t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  d.dataset.theme = t
  var m = document.querySelectorAll('meta[name="theme-color"]')
  for (var i = 0; i < m.length; i++) m[i].setAttribute('content', t === 'light' ? '#f2eee7' : '#0a0a0b')
} catch (e) {}
