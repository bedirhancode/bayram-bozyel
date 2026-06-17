# bayrambozyel.com

Bayram Bozyel'in kişisel sayfası. Astro ile yazılmış, statik bir site;
Cloudflare Workers (Static Assets) üzerinde yayında.

Tasarım hedefi: **sade, okunaklı, az JavaScript, hızlı**.

---

## Stack

- **Astro 5** — content collections + static output
- **Saf CSS** — tek bir `global.css`, koyu/açık tema otomatik (prefers-color-scheme)
- **Cloudflare Workers Static Assets** — `dist/` doğrudan edge'den servis edilir, Worker script yok
- **Sıfır client JS** — tüm sayfalar tamamen statik HTML

## Yerel geliştirme

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # dist/ üretir
npm run preview   # build çıktısını yerelde önizler
```

## Yazı ekleme

Yazılar `src/content/posts/*.md` altında. Her dosya bir yazıdır.
Frontmatter şeması (`src/content.config.ts`):

```yaml
---
title: "Yazının başlığı"
date: 2026-06-17           # YYYY-MM-DD
summary: "Listede gözüken kısa özet (opsiyonel)"
tags: ["siyaset", "kurd"]  # opsiyonel
draft: false               # true ise yayınlanmaz
---

Markdown gövdesi buraya.
```

Yeni dosya eklendiğinde `npm run build` ile site yeniden üretilir
ve `npm run deploy` ile yayınlanır.

URL şeması: `/yazilar/<dosya-adi>` (örn. `merhaba.md` → `/yazilar/merhaba`).

## Sayfa yapısı

```
/                  Ana sayfa — hero + son 5 yazı + başka yayınlarda 3 yazı
/yazilar           Tüm yazılar listesi (yıla göre gruplandırılmış)
/yazilar/[slug]    Yazı detayı
/arsiv             Dış yayınlardaki yazılar + söyleşiler
/hakkimda          Biyografi + konular + kitaplar
/iletisim          E-posta, X, RSS
/rss.xml           RSS akışı
/404               Bulunamadı sayfası
```

**Birincil nav**: Yazılar · Arşiv · Hakkımda (3 öğe — 390px'te asla taşmaz)
**Footer**: Yazılar · Hakkımda · İletişim · RSS

## Cloudflare Workers'a deploy

İlk kurulum (bir kere):

```bash
npx wrangler login
```

Sonraki her deploy:

```bash
npm run deploy    # = astro build && wrangler deploy
```

`wrangler.toml`:

- `name = "bayram-bozyel"` — Worker adı
- `[assets] directory = "./dist"` — Astro çıktısı buradan servis edilir
- `not_found_handling = "404-page"` — `dist/404.html` 404'lerde gösterilir
- `html_handling = "auto-trailing-slash"` — `/yazilar` ve `/yazilar/` aynı içeriği verir

İlk deploy sonrası Worker `https://bayram-bozyel.<account>.workers.dev`
üzerinde yayında olur. Özel domain (`bayrambozyel.com`) bağlamak için
`wrangler.toml` içindeki `routes` bloğunu yorumdan çıkarın ve
Cloudflare dashboard'dan domain'i hesabınıza ekleyin.

## Dosya haritası

```
astro.config.mjs        Astro yapılandırması (site, trailingSlash)
wrangler.toml           Cloudflare Workers deploy ayarları
src/
  content.config.ts     Posts collection şeması
  layouts/Base.astro    HTML iskeleti + meta etiketleri
  components/
    Header.astro        Üst gezinme (3 nav öğesi)
    Footer.astro        Alt bilgi + iletişim + RSS
    PostList.astro      Blog yazı listesi (yıl gruplandırma destekli)
    ExternalList.astro  Dış yayın linklerinin listesi
    Portrait.astro      Optimize edilmiş portre (Astro Image)
  data/
    external.ts         Dış yazı + söyleşi + konu listesi (elle güncellenir)
  assets/
    bayram-bozyel.jpg   Portre kaynağı — derleme sırasında webp'ye dönüştürülür
  pages/
    index.astro         Ana sayfa
    hakkimda.astro      Biyografi (portre + konular + kitaplar)
    iletisim.astro      İletişim (e-posta, X, RSS)
    arsiv.astro         Dış yayınlardaki yazı + söyleşi listesi
    yazilar/
      index.astro       Yazı listesi (yıla göre gruplandırılmış)
      [...slug].astro   Yazı detayı (dinamik)
    rss.xml.ts          RSS feed üreteci
    404.astro
  styles/global.css     Tüm stiller (tek dosya, koşullu dark mode)
  content/posts/        Markdown yazılar (yeni yazılar buraya)
public/
  favicon.svg
  robots.txt
```

## Dış yazı / söyleşi ekleme

`src/data/external.ts` içindeki `articles` veya `interviews` dizisine yeni
bir nesne ekleyin. Şema:

```ts
{
  title: "...",
  outlet: "Gazete Duvar",
  date: "2026-01-15",   // YYYY-MM-DD
  url: "https://...",
  excerpt: "Kısa alıntı",   // articles
  // quote: "Kısa alıntı",  // interviews
}
```

Ana sayfada en yeni 3 dış yazı görünür; tam liste `/arsiv`'tedir.

## v1'den sonra düşünülecekler

- Open Graph görseli (her yazı için)
- Sitemap (`@astrojs/sitemap`)
- Etiket / arşiv sayfaları
- Yazılarda kapak görseli alanı
- Newsletter (sade bir e-posta abonelik formu, ör. Buttondown)
- Yorum (Webmention veya yok)
