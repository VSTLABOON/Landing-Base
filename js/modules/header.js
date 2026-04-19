// ─── HEADER.JS ──────────────────────────────────────────────────
export function initHeader() {
  const header   = document.getElementById('site-header')
  const progress = document.getElementById('progress')
  if (!header) return

  const onScroll = () => {
    const y = window.scrollY
    header.classList.toggle('scrolled', y > 60)
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.style.width = max > 0 ? `${(y / max) * 100}%` : '0%'
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}
