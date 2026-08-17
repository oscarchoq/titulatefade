import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

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

export const collections = { modalidades };
