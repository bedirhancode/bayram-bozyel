// Shared Turkish date formatters used across entry list + detail pages.

export const fmtLong = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const fmtShort = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
});

export const fmtYear = new Intl.DateTimeFormat('tr-TR', { year: 'numeric' });

export type EntryGroup<T> = { year: number; items: T[] };

export function groupByYear<T extends { date: Date }>(items: T[]): EntryGroup<T>[] {
  const byYear = new Map<number, T[]>();
  for (const item of items) {
    const y = item.date.getFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(item);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
}

// Pretty hostname for source-link displays — "https://www.bianet.org/x"
// becomes "bianet.org". Falls back to the raw input on parse failures.
export function prettyHost(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
