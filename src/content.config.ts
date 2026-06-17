import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Four parallel content collections — each editable from the Sveltia CMS
// admin panel (mounted at /admin). One markdown file = one entry.

// MAKALELER — long-form writing authored by Bayram Bozyel.
// Body is the full piece (or a teaser + link if hosted externally).
const makaleler = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/makaleler' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    // When the original was published on an external outlet
    // (Gazete Duvar, Deng, etc.) we keep the canonical link here.
    sourceUrl: z.string().url().optional(),
    sourceOutlet: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(false),
  }),
});

// RÖPORTAJLAR — interviews where Bayram Bozyel is the interviewee.
const roportajlar = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/roportajlar' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    interviewer: z.string().optional(),
    outlet: z.string().optional(),
    summary: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    embedUrl: z.string().url().optional(), // YouTube / SoundCloud etc.
    draft: z.boolean().optional().default(false),
  }),
});

// ETKİNLİKLER — public events: speeches, panels, congresses, signings.
// Can be past or upcoming.
const etkinlikler = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/etkinlikler' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
    kind: z.enum(['konusma', 'panel', 'roportaj', 'duyuru', 'diger']).optional(),
    summary: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

// VİDEOLAR — embedded videos (YouTube primarily).
const videolar = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/videolar' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    youtubeId: z.string().optional(), // preferred
    embedUrl: z.string().url().optional(), // fallback for non-YouTube
    summary: z.string().optional(),
    outlet: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { makaleler, roportajlar, etkinlikler, videolar };
