'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'audit'].includes(entry.name)) return [];
      return walk(fullPath);
    }
    return [fullPath];
  });
}

test('critical pages exist', () => {
  [
    'index.html',
    'servicios/electricista-medellin/index.html',
    'servicios/plomero-fugas-agua-medellin/index.html',
    'servicios/gas-medellin/index.html',
    'privacidad.html',
  ].forEach((file) => assert.equal(fs.existsSync(path.join(root, file)), true, file));
});

test('service navigation has three destinations and retired URLs redirect', () => {
  const serviceRoot = path.join(root, 'servicios');
  const live = ['electricista-medellin', 'plomero-fugas-agua-medellin', 'gas-medellin'];
  const retired = {
    'servicios-electricos-comerciales-medellin': live[0],
    'fugas-de-agua-y-gas-medellin': live[1],
    'redes-internas-de-gas-medellin': live[2],
    'bombas-y-presion-de-agua-medellin': live[1],
    'lavado-de-tanques-medellin': live[1],
    'mantenimiento-cocinas-comerciales-medellin': live[2],
  };
  assert.equal(fs.existsSync(path.join(serviceRoot, 'index.html')), false);
  assert.deepEqual(fs.readdirSync(serviceRoot).filter((name) => fs.existsSync(path.join(serviceRoot, name, 'index.html'))).sort(), [...live].sort());
  const redirects = read('_redirects');
  assert.match(redirects, /^\/servicios\/\s+\/\s+301!/m);
  for (const [oldPath, destination] of Object.entries(retired)) {
    assert.match(redirects, new RegExp(`^/servicios/${oldPath}/\\s+/servicios/${destination}/\\s+301!`, 'm'));
  }
  const sitemap = read('sitemap.xml');
  assert.doesNotMatch(sitemap, /<loc>https:\/\/solucionesgea\.com\/servicios\/<\/loc>/);
  for (const oldPath of Object.keys(retired)) assert.doesNotMatch(sitemap, new RegExp(`<loc>[^<]+/${oldPath}/`));
  for (const html of [read('index.html'), ...live.map((slug) => read(`servicios/${slug}/index.html`))]) {
    assert.doesNotMatch(html, /href="\/servicios\/(?:servicios-electricos|fugas-de-agua|redes-internas|bombas-y-presion|lavado-de-tanques|mantenimiento-cocinas|gea-care)/);
    assert.doesNotMatch(html, /href="\/servicios\/"/);
  }
});

test('contact form has labels and WhatsApp control', () => {
  const html = read('index.html');
  for (const id of ['nombre', 'telefono', 'servicio', 'detalle']) {
    assert.match(html, new RegExp(`<label[^>]+for=["']${id}["']`, 'i'));
    assert.match(html, new RegExp(`<(?:input|select|textarea)[^>]+id=["']${id}["']`, 'i'));
  }
  assert.match(html, /data-lead-submit/);
  assert.match(html, /tel:\+573017605677/);
});

test('blank-target links are protected', () => {
  const htmlFiles = walk(root).filter((file) => file.endsWith('.html') && !path.basename(file).startsWith('google'));
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const tags = html.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gi) || [];
    for (const tag of tags) {
      assert.match(tag, /rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i, path.relative(root, file));
    }
  }
});

test('JSON-LD blocks parse', () => {
  const htmlFiles = walk(root).filter((file) => file.endsWith('.html') && !path.basename(file).startsWith('google'));
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      assert.doesNotThrow(() => JSON.parse(match[1]), path.relative(root, file));
    }
  }
});

test('security headers baseline is present', () => {
  const headers = read('_headers');
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /Strict-Transport-Security:/);
  assert.match(headers, /X-Content-Type-Options:\s*nosniff/i);
  assert.match(headers, /Referrer-Policy:/);
  assert.match(headers, /Permissions-Policy:/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /object-src 'none'/);
});

test('Google Places secret stays server-side', () => {
  const fn = read('netlify/functions/google-reviews.mts');
  const app = read('app.js');
  assert.match(fn, /Netlify\.env\.get\(['"]GOOGLE_API_KEY['"]\)/);
  assert.doesNotMatch(fn, /AIza[0-9A-Za-z_-]{30,}/);
  assert.doesNotMatch(app, /places\.googleapis\.com/);
  assert.doesNotMatch(app, /AIza[0-9A-Za-z_-]{30,}/);
});

test('Google external data is constrained before DOM URL use', () => {
  const app = read('app.js');
  const fn = read('netlify/functions/google-reviews.mts');
  assert.match(app, /text\.textContent = review\.text/);
  assert.match(app, /safeGoogleImageUrl/);
  assert.match(app, /hostname\.endsWith\('\.googleusercontent\.com'\)/);
  assert.match(fn, /safeGooglePhotoUri/);
  assert.match(fn, /hostname\.endsWith\('\.googleusercontent\.com'\)/);
  assert.doesNotMatch(app, /image\.src\s*=\s*review\.author\.photoUri/);
  assert.doesNotMatch(app, /authorName\.href\s*=\s*review\.author\.uri/);
  assert.doesNotMatch(app, /source\.href\s*=\s*review\.googleMapsUri/);
});

test('analytics is consent-driven', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /<script[^>]+src=["'][^"']*googletagmanager\.com\/gtag\/js/i);
  const app = read('app.js');
  assert.match(app, /consent/i);
  assert.match(app, /googletagmanager\.com/);
});

test('reviews and map are lazy initialized', () => {
  const app = read('app.js');
  assert.match(app, /IntersectionObserver/);
  assert.match(app, /rootMargin:\s*['"]420px 0px['"]/);
  assert.match(app, /iframe\.loading\s*=\s*['"]lazy['"]/);
});

test('engineering docs exist', () => {
  [
    'docs/engineering/ARCHITECTURE.md',
    'docs/quality/REQUIREMENTS.md',
    'docs/quality/TRACEABILITY.md',
    'docs/quality/TEST-STRATEGY-ISO29119.md',
    'docs/security/THREAT-MODEL.md',
    'docs/operations/RELEASE-ROLLBACK.md',
  ].forEach((file) => assert.equal(fs.existsSync(path.join(root, file)), true, file));
});
