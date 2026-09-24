import assert from 'node:assert/strict';

const baseUrl = (process.env.GEA_BASE_URL || 'https://solucionesgea.com').replace(/\/$/, '');
const pages = [
  '/',
  '/servicios/electricista-medellin/',
  '/servicios/plomero-fugas-agua-medellin/',
  '/servicios/gas-medellin/',
  '/privacidad.html',
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

const reviews = await get('/api/google-reviews');
const payload = await reviews.json();
assert.equal(payload.configured, true, 'Google Reviews no está configurado');
assert.ok(Number.isFinite(payload.rating), 'rating inválido');
assert.ok(payload.rating >= 0 && payload.rating <= 5, 'rating fuera de rango');
assert.ok(Number.isInteger(payload.reviewCount) && payload.reviewCount >= 0, 'reviewCount inválido');
assert.ok(Array.isArray(payload.reviews), 'reviews debe ser array');
assert.ok(payload.reviews.length <= 3, 'más de 3 reseñas');
assert.equal('apiKey' in payload, false, 'El payload no puede exponer apiKey');

console.log('Production smoke PASS');
