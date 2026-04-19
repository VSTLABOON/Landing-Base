// ─── SERVICIO-CATALOGO.JS ────────────────────────────────────────
//
//  Panel de catálogo horizontal para servicios con selección múltiple.
//
//  Flujo de selección:
//    • Tocar una tarjeta la marca/desmarca (multi-select)
//    • El botón del footer muestra cuántas están seleccionadas
//    • Al confirmar, genera un mensaje WA consolidado con todos los
//      arreglos elegidos, evitando que el cliente escriba manualmente
//    • El botón "Pedir" de cada tarjeta sigue funcionando de forma
//      independiente (abre el drawer del carrito con ese arreglo)

export function initServicioCatalogo(productos) {
  const prodMap = Object.fromEntries(productos.map(p => [p.id, p]))

  // ── 1. Markup ──────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <div id="sc-backdrop" aria-hidden="true"></div>

    <section id="sc-panel"
             role="dialog"
             aria-modal="true"
             aria-label="Catálogo de servicio"
             aria-hidden="true">

      <div class="sc-handle" aria-hidden="true"></div>

      <header class="sc-header">
        <div class="sc-header-info">
          <div id="sc-icon" class="sc-icon" aria-hidden="true"></div>
          <div class="sc-header-text">
            <p  id="sc-eyebrow" class="sc-eyebrow"></p>
            <h2 id="sc-title"   class="sc-title"></h2>
          </div>
        </div>
        <button id="sc-close" class="sc-close" aria-label="Cerrar catálogo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               width="18" height="18" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </header>

      <p id="sc-desc" class="sc-desc"></p>

      <!-- Hints de selección y scroll -->
      <div class="sc-hints" aria-hidden="true">
        <span class="sc-hint-select">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="12" height="12">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Toca una tarjeta para seleccionarla
        </span>
        <span class="sc-hint-scroll">
          Desliza para ver más
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="13" height="13">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </div>

      <div class="sc-rail-wrap" id="sc-rail-wrap" tabindex="-1">
        <ul class="sc-rail" id="sc-rail" role="list"
            aria-label="Arreglos disponibles"></ul>
      </div>

      <!-- Footer dinámico -->
      <footer class="sc-footer">
        <p class="sc-footer-hint" id="sc-footer-hint">
          Selecciona los arreglos que te interesan
        </p>
        <button id="sc-consult-btn" class="sc-consult-btn" disabled
                aria-disabled="true" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"
               aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94
              1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297
              -.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149
              -.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297
              -1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489
              1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124
              -.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86
              9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893
              6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157
              11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0
              11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span id="sc-consult-label">Añadir al carrito</span>
          <span id="sc-consult-badge" class="sc-consult-badge" hidden aria-hidden="true"></span>
        </button>
      </footer>
    </section>
  `)

  // ── 2. DOM refs ────────────────────────────────────────────────
  const panel        = document.getElementById('sc-panel')
  const backdrop     = document.getElementById('sc-backdrop')
  const closeBtn     = document.getElementById('sc-close')
  const iconEl       = document.getElementById('sc-icon')
  const eyebrowEl    = document.getElementById('sc-eyebrow')
  const titleEl      = document.getElementById('sc-title')
  const descEl       = document.getElementById('sc-desc')
  const railWrap     = document.getElementById('sc-rail-wrap')
  const rail         = document.getElementById('sc-rail')
  const footerHint   = document.getElementById('sc-footer-hint')
  const consultBtn   = document.getElementById('sc-consult-btn')
  const consultLbl   = document.getElementById('sc-consult-label')
  const consultBadge = document.getElementById('sc-consult-badge')
  const hintSelect   = panel.querySelector('.sc-hint-select')
  const hintScroll   = panel.querySelector('.sc-hint-scroll')

  // ── 3. Estado ──────────────────────────────────────────────────
  let selectedIds   = new Set()
  let activeWaMsg   = ''
  let previousFocus = null
  let cardObserver  = null

  // ── 4. Sincronizar footer con el estado de selección ──────────
  const syncFooter = () => {
    const n = selectedIds.size
    const active = n > 0

    footerHint.hidden    = active
    consultBtn.disabled  = !active
    consultBtn.setAttribute('aria-disabled', String(!active))
    consultBtn.classList.toggle('sc-consult-active', active)

    if (active) {
      consultLbl.textContent   = n === 1 ? 'Añadir 1 arreglo al carrito' : `Añadir ${n} arreglos al carrito`
      consultBadge.textContent = String(n)
      consultBadge.hidden      = false
    } else {
      consultLbl.textContent   = 'Añadir al carrito'
      consultBadge.hidden      = true
    }
  }

  // ── 5. Toggle selección de tarjeta ─────────────────────────────
  const toggleCard = (card, id) => {
    const wasSelected = selectedIds.has(id)
    if (wasSelected) {
      selectedIds.delete(id)
      card.classList.remove('sc-card-selected')
      card.setAttribute('aria-pressed', 'false')
    } else {
      selectedIds.add(id)
      card.classList.add('sc-card-selected')
      card.setAttribute('aria-pressed', 'true')
    }
    hintSelect?.classList.add('sc-hint-used')
    syncFooter()
  }

  // ── 6. Construir tarjeta ───────────────────────────────────────
  const buildCard = (prod, index) => {
    const li = document.createElement('li')
    li.className   = 'sc-card'
    li.dataset.idx = index
    li.dataset.id  = prod.id
    li.setAttribute('role', 'button')
    li.setAttribute('tabindex', '0')
    li.setAttribute('aria-pressed', 'false')
    li.setAttribute('aria-label', `${prod.name} — ${prod.precio}. Toca para seleccionar.`)

    const disponibleHtml = prod.disponible
      ? `<span class="sc-card-disp"><span class="sc-card-dot"></span>Disponible hoy</span>`
      : `<span class="sc-card-disp sc-card-agotado"><span class="sc-card-dot"></span>Bajo pedido</span>`

    const descHtml = prod.desc
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p class="sc-card-p">${p.replace(/\n/g, '<br>')}</p>`)
      .join('')

    li.innerHTML = `
      <div class="sc-card-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
             width="13" height="13">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="sc-card-img-wrap">
        <img src="${prod.imgUrl}" alt="${prod.name}" loading="lazy" class="sc-card-img"
             onload="this.closest('.sc-card-img-wrap').classList.remove('sc-loading')">
        ${prod.badge ? `<span class="sc-card-badge ${prod.badgeClass || ''}">${prod.badge}</span>` : ''}
        ${disponibleHtml}
      </div>
      <div class="sc-card-body">
        <p class="sc-card-short">${prod.short}</p>
        <h3 class="sc-card-name">${prod.name}</h3>
        <div class="sc-card-desc">${descHtml}</div>
        <div class="sc-card-footer">
          <span class="sc-card-price">${prod.precio}</span>
          <button class="sc-card-cta" type="button"
                  data-sc-pedir="${prod.id}"
                  aria-label="Pedir ${prod.name} ahora">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 width="13" height="13" aria-hidden="true">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            Pedir
          </button>
        </div>
      </div>
    `

    li.querySelector('.sc-card-img-wrap').classList.add('sc-loading')

    // Clic en la tarjeta → toggle (excepto si cae en el botón "Pedir")
    li.addEventListener('click', e => {
      if (e.target.closest('[data-sc-pedir]')) return
      toggleCard(li, prod.id)
    })
    li.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        toggleCard(li, prod.id)
      }
    })

    return li
  }

  // ── 7. Observer: revelar tarjetas al hacer scroll ──────────────
  const createObserver = () => {
    cardObserver?.disconnect()
    cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sc-card-visible')
          cardObserver.unobserve(entry.target)
        }
      })
    }, {
      root:       railWrap,
      threshold:  0.08,
      rootMargin: '0px 80px 0px 0px',
    })
    rail.querySelectorAll('.sc-card').forEach(c => cardObserver.observe(c))
  }

  // ── 8. Enviar selección al Carrito Global ────────
  const commitToCart = () => {
    [...selectedIds].forEach(id => {
      const p = prodMap[id]
      if (p && window.carritoAdd) {
        window.carritoAdd({
          id: p.id,
          type: 'producto',
          label: p.name,
          sub: p.precio,
          img: p.imgUrl
        })
      }
    })
  }

  // ── 9. Abrir panel ─────────────────────────────────────────────
  const ICONS_SVG = {
    heart:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    ribbon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 12c-2-2.5-4-4-4-4s-3.5 1-4 4 4 4 4 4 2-1.5 4-4z"/><path d="M12 12c2-2.5 4-4 4-4s3.5 1 4 4-4 4-4 4-2-1.5-4-4z"/></svg>',
    zap:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  }

  let scScrollBound = false

  const open = (data) => {
    previousFocus = document.activeElement
    selectedIds.clear()
    hintSelect?.classList.remove('sc-hint-used')
    hintScroll?.classList.remove('sc-hint-used')
    syncFooter()

    iconEl.innerHTML      = ICONS_SVG[data.icon] || ICONS_SVG.heart
    eyebrowEl.textContent = 'Catálogo'
    titleEl.textContent   = data.title
    descEl.textContent    = data.desc.split('\n\n')[0]
    activeWaMsg           = data.waMsg || ''

    rail.innerHTML = ''
    data.catalogIds.forEach((id, i) => {
      const prod = prodMap[id]
      if (prod) rail.appendChild(buildCard(prod, i))
    })

    panel.classList.add('sc-open')
    panel.removeAttribute('aria-hidden')
    backdrop.classList.add('sc-active')
    document.body.style.overflow = 'hidden'
    railWrap.scrollLeft = 0

    const onEnd = () => {
      panel.removeEventListener('transitionend', onEnd)
      createObserver()
    }
    panel.addEventListener('transitionend', onEnd)

    requestAnimationFrame(() => closeBtn.focus())
    panel.addEventListener('keydown', trapFocus)
    attachSwipe()

    // Ocultar scroll hint tras primer scroll (bind una sola vez)
    if (!scScrollBound) {
      scScrollBound = true
      railWrap.addEventListener('scroll', () => {
        if (railWrap.scrollLeft > 40) hintScroll?.classList.add('sc-hint-used')
      }, { passive: true })
    }
  }

  // ── 10. Cerrar ─────────────────────────────────────────────────
  const close = () => {
    panel.classList.remove('sc-open')
    panel.setAttribute('aria-hidden', 'true')
    backdrop.classList.remove('sc-active')
    document.body.style.overflow = ''
    panel.removeEventListener('keydown', trapFocus)
    detachSwipe()
    cardObserver?.disconnect()
    previousFocus?.focus()
  }

  // ── 11. Focus trap ─────────────────────────────────────────────
  const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'

  const trapFocus = e => {
    if (e.key === 'Escape') { close(); return }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const cards = [...rail.querySelectorAll('.sc-card')]
      const cur   = document.activeElement?.closest('.sc-card')
      if (!cur) return
      const idx  = cards.indexOf(cur)
      const next = e.key === 'ArrowRight' ? cards[idx + 1] : cards[idx - 1]
      if (next) {
        next.focus()
        next.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
      return
    }

    if (e.key !== 'Tab') return
    const els   = [...panel.querySelectorAll(FOCUSABLE)]
    const first = els[0]
    const last  = els[els.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }

  // ── 12. Swipe-down para cerrar ─────────────────────────────────
  let swipeY0 = null, swiping = false

  const onTouchStart = e => {
    if (!e.target.closest('.sc-header,.sc-handle,.sc-desc,.sc-hints')) return
    swipeY0 = e.touches[0].clientY
  }
  const onTouchMove = e => {
    if (swipeY0 === null) return
    const dy = e.touches[0].clientY - swipeY0
    if (dy > 0) {
      swiping = true
      panel.style.transition = 'none'
      panel.style.transform  = `translateY(${dy}px)`
      backdrop.style.opacity = String(Math.max(0, 0.6 * (1 - dy / 280)))
    }
  }
  const onTouchEnd = e => {
    if (!swiping) { swipeY0 = null; return }
    const dy = e.changedTouches[0].clientY - swipeY0
    panel.style.transition = ''
    panel.style.transform  = ''
    backdrop.style.opacity = ''
    if (dy > 100) close()
    swipeY0 = null; swiping = false
  }

  const attachSwipe = () => {
    panel.addEventListener('touchstart', onTouchStart, { passive: true })
    panel.addEventListener('touchmove',  onTouchMove,  { passive: true })
    panel.addEventListener('touchend',   onTouchEnd,   { passive: true })
  }
  const detachSwipe = () => {
    panel.removeEventListener('touchstart', onTouchStart)
    panel.removeEventListener('touchmove',  onTouchMove)
    panel.removeEventListener('touchend',   onTouchEnd)
    panel.style.transform  = ''
    backdrop.style.opacity = ''
  }

  // ── 13. Botón "Pedir" individual → drawer carrito ──────────────
  rail.addEventListener('click', e => {
    const btn = e.target.closest('[data-sc-pedir]')
    if (!btn) return
    e.stopPropagation()
    const id = btn.dataset.scPedir
    close()
    requestAnimationFrame(() => {
      if (typeof window.carritoOpen === 'function') window.carritoOpen(id)
    })
  })

  // ── 14. Botón "Consultar selección" → Enviar al Carrito ─────────────
  consultBtn.addEventListener('click', () => {
    if (selectedIds.size === 0) return
    commitToCart()
    close()
    if (window.carritoOpen) window.carritoOpen()
  })

  // ── 15. Delegación de clics en serv-items con catálogo ─────────
  document.body.addEventListener('click', e => {
    const trigger = e.target.closest('[data-serv-catalog]')
    if (!trigger?._catalogData) return
    e.stopPropagation()
    open(trigger._catalogData)
  })
  document.body.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const t = document.activeElement
      if (t?._catalogData) open(t._catalogData)
    }
  })

  closeBtn.addEventListener('click', close)
  backdrop.addEventListener('click', close)
}