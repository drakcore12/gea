'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const assetsRoot = path.join(root, 'assets');
const imagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function gifDimensions(buffer) {
  if (buffer.length < 10 || !/^GIF8[79]a$/.test(buffer.toString('ascii', 0, 6))) return null;
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

function jpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  return null;
}

function svgDimensions(text) {
  const viewBox = text.match(/viewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  if (viewBox) return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
  const width = text.match(/\bwidth=["']([\d.]+)(?:px)?["']/i)?.[1];
  const height = text.match(/\bheight=["']([\d.]+)(?:px)?["']/i)?.[1];
  return width && height ? { width: Number(width), height: Number(height) } : null;
}

function dimensions(file, buffer) {
  const extension = path.extname(file).toLowerCase();
  if (extension === '.png') return pngDimensions(buffer);
  if (extension === '.jpg' || extension === '.jpeg') return jpegDimensions(buffer);
  if (extension === '.gif') return gifDimensions(buffer);
  if (extension === '.svg') return svgDimensions(buffer.toString('utf8'));
  return null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function assetUrl(relativePath) {
  return `/${relativePath.split(path.sep).map(encodeURIComponent).join('/')}`;
}

const images = walk(assetsRoot)
  .filter((file) => imagePattern.test(file))
  .map((file) => {
    const buffer = fs.readFileSync(file);
    const relativePath = path.relative(root, file).split(path.sep).join('/');
    const info = dimensions(file, buffer);
    return {
      path: relativePath,
      filename: path.basename(file),
      folder: path.dirname(relativePath),
      extension: path.extname(file).slice(1).toLowerCase(),
      bytes: buffer.length,
      kilobytes: Math.round((buffer.length / 1024) * 10) / 10,
      width: info?.width || null,
      height: info?.height || null,
      ratio: info?.width && info?.height ? Math.round((info.width / info.height) * 100) / 100 : null,
      url: assetUrl(relativePath),
    };
  })
  .sort((a, b) => a.path.localeCompare(b.path, 'es'));

const summary = {
  generatedAt: new Date().toISOString(),
  count: images.length,
  totalKilobytes: Math.round(images.reduce((total, image) => total + image.bytes, 0) / 1024),
  formats: Object.fromEntries(
    [...new Set(images.map((image) => image.extension))].map((format) => [format, images.filter((image) => image.extension === format).length]),
  ),
  images,
};

fs.writeFileSync(path.join(root, 'assets-inventory.json'), `${JSON.stringify(summary, null, 2)}\n`);

const cards = images.map((image, index) => {
  const dimensionsText = image.width && image.height ? `${image.width} × ${image.height}px` : 'Dimensiones no detectadas';
  return `
    <article class="asset-card" data-index="${index}" data-name="${escapeHtml(image.path.toLowerCase())}" data-format="${escapeHtml(image.extension)}">
      <div class="asset-preview"><img src="${escapeHtml(image.url)}" alt="Vista previa de ${escapeHtml(image.filename)}" loading="lazy"></div>
      <div class="asset-info">
        <strong>${escapeHtml(image.filename)}</strong>
        <code>${escapeHtml(image.path)}</code>
        <span>${escapeHtml(dimensionsText)} · ${image.kilobytes} KB · ${escapeHtml(image.extension.toUpperCase())}</span>
      </div>
    </article>`;
}).join('');

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Inventario temporal de imágenes GEA</title>
  <style>
    :root{font-family:Arial,sans-serif;color:#10203b;background:#edf2f8}*{box-sizing:border-box}body{margin:0}header{position:sticky;top:0;z-index:2;padding:18px 22px;background:#011949;color:white;box-shadow:0 4px 20px #0002}h1{margin:0 0 8px;font-size:24px}.summary{margin:0 0 14px;color:#d9e6fa}.controls{display:flex;gap:10px;flex-wrap:wrap}input,select{min-height:44px;padding:9px 12px;border:2px solid #8aa1c4;border-radius:10px;font-size:16px}input{flex:1;min-width:240px}main{padding:22px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}.asset-card{overflow:hidden;background:white;border:1px solid #cbd7e8;border-radius:16px;box-shadow:0 8px 24px #01194912}.asset-card[hidden]{display:none}.asset-preview{display:grid;place-items:center;aspect-ratio:4/3;padding:10px;background:linear-gradient(45deg,#f3f6fa 25%,#e8eef6 25% 50%,#f3f6fa 50% 75%,#e8eef6 75%);background-size:24px 24px}.asset-preview img{display:block;max-width:100%;max-height:100%;object-fit:contain}.asset-info{display:grid;gap:7px;padding:14px}.asset-info strong{font-size:16px;overflow-wrap:anywhere}.asset-info code{font-size:12px;color:#365071;overflow-wrap:anywhere}.asset-info span{font-size:13px;color:#526783}@media(max-width:520px){header{padding:15px}main{padding:14px}.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <header>
    <h1>Inventario temporal de imágenes GEA</h1>
    <p class="summary">${images.length} imágenes · ${summary.totalKilobytes} KB en total · ${escapeHtml(JSON.stringify(summary.formats))}</p>
    <div class="controls">
      <input id="search" type="search" placeholder="Filtrar por nombre o ruta" aria-label="Filtrar imágenes">
      <select id="format" aria-label="Filtrar por formato"><option value="">Todos los formatos</option>${Object.keys(summary.formats).map((format) => `<option value="${escapeHtml(format)}">${escapeHtml(format.toUpperCase())}</option>`).join('')}</select>
    </div>
  </header>
  <main><div class="grid">${cards}</div></main>
  <script>
    const search=document.querySelector('#search');const format=document.querySelector('#format');const cards=[...document.querySelectorAll('.asset-card')];function apply(){const q=search.value.trim().toLowerCase();const f=format.value;cards.forEach(card=>{card.hidden=Boolean((q&&!card.dataset.name.includes(q))||(f&&card.dataset.format!==f));});}search.addEventListener('input',apply);format.addEventListener('change',apply);
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(root, 'assets-audit.html'), html);
console.log(`Inventario temporal generado: ${images.length} imágenes.`);
