'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const errors = [];

const requiredDocs = [
  'docs/engineering/ARCHITECTURE.md',
  'docs/engineering/ADRs/0001-static-serverless.md',
  'docs/engineering/ADRs/0002-netlify-production.md',
  'docs/engineering/ADRs/0003-google-reviews-boundary.md',
  'docs/quality/REQUIREMENTS.md',
  'docs/quality/QUALITY-MODEL-ISO25010.md',
  'docs/quality/TEST-STRATEGY-ISO29119.md',
  'docs/quality/TEST-PLAN.md',
  'docs/quality/TEST-DESIGN.md',
  'docs/quality/TEST-PROCEDURE.md',
  'docs/quality/RISK-REGISTER.md',
  'docs/quality/TRACEABILITY.md',
  'docs/quality/TEST-CASES.md',
  'docs/quality/TEST-INCIDENTS.md',
  'docs/quality/TEST-REPORT.md',
  'docs/quality/TEST-COMPLETION-REPORT.md',
  'docs/security/THREAT-MODEL.md',
  'docs/operations/RELEASE-ROLLBACK.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
];

function report(message) { errors.push(message); }
function read(relativePath) { return fs.readFileSync(path.join(root, relativePath), 'utf8'); }

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', 'audit', 'assets'].includes(entry.name)) return [];
      return walk(fullPath);
    }
    return [{ fullPath, relative: path.relative(root, fullPath) }];
  });
}

for (const file of requiredDocs) {
  if (!fs.existsSync(path.join(root, file))) report(`Falta documentación obligatoria: ${file}`);
}

const forbiddenLegacyFiles = [
  'home-ux.js',
  'home-ux.css',
  'home-ux-content.css',
  'home-ux-theme.css',
  'intro-critical.css',
  'intro-gate-refresh.css',
  'hero-home.css',
  'social.css',
];

for (const file of forbiddenLegacyFiles) {
  if (fs.existsSync(path.join(root, file))) report(`Archivo legacy no debe regresar: ${file}`);
}

const files = walk(root);
const textFiles = files.filter(({ relative }) => /\.(?:js|mjs|mts|html|css|md|yml|yaml|toml|json|txt)$/i.test(relative));
const secretPatterns = [
  { name: 'Google API key', pattern: /AIza[0-9A-Za-z_-]{30,}/g },
  { name: 'private key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
];

for (const { fullPath, relative } of textFiles) {
  const source = fs.readFileSync(fullPath, 'utf8');
  for (const { name, pattern } of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) report(`${relative}: posible ${name} hardcodeada`);
  }
}

const browserJs = files.filter(({ relative }) =>
  relative.endsWith('.js') &&
  !relative.startsWith('scripts/') &&
  !relative.startsWith('tests/')
);

for (const { fullPath, relative } of browserJs) {
  const source = fs.readFileSync(fullPath, 'utf8');
  const lines = source.split(/\r?\n/).length;
  if (lines > 1100) report(`${relative}: supera presupuesto de 1100 líneas (${lines})`);
  if (/\beval\s*\(/.test(source)) report(`${relative}: eval() no permitido`);
  if (/\bnew\s+Function\s*\(/.test(source)) report(`${relative}: new Function no permitido`);
  if (/document\.write\s*\(/.test(source)) report(`${relative}: document.write no permitido`);
  if (/javascript:/i.test(source)) report(`${relative}: URL javascript: no permitida`);
}

for (const { fullPath, relative } of files.filter(({ relative }) => relative.endsWith('.css'))) {
  const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).length;
  if (lines > 2000) report(`${relative}: supera presupuesto de 2000 líneas (${lines})`);
}

if (fs.existsSync(path.join(root, 'docs/quality/REQUIREMENTS.md')) &&
    fs.existsSync(path.join(root, 'docs/quality/TRACEABILITY.md'))) {
  const requirements = read('docs/quality/REQUIREMENTS.md');
  const traceability = read('docs/quality/TRACEABILITY.md');
  const ids = [...new Set(requirements.match(/\b(?:FR|NFR|SEO|OPS|QA)-\d{3}\b/g) || [])];
  for (const id of ids) {
    if (!traceability.includes(`| ${id} |`)) report(`Trazabilidad ausente para ${id}`);
  }
  if (ids.length < 20) report('El catálogo de requisitos parece incompleto');
}

const qualityWorkflow = read('.github/workflows/quality.yml');
if (!qualityWorkflow.includes('node scripts/verify.js --release')) {
  report('quality.yml debe ejecutar el pipeline unificado verify.js --release');
}

const staticWorkflow = read('.github/workflows/static.yml');
const hasAutomaticPushTrigger = staticWorkflow
  .split('\n')
  .some((line) => line.trim() === 'push:');

if (hasAutomaticPushTrigger) {
  report('GitHub Pages no debe desplegar automáticamente: Netlify es producción');
}

const headers = read('_headers');
for (const header of [
  'Content-Security-Policy:',
  'Strict-Transport-Security:',
  'X-Content-Type-Options: nosniff',
  'Referrer-Policy:',
  'Permissions-Policy:',
]) {
  if (!headers.includes(header)) report(`_headers: falta ${header}`);
}

if (errors.length) {
  console.error('Quality gate FAILED');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Quality gate PASS: ${requiredDocs.length} documentos, trazabilidad y límites verificados.`);
