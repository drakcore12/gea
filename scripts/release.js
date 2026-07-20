'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const excludedDirectories = new Set(['.git', 'node_modules', 'web-v2']);

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
  const withoutExisting = html.replace(/\s*<meta\s+name=["']gea-build["'][^>]*>\s*/gi, '\n');
  const buildMeta = `  <meta name="gea-build" content="${version}">`;
  const viewportPattern = /(<meta\s+name=["']viewport["'][^>]*>)/i;

  if (viewportPattern.test(withoutExisting)) {
    return withoutExisting.replace(viewportPattern, `$1\n${buildMeta}`);
  }

  return withoutExisting.replace(/<head>/i, `<head>\n${buildMeta}`);
}

function protectPreviewFromIndexing(html, context) {
  if (!['deploy-preview', 'branch-deploy'].includes(context)) return html;

  const robotsPattern = /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?\s*>/i;
  const previewRobots = '<meta name="robots" content="noindex, nofollow, noarchive">';

  if (robotsPattern.test(html)) return html.replace(robotsPattern, previewRobots);
  return html.replace(/<head>/i, `<head>\n  ${previewRobots}`);
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
  return css.replace(
    /@import\s+url\(\s*(["']?)([^"')]+\.css(?:\?[^"')#]*)?(?:#[^"')]*)?)\1\s*\)/gi,
    (match, quote, reference) => {
      const versioned = versionLocalAsset(reference, version);
      const wrapper = quote || "'";
      return `@import url(${wrapper}${versioned}${wrapper})`;
    },
  );
}

function injectBuildHeader(version) {
  const headersPath = path.join(root, '_headers');
  if (!fs.existsSync(headersPath)) return;

  const source = fs.readFileSync(headersPath, 'utf8');
  const buildHeader = `  X-GEA-Build: ${version}`;
  const updated = /^\s*X-GEA-Build:\s*.*$/im.test(source)
    ? source.replace(/^\s*X-GEA-Build:\s*.*$/im, buildHeader)
    : source.replace(/^\/\*\s*$/m, `/*\n${buildHeader}`);

  fs.writeFileSync(headersPath, updated);
}

const commit = readCommit();
const shortCommit = safeToken(commit.slice(0, 12), 'local');
const deployId = safeToken(process.env.DEPLOY_ID, '');
const version = deployId ? `${shortCommit}-${deployId.slice(0, 8)}` : shortCommit;
const context = safeToken(process.env.CONTEXT, 'local');
const productionUrl = process.env.URL || 'https://soluciones-gea.netlify.app';
const deployUrl = process.env.DEPLOY_URL || productionUrl;
const deployedAt = new Date().toISOString();

const files = walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const cssFiles = files.filter((file) => file.endsWith('.css'));

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  html = injectBuildMeta(html, version);
  html = protectPreviewFromIndexing(html, context);
  html = versionHtmlAssets(html, version);
  fs.writeFileSync(file, html);
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

console.log(`Release preparado: ${version} (${context}), ${htmlFiles.length} páginas versionadas.`);
