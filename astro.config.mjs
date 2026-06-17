// @ts-check
import { defineConfig } from 'astro/config';

// Static-only Astro site. We deploy the built `dist/` to Cloudflare
// Workers using the Static Assets feature (no SSR adapter required).
export default defineConfig({
  site: 'https://bayrambozyel.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
