import assert from 'node:assert/strict';

const baseUrl = (process.env.GEA_BASE_URL || 'https://solucionesgea.com').replace(/\/$/, '');
const pages = [
  '/',
  '/servicios/electricista-medellin/',
  '/servicios/plomero-fugas-agua-medellin/',
  '/servicios/gas-medellin/',
  '/privacidad.html',
  '/condiciones-servicio.html',
];

async function get(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
    headers: { 'user-agent': 'GEA-production-smoke/1.0' },
  });
  assert.equal(response.ok, true, `${pathname} respondió ${response.status}`);
  return response;
}

for (const pathname of pages) {
  await get(pathname);
  console.log(`PASS ${pathname}`);
}

const home = await get('/');
for (const header of [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
]) {
  assert.ok(home.headers.get(header), `Falta header ${header}`);
}

const homeHtml = await home.text();
assert.match(homeHtml, /data-review-snapshot="2026-09"/, 'Falta el snapshot estático de reseñas');
assert.match(homeHtml, />4\.8<\//, 'Falta rating verificado 4.8');
assert.match(homeHtml, /27 calificaciones publicadas en Google/, 'Falta total verificado de calificaciones');
assert.match(homeHtml, /Lala Vasquez Restrepo/, 'Faltan opiniones verificadas');
assert.doesNotMatch(homeHtml, /\/api\/google-reviews/, 'La homepage no debe depender de Google Reviews API');

console.log('Production smoke PASS');
