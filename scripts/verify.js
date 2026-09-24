'use strict';

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const release = process.argv.includes('--release');

const syntaxFiles = [
  'app.js',
  'theme-init.js',
  'service-pages.js',
  'home-redesign.js',
  'hero-video.js',
  'intro.js',
  'floating-whatsapp.js',
  'gea-motion.js',
  'scripts/release.js',
  'scripts/check.js',
  'scripts/quality-gate.js',
  'scripts/smoke-production.mjs',
  'tests/repository.test.js',
];

function run(label, args) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

for (const file of syntaxFiles) {
  run(`syntax ${file}`, ['--check', file]);
}

run('repository tests', ['--test', 'tests/repository.test.js']);
run('engineering quality gate', ['scripts/quality-gate.js']);
run('source validation', ['scripts/check.js']);

if (release) {
  run('prepare release', ['scripts/release.js']);
  run('versioned release validation', ['scripts/check.js']);
}

console.log(`\nVerification PASS${release ? ' + release' : ''}.`);
