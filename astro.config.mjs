// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

// URL del sitio, resuelta por precedencia:
//   SITE_URL      → dominio oficial cuando se compre
//   CF_PAGES_URL  → URL que inyecta Cloudflare Pages en cada build
//   localhost     → fallback local
const site =
  process.env.SITE_URL ??
  process.env.CF_PAGES_URL ??
  'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site,

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx(), sitemap()]
});