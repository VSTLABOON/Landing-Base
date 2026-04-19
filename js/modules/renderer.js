// ─── RENDERER.JS ────────────────────────────────────────────────

const ICONS = {
  zap:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  flower:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2c-1.5 0-2.8.7-3.6 1.8A3 3 0 0 0 4.2 8C2.7 8.8 2 10.3 2 12c0 1.5.7 2.8 1.8 3.6a3 3 0 0 0 4.2 4.2C8.8 21.3 10.3 22 12 22c1.5 0 2.8-.7 3.6-1.8a3 3 0 0 0 4.2-4.2c1.1-1 1.8-2.5 1.8-4.2 0-1.5-.7-2.8-1.8-3.6a3 3 0 0 0-4.2-4.2C14.8 2.7 13.5 2 12 2z"/></svg>',
  shield:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  heart:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  ribbon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12c-2-2.5-4-4-4-4s-3.5 1-4 4 4 4 4 4 2-1.5 4-4z"/><path d="M12 12c2-2.5 4-4 4-4s3.5 1 4 4-4 4-4 4-2-1.5-4-4z"/></svg>',
  arrow:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  wa:      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
}

// ── PRODUCTOS ──────────────────────────────────────────────────────
// data-select-id / data-select-type activan el motor de selección múltiple.
// data-select-skip en el botón "Pedir" lo excluye del toggle de selección.
export function renderProductos(items, containerId, waUrl) {
  const el = document.getElementById(containerId)
  if (!el) return

  // Hint contextual encima del grid
  el.insertAdjacentHTML('beforebegin', `
    <p class="sel-section-hint" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           width="12" height="12">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Toca una tarjeta para seleccionarla · "Pedir" para pedido directo
    </p>
  `)

  el.innerHTML = items.map((p, i) => `
    <article class="prod-card reveal d${(i % 4) + 1}"
             tabindex="0"
             role="button"
             aria-pressed="false"
             aria-label="Seleccionar ${p.name} — ${p.precio}"
             data-modal-id="${p.id}"
             data-select-id="${p.id}"
             data-select-type="producto"
             data-precio="${p.precioNum || 0}">
      <div class="prod-img-wrap loading">
        <img src="${p.imgUrl}"
             alt="${p.name}"
             loading="lazy"
             onload="this.parentElement.classList.remove('loading')">
        ${p.badge ? `<span class="prod-badge ${p.badgeClass || ''}">${p.badge}</span>` : ''}
        ${p.disponible
          ? `<span class="prod-disponible" aria-label="Disponible para entrega hoy"><span class="prod-disp-dot"></span>Disponible hoy</span>`
          : `<span class="prod-disponible prod-agotado" aria-label="Bajo pedido"><span class="prod-disp-dot"></span>Bajo pedido</span>`
        }
      </div>
      <div class="prod-info">
        <h3 class="prod-name">${p.name}</h3>
        <p class="prod-short">${p.short}</p>
        <div class="prod-footer">
          <span class="prod-price">${p.precio}</span>
          <button class="prod-cta"
                  data-carrito-id="${p.id}"
                  data-select-skip
                  aria-label="Pedir ${p.name} directamente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 width="13" height="13" aria-hidden="true">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            Pedir
          </button>
        </div>
      </div>
    </article>
  `).join('')

  items.forEach(p => {
    const card = el.querySelector(`[data-modal-id="${p.id}"]`)
    if (card) {
      card._modalData = {
        title:   p.name,
        desc:    p.desc,
        imgUrl:  p.imgUrl,
        precio:  p.precio,
        waHref:  waUrl(p.waMsg),
        waLabel: 'Pedir este arreglo',
      }
    }
  })
}

// ── SERVICIOS ──────────────────────────────────────────────────────
export function renderServicios(items, containerId, waUrl) {
  const el = document.getElementById(containerId)
  if (!el) return

  el.innerHTML = items.map((s) => {
    const hasCatalog = Array.isArray(s.catalogIds) && s.catalogIds.length > 0
    const servKey    = s.title.replace(/\s/g, '_')
    return `
    <article class="serv-item reveal${hasCatalog ? ' serv-has-catalog' : ''}"
             tabindex="0"
             role="button"
             aria-label="${hasCatalog ? `Ver catálogo de ${s.title}` : `Ver detalles de ${s.title}`}"
             data-serv-id="${servKey}"
             ${hasCatalog ? `data-serv-catalog="${servKey}"` : ''}>
      <div class="serv-img">
        <img src="${s.imgUrl}" alt="${s.title}" loading="lazy">
        <div class="serv-img-overlay"></div>
      </div>
      <div class="serv-copy">
        <span class="serv-icon">${ICONS[s.icon] || ICONS.heart}</span>
        <h3 class="serv-title">${s.title}</h3>
        <p class="serv-desc">${s.desc}</p>
        <span class="serv-link">
          ${hasCatalog ? 'Ver catálogo' : 'Conocer más'} ${ICONS.arrow}
        </span>
      </div>
    </article>
    `
  }).join('')

  items.forEach(s => {
    const servKey = s.title.replace(/\s/g, '_')
    const card    = el.querySelector(`[data-serv-id="${servKey}"]`)
    if (!card) return

    if (Array.isArray(s.catalogIds) && s.catalogIds.length > 0) {
      card._catalogData = {
        title:      s.title,
        desc:       s.longDesc,
        icon:       s.icon,
        imgUrl:     s.imgUrl,
        waMsg:      s.waMsg,
        catalogIds: s.catalogIds,
      }
    } else {
      card._modalData = {
        title:   s.title,
        desc:    s.longDesc,
        imgUrl:  s.imgUrl,
        precio:  null,
        waHref:  waUrl(s.waMsg),
        waLabel: 'Consultar por WhatsApp',
      }
    }
  })
}

