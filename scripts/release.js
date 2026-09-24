'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const excludedDirectories = new Set(['.git', 'node_modules', 'web-v2']);
const brandAssetReplacements = Object.freeze({
  'imagotipo-horizontal-color-transparente.png': 'imagotipo-horizontal.svg',
  'imagotipo-horizontal-negativo-transparente.png': 'Soluciones_GEA_imagotipo_horizontal_blanco.svg',
  'isotipo-color-transparente.png': 'isotipo.svg',
  'isotipo.jpeg': 'isotipo.svg',
  'icono_agua_transparente.png': 'icono-agua.svg',
  'icono_gas_transparente.png': 'icono-gas.svg',
  'icono_electricidad_transparente.png': 'icono-electricidad.svg',
});

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) return [];
      return walk(fullPath);
    }

    return [fullPath];
  });
}

function readCommit() {
  const environmentCommit = process.env.COMMIT_REF || process.env.GITHUB_SHA;
  if (environmentCommit) return environmentCommit.trim();

  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (_) {
    return `local-${Date.now()}`;
  }
}

function safeToken(value, fallback) {
  const normalized = String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 24);

  return normalized || fallback;
}

function replaceBrandRasterReferences(source) {
  return Object.entries(brandAssetReplacements).reduce(
    (updated, [rasterName, svgName]) => updated.split(rasterName).join(svgName),
    source,
  );
}

function validateServiceIconSvgs() {
  const assetsDirectory = path.join(root, 'assets', 'img');
  const icons = ['icono-agua.svg', 'icono-gas.svg', 'icono-electricidad.svg'];

  for (const filename of icons) {
    if (!fs.existsSync(path.join(assetsDirectory, filename))) {
      throw new Error(`No se encontró assets/img/${filename}`);
    }
  }
}

function readAttribute(tag, attributeName) {
  const lowerTag = tag.toLowerCase();
  const target = attributeName.toLowerCase();
  let cursor = 0;

  while (cursor < tag.length) {
    const index = lowerTag.indexOf(target, cursor);
    if (index < 0) return null;

    let position = index + target.length;
    while (position < tag.length && /\s/.test(tag.charAt(position))) position += 1;
    if (tag.charAt(position) !== '=') {
      cursor = position;
      continue;
    }

    position += 1;
    while (position < tag.length && /\s/.test(tag.charAt(position))) position += 1;
    const quote = tag.charAt(position);
    if (quote !== '"' && quote !== "'") {
      cursor = position + 1;
      continue;
    }

    const end = tag.indexOf(quote, position + 1);
    if (end < 0) return null;
    return tag.slice(position + 1, end);
  }

  return null;
}

function findHtmlTag(source, tagName, predicate) {
  const lowerSource = source.toLowerCase();
  const needle = `<${tagName.toLowerCase()}`;
  let cursor = 0;

  while (cursor < source.length) {
    const start = lowerSource.indexOf(needle, cursor);
    if (start < 0) return null;

    const end = source.indexOf('>', start + needle.length);
    if (end < 0) return null;

    const tag = source.slice(start, end + 1);
    if (predicate(tag)) return { start, end: end + 1, tag };
    cursor = end + 1;
  }

  return null;
}

function replaceRange(source, start, end, replacement) {
  return source.slice(0, start) + replacement + source.slice(end);
}

function cssImportReferences(source) {
  const references = [];
  const lowerSource = source.toLowerCase();
  let cursor = 0;

  while (cursor < source.length) {
    const importIndex = lowerSource.indexOf('@import', cursor);
    if (importIndex < 0) break;

    const urlIndex = lowerSource.indexOf('url(', importIndex + 7);
    if (urlIndex < 0) break;

    const closeIndex = source.indexOf(')', urlIndex + 4);
    if (closeIndex < 0) break;

    let reference = source.slice(urlIndex + 4, closeIndex).trim();
    const first = reference.charAt(0);
    const last = reference.charAt(reference.length - 1);
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      reference = reference.slice(1, -1).trim();
    }

    if (reference) references.push({ start: urlIndex + 4, end: closeIndex, reference });
    cursor = closeIndex + 1;
  }

  return references;
}

function versionLocalAsset(reference, version) {
  if (/^(?:https?:)?\/\//i.test(reference)) return reference;
  if (/^(?:data:|mailto:|tel:|javascript:)/i.test(reference)) return reference;

  const hashIndex = reference.indexOf('#');
  const hash = hashIndex >= 0 ? reference.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? reference.slice(0, hashIndex) : reference;
  const queryIndex = withoutHash.indexOf('?');
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';
  const params = new URLSearchParams(query);

  params.set('v', version);
  return `${pathname}?${params.toString()}${hash}`;
}

function injectBuildMeta(html, version) {
  const existing = findHtmlTag(
    html,
    'meta',
    (tag) => readAttribute(tag, 'name')?.toLowerCase() === 'gea-build',
  );
  const withoutExisting = existing
    ? replaceRange(html, existing.start, existing.end, '')
    : html;
  const buildMeta = `  <meta name="gea-build" content="${version}">`;
  const viewport = findHtmlTag(
    withoutExisting,
    'meta',
    (tag) => readAttribute(tag, 'name')?.toLowerCase() === 'viewport',
  );

  if (viewport) {
    return replaceRange(withoutExisting, viewport.end, viewport.end, `\n${buildMeta}`);
  }

  return withoutExisting.replace(/<head>/i, `<head>\n${buildMeta}`);
}

function protectPreviewFromIndexing(html, context) {
  if (!['deploy-preview', 'branch-deploy'].includes(context)) return html;

  const previewRobots = '<meta name="robots" content="noindex, nofollow, noarchive">';
  const robots = findHtmlTag(
    html,
    'meta',
    (tag) => readAttribute(tag, 'name')?.toLowerCase() === 'robots',
  );

  if (robots) return replaceRange(html, robots.start, robots.end, previewRobots);
  return html.replace(/<head>/i, `<head>\n  ${previewRobots}`);
}

function injectHomePriorityStyles(html, file) {
  if (path.relative(root, file) !== 'index.html') return html;
  if (/home-priority\.css/i.test(html)) return html;

  const marker = /(<link\s+rel=["']stylesheet["']\s+href=["'][^"']*home-ux-theme\.css[^"']*["']\s*>)/i;
  const stylesheet = '  <link rel="stylesheet" href="./home-priority.css">';

  if (marker.test(html)) return html.replace(marker, `$1\n${stylesheet}`);
  return html.replace(/<\/head>/i, `${stylesheet}\n</head>`);
}

function versionHtmlAssets(html, version) {
  return html.replace(
    /\b(href|src)=(["'])([^"']+\.(?:css|js)(?:\?[^"'#]*)?(?:#[^"']*)?)\2/gi,
    (match, attribute, quote, reference) => {
      const versioned = versionLocalAsset(reference, version);
      return `${attribute}=${quote}${versioned}${quote}`;
    },
  );
}

function versionCssImports(css, version) {
  const imports = cssImportReferences(css);
  if (!imports.length) return css;

  let updated = css;
  for (let index = imports.length - 1; index >= 0; index -= 1) {
    const item = imports[index];
    if (!item.reference.toLowerCase().includes('.css')) continue;
    const versioned = versionLocalAsset(item.reference, version);
    updated = replaceRange(updated, item.start, item.end, `'${versioned}'`);
  }

  return updated;
}

function injectBuildHeader(version) {
  const headersPath = path.join(root, '_headers');
  if (!fs.existsSync(headersPath)) return;

  const source = fs.readFileSync(headersPath, 'utf8');
  const buildHeader = `  X-GEA-Build: ${version}`;
  const lines = source.split(/\r?\n/);
  const buildHeaderIndex = lines.findIndex(
    (line) => line.trim().toLowerCase().startsWith('x-gea-build:'),
  );

  if (buildHeaderIndex >= 0) {
    lines[buildHeaderIndex] = buildHeader;
  } else {
    const headerBlockIndex = lines.findIndex((line) => line.trim() === '/*');
    lines.splice(headerBlockIndex >= 0 ? headerBlockIndex + 1 : 0, 0, buildHeader);
  }

  fs.writeFileSync(headersPath, lines.join('\n'));
}

const commit = readCommit();
const shortCommit = safeToken(commit.slice(0, 12), 'local');
const deployId = safeToken(process.env.DEPLOY_ID, '');
const version = deployId ? `${shortCommit}-${deployId.slice(0, 8)}` : shortCommit;
const context = safeToken(process.env.CONTEXT, 'local');
const productionUrl = process.env.URL || 'https://solucionesgea.com';
const deployUrl = process.env.DEPLOY_URL || productionUrl;
const deployedAt = new Date().toISOString();

validateServiceIconSvgs();

const files = walk(root);
const htmlFiles = files.filter(
  (file) => file.endsWith('.html') && !path.basename(file).startsWith('google'),
);
const cssFiles = files.filter((file) => file.endsWith('.css'));
const brandReferenceFiles = [
  path.join(root, 'app.js'),
  path.join(root, 'home-ux.js'),
  path.join(root, 'scripts', 'check.js'),
].filter((file) => fs.existsSync(file));

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  html = replaceBrandRasterReferences(html);
  html = injectBuildMeta(html, version);
  html = protectPreviewFromIndexing(html, context);
  html = injectHomePriorityStyles(html, file);
  html = versionHtmlAssets(html, version);
  fs.writeFileSync(file, html);
}

for (const file of brandReferenceFiles) {
  const source = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, replaceBrandRasterReferences(source));
}

for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, versionCssImports(css, version));
}

injectBuildHeader(version);

const buildInformation = {
  site: 'Soluciones GEA',
  commit,
  shortCommit,
  deployId: process.env.DEPLOY_ID || null,
  version,
  context,
  productionUrl,
  deployUrl,
  deployedAt,
};

fs.writeFileSync(
  path.join(root, 'version.json'),
  `${JSON.stringify(buildInformation, null, 2)}\n`,
);

console.log(`Release preparado: ${version} (${context}), ${htmlFiles.length} páginas versionadas y recursos de marca migrados a SVG.`);
