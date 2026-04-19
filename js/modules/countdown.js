// ─── COUNTDOWN.JS — Cuenta regresiva al 10 de mayo ──────────────
export function initCountdown() {
  const banner  = document.getElementById('countdown-banner')
  const closeBtn = document.getElementById('cd-close')
  const dEl = document.getElementById('cd-days')
  const hEl = document.getElementById('cd-hours')
  const mEl = document.getElementById('cd-mins')
  const sEl = document.getElementById('cd-secs')

  if (!banner || !dEl) return

  // Si el usuario ya cerró el banner en esta sesión, ocultarlo
  if (sessionStorage.getItem('cd-closed')) {
    banner.style.display = 'none'
    return
  }

  // Calcular target: próximo 10 de mayo
  const getTarget = () => {
    const now   = new Date()
    const year  = now.getMonth() < 4 || (now.getMonth() === 4 && now.getDate() <= 10)
      ? now.getFullYear()
      : now.getFullYear() + 1
    return new Date(`${year}-05-10T08:00:00`)
  }

  const pad = n => String(n).padStart(2, '0')

  const tick = () => {
    const diff = getTarget() - Date.now()
    if (diff <= 0) {
      // Ya es el día — mostrar mensaje especial
      dEl.textContent = '¡HOY!'
      hEl.textContent = '--'
      mEl.textContent = '--'
      sEl.textContent = '--'
      return
    }
    const days  = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const mins  = Math.floor((diff % 3600000)  / 60000)
    const secs  = Math.floor((diff % 60000)    / 1000)

    dEl.textContent = pad(days)
    hEl.textContent = pad(hours)
    mEl.textContent = pad(mins)
    sEl.textContent = pad(secs)
  }

  tick()
  const timer = setInterval(tick, 1000)

  // Cerrar banner
  closeBtn?.addEventListener('click', () => {
    banner.classList.add('cd-hiding')
    setTimeout(() => { banner.style.display = 'none' }, 350)
    sessionStorage.setItem('cd-closed', '1')
    clearInterval(timer)
  })

  // Inyectar altura del banner en el body para que el header no solape
  const adjustOffset = () => {
    const h = banner.offsetHeight
    document.documentElement.style.setProperty('--cd-height', `${h}px`)
  }
  adjustOffset()
  window.addEventListener('resize', adjustOffset)
}