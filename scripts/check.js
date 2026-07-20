'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const errors = [];

function report(message) {
  errors.push(message);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'web-v2'].includes(entry.name)) return [];
      return walk(fullPath);
    }
    return [fullPath];
  });
}

function localReferenceExists(reference, sourceFile) {
  const clean = reference.split('#')[0].split('?')[0];
  if (!clean || clean === './' || clean === '/') return true;
  if (/^(https?:|mailto:|tel:|data:)/i.test(clean)) return true;

  const resolved = clean.startsWith('/')
    ? path.resolve(root, clean.slice(1))
    : path.resolve(path.dirname(sourceFile), clean);

  return resolved.startsWith(root) && fs.existsSync(resolved);
}

function isExternalReference(reference) {
  return /^(?:https?:)?\/\//i.test(reference) || /^(?:data:|mailto:|tel:)/i.test(reference);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const allFiles = walk(root);
const htmlPaths = allFiles.filter((file) => file.endsWith('.html') && !path.basename(file).startsWith('google'));
const googleVerificationPaths = allFiles.filter((file) => file.endsWith('.html') && path.basename(file).startsWith('google'));
const cssPaths = allFiles.filter((file) => file.endsWith('.css'));
const titles = new Map();
const sitemapPath = path.join(root, 'sitemap.xml');
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';

for (const fullPath of htmlPaths) {
  const file = path.relative(root, fullPath);
  const source = fs.readFileSync(fullPath, 'utf8');
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const title = source.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = source.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim();
  const canonical = source.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1]?.trim();
  const h1Count = (source.match(/<h1\b/gi) || []).length;

  for (const id of new Set(duplicateIds)) report(`${file}: id duplicado "${id}"`);
  if (/\sstyle=["']/i.test(source)) report(`${file}: contiene estilos inline`);
  if (/javascript:/i.test(source)) report(`${file}: contiene una URL javascript:`);
  if (!title) report(`${file}: falta <title>`);
  if (h1Count !== 1) report(`${file}: debe contener exactamente un h1; contiene ${h1Count}`);

  if (title) {
    if (titles.has(title)) report(`${file}: título duplicado con ${titles.get(title)}`);
    titles.set(title, file);
  }

  if (file !== '404.html') {
    if (!description) report(`${file}: falta meta description`);
    if (!canonical) report(`${file}: falta canonical`);
  }

  if (canonical && !sitemap.includes(`<loc>${canonical}</loc>`)) {
    report(`${file}: canonical ausente del sitemap`);
  }

  for (const match of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    const reference = match[1];
    if (!localReferenceExists(reference, fullPath)) report(`${file}: referencia local inexistente ${reference}`);
  }

  for (const match of source.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
    const tag = match[0];
    if (!/rel=["'][^"']*noopener[^"']*noreferrer[^"']*["']/i.test(tag)) {
      report(`${file}: enlace target=_blank sin noopener noreferrer`);
    }
  }

  for (const match of source.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      report(`${file}: JSON-LD inválido (${error.message})`);
    }
  }
}

for (const fullPath of googleVerificationPaths) {
  const filename = path.basename(fullPath);
  const expected = `google-site-verification: ${filename}`;
  const actual = fs.readFileSync(fullPath, 'utf8').trim();
  if (actual !== expected) report(`${filename}: contenido de verificación alterado`);
}

const requiredServicePages = [
  'servicios/index.html',
  'servicios/fugas-de-agua-y-gas-medellin/index.html',
  'servicios/mantenimiento-cocinas-comerciales-medellin/index.html',
  'servicios/redes-internas-de-gas-medellin/index.html',
  'servicios/servicios-electricos-comerciales-medellin/index.html',
  'servicios/lavado-de-tanques-medellin/index.html',
  'servicios/bombas-y-presion-de-agua-medellin/index.html',
  'servicios/gea-care-mantenimiento-preventivo-negocios-medellin/index.html',
];

for (const file of requiredServicePages) {
  if (!fs.existsSync(path.join(root, file))) report(`${file}: página de servicio ausente`);
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const theme = fs.readFileSync(path.join(root, 'theme.css'), 'utf8');
const headersPath = path.join(root, '_headers');

if (!index.includes('imagotipo-horizontal-negativo-transparente.png')) report('index.html: el footer no contiene el imagotipo negativo');
if (!index.includes('data-lead-submit')) report('index.html: falta el control seguro del formulario');
if (!fs.existsSync(path.join(root, 'brand.css'))) report('Falta brand.css');
if (!fs.existsSync(path.join(root, 'service-pages.css'))) report('Falta service-pages.css');
if (!fs.existsSync(path.join(root, 'service-pages.js'))) report('Falta service-pages.js');
if (!fs.existsSync(path.join(root, 'home-priority.css'))) report('Falta home-priority.css');
if (!/@import\s+url\(\s*["']\.\/brand\.css(?:\?v=[^"')]+)?["']\s*\)/i.test(theme)) report('theme.css: falta cargar brand.css');
if (!fs.existsSync(headersPath)) report('Falta _headers');
if (!fs.existsSync(path.join(root, 'robots.txt'))) report('Falta robots.txt');
if (!fs.existsSync(sitemapPath)) report('Falta sitemap.xml');
if (!fs.existsSync(path.join(root, 'scripts/release.js'))) report('Falta scripts/release.js');

const versionPath = path.join(root, 'version.json');
if (fs.existsSync(versionPath)) {
  try {
    const build = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    const version = String(build.version || '');
    const versionPattern = version ? new RegExp(`(?:[?&])v=${escapeRegExp(version)}(?:[&#]|$)`) : null;

    if (!version) report('version.json: falta version');
    if (!build.commit) report('version.json: falta commit');
    if (!build.deployedAt) report('version.json: falta deployedAt');

    if (versionPattern) {
      if (!/home-priority\.css\?v=/i.test(index)) {
        report('index.html: falta cargar home-priority.css en la versión publicada');
      }

      for (const fullPath of htmlPaths) {
        const file = path.relative(root, fullPath);
        const source = fs.readFileSync(fullPath, 'utf8');
        const metaVersion = source.match(/<meta\s+name=["']gea-build["']\s+content=["']([^"']+)["']/i)?.[1];

        if (metaVersion !== version) report(`${file}: meta gea-build no coincide con version.json`);

        for (const match of source.matchAll(/\b(?:href|src)=["']([^"']+\.(?:css|js)(?:\?[^"']*)?)["']/gi)) {
          const reference = match[1];
          if (!isExternalReference(reference) && !versionPattern.test(reference)) {
            report(`${file}: recurso sin versión de deploy ${reference}`);
          }
        }
      }

      for (const fullPath of cssPaths) {
        const file = path.relative(root, fullPath);
        const source = fs.readFileSync(fullPath, 'utf8');
        for (const match of source.matchAll(/@import\s+url\(\s*["']?([^"')]+\.css(?:\?[^"')]*)?)["']?\s*\)/gi)) {
          const reference = match[1];
          if (!isExternalReference(reference) && !versionPattern.test(reference)) {
            report(`${file}: @import sin versión de deploy ${reference}`);
          }
        }
      }

      if (fs.existsSync(headersPath)) {
        const headers = fs.readFileSync(headersPath, 'utf8');
        if (!headers.includes(`X-GEA-Build: ${version}`)) report('_headers: X-GEA-Build no coincide con version.json');
        if (!/Cache-Control:\s*no-cache,\s*max-age=0,\s*must-revalidate/i.test(headers)) {
          report('_headers: falta política global de revalidación');
        }
      }
    }
  } catch (error) {
    report(`version.json inválido (${error.message})`);
  }
}

if (errors.length) {
  console.error('Validación fallida:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validación completada: ${htmlPaths.length} páginas HTML sin errores.`);
