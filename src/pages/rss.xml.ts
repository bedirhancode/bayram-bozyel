import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const escapeXml = (str: string) =>
  str.replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[c] as string);

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://bayrambozyel.com')).toString().replace(/\/$/, '');

  // Unified feed: makaleler + röportajlar + etkinlikler + videolar.
  const [makaleler, roportajlar, etkinlikler, videolar] = await Promise.all([
    getCollection('makaleler', ({ data }) => !data.draft),
    getCollection('roportajlar', ({ data }) => !data.draft),
    getCollection('etkinlikler', ({ data }) => !data.draft),
    getCollection('videolar', ({ data }) => !data.draft),
  ]);

  type Item = { date: Date; title: string; href: string; summary?: string; kind: string };
  const all: Item[] = [
    ...makaleler.map((e) => ({ date: e.data.date, title: e.data.title, href: `/makaleler/${e.id}`, summary: e.data.summary, kind: 'Makale' })),
    ...roportajlar.map((e) => ({ date: e.data.date, title: e.data.title, href: `/roportajlar/${e.id}`, summary: e.data.summary, kind: 'Röportaj' })),
    ...etkinlikler.map((e) => ({ date: e.data.date, title: e.data.title, href: `/etkinlikler/${e.id}`, summary: e.data.summary, kind: 'Etkinlik' })),
    ...videolar.map((e) => ({ date: e.data.date, title: e.data.title, href: `/videolar/${e.id}`, summary: e.data.summary, kind: 'Video' })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const items = all
    .map((p) => {
      const url = `${base}${p.href}`;
      return `    <item>
      <title>[${p.kind}] ${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      ${p.summary ? `<description>${escapeXml(p.summary)}</description>` : ''}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Bayram Bozyel</title>
    <link>${base}</link>
    <description>Makaleler, röportajlar, etkinlikler ve videolar.</description>
    <language>tr</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