// ── TESTIMONIOS ────────────────────────────────────────────────────
export function renderTestimonios(items, containerId) {
  const el = document.getElementById(containerId)
  if (!el) return

  el.innerHTML = items.map((t, i) => `
    <article class="testi-card reveal d${(i % 3) + 1}">
      <div class="testi-stars" aria-label="${t.estrellas} estrellas">
        ${'★'.repeat(t.estrellas)}
      </div>
      <p class="testi-quote">"${t.cita}"</p>
      <div class="testi-author">
        <div class="testi-avatar" aria-hidden="true">${t.inicial}</div>
        <div>
          <p class="testi-name">${t.nombre}</p>
          <p class="testi-loc">${t.ubicacion}</p>
        </div>
      </div>
    </article>
  `).join('')
}

// ── BENEFICIOS ─────────────────────────────────────────────────────
export function renderBeneficios(items, containerId) {
  const el = document.getElementById(containerId)
  if (!el) return

  el.innerHTML = items.map((b, i) => `
    <article class="benef-item reveal d${(i % 3) + 1}"
             tabindex="0"
             role="button"
             data-benef-id="${i}">
      <div class="benef-icon">${ICONS[b.icon] || ICONS.zap}</div>
      <div>
        <p class="benef-title">${b.title}</p>
        <p class="benef-desc">${b.desc}</p>
      </div>
    </article>
  `).join('')

  items.forEach((b, i) => {
    const card = el.querySelector(`[data-benef-id="${i}"]`)
    if (card) {
      card._modalData = {
        title:  b.title,
        desc:   b.largo,
        imgUrl: null,
        precio: null,
        waHref: null,
      }
    }
  })
}

// ── FLORES ─────────────────────────────────────────────────────────
// data-select-id = nombre en minúsculas (coincide con la clave del florMap en seleccion.js)
// data-select-type = "flor"
export function renderFlores(items, containerId) {
  const el = document.getElementById(containerId)
  if (!el) return

  // Hint contextual encima del grid
  el.insertAdjacentHTML('beforebegin', `
    <p class="sel-section-hint" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           width="12" height="12">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Toca las flores que te gustan para consultarlas
    </p>
  `)

  el.innerHTML = items.map((f, i) => `
    <div class="flor-card reveal d${(i % 4) + 1}"
         tabindex="0"
         role="button"
         aria-pressed="false"
         aria-label="Seleccionar ${f.name}"
         data-select-id="${f.name.toLowerCase()}"
         data-select-type="flor">
      <div class="flor-circle" style="background:${f.gradient};">
        <span class="flor-name">${f.name}</span>
        <span class="flor-sub">${f.sub}</span>
      </div>
    </div>
  `).join('')
}

// ── NOSOTROS ───────────────────────────────────────────────────────
export function renderNosotros(data, containerId) {
  const el = document.getElementById(containerId)
  if (!el) return

  const paragraphs = data.texto
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p class="reveal d2">${p}</p>`)
    .join('')

  el.innerHTML = `
    ${paragraphs}
    <div class="nosotros-firma reveal d3">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      ${data.firma}
    </div>
  `
}

// ── GALERÍA ─────────────────────────────────────────────────────────
export function renderGaleria(items, containerId) {
  const el = document.getElementById(containerId)
  if (!el) return

  el.innerHTML = items.map((g, i) => `
    <div class="galeria-item reveal d${(i % 4) + 1}">
      <div class="galeria-img-wrap loading">
        <img src="${g.imgUrl}"
             alt="${g.alt}"
             loading="lazy"
             onload="this.parentElement.classList.remove('loading')">
        <div class="galeria-overlay">
          <span class="galeria-autor">${g.autor}</span>
        </div>
      </div>
    </div>
  `).join('')
}