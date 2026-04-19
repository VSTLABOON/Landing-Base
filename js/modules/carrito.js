// ─── CARRITO.JS — Sistema de pedido unificado ────────────────────
export function initCarrito(productos, whatsapp) {
  // ── 0. Datos y Storage Global ──────────────────────────────────
  const prodMap = Object.fromEntries(productos.map(p => [p.id, p]))
  const cartStore = {
    items: new Map(), // key: id -> value: { id, type, label, sub, img }
    add(item) {
      if (!this.items.has(item.id)) {
        this.items.set(item.id, item)
        this.notify()
        showToast(`¡Agregado al carrito!`)
      }
    },
    remove(id) {
      if (this.items.has(id)) {
        this.items.delete(id)
        this.notify()
      }
    },
    clear() {
      this.items.clear()
      this.notify()
    },
    listeners: [],
    subscribe(fn) { this.listeners.push(fn) },
    notify() { 
      this.listeners.forEach(fn => fn(this.items)) 
      document.dispatchEvent(new CustomEvent('cart-updated', { detail: this.items }))
    }
  }

  // ── 1. Inyectar markup ─────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <div id="toast-container" aria-live="polite"></div>

    <div id="carrito-backdrop" aria-hidden="true"></div>

    <aside id="carrito-drawer"
           role="dialog"
           aria-modal="true"
           aria-label="Hacer un pedido"
           aria-hidden="true">

      <div class="cd-header">
        <div class="cd-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="18" height="18" aria-hidden="true">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          <span>Hacer un pedido</span>
        </div>
        <button id="carrito-close" aria-label="Cerrar panel de pedido">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               width="16" height="16" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Lista de elementos del Carrito -->
      <div id="cd-list" class="cd-list">
         <div class="cd-list-empty">Tu carrito está vacío</div>
      </div>

      <form id="carrito-form" class="cd-form" novalidate aria-label="Formulario de pedido">
        <div class="cd-row">
          <div class="cd-field">
            <label for="cd-nombre">Tu nombre</label>
            <input type="text" id="cd-nombre" name="nombre"
                   placeholder="María González"
                   required autocomplete="name">
          </div>
          <div class="cd-field">
            <label for="cd-fecha">Fecha de entrega</label>
            <input type="date" id="cd-fecha" name="fecha" required>
          </div>
        </div>

        <div class="cd-field">
          <label for="cd-colonia">Colonia de entrega</label>
          <input type="text" id="cd-colonia" name="colonia"
                 placeholder="Ej: Angelópolis"
                 required autocomplete="address-level2">
        </div>

        <div class="cd-field">
          <label for="cd-destinatario">¿Para quién es?</label>
          <input type="text" id="cd-destinatario" name="destinatario"
                 placeholder="Nombre de quien recibe" required>
        </div>

        <div class="cd-field">
          <label for="cd-notas">Preferencias sobre flores <span class="cd-opt">(opcional)</span></label>
          <input type="text" id="cd-notas" name="notas"
                 placeholder="Ej: Rosas rojas, o girasoles grandes...">
        </div>

        <div class="cd-field">
          <label for="cd-mensaje">
            Mensaje en la tarjeta
            <span class="cd-opt">(opcional)</span>
          </label>
          <textarea id="cd-mensaje" name="mensaje"
                    rows="2"
                    placeholder="Con todo mi amor…"
                    maxlength="120"></textarea>
          <span class="cd-char-count" id="cd-char" aria-live="polite">0 / 120</span>
        </div>

        <button type="submit" class="cd-submit">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
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
          Enviar pedido por WhatsApp
        </button>

        <p class="cd-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="12" height="12" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Sin apps, sin registro. Confirman en minutos.
        </p>
      </form>
    </aside>

    <!-- FAB siempre visible -->
    <button id="carrito-fab" aria-label="Abrir formulario de pedido" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           width="20" height="20" aria-hidden="true">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
      <span>Pedir</span>
      <div class="cd-fab-badge" id="cd-fab-badge">0</div>
    </button>
  `)

  // ── 2. Referencias DOM ─────────────────────────────────────────
  const drawer       = document.getElementById('carrito-drawer')
  const backdrop     = document.getElementById('carrito-backdrop')
  const closeBtn     = document.getElementById('carrito-close')
  const form         = document.getElementById('carrito-form')
  const fab          = document.getElementById('carrito-fab')
  const fabBadge     = document.getElementById('cd-fab-badge')
  const cdList       = document.getElementById('cd-list')
  const msgArea      = document.getElementById('cd-mensaje')
  const charEl       = document.getElementById('cd-char')
  const fechaInput   = document.getElementById('cd-fecha')
  const toastCont    = document.getElementById('toast-container')

  let previousFocus = null

  // ── 3. Fecha mínima = hoy ──────────────────────────────────────
  ;(() => {
    const hoy  = new Date()
    const yyyy = hoy.getFullYear()
    const mm   = String(hoy.getMonth() + 1).padStart(2, '0')
    const dd   = String(hoy.getDate()).padStart(2, '0')
    fechaInput.min   = `${yyyy}-${mm}-${dd}`
    fechaInput.value = `${yyyy}-${mm}-${dd}`
  })()

  // ── 4. Contador de caracteres ──────────────────────────────────
  msgArea.addEventListener('input', () => {
    const len = msgArea.value.length
    charEl.textContent  = `${len} / 120`
    charEl.style.color  = len > 100 ? 'var(--rosa)' : ''
    charEl.style.fontWeight = len > 100 ? '600' : ''
  })

  // ── 5. Actualizar Drawer y FAB (Suscritos al store) ─────────────
  cartStore.subscribe(items => {
    // 5.1 Atualizar Badge
    const count = items.size
    fabBadge.textContent = String(count)
    if (count > 0) {
      fab.classList.add('has-items')
      // Efecto Pop
      fab.classList.remove('pop')
      void fab.offsetWidth
      fab.classList.add('pop')
    } else {
      fab.classList.remove('has-items')
    }

    // 5.2 Actualizar Lista del Drawer
    if (count === 0) {
      cdList.innerHTML = '<div class="cd-list-empty">Tu carrito está vacío</div>'
      return
    }

    cdList.innerHTML = ''
    items.forEach(item => {
      const cls = item.type === 'flor' ? 'cd-item cd-item-flor' : 'cd-item cd-item-prod'
      const img = item.img ? `<img src="${item.img}" alt="${item.label}">` : ''
      const markup = `
        <div class="${cls}">
          ${img}
          <div class="cd-item-info">
            <span class="cd-item-name">${item.label}</span>
            <span class="cd-item-sub">${item.sub}</span>
          </div>
          <button class="cd-item-remove" data-remove-id="${item.id}" type="button" aria-label="Quitar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      `
      cdList.insertAdjacentHTML('beforeend', markup)
    })
  })

  // Remover item click
  cdList.addEventListener('click', e => {
    const btn = e.target.closest('.cd-item-remove')
    if (btn) cartStore.remove(btn.dataset.removeId)
  })

  // ── Toast Notification System ──────────────────────────────────
  const showToast = (msg) => {
    const toast = document.createElement('div')
    toast.className = 'cd-toast'
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
         <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
      </svg>
      ${msg}
    `
    toastCont.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  // ── 6. Validación campo a campo ────────────────────────────────
  const FOCUSABLE_SEL = [
    'a[href]', 'button:not([disabled])',
    'input:not([disabled])', 'select:not([disabled])',
    'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  const validateField = (el) => {
    if (el.tagName === 'SELECT') return el.value !== ''
    if (el.type === 'date')      return !!el.value
    return el.value.trim().length >= 2
  }

  const markField = (el, valid, shake = false) => {
    el.classList.toggle('cd-invalid', !valid)
    el.classList.toggle('cd-valid',    valid)
    if (!valid && shake) {
      el.classList.remove('cd-shook')
      void el.offsetWidth
      el.classList.add('cd-shook')
      el.addEventListener('animationend', () => el.classList.remove('cd-shook'), { once: true })
    }
  }

  form.querySelectorAll('input, select, textarea').forEach(f => {
    f.addEventListener('blur', () => {
      if (f.hasAttribute('required')) markField(f, validateField(f))
    })
    f.addEventListener('input', () => {
      if (f.classList.contains('cd-invalid')) markField(f, validateField(f))
    })
  })

  // ── 7. Abrir / cerrar drawer ───────────────────────────────────
  const openDrawer = () => {
    previousFocus = document.activeElement
    drawer.classList.add('open')
    drawer.removeAttribute('aria-hidden')
    backdrop.classList.add('active')
    document.body.style.overflow = 'hidden'

    requestAnimationFrame(() => {
      const first = drawer.querySelector(FOCUSABLE_SEL)
      first?.focus()
    })

    drawer.addEventListener('keydown', trapFocus)
    attachSwipeClose()
  }

  const closeDrawer = () => {
    drawer.classList.remove('open')
    drawer.setAttribute('aria-hidden', 'true')
    backdrop.classList.remove('active')
    document.body.style.overflow = ''
    drawer.removeEventListener('keydown', trapFocus)
    detachSwipeClose()
    previousFocus?.focus()
  }

  const trapFocus = (e) => {
    if (e.key !== 'Tab') return
    const focusable = [...drawer.querySelectorAll(FOCUSABLE_SEL)]
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  }

  // ── 8. Swipe-down to close (mobile sheet) ─────────────────────
  let swipeStartY = null
  let swipeStartScrollTop = null
  let drawerTranslating = false

  const onSwipeTouchStart = (e) => {
    if (window.innerWidth > 600) return
    const rect  = drawer.getBoundingClientRect()
    const touch = e.touches[0]
    if (touch.clientY - rect.top > 64) return
    swipeStartY         = touch.clientY
    swipeStartScrollTop = form.scrollTop
  }

  const onSwipeTouchMove = (e) => {
    if (swipeStartY === null || window.innerWidth > 600) return
    const dy = e.touches[0].clientY - swipeStartY
    if (dy > 0) {
      drawerTranslating = true
      drawer.style.transition = 'none'
      drawer.style.transform  = `translateY(${dy}px)`
      const maxDy = window.innerHeight * 0.3
      const alpha = Math.max(0, 0.55 * (1 - dy / maxDy))
      backdrop.style.opacity = String(alpha)
    }
  }

  const onSwipeTouchEnd = (e) => {
    if (!drawerTranslating) { swipeStartY = null; return }
    const dy = e.changedTouches[0].clientY - swipeStartY
    drawer.style.transition = ''
    if (dy > 100) {
      drawer.style.transform = ''
      backdrop.style.opacity = ''
      closeDrawer()
    } else {
      drawer.style.transform = ''
      backdrop.style.opacity = ''
    }
    swipeStartY     = null
    drawerTranslating = false
  }

  const attachSwipeClose = () => {
    drawer.addEventListener('touchstart', onSwipeTouchStart, { passive: true })
    drawer.addEventListener('touchmove',  onSwipeTouchMove,  { passive: true })
    drawer.addEventListener('touchend',   onSwipeTouchEnd,   { passive: true })
  }
  const detachSwipeClose = () => {
    drawer.removeEventListener('touchstart', onSwipeTouchStart)
    drawer.removeEventListener('touchmove',  onSwipeTouchMove)
    drawer.removeEventListener('touchend',   onSwipeTouchEnd)
    drawer.style.transform = ''
    backdrop.style.opacity = ''
  }

  // ── 9. Botones Básicos  ─────────────────────────────
  fab.addEventListener('click', openDrawer)
  closeBtn.addEventListener('click', closeDrawer)
  backdrop.addEventListener('click', closeDrawer)
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer()
  })

  // ── 10. Submit → mensaje WhatsApp unificado ─────────────────────
  form.addEventListener('submit', e => {
    e.preventDefault()

    // Validar carrito vacío
    if (cartStore.items.size === 0) {
      alert("Tu carrito está vacío. Agrega al menos un arreglo para continuar.")
      return
    }

    const requiredFields = [...form.querySelectorAll('[required]')]
    let allValid = true
    requiredFields.forEach(f => {
      const ok = validateField(f)
      markField(f, ok, !ok)
      if (!ok) allValid = false
    })

    if (!allValid) {
      const firstBad = form.querySelector('.cd-invalid')
      firstBad?.focus()
      firstBad?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const nombre  = document.getElementById('cd-nombre').value.trim()
    const fecha   = document.getElementById('cd-fecha').value
    const colonia = document.getElementById('cd-colonia').value.trim()
    const dest    = document.getElementById('cd-destinatario').value.trim()
    const notas   = document.getElementById('cd-notas').value.trim()
    const mensaje = msgArea.value.trim()

    const [y, m, d] = fecha.split('-')
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
    const fechaLeg = `${Number(d)} de ${meses[Number(m) - 1]} de ${y}`

    const items = Array.from(cartStore.items.values())
    const productos = items.filter(i => i.type === 'producto')
    const floresArr = items.filter(i => i.type === 'flor')

    const lines = [
      '¡Hola! Quiero hacer un pedido 🌸',
      '',
    ]
    
    if (productos.length) {
      lines.push('🛒 *Arreglos:*')
      productos.forEach((p, i) => lines.push(`${i + 1}. ${p.label} (${p.sub})`))
      lines.push('')
    }
    
    if (floresArr.length || notas) {
      lines.push('💐 *Preferencia de Flores / Extras:*')
      floresArr.forEach(f => lines.push(`• ${f.label} (${f.sub})`))
      if (notas) lines.push(`📝 *Notas:* ${notas}`)
      lines.push('')
    }

    lines.push(
      `📅 *Fecha de entrega:* ${fechaLeg}`,
      `📍 *Colonia:* ${colonia}`,
      `👤 *Quién pide:* ${nombre}`,
      `💐 *Para:* ${dest}`
    )
    if (mensaje) lines.push(`✉️ *Tarjeta:* "${mensaje}"`)

    lines.push('', 'Por favor confirmar disponibilidad y costo de envío. ¡Gracias!')

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`

    const submitBtn  = form.querySelector('.cd-submit')
    const origHTML   = submitBtn.innerHTML
    submitBtn.textContent = '✓ Abriendo WhatsApp…'
    submitBtn.disabled    = true

    setTimeout(() => {
      window.open(url, '_blank', 'noopener')
      submitBtn.innerHTML = origHTML
      submitBtn.disabled  = false
    }, 600)
  })

  // ── 11. Delegación: botones "Pedir" en tarjetas de producto ───
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('[data-carrito-id]')
    if (!btn) return
    e.stopPropagation()
    const id = btn.dataset.carritoId
    const prod = prodMap[id]
    if (prod) {
      window.carritoAdd({
        id: prod.id,
        type: 'producto',
        label: prod.name,
        sub: prod.precio,
        img: prod.imgUrl
      })
    }
  })

  // ── 12. API global unificada ─────────────────────────────────────
  window.carritoOpen  = openDrawer
  window.carritoClose = closeDrawer
  
  window.carritoAdd = (itemDef) => {
    cartStore.add(itemDef)
  }
  
  window.carritoRemove = (id) => {
    cartStore.remove(id)
  }

  window.carritoHas = (id) => {
    return cartStore.items.has(id)
  }
}