'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlFiles = ['index.html', 'privacidad.html', '404.html'];
const errors = [];

function report(message) {
  errors.push(message);
}

function localReferenceExists(reference) {
  const clean = reference.split('#')[0].split('?')[0];
  if (!clean || clean === './' || clean === '/') return true;
  if (/^(https?:|mailto:|tel:|data:)/i.test(clean)) return true;

  const relative = clean.startsWith('/') ? clean.slice(1) : clean.replace(/^\.\//, '');
  const resolved = path.resolve(root, relative);
  return resolved.startsWith(root) && fs.existsSync(resolved);
}

for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    report(`${file}: archivo ausente`);
    continue;
  }

  const html = fs.readFileSync(fullPath, 'utf8');
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  for (const id of new Set(duplicateIds)) report(`${file}: id duplicado "${id}"`);
  if (/\sstyle=["']/i.test(html)) report(`${file}: contiene estilos inline`);
  if (/javascript:/i.test(html)) report(`${file}: contiene una URL javascript:`);

  for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    const reference = match[1];
    if (!localReferenceExists(reference)) report(`${file}: referencia local inexistente ${reference}`);
  }

  for (const match of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
    const tag = match[0];
    if (!/rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i.test(tag)) {
      report(`${file}: enlace target=_blank sin noopener noreferrer`);
    }
  }
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const theme = fs.readFileSync(path.join(root, 'theme.css'), 'utf8');

if (!index.includes('imagotipo-horizontal-negativo-transparente.png')) report('index.html: el footer no contiene el imagotipo negativo');
if (!index.includes('data-lead-submit')) report('index.html: falta el control seguro del formulario');
if (!fs.existsSync(path.join(root, 'brand.css'))) report('Falta brand.css');
if (!theme.includes("@import url('./brand.css')")) report('theme.css: falta cargar brand.css');
if (!fs.existsSync(path.join(root, '_headers'))) report('Falta _headers');
if (!fs.existsSync(path.join(root, 'robots.txt'))) report('Falta robots.txt');
if (!fs.existsSync(path.join(root, 'sitemap.xml'))) report('Falta sitemap.xml');

if (errors.length) {
  console.error('Validación fallida:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Validación estática completada sin errores.');
