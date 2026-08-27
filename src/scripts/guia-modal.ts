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

  // Token de apertura (SPEC 15): se incrementa en cada apertura y cada cierre.
  // Los callbacks de decode()/load comprueban su valor antes de revelar la
  // <img>, descartando resultados obsoletos y evitando carreras entre
  // aperturas rápidas (abrir B mientras A aún cargaba).
  let apertura = 0;

  // Precarga por intención (SPEC 15): rutas ya precargadas al señalar el
  // usuario que va a abrirlas (hover/focus/touch), para no relanzar la
  // descarga en cada evento.
  const precargadas = new Set<string>();

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

    // SPEC 15: nuevo token para esta apertura; oculta la <img> antes de tocar
    // src para no pintar nunca el bitmap anterior. El modal abre de inmediato
    // (respuesta instantánea) y la imagen se resuelve dentro ya abierto.
    const token = ++apertura;
    disparador = trigger;
    resetVista();
    img.setAttribute('data-guia-cargando', '');
    img.alt = trigger.dataset.guiaAlt ?? '';
    img.src = src;
    dialog.showModal();

    const revelar = () => {
      // Solo revela si esta sigue siendo la apertura vigente (descarta
      // callbacks obsoletos: carrera entre aperturas o cierre anticipado).
      if (token === apertura) img.removeAttribute('data-guia-cargando');
    };

    // Reabrir la MISMA imagen (ya en caché y decodificada) puede no disparar
    // load/decode de forma consistente: si ya está completa, revelar directo.
    if (img.complete && img.naturalWidth > 0) {
      revelar();
    } else {
      img
        .decode()
        .then(revelar)
        .catch(revelar); // error/decode rechazado: revelar igual (alt/roto)
    }
  });

  // --- Precarga por intención (delegación, igual que el clic) --------------
  // Al señalar el usuario que abrirá una guía (hover/focus en desktop, touch
  // en móvil), descargar SOLO esa imagen para calentar la caché; el clic
  // posterior abre desde caché sin backdrop vacío perceptible. Nunca se
  // precarga la página entera: solo los enlaces que reciben intención.
  const precargar = (e: Event) => {
    const trigger = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-guia]',
    );
    const src = trigger?.dataset.guiaSrc;
    if (!src || precargadas.has(src)) return; // sin src o ya precargada
    precargadas.add(src); // marcar antes: una sola descarga por imagen
    new Image().src = src;
  };
  // `pointerover` (no `pointerenter`: no burbujea) es el equivalente
  // delegable del hover; el Set evita repetir en cada movimiento.
  document.addEventListener('pointerover', precargar);
  document.addEventListener('focusin', precargar);
  document.addEventListener('touchstart', precargar, { passive: true });

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
    // SPEC 15: nuevo token → invalida cualquier decode()/load aún en vuelo
    // (cerrar antes de que cargue no revelará la imagen tarde). Re-ocultar la
    // <img> deja el visor consistente: la próxima apertura arranca limpia.
    apertura++;
    img.setAttribute('data-guia-cargando', '');
    resetVista();
    disparador?.focus();
    disparador = null;
  });
}

initGuiaModal();
