export function initCursor() {
  const cursor = document.getElementById('cur');
  const cursorRing = document.getElementById('cur-ring');

  if (!cursor || !cursorRing || window.innerWidth < 768) {
    if (cursor) cursor.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
    return;
  }

  let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  const render = () => {
    cursor.style.transform = `translate3d(${mouseX - 5}px, ${mouseY - 5}px, 0)`;
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);

  const interactiveSelectors = ['a', 'button', '.u-gallery-card', '.music-item', '.trait-item', '.parallax-band', '.swatch', '.nav-dot', '#modal-close'];

  const bindHoverEvents = () => {
    document.querySelectorAll(interactiveSelectors.join(', ')).forEach(el => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = 'true';
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        cursorRing.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0) scale(1.5)`;
        cursorRing.style.borderColor = 'var(--rosa)';
        cursorRing.style.opacity = '0.8';
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        cursorRing.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0) scale(1)`;
        cursorRing.style.borderColor = 'rgba(45,90,39,.4)';
        cursorRing.style.opacity = '0.5';
      });
    });
  };

  bindHoverEvents();
  new MutationObserver(bindHoverEvents).observe(document.body, { childList: true, subtree: true });

  // ── Cursor nunca desaparece al pasar por la página ───────────
  // Se vuelve muy tenue tras 3 s de inactividad y reaparece
  // al primer movimiento. Al salir de la ventana se desvanece
  // suavemente, pero al volver ya está listo.
  const IDLE_MS = 3000
  const IDLE_OPACITY     = '0.18'
  const ACTIVE_OPACITY   = '1'
  const RING_IDLE        = '0.1'
  const RING_ACTIVE      = '0.5'

  let idleTimer = null

  const setActive = () => {
    cursor.style.opacity    = ACTIVE_OPACITY
    cursorRing.style.opacity = RING_ACTIVE
  }

  const setIdle = () => {
    cursor.style.opacity    = IDLE_OPACITY
    cursorRing.style.opacity = RING_IDLE
  }

  const resetIdle = () => {
    setActive()
    clearTimeout(idleTimer)
    idleTimer = setTimeout(setIdle, IDLE_MS)
  }

  // Inicia el temporizador desde el arranque
  resetIdle()

  // Cualquier movimiento reinicia el contador
  window.addEventListener('mousemove', resetIdle, { passive: true })

  // Al salir de la ventana: se desvanece (no desaparece del todo)
  document.addEventListener('mouseleave', () => {
    clearTimeout(idleTimer)
    cursor.style.opacity    = '0.08'
    cursorRing.style.opacity = '0.04'
  })

  // Al volver: reaparece de inmediato y reinicia el temporizador
  document.addEventListener('mouseenter', () => {
    resetIdle()
  })
}