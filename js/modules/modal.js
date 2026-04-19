// ─── MODAL.JS ────────────────────────────────────────────────────
export function initModal(waUrl) {
  const backdrop  = document.getElementById('modal-backdrop')
  const modal     = document.getElementById('modal')
  const closeBtn  = document.getElementById('modal-close')
  const imgWrap   = document.getElementById('modal-img-wrap')
  const modalImg  = document.getElementById('modal-img')
  const priceBadge= document.getElementById('modal-price-badge')
  const titleEl   = document.getElementById('modal-title-text')
  const textEl    = document.getElementById('modal-text')
  const waBtn     = document.getElementById('modal-wa-btn')

  if (!backdrop || !modal) return

  const open = ({ title, desc, imgUrl, precio, waHref, waLabel }) => {
    // Imagen
    if (imgUrl) {
      modalImg.src = imgUrl
      modalImg.alt = title
      imgWrap.style.display = 'block'
    } else {
      imgWrap.style.display = 'none'
    }

    // Badge de precio
    if (precio) {
      priceBadge.textContent = precio
      priceBadge.style.display = 'block'
    } else {
      priceBadge.style.display = 'none'
    }

    // Texto
    titleEl.textContent = title
    textEl.innerHTML    = `<div class="modal-divider"></div>` +
      desc.split('\n\n')
          .filter(p => p.trim())
          .map(p => `<p class="modal-p">${p.replace(/\n/g,'<br>')}</p>`)
          .join('')

    // Botón WhatsApp
    if (waHref) {
      waBtn.href          = waHref
      waBtn.style.display = 'flex'
      waBtn.childNodes[1]
        ? (waBtn.childNodes[1].textContent = ' ' + (waLabel || 'Contactar'))
        : null
    } else {
      waBtn.style.display = 'none'
    }

    document.body.style.overflow = 'hidden'
    backdrop.classList.add('active')
    modal.classList.add('active')
    closeBtn.focus()
  }

  const close = () => {
    backdrop.classList.remove('active')
    modal.classList.remove('active')
    document.body.style.overflow = ''
  }

  // Delegación de eventos — escucha tarjetas con _modalData
  document.body.addEventListener('click', e => {
    const trigger = e.target.closest('[data-modal-id], [data-serv-id], [data-benef-id]')
    if (trigger && trigger._modalData) {
      open(trigger._modalData)
    }
  })
  document.body.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const trigger = document.activeElement
      if (trigger && trigger._modalData) open(trigger._modalData)
    }
  })

  closeBtn.addEventListener('click', close)
  backdrop.addEventListener('click', close)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) close()
  })
}
