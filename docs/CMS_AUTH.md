# İçerik Yönetimi (CMS) — kurulum kılavuzu

Site, **Sveltia CMS** (Decap CMS'in modern fork'u) ile birlikte gelir.
Bayram Bozyel `bayrambozyel.com/admin` adresinden GitHub hesabıyla giriş
yapar, yeni içerik (makale, röportaj, etkinlik, video) ekler/düzenler.
Kayıt → GitHub'a commit → GitHub Actions sitemi yeniden derler →
Cloudflare Workers'a deploy eder.

Bu kurulumun **bir kerelik** adımları aşağıda. Üç bağımsız parça var:

1. **GitHub OAuth uygulaması** (Sveltia'nın GitHub'a yazabilmesi için)
2. **OAuth proxy** Cloudflare Worker'ı (GitHub OAuth handshake'i ile site arasında köprü)
3. **GitHub Actions secret'ları** (Cloudflare deploy için)

---

## 1) GitHub OAuth App

1. https://github.com/settings/developers → **OAuth Apps → New OAuth App**.
2. Form:
   - **Application name**: `Bayram Bozyel CMS`
   - **Homepage URL**: `https://bayrambozyel.com`
   - **Authorization callback URL**:
     `https://bayram-bozyel-auth.bedirhancode.workers.dev/oauth/callback`
3. Kaydet → **Client ID** ve **Generate a new client secret** ile **Client Secret**'i not al.

---

## 2) OAuth proxy Cloudflare Worker

Sveltia/Decap, GitHub OAuth için ufak bir proxy Worker bekliyor. Hazır
şablonu kullan:

```bash
# Yeni bir klasörde
git clone https://github.com/sveltia/sveltia-cms-auth.git
cd sveltia-cms-auth
npm install
```

`wrangler.toml` içine isim ve gerekirse rota ekle:

```toml
name = "bayram-bozyel-auth"
main = "src/index.js"
compatibility_date = "2025-06-01"
```

Secret'ları gir:

```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
# allow-list domain
npx wrangler secret put ALLOWED_DOMAINS
# Yanıt: bayrambozyel.com,*.bayrambozyel.com
```

Deploy:

```bash
npx wrangler deploy
```

Yayınlanan URL (örn. `https://bayram-bozyel-auth.bedirhancode.workers.dev`)
ile `public/admin/config.yml` içindeki `base_url`'in **bire bir** aynı
olduğundan emin ol.

---

## 3) Cloudflare deploy için GitHub Actions secret'ları

Repo: `bedirhancode/bayram-bozyel` → **Settings → Secrets and variables → Actions → New repository secret**.

İki secret ekle:

| Secret adı | Nereden | Notlar |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** şablonu | "Account → Workers Scripts → Edit" yetkili olmalı |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard sağ panelde "Account ID" | — |

Bu noktadan sonra `main` branch'ına her push (CMS'den gelen commit'ler dahil)
GitHub Actions'ı tetikler → build → `wrangler deploy`.

---

## 4) Bayram Bozyel için ilk giriş

1. `bayrambozyel.com/admin` adresine git.
2. **Login with GitHub** → hesabıyla onayla.
3. Sol panelden bir koleksiyon seç (Makaleler / Röportajlar / Etkinlikler / Videolar).
4. **+ Yeni Makale** butonu → başlık, tarih, içerik formu.
5. **Save** → repo'ya commit. Birkaç dakika içinde siten güncel.

> **Önemli**: Bayram amcanın GitHub kullanıcı adının bu repo'da en az
> **write** yetkili collaborator olması gerek. `bedirhancode/bayram-bozyel`
> → Settings → Collaborators → "Add people" ile ekle.

---

## Sorun giderme

- **Login penceresi açılıyor ama "redirect_uri mismatch" hatası**:
  GitHub OAuth App'in callback URL'i ile Worker'ın domain'i bire bir aynı olmalı.
- **"Bad credentials"**: GITHUB_CLIENT_SECRET hatalı; `wrangler secret put`
  ile yenile.
- **Commit oluyor ama site güncellenmiyor**: GitHub Actions'ı `Actions`
  sekmesinden kontrol et. Çoğu zaman `CLOUDFLARE_API_TOKEN` eksiktir.
- **CSP yüzünden Sveltia yüklenmiyor**: Cloudflare Workers Static Assets
  default'da CSP koymaz, ama özel header eklediysen `unpkg.com` ve
  `api.github.com` izinli olmalı.
