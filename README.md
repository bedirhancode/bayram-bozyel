# bayrambozyel.com

Bayram Bozyel'in kişisel sitesi. Astro 5 ile yazılmış, statik, Cloudflare
Workers Static Assets üzerinde yayımlanan, Sveltia CMS ile (`/admin`)
doğrudan tarayıcı üzerinden düzenlenebilir bir blog.

**Tasarım hedefi**: editorial, lean, hızlı, az JavaScript, gerçek dergi
hissi (Fraunces display + Source Serif body).

---

## İçerik mimarisi

Dört bağımsız koleksiyon — her biri `/admin` panelinden ayrı sekme:

| Koleksiyon | URL | Şema |
|---|---|---|
| **Makaleler** | `/makaleler` | başlık, tarih, özet, kaynak yayın + URL, etiketler, içerik |
| **Röportajlar** | `/roportajlar` | başlık, tarih, yayın organı, söyleşi yapan, özet, kaynak URL, gömme URL |
| **Etkinlikler** | `/etkinlikler` | başlık, tarih, yer, tür (konuşma/panel/duyuru), özet, kaynak URL |
| **Videolar** | `/videolar` | başlık, tarih, YouTube ID, yayın organı, özet |

Statik sayfalar: **Hakkımda**, **İletişim**, **404**, **RSS**.

## Sayfa haritası

```
/                       Hero + her koleksiyonun son birkaç girdisi
/makaleler              Liste (yıla göre)
/makaleler/[slug]       Makale (drop cap, kaynak linki)
/roportajlar            Liste
/roportajlar/[slug]     Röportaj
/etkinlikler            Liste
/etkinlikler/[slug]     Etkinlik
/videolar               Liste
/videolar/[slug]        Video (YouTube nocookie embed)
/hakkimda               Biyografi + portre
/iletisim               E-posta + X + RSS
/admin                  Sveltia CMS (Bayram Bozyel için içerik düzenleme)
/rss.xml                Birleşik RSS akışı (4 koleksiyon)
```

---

## Yerel geliştirme

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # dist/ üretir
npm run preview   # build çıktısını yerelde önizler
```

## Stack

- **Astro 5** content collections + static output
- **Fraunces** (variable, opsz) + **Source Serif 4** body (Google Fonts)
- **Saf CSS** — tek `global.css`, otomatik dark mode
- **Sveltia CMS** (MIT, Decap'in modern fork'u) — `/admin/` altında
- **GitHub Actions** → `wrangler deploy` → **Cloudflare Workers Static Assets**
- **Sıfır client JS** ana sitede; sadece `/admin` Sveltia için JS yükler

---

## Cloudflare Workers'a deploy

İlk deploy (yerel):

```bash
npx wrangler login
npm run deploy    # = astro build && wrangler deploy
```

Sonraki deploy'lar otomatik: `main` branch'ına her push → GitHub Actions →
build → `wrangler deploy`. Bunun için **tek seferlik** bir kurulum gerek:

```bash
# 1) gh CLI'a workflow yetkisi ekle (tarayıcı açılır, onayla)
gh auth refresh -s workflow -h github.com

# 2) Workflow dosyasını doğru yere taşı
mkdir -p .github/workflows
git mv docs/templates/github-actions-deploy.yml .github/workflows/deploy.yml
git commit -m "ci: enable GitHub Actions deploy workflow"
git push
```

Ardından GitHub repo → Settings → Secrets → iki secret ekle:
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` ([detay](docs/CMS_AUTH.md)).

`wrangler.toml`:
- `name = "bayram-bozyel"` → Worker adı
- `[assets] directory = "./dist"` → Astro çıktısı
- `not_found_handling = "404-page"` → dist/404.html
- `html_handling = "auto-trailing-slash"`

Özel domain (`bayrambozyel.com`) bağladığında `routes` bloğunu yorumdan çıkar.

---

## İçerik yönetimi (CMS)

`bayrambozyel.com/admin` → Bayram Bozyel GitHub ile login →
form üzerinden yazı ekler/düzenler → save → repo'ya commit → GH Actions →
deploy. Hiç git/markdown bilmesi gerekmez.

Kurulum (bir kere):

1. **GitHub OAuth App** → callback URL: `https://bayram-bozyel-auth.bedirhancode.workers.dev/oauth/callback`
2. **OAuth proxy Worker** → `sveltia/sveltia-cms-auth` repo'sundan deploy
3. **GitHub Actions secret'ları** → `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
4. **Bayram amca → repo collaborator** olarak eklenmeli

Adım adım: [`docs/CMS_AUTH.md`](docs/CMS_AUTH.md).

---

## Dosya haritası

```
astro.config.mjs        Astro config
wrangler.toml           Cloudflare Workers deploy
.github/workflows/
  deploy.yml            Push → build → Cloudflare deploy
docs/
  CMS_AUTH.md           OAuth + secret kurulumu
public/
  admin/
    index.html          Sveltia CMS yükleyici
    config.yml          Koleksiyon şemaları
  favicon.svg
  robots.txt
src/
  content.config.ts     Astro koleksiyon şemaları
  content/
    makaleler/          .md dosyaları (Sveltia üzerinden de yönetilir)
    roportajlar/
    etkinlikler/
    videolar/
  assets/
    bayram-bozyel.jpg   Portre (build sırasında webp optimize edilir)
  layouts/Base.astro    HTML iskeleti
  lib/format.ts         Türkçe tarih + gruplama
  components/
    Header.astro        Üst nav (5 öğe)
    Footer.astro        Alt bilgi + RSS
    Portrait.astro      Astro:assets ile optimize portre
    EntryList.astro     Tüm koleksiyon listelemeleri
  pages/
    index.astro         Ana sayfa (her koleksiyondan son birkaç)
    hakkimda.astro      Biyografi + portre + kitaplar
    iletisim.astro      E-posta, X, RSS
    makaleler/
      index.astro       Liste
      [...slug].astro   Detay
    roportajlar/
      index.astro
      [...slug].astro
    etkinlikler/
      index.astro
      [...slug].astro
    videolar/
      index.astro
      [...slug].astro
    rss.xml.ts          Birleşik RSS feed
    404.astro
  styles/global.css     Tüm stiller (tek dosya)
```

---

## Yapılacaklar (v2)

- [ ] Bayram amcadan daha doğal/güncel bir portre alıp `src/assets/` altına koymak
- [ ] Kürtçe (Kurmancî) sürüm `/ku/` altında
- [ ] Etiket / konu sayfaları (`/konu/anadilde-egitim` vb.)
- [ ] Sitemap (`@astrojs/sitemap`)
- [ ] Newsletter abonelik formu (Buttondown / Beehiiv)
- [ ] Open Graph görseli (her yazı için generate)
