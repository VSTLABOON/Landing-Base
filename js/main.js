// ─── MAIN ENTRY POINT ───────────────────────────────────────────
import { meta, productos, servicios, testimonios, beneficios, flores, nosotros, galeria } from './data/floreria.js'
import { initCursor }           from './modules/cursor.js'
import { initAnimations }       from './modules/animations.js'
import { initPetals }           from './modules/petals.js'
import { initModal }            from './modules/modal.js'
import { initCountdown }        from './modules/countdown.js'
import { initFiltro }           from './modules/filtro.js'
import { initCarrito }          from './modules/carrito.js'
import { initServicioCatalogo } from './modules/servicio-catalogo.js'
import { initSeleccion }        from './modules/seleccion.js'
import {
  renderProductos,
  renderServicios,
  renderTestimonios,
  renderBeneficios,
  renderFlores,
  renderNosotros,
  renderGaleria,
} from './modules/renderer.js'

document.addEventListener('DOMContentLoaded', () => {

  // ── WhatsApp links globales ─────────────────────────────────
  const waUrl = (msg) =>
    `https://wa.me/${meta.whatsapp}?text=${encodeURIComponent(msg)}`
  const defaultMsg = 'Hola! Quisiera ver el catálogo de arreglos disponibles.'
  document.querySelectorAll('[data-wa-global]').forEach(el => {
    el.href = waUrl(defaultMsg)
  })

  // Exponer el número para módulos que construyan links WA internamente
  window._carritoWhatsapp = meta.whatsapp

  // ── Render de secciones ─────────────────────────────────────
  renderProductos(productos,     'productos-grid',   waUrl)
  renderServicios(servicios,     'servicios-list',   waUrl)
  renderTestimonios(testimonios, 'testimonios-grid')
  renderBeneficios(beneficios,   'beneficios-list')
  renderFlores(flores,           'flores-grid')
  renderNosotros(nosotros,       'nosotros-texto')
  renderGaleria(galeria,         'galeria-grid')

  // ── Init de módulos ──────────────────────────────────────────
  // Orden importa: carrito antes de servicioCatalogo (usa carritoOpen)
  //                seleccion al final (todos los elementos ya están en el DOM)
  initModal(waUrl)
  initAnimations()
  initPetals()
  initCursor()
  initCountdown()
  initFiltro(productos)
  initCarrito(productos, meta.whatsapp)
  initServicioCatalogo(productos)
  initSeleccion(productos, flores, meta.whatsapp)

  // ── Hero image ─────────────────────────────────────────────
  const heroImg = document.getElementById('hero-img')
  if (heroImg) {
    if (heroImg.complete) heroImg.classList.add('loaded')
    else heroImg.addEventListener('load', () => heroImg.classList.add('loaded'))
  }

  // ── Mobile nav ─────────────────────────────────────────────
  const toggle    = document.getElementById('menu-toggle')
  const mobileNav = document.getElementById('mobile-nav')
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open')
      toggle.classList.toggle('open', open)
      toggle.setAttribute('aria-expanded', String(open))
      mobileNav.setAttribute('aria-hidden', String(!open))
    })
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open')
        toggle.classList.remove('open')
        toggle.setAttribute('aria-expanded', 'false')
        mobileNav.setAttribute('aria-hidden', 'true')
      })
    })
  }
})