// Visor de Guías Rápidas (SPEC 08): un único <dialog id="guia-modal"> global,
// abierto desde cualquier `GuiaEnlace` con `imagen`. Solo imagen (sin texto de
// paso), con zoom (+/−/reset, incl. rueda), arrastre al ampliar y cierre por
// X / backdrop / Esc. Atributo-driven, igual patrón que `proceso-swap.ts`.
//
// Degradación: sin JS ningún disparador hace nada (el <button data-guia> no
// tiene comportamiento por defecto) y el <dialog> queda cerrado e inerte.

const ESCALA_MIN = 1;
const ESCALA_MAX = 5;
const PASO_ZOOM = 0.25;

function initGuiaModal(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#guia-modal');
  if (!dialog) return;

  const img = dialog.querySelector<HTMLImageElement>('[data-guia-img]');
  const lienzo = dialog.querySelector<HTMLElement>('[data-guia-lienzo]');
  if (!img || !lienzo) return;

  // Estado del visor. `offset` en px de pantalla; `escala` acotada a [MIN, MAX].
  let escala = 1;
  let offset = { x: 0, y: 0 };
  let disparador: HTMLElement | null = null;

  // Estado del arrastre (pan). Solo activo cuando la imagen está ampliada.
  let arrastrando = false;
  let inicioPtr = { x: 0, y: 0 };
  let inicioOffset = { x: 0, y: 0 };

  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);

  function aplicarTransform(): void {
    img!.style.transform =
      `translate(${offset.x}px, ${offset.y}px) scale(${escala})`;
  }

  function resetVista(): void {
    escala = 1;
    offset = { x: 0, y: 0 };
    arrastrando = false;
    img!.removeAttribute('data-arrastrando');
    aplicarTransform();
  }

  function setEscala(nueva: number): void {
    escala = clamp(nueva, ESCALA_MIN, ESCALA_MAX);
    // Al volver al fit, recentrar: un pan sin zoom no tiene sentido.
    if (escala === 1) offset = { x: 0, y: 0 };
    aplicarTransform();
  }

  // --- Apertura desde cualquier disparador (delegación) --------------------
  document.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-guia]',
    );
    if (!trigger) return;

    const src = trigger.dataset.guiaSrc;
    if (!src) return; // enlace pendiente: no abre nada

    img.src = src;
    img.alt = trigger.dataset.guiaAlt ?? '';
    disparador = trigger;
    resetVista();
    dialog.showModal();
  });

  // --- Zoom: botones + / − / reset -----------------------------------------
  dialog
    .querySelector('[data-guia-zoom-in]')
    ?.addEventListener('click', () => setEscala(escala + PASO_ZOOM));
  dialog
    .querySelector('[data-guia-zoom-out]')
    ?.addEventListener('click', () => setEscala(escala - PASO_ZOOM));
  dialog
    .querySelector('[data-guia-reset]')
    ?.addEventListener('click', () => resetVista());

  // --- Zoom con la rueda sobre la imagen -----------------------------------
  lienzo.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? PASO_ZOOM : -PASO_ZOOM;
      setEscala(escala + delta);
    },
    { passive: false },
  );

  // --- Pan (arrastre) al estar ampliada ------------------------------------
  img.addEventListener('pointerdown', (e) => {
    if (escala <= 1) return;
    arrastrando = true;
    inicioPtr = { x: e.clientX, y: e.clientY };
    inicioOffset = { ...offset };
    img.setPointerCapture(e.pointerId);
    img.setAttribute('data-arrastrando', 'true');
  });

  img.addEventListener('pointermove', (e) => {
    if (!arrastrando) return;
    offset = {
      x: inicioOffset.x + (e.clientX - inicioPtr.x),
      y: inicioOffset.y + (e.clientY - inicioPtr.y),
    };
    aplicarTransform();
  });

  const finArrastre = (e: PointerEvent) => {
    if (!arrastrando) return;
    arrastrando = false;
    img.releasePointerCapture(e.pointerId);
    img.removeAttribute('data-arrastrando');
  };
  img.addEventListener('pointerup', finArrastre);
  img.addEventListener('pointercancel', finArrastre);

  // --- Cierre: X, backdrop y Esc (nativo) ----------------------------------
  dialog
    .querySelector('[data-guia-close]')
    ?.addEventListener('click', () => dialog.close());

  // Clic en la zona del diálogo fuera de la imagen y los controles → cerrar.
  dialog.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === dialog || t === lienzo) dialog.close();
  });

  // Al cerrar (X, backdrop o Esc): resetear vista y devolver el foco.
  dialog.addEventListener('close', () => {
    resetVista();
    disparador?.focus();
    disparador = null;
  });
}

initGuiaModal();
