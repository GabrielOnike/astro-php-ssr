# astro-php-ssr
Serve PHP under a mount path and allow the PHP dir in Astro

# astro-php-ssr

Run `.php` routes **inside Astro SSR** via `php-cgi` (preferred) or `php` fallback.

- ✅ Works with `astro dev`/SSR
- ✅ GET/POST supported (basic CGI env)
- ✅ Configurable `phpBinary` and `phpDir`
- ⚠️ Requires `php-cgi` _or_ `php` on the host

## Install

```bash
npm i astro-php-ssr
# or: yarn add astro-php-ssr
# or: pnpm add astro-php-ssr
