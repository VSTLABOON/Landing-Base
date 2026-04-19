// ─── FILTRO.JS — Filtro por presupuesto ─────────────────────────
export function initFiltro(productos) {
  const btns      = document.querySelectorAll('.filtro-btn')
  const emptyMsg  = document.getElementById('filtro-empty')
  if (!btns.length) return

  const RANGES = {
    'all':     [0, Infinity],
    '300-500': [300, 500],
    '500-800': [500, 800],
    '800+':    [800, Infinity],
  }

  const filter = (range) => {
    const [min, max] = RANGES[range] || [0, Infinity]
    const cards = document.querySelectorAll('.prod-card')
    let visible = 0

    cards.forEach(card => {
      const precio = Number(card.dataset.precio) || 0
      // 'all' siempre muestra todo; el resto filtra por rango inclusivo
      const show = range === 'all' || (precio >= min && precio <= max)
      card.style.display     = show ? '' : 'none'
      card.style.opacity     = show ? '' : '0'
      if (show) visible++
    })

    if (emptyMsg) emptyMsg.hidden = visible > 0
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      filter(btn.dataset.range)
    })
  })

  // Estado inicial: todo visible
  filter('all')
}