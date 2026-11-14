// Prerender every page of the site into static HTML for search engines.
// usage: node prerender.js <shell.html> <repo dir>
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [shellPath, repo] = process.argv.slice(2);
const shell = fs.readFileSync(shellPath, 'utf8');
const ORIGIN = 'https://gianmarcoantonaccidesigner.it';
const TYPES = { '.webp': 'image/webp', '.woff2': 'font/woff2', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u.startsWith('/img/') || u.startsWith('/fonts/')) {
    const f = path.join(repo, u);
    if (fs.existsSync(f)) { res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); return fs.createReadStream(f).pipe(res); }
    res.writeHead(404); return res.end();
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(shell.replace('<!--HEAD-->', '<title>prerender</title>').replace('<!--APP-->', ''));
});

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

(async () => {
  await new Promise(r => server.listen(8123, r));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1320, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('ga-cookie', '1'); } catch (e) {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.goto('http://localhost:8123/', { waitUntil: 'networkidle' });
  const PAGES = await page.evaluate(() => PAGES);

  // Open Graph image: the home hero at 1200x630
  const og = await ctx.newPage();
  await og.setViewportSize({ width: 1200, height: 630 });
  await og.goto('http://localhost:8123/', { waitUntil: 'networkidle' });
  await og.waitForTimeout(400);
  await og.screenshot({ path: path.join(repo, 'img/og.jpg'), type: 'jpeg', quality: 82 });

  const org = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': ORIGIN + '/#studio',
    name: 'GA Studio', url: ORIGIN + '/', image: ORIGIN + '/img/og.jpg',
    description: PAGES.home.desc, telephone: '+39 352 029 5120',
    areaServed: 'IT', address: { '@type': 'PostalAddress', addressRegion: 'Puglia', addressCountry: 'IT' },
    founder: { '@type': 'Person', name: 'Gianmarco Antonacci', jobTitle: 'Product designer', url: ORIGIN + '/chi-siamo' },
    knowsAbout: ['UX design', 'UI design', 'App design', 'Web design', 'Brand identity', 'Intelligenza artificiale'],
    makesOffer: ['svc:app', 'svc:web', 'svc:brand', 'svc:ai'].map(k => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: PAGES[k].title.split(' | ')[0], url: ORIGIN + PAGES[k].path } }))
  };

  const urls = [];
  for (const key of Object.keys(PAGES)) {
    const meta = PAGES[key];
    await page.goto('http://localhost:8123' + meta.path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(150);
    const app = await page.evaluate(() => document.getElementById('app').innerHTML);
    const is404 = key === '404';
    const url = ORIGIN + meta.path;
    const ld = [org];
    if (meta.path !== '/' && !is404) {
      const crumbs = [{ name: 'Home', item: ORIGIN + '/' }];
      if (key.startsWith('svc:')) crumbs.push({ name: 'Servizi', item: ORIGIN + '/servizi' });
      crumbs.push({ name: meta.title.split(' — ')[0].split(' | ')[0], item: url });
      ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })) });
    }
    const head = [
      `<title>${esc(meta.title)}</title>`,
      `<meta name="description" content="${esc(meta.desc)}">`,
      is404 ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`,
      '<meta property="og:type" content="website">',
      '<meta property="og:locale" content="it_IT">',
      '<meta property="og:site_name" content="GA Studio">',
      `<meta property="og:title" content="${esc(meta.title)}">`,
      `<meta property="og:description" content="${esc(meta.desc)}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:image" content="${ORIGIN}/img/og.jpg">`,
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">',
      '<meta name="twitter:card" content="summary_large_image">',
      `<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld).replace(/</g, '\\u003c')}</script>`
    ].join('\n');
    const html = shell.replace('<!--HEAD-->', head).replace('<!--APP-->', app);
    const out = is404 ? path.join(repo, '404.html') : meta.path === '/' ? path.join(repo, 'index.html') : path.join(repo, meta.path.slice(1), 'index.html');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
    if (!is404) urls.push({ url, pri: meta.path === '/' ? '1.0' : key === 'privacy' || key === 'cookie' ? '0.3' : '0.8' });
    console.log('wrote', path.relative(repo, out), (html.length / 1024).toFixed(0) + 'KB');
  }

  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(repo, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => `  <url><loc>${u.url}</loc><lastmod>${today}</lastmod><priority>${u.pri}</priority></url>`).join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(repo, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  console.log('errors', errors);
  await browser.close();
  server.close();
})();
