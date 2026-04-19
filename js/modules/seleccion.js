// ─── SELECCION.JS ────────────────────────────────────────────────
//
//  Motor de selección de tarjetas que ahora integra con carrito.js
//

export function initSeleccion(productos, flores, whatsapp) {

  // ── 1. Índices de datos ────────────────────────────────────────
  const prodMap  = Object.fromEntries(productos.map(p => [p.id, p]))
  const florMap  = Object.fromEntries(flores.map(f => [f.name.toLowerCase(), f]))

  // ── 2. Toggle selección (Conexión al carrito unificado) ────────
  const toggle = (el) => {
    const id   = el.dataset.selectId
    const type = el.dataset.selectType
    if (!id || !type) return

    if (window.carritoHas && window.carritoHas(id)) {
      window.carritoRemove(id)
    } else {
      let meta = null
      if (type === 'producto') {
        const p = prodMap[id]
        if (p) meta = { id, type, label: p.name, sub: p.precio, img: p.imgUrl }
      } else if (type === 'flor') {
        const f = florMap[id]
        if (f) meta = { id, type, label: f.name, sub: f.sub, img: f.imgUrl }
      }
      if (!meta) return
      if (window.carritoAdd) window.carritoAdd(meta)
    }
  }

  // ── 3. Delegación global de clics en tarjetas seleccionables ──
  document.body.addEventListener('click', e => {
    // Ignorar clics en elementos marcados como skip (botones de acción)
    if (e.target.closest('[data-select-skip]')) return
    const card = e.target.closest('[data-select-id]')
    if (!card) return
    toggle(card)
  })

  // Soporte teclado: Espacio/Enter en tarjetas seleccionables
  document.body.addEventListener('keydown', e => {
    if (e.key !== ' ' && e.key !== 'Enter') return
    if (e.target.closest('[data-select-skip]')) return
    const card = e.target.closest('[data-select-id]')
    if (!card) return
    if (document.activeElement === card) {
      e.preventDefault()
      toggle(card)
    }
  })

  // ── 4. Sincronizar UI de tarjetas ───────────────────────────────
  document.addEventListener('cart-updated', e => {
    const items = e.detail; // Map de items en carrito
    document.querySelectorAll('[data-select-id]').forEach(card => {
      const id = card.dataset.selectId;
      if (items.has(id)) {
        card.classList.add('sel-selected')
        card.setAttribute('aria-pressed', 'true')
      } else {
        card.classList.remove('sel-selected')
        card.setAttribute('aria-pressed', 'false')
      }
    })
  })
}