// Swap de etapas genérico y atributo-driven (sirve a cualquier proceso).
//
// - Los artículos de etapa son `article[data-etapa]`; solo el activo se muestra
//   (los demás llevan `hidden`).
// - El riel son botones `nav [data-etapa]`; el activo lleva `data-activa="true"`.
// - Las flechas `[data-nav="prev|next"]` navegan de forma RELATIVA a la etapa
//   visible; su estado disabled ya viene resuelto por artículo (esPrimera/esUltima),
//   así que basta con que solo el artículo activo esté a la vista.
//
// Degradación: sin JS, la primera etapa se renderiza visible por defecto.
// Scroll suave propio al tope: ease-out de duración fija (no depende de la
// distancia como el `smooth` nativo, que se siente irregular). Con
// prefers-reduced-motion salta al instante.
function scrollArriba(): void {
  const inicio = window.scrollY;
  if (inicio === 0) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    window.scrollTo(0, 0);
    return;
  }

  const duracion = 500;
  const t0 = performance.now();
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

  function paso(ahora: number): void {
    const t = Math.min((ahora - t0) / duracion, 1);
    window.scrollTo(0, inicio * (1 - easeOut(t)));
    if (t < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

function initProcesoSwap(): void {
  const articulos = Array.from(
    document.querySelectorAll<HTMLElement>('article[data-etapa]'),
  );
  if (articulos.length === 0) return;

  const orden = articulos.map((a) => a.dataset.etapa ?? '');
  const rielBtns = Array.from(
    document.querySelectorAll<HTMLElement>('nav [data-etapa]'),
  );

  type Direccion = 'right' | 'left' | 'none';

  function activar(id: string, dir: Direccion = 'none'): void {
    if (!orden.includes(id)) return;

    articulos.forEach((a) => {
      a.hidden = a.dataset.etapa !== id;
    });

    rielBtns.forEach((b) => {
      if (b.dataset.etapa === id) {
        b.dataset.activa = 'true';
        b.setAttribute('aria-current', 'step');
      } else {
        delete b.dataset.activa;
        b.removeAttribute('aria-current');
      }
    });

    // Desliza la etapa entrante según el sentido de navegación (SPEC 06).
    // Reinicio: quitar clases → forzar reflow → añadir, para que el keyframe
    // re-dispare aunque se navegue rápido.
    if (dir !== 'none') {
      const destino = articulos.find((a) => a.dataset.etapa === id);
      if (destino) {
        destino.classList.remove('slide-from-right', 'slide-from-left');
        void destino.offsetWidth;
        destino.classList.add(dir === 'right' ? 'slide-from-right' : 'slide-from-left');
      }

      // Volver arriba al cambiar de etapa: si venías leyendo el final de una
      // etapa larga, la siguiente empieza desde su inicio, no desde ese foco.
      scrollArriba();
    }
  }

  // Clic en un nodo del riel → activa esa etapa, con dirección según el índice.
  rielBtns.forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.dataset.etapa ?? '';
      const actual = articulos.find((a) => !a.hidden);
      const i = actual ? orden.indexOf(actual.dataset.etapa ?? '') : -1;
      const j = orden.indexOf(id);
      const dir: Direccion = j === i ? 'none' : j > i ? 'right' : 'left';
      activar(id, dir);
    });
  });

  // Flechas prev/next → una etapa antes/después de la visible.
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const actual = articulos.find((a) => !a.hidden);
      if (!actual) return;
      const i = orden.indexOf(actual.dataset.etapa ?? '');
      const j = btn.dataset.nav === 'next' ? i + 1 : i - 1;
      if (j < 0 || j >= orden.length) return;
      activar(orden[j], btn.dataset.nav === 'next' ? 'right' : 'left');
    });
  });
}

initProcesoSwap();
