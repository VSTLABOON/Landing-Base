// ─── PETALS.JS ──────────────────────────────────────────────────
export function initPetals() {
  const container = document.getElementById('petals-container')
  if (!container) return

  if (!document.getElementById('petal-kf')) {
    const s = document.createElement('style')
    s.id = 'petal-kf'
    s.textContent = `
      @keyframes petalFall {
        0%   { transform:translateY(-50px) rotate(0deg) scale(.8); opacity:0; }
        6%   { opacity:1; }
        88%  { opacity:.55; }
        100% { transform:translateY(105vh) rotate(480deg) scale(1.1); opacity:0; }
      }
      .petal { position:absolute; top:0; pointer-events:none;
               animation:petalFall linear infinite; will-change:transform,opacity; }
    `
    document.head.appendChild(s)
  }

  const shapes = [
    c => `<svg viewBox="0 0 24 24" fill="${c}" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    c => `<svg viewBox="0 0 20 28" fill="${c}" stroke="none"><ellipse cx="10" cy="14" rx="7" ry="12" transform="rotate(-15 10 14)"/></svg>`,
    c => `<svg viewBox="0 0 20 24" fill="${c}" stroke="none"><path d="M10 2C4 2 2 8 2 13C2 19 6 22 10 22C14 22 18 19 18 13C18 8 16 2 10 2Z"/></svg>`,
  ]
  const cols = ['rgba(240,160,180,.7)','rgba(255,255,255,.5)','rgba(217,79,110,.55)','rgba(196,154,60,.4)']

  for (let i = 0; i < 28; i++) {
    const p    = document.createElement('div')
    p.className = 'petal'
    const sz   = Math.random() * 13 + 6
    const dur  = Math.random() * 7 + 5
    const delay= -(Math.random() * dur)
    const col  = cols[Math.floor(Math.random() * cols.length)]
    const sh   = shapes[Math.floor(Math.random() * shapes.length)]
    Object.assign(p.style, {
      width:`${sz}px`, height:`${sz}px`,
      left:`${Math.random()*100}%`,
      opacity: String(Math.random()*.22+.06),
      animationDuration:`${dur}s`,
      animationDelay:`${delay}s`,
    })
    p.innerHTML = sh(col)
    container.appendChild(p)
  }
}
