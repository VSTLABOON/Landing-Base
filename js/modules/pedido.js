// ─── PEDIDO.JS — Formulario de pedido estructurado ──────────────
export function initPedido(productos, whatsapp) {
  const form      = document.getElementById('pedido-form')
  const selectArr = document.getElementById('pf-arreglo')
  const inputFecha = document.getElementById('pf-fecha')
  if (!form || !selectArr) return

  // ── Poblar select con productos ──────────────────────────────
  productos.forEach(p => {
    const opt = document.createElement('option')
    opt.value       = p.name
    opt.textContent = `${p.name} — ${p.precio}`
    selectArr.appendChild(opt)
  })

  // ── Fecha mínima = hoy ────────────────────────────────────────
  if (inputFecha) {
    const hoy = new Date()
    const yyyy = hoy.getFullYear()
    const mm   = String(hoy.getMonth() + 1).padStart(2, '0')
    const dd   = String(hoy.getDate()).padStart(2, '0')
    inputFecha.min = `${yyyy}-${mm}-${dd}`
    inputFecha.value = `${yyyy}-${mm}-${dd}`
  }

  // ── Validación visual inline ─────────────────────────────────
  const markField = (input, valid) => {
    input.classList.toggle('pf-invalid', !valid)
    input.classList.toggle('pf-valid',   valid)
  }

  const validate = (input) => {
    if (input.type === 'date') return !!input.value
    return input.value.trim().length >= (input.tagName === 'SELECT' ? 1 : 2)
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => {
      if (field.hasAttribute('required')) markField(field, validate(field))
    })
    field.addEventListener('input', () => {
      if (field.classList.contains('pf-invalid')) markField(field, validate(field))
    })
  })

  // ── Submit → construir mensaje WA y abrir ────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const requiredFields = [...form.querySelectorAll('[required]')]
    let allValid = true

    requiredFields.forEach(f => {
      const ok = validate(f)
      markField(f, ok)
      if (!ok) allValid = false
    })

    if (!allValid) {
      const firstInvalid = form.querySelector('.pf-invalid')
      firstInvalid?.focus()
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const arreglo     = document.getElementById('pf-arreglo')?.value      || ''
    const nombre      = document.getElementById('pf-nombre')?.value.trim() || ''
    const fecha       = document.getElementById('pf-fecha')?.value         || ''
    const colonia     = document.getElementById('pf-colonia')?.value.trim()|| ''
    const destinatario = document.getElementById('pf-destinatario')?.value.trim() || ''
    const mensaje     = document.getElementById('pf-mensaje')?.value.trim() || ''

    // Formatear fecha legible
    const [y, m, d] = fecha.split('-')
    const meses = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre']
    const fechaLeg = `${Number(d)} de ${meses[Number(m)-1]} de ${y}`

    const waText = [
      `¡Hola! Quiero hacer un pedido 🌸`,
      ``,
      `🌹 *Arreglo:* ${arreglo}`,
      `📅 *Fecha de entrega:* ${fechaLeg}`,
      `📍 *Colonia:* ${colonia}`,
      `👤 *Quien realiza el pedido:* ${nombre}`,
      `💐 *Para:* ${destinatario}`,
      mensaje ? `✉️ *Mensaje en tarjeta:* "${mensaje}"` : '',
      ``,
      `Por favor confirmar disponibilidad y costo de envío. ¡Gracias!`,
    ].filter(l => l !== null).join('\n')

    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(waText)}`

    // Feedback visual antes de abrir WA
    const btn = form.querySelector('.pf-submit')
    const original = btn.innerHTML
    btn.textContent = '✓ Abriendo WhatsApp…'
    btn.disabled = true
    setTimeout(() => {
      window.open(url, '_blank', 'noopener')
      btn.innerHTML = original
      btn.disabled = false
    }, 600)
  })
}