import type { APIRoute } from 'astro';

// robots.txt dinámico (SPEC 16): la línea `Sitemap:` sigue siempre al dominio
// activo (`site` de astro.config, resuelto por env var), en vez de quedar
// hardcodeada en un `public/robots.txt` estático que se rompería al cambiar de
// dominio. `site` llega por el contexto del endpoint.
export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  const body = `User-agent: *
Allow: /
Sitemap: ${sitemapURL.href}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
