[![npm version](https://badge.fury.io/js/astro-php-ssr.svg)](https://www.npmjs.com/package/astro-php-ssr)

# astro-php-ssr

Serve PHP under a mount path and allow the PHP dir in Astro

# How astro-php-ssr works

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
```

## Demo - Try/Test it Live

Click the badge below to see a working demo:

[![Run on Replit](https://replit.com/badge/github/GabrielOnike/astro-php-ssr)](https://replit.com/@developer92/AstroPHPNode)

Or fork it to experiment:

[Fork Demo on Replit](https://replit.com/@developer92/AstroPHPNode?v=1)

The demo shows:
- Basic PHP route integration
- GET/POST request handling
- PHP file serving 