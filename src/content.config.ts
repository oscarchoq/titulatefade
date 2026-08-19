import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const modalidades = defineCollection({
  loader: file('src/data/modalidades.yaml'),
  schema: z.object({
    orden: z.number(),        // orden de aparición (getCollection NO garantiza orden)
    articulo: z.string(),     // "Art. 20"  → texto del cuadro
    titulo: z.string(),       // "Tesis Convencional"
    descripcion: z.string(),
    href: z.string().default('#'),
  }),
});

const etapasTesis = defineCollection({
  loader: glob({ pattern: '*.mdx', base: 'src/data/etapas-tesis' }),
  schema: z.object({
    orden: z.number(),                 // orden en el riel (getCollection NO garantiza orden)
    titulo: z.string(),                // nombre real, usado en riel Y como título del bloque
    estado: z.enum(['completo', 'pendiente']).default('completo'), // andamiaje v1
    plantillas: z
      .array(
        z.object({
          nombre: z.string(),
          archivo: z.string(),            // URL del documento (enlace de Drive, abre en pestaña nueva); placeholder "#" por ahora
          formato: z.string().optional(), // "PDF" | "DOCX"
        }),
      )
      .default([]),
  }),
});

// Reglamento anterior (Resolución 221-2025-UPT-CU): misma estructura de etapas
// que `etapasTesis` pero colección propia, para que editar una no afecte a la otra.
const etapasTesisOld = defineCollection({
  loader: glob({ pattern: '*.mdx', base: 'src/data/etapas-tesis-old' }),
  schema: z.object({
    orden: z.number(),
    titulo: z.string(),
    estado: z.enum(['completo', 'pendiente']).default('completo'),
    plantillas: z
      .array(
        z.object({
          nombre: z.string(),
          archivo: z.string(),
          formato: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

export const collections = { modalidades, etapasTesis, etapasTesisOld };
