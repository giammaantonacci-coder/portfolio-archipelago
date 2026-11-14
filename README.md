# GA Studio — Gianmarco Antonacci

Portfolio of GA Studio in Italian, plain HTML, CSS and JavaScript, served by Vercel.

## Pages

| Address | Page |
|---|---|
| `/` | Home: method, services, projects, AI |
| `/servizi` | All services |
| `/servizi/app`, `/servizi/siti-web`, `/servizi/brand-identity`, `/servizi/ai` | One page per service |
| `/chi-siamo` | About the studio |
| `/privacy-policy`, `/cookie-policy` | Legal pages |
| `404.html` | Page not found |

Every page is a static, prerendered HTML file (good for search engines) that also contains the page template and a small renderer, so moving between pages happens without a reload.

- `img/` — screenshots, portrait and social preview image
- `fonts/` — self-hosted fonts (no requests to Google Fonts)
- `sitemap.xml`, `robots.txt` — for search engines
- `vercel.json` — clean addresses without `.html`
- `tools/` — the page source (`source.dc.html`) and the build: `build_page.py` turns it into a page shell, `prerender.js` renders every address with Playwright and writes the HTML files, the sitemap and the social image

## Rebuild

```bash
python3 tools/build_page.py tools/source.dc.html /tmp/shell.html
node tools/prerender.js /tmp/shell.html .
```

## Local preview

Any static server that maps `/servizi` to `servizi/index.html` works, for example `npx serve`.
