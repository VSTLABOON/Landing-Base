// ─── STATS.JS — Animated counters ───────────────────────────────
export function initStats() {
  const els = document.querySelectorAll('.stat-num[data-target]')
  if (!els.length) return

  const easeOut = t => 1 - Math.pow(1 - t, 3)

  const animate = (el, target, duration = 1600) => {
    const start = performance.now()
    const step  = now => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      const value    = Math.round(easeOut(progress) * target)
      el.textContent = value >= 1000 ? value.toLocaleString('es-MX') : String(value)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  // Disparar cuando el hero-stats sea visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        els.forEach(el => animate(el, Number(el.dataset.target)))
        observer.disconnect()
      }
    })
  }, { threshold: .5 })

  const statsBar = document.querySelector('.hero-stats')
  if (statsBar) observer.observe(statsBar)
}
