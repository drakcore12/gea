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
    'condiciones-servicio.html',
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

test('Google review content stays in the local verified snapshot', () => {
  const html = read('index.html');
  const app = read('app.js');
  const snapshot = JSON.parse(read('data/google-reviews.snapshot.json'));

  assert.equal(snapshot.snapshot.realtime, false);
  assert.equal(snapshot.business.rating, 4.8);
  assert.equal(snapshot.business.reviewCount, 27);
  assert.equal(snapshot.reviews.length, 3);
  for (const review of snapshot.reviews) {
    assert.equal(typeof review.avatar, 'string');
    assert.equal(review.avatar.startsWith('/assets/img/reviews/'), true);
    assert.equal(fs.existsSync(path.join(root, review.avatar.replace(/^\//, ''))), true, review.avatar);
  }
  assert.match(html, /data-review-snapshot="2026-09"/);
  assert.match(html, />4\.8<\//);
  assert.match(html, /27 calificaciones publicadas en Google/);
  assert.match(html, /Lala Vasquez Restrepo/);
  assert.doesNotMatch(html, /data-google-reviews/);
  assert.doesNotMatch(app, /\/api\/google-reviews/);
  assert.equal(fs.existsSync(path.join(root, 'netlify/functions/google-reviews.mts')), false);
  assert.equal(fs.existsSync(path.join(root, 'netlify/functions/google-photo.mts')), false);
  assert.equal(fs.existsSync(path.join(root, 'netlify/functions/google-review-avatar.mts')), true);
});

test('local evidence gallery uses repository assets and no Google photo proxy', () => {
  const html = read('index.html');
  const app = read('app.js');
  assert.match(html, /data-local-evidence-gallery/);
  assert.match(html, /assets\/img\/archive\/caso-electrico-industrial-2026-06-20/);
  assert.doesNotMatch(html, /\/api\/google-photo/);
  assert.doesNotMatch(app, /\/api\/google-photo/);
  assert.match(app, /initializeEvidenceCarousel/);
});

test('analytics is consent-driven', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /<script[^>]+src=["'][^"']*googletagmanager\.com\/gtag\/js/i);
  const app = read('app.js');
  assert.match(app, /consent/i);
  assert.match(app, /googletagmanager\.com/);
});

test('review snapshot is present in HTML and does not require JavaScript to appear', () => {
  const html = read('index.html');
  assert.match(html, /Opiniones destacadas/);
  assert.match(html, /google-review-card/);
  assert.match(html, /Datos y opiniones verificados en septiembre de 2026/i);
  assert.doesNotMatch(html, /google-review-card--loading/);
});

test('home interactive guidance stays lightweight and directly accessible', () => {
  const html = read('index.html');
  const runtime = read('home-redesign.js');
  const motion = read('gea-motion.js');
  const floating = read('floating-whatsapp.css');

  assert.doesNotMatch(html, /data-gea-intro/);
  assert.doesNotMatch(html, /intro\.js/);
  assert.match(html, /data-live-status/);
  assert.match(html, /data-diagnosis="gas-smell"/);
  assert.match(html, /data-diagnosis-result/);
  assert.match(html, /data-coverage-location="Medellín"/);
  assert.match(html, /prefers-reduced-motion|diagnosis-option/);
  assert.match(runtime, /America\/Bogota/);
  assert.match(runtime, /IntersectionObserver/);
  assert.match(runtime, /initializeQuickDiagnosis/);
  assert.match(runtime, /initializeCoverage/);
  assert.match(motion, /prefers-reduced-motion/);
  assert.match(floating, /prefers-reduced-motion: no-preference/);
});

test('Google reviewer photos and map preview use constrained same-origin endpoints', () => {
  const html = read('index.html');
  const runtime = read('home-redesign.js');
  const avatarFn = read('netlify/functions/google-review-avatar.mts');
  const mapFn = read('netlify/functions/google-map-preview.mts');

  assert.match(html, /src="\/api\/google-review-avatar\?author=Lala%20Vasquez%20Restrepo"/);
  assert.match(html, /src="\/api\/google-map-preview"/);
  assert.match(html, /Abrir en Google Maps/);
  assert.doesNotMatch(html, /data-google-map-load/);
  assert.doesNotMatch(html, /<iframe[^>]+google\.com\/maps/i);

  assert.match(runtime, /initializeReviewAvatarLoading/);
  assert.match(runtime, /\/api\/google-review-avatar\?author=/);
  assert.doesNotMatch(runtime, /initializeGoogleMapLoader/);

  assert.match(avatarFn, /REVIEWERS = new Map/);
  assert.match(avatarFn, /hostname\.endsWith\('\.googleusercontent\.com'\)/);
  assert.match(avatarFn, /path: '\/api\/google-review-avatar'/);
  assert.match(mapFn, /maps\.googleapis\.com\/maps\/api\/staticmap/);
  assert.match(mapFn, /path: '\/api\/google-map-preview'/);
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


test('legal and privacy controls are published and consent is explicit', () => {
  const home = read('index.html');
  const privacy = read('privacidad.html');
  const terms = read('condiciones-servicio.html');
  const sitemap = read('sitemap.xml');

  assert.match(home, /id=["']privacy-consent["'][^>]*type=["']checkbox["'][^>]*required/i);
  assert.match(home, /Autorizo a Soluciones GEA a tratar los datos/i);
  assert.match(home, /Soluciones GEA es una operación independiente/i);
  assert.match(home, /condiciones-servicio\.html/i);
  assert.match(home, /data-consent-manage/i);
  const head = home.match(/<head>[\s\S]*?<\/head>/i)?.[0] || '';
  assert.doesNotMatch(head, /consent-banner/i);

  assert.doesNotMatch(privacy, /medición anónima/i);
  assert.match(privacy, /Ley 1581 de 2012/i);
  assert.match(privacy, /Carrera 141 #62-86/i);
  assert.match(privacy, /revocatoria de la autorización/i);
  assert.match(privacy, /Superintendencia de Industria y Comercio/i);
  assert.match(privacy, /solucionesgea\.oficial@gmail\.com/i);

  assert.match(terms, /Condiciones del servicio/i);
  assert.match(terms, /no pertenece, representa ni actúa por cuenta de EPM/i);
  assert.match(terms, /Superintendencia de Industria y Comercio/i);
  assert.match(terms, /solucionesgea\.oficial@gmail\.com/i);
  assert.match(home, /"email":"solucionesgea\.oficial@gmail\.com"/i);
  assert.match(sitemap, /condiciones-servicio\.html/i);
});
