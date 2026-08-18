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
function initProcesoSwap(): void {
  const articulos = Array.from(
    document.querySelectorAll<HTMLElement>('article[data-etapa]'),
  );
  if (articulos.length === 0) return;

  const orden = articulos.map((a) => a.dataset.etapa ?? '');
  const rielBtns = Array.from(
    document.querySelectorAll<HTMLElement>('nav [data-etapa]'),
  );

  function activar(id: string): void {
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
  }

  // Clic en un nodo del riel → activa esa etapa.
  rielBtns.forEach((b) => {
    b.addEventListener('click', () => activar(b.dataset.etapa ?? ''));
  });

  // Flechas prev/next → una etapa antes/después de la visible.
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const actual = articulos.find((a) => !a.hidden);
      if (!actual) return;
      const i = orden.indexOf(actual.dataset.etapa ?? '');
      const j = btn.dataset.nav === 'next' ? i + 1 : i - 1;
      if (j < 0 || j >= orden.length) return;
      activar(orden[j]);
    });
  });
}

initProcesoSwap();
