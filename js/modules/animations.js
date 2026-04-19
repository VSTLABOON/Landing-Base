// ─── ANIMATIONS.JS ──────────────────────────────────────────────
export function initAnimations() {
  // ── Scroll reveal ───────────────────────────────────────────
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        obs.unobserve(entry.target)
      }
    })
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 })
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el))

  // ── Hero parallax ───────────────────────────────────────────
  const heroBody = document.querySelector('.hero-body')
  const heroImg  = document.getElementById('hero-img')

  const onScroll = () => {
    const y = window.scrollY
    const vh = window.innerHeight

    if (y < vh * 1.2) {
      if (heroBody) {
        heroBody.style.transform = `translateY(${y * 0.28}px)`
        heroBody.style.opacity   = String(Math.max(0, 1 - y / (vh * 0.75)))
      }
      if (heroImg) {
        heroImg.style.transform = `scale(1) translateY(${y * 0.12}px)`
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}
