import fs from 'node:fs/promises';
import { URL } from 'node:url';

const target = process.env.AUDIT_URL || 'https://soluciones-gea.netlify.app/';
const verificationPath = '/google0e31cec6a62f52e8.html';
const origin = new URL(target).origin;
const seedPaths = [
  '/',
  '/robots.txt',
  '/sitemap.xml',
  verificationPath,
  '/privacidad.html',
  '/404.html',
  '/seo-audit-not-found-check-20260718',
];

function stripTags(value = '') {
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || null;
}

function metaContent(html, name, attribute = 'name') {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const key = firstMatch(tag, new RegExp(`${attribute}=["']([^"']+)["']`, 'i'));
    if (key?.toLowerCase() !== name.toLowerCase()) continue;
    return firstMatch(tag, /content=["']([^"']*)["']/i);
  }
  return null;
}

function linkHref(html, rel) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const relValue = firstMatch(tag, /rel=["']([^"']+)["']/i);
    if (!relValue?.toLowerCase().split(/\s+/).includes(rel.toLowerCase())) continue;
    return firstMatch(tag, /href=["']([^"']+)["']/i);
  }
  return null;
}

function headingTexts(html, level) {
  const matches = [...html.matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi'))];
  return matches.map((match) => stripTags(match[1])).filter(Boolean);
}

function extractLinks(html, baseUrl) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const raw = match[1].trim();
    if (!raw || raw.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(raw)) continue;
    try {
      const resolved = new URL(raw, baseUrl);
      resolved.hash = '';
      links.push(resolved.href);
    } catch {
      // Ignore malformed URLs while keeping the audit running.
    }
  }
  return [...new Set(links)];
}

function extractImages(html, baseUrl) {
  const images = [];
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const tag = match[1];
    const src = firstMatch(tag, /src=["']([^"']+)["']/i);
    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    const width = firstMatch(tag, /width=["']?([^\s"'>]+)/i);
    const height = firstMatch(tag, /height=["']?([^\s"'>]+)/i);
    if (!src) continue;
    let resolved = src;
    try { resolved = new URL(src, baseUrl).href; } catch {}
    images.push({
      src: resolved,
      hasAlt: Boolean(altMatch),
      alt: altMatch?.[1] ?? null,
      width: width || null,
      height: height || null,
      loading: firstMatch(tag, /loading=["']([^"']+)["']/i),
    });
  }
  return images;
}

function extractJsonLd(html) {
  const blocks = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const raw = match[1].trim();
    try {
      const value = JSON.parse(raw);
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) {
        if (item && typeof item === 'object') {
          const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']].filter(Boolean);
          blocks.push({ validJson: true, types, value: item });
        }
      }
    } catch (error) {
      blocks.push({ validJson: false, error: error.message, raw: raw.slice(0, 500) });
    }
  }
  return blocks;
}

async function fetchUrl(url, options = {}) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': 'Soluciones-GEA-SEO-Audit/1.0' },
      signal: AbortSignal.timeout(30000),
      ...options,
    });
    const contentType = response.headers.get('content-type') || '';
    const body = options.method === 'HEAD' ? '' : await response.text();
    return {
      requestedUrl: url,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      contentType,
      elapsedMs: Date.now() - started,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      error: null,
    };
  } catch (error) {
    return {
      requestedUrl: url,
      finalUrl: null,
      status: null,
      ok: false,
      contentType: null,
      elapsedMs: Date.now() - started,
      headers: {},
      body: '',
      error: error.message,
    };
  }
}

function analyzeHtml(page) {
  const html = page.body;
  const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = headingTexts(html, 1);
  const h2 = headingTexts(html, 2);
  const links = extractLinks(html, page.finalUrl || page.requestedUrl);
  const images = extractImages(html, page.finalUrl || page.requestedUrl);
  const jsonLd = extractJsonLd(html);
  return {
    title: title ? stripTags(title) : null,
    titleLength: title ? stripTags(title).length : 0,
    description: metaContent(html, 'description'),
    descriptionLength: metaContent(html, 'description')?.length || 0,
    robots: metaContent(html, 'robots'),
    canonical: linkHref(html, 'canonical'),
    lang: firstMatch(html, /<html\b[^>]*lang=["']([^"']+)["']/i),
    viewport: metaContent(html, 'viewport'),
    openGraph: {
      title: metaContent(html, 'og:title', 'property'),
      description: metaContent(html, 'og:description', 'property'),
      url: metaContent(html, 'og:url', 'property'),
      image: metaContent(html, 'og:image', 'property'),
    },
    h1,
    h2,
    links,
    internalLinks: links.filter((link) => new URL(link).origin === origin),
    externalLinks: links.filter((link) => new URL(link).origin !== origin),
    images,
    imagesWithoutAlt: images.filter((image) => !image.hasAlt).length,
    imagesWithoutDimensions: images.filter((image) => !image.width || !image.height).length,
    jsonLd,
    jsonLdTypes: [...new Set(jsonLd.flatMap((block) => block.types || []))],
    wordCount: stripTags(html).split(/\s+/).filter(Boolean).length,
  };
}

async function crawl() {
  const queue = [new URL('/', origin).href];
  const seen = new Set();
  const pages = [];

  while (queue.length && seen.size < 50) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    const page = await fetchUrl(url);
    const record = {
      requestedUrl: page.requestedUrl,
      finalUrl: page.finalUrl,
      status: page.status,
      ok: page.ok,
      contentType: page.contentType,
      elapsedMs: page.elapsedMs,
      error: page.error,
      analysis: null,
    };
    if (page.contentType?.includes('text/html')) {
      record.analysis = analyzeHtml(page);
      for (const link of record.analysis.internalLinks) {
        const normalized = new URL(link);
        normalized.search = '';
        normalized.hash = '';
        if (!seen.has(normalized.href)) queue.push(normalized.href);
      }
    }
    pages.push(record);
  }
  return pages;
}

function lighthouseSummary(file) {
  return fs.readFile(file, 'utf8').then((text) => {
    const report = JSON.parse(text);
    const categories = Object.fromEntries(
      Object.entries(report.categories || {}).map(([key, value]) => [key, Math.round((value.score || 0) * 100)]),
    );
    const audit = (id) => report.audits?.[id]?.displayValue || report.audits?.[id]?.numericValue || null;
    const failedAudits = Object.values(report.audits || {})
      .filter((item) => item.scoreDisplayMode !== 'notApplicable' && typeof item.score === 'number' && item.score < 0.9)
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .slice(0, 15)
      .map((item) => ({ id: item.id, title: item.title, score: item.score, displayValue: item.displayValue || null }));
    return {
      fetchTime: report.fetchTime,
      requestedUrl: report.requestedUrl,
      finalUrl: report.finalUrl,
      lighthouseVersion: report.lighthouseVersion,
      categories,
      metrics: {
        firstContentfulPaint: audit('first-contentful-paint'),
        largestContentfulPaint: audit('largest-contentful-paint'),
        speedIndex: audit('speed-index'),
        totalBlockingTime: audit('total-blocking-time'),
        cumulativeLayoutShift: audit('cumulative-layout-shift'),
        interactionToNextPaint: audit('interaction-to-next-paint'),
        timeToInteractive: audit('interactive'),
      },
      failedAudits,
    };
  }).catch((error) => ({ error: error.message }));
}

const explicitChecks = [];
for (const path of seedPaths) {
  const page = await fetchUrl(new URL(path, origin).href);
  explicitChecks.push({
    path,
    requestedUrl: page.requestedUrl,
    finalUrl: page.finalUrl,
    status: page.status,
    ok: page.ok,
    contentType: page.contentType,
    elapsedMs: page.elapsedMs,
    bodyPreview: page.body.slice(0, 300),
    headers: page.headers,
    error: page.error,
    analysis: page.contentType?.includes('text/html') ? analyzeHtml(page) : null,
  });
}

const crawlPages = await crawl();
const brokenInternal = crawlPages.filter((page) => page.status === null || page.status >= 400);
const mobile = await lighthouseSummary('audit-output/lighthouse-mobile.json');
const desktop = await lighthouseSummary('audit-output/lighthouse-desktop.json');

const report = {
  generatedAt: new Date().toISOString(),
  target,
  explicitChecks,
  crawl: {
    pageCount: crawlPages.length,
    pages: crawlPages,
    brokenInternal,
  },
  lighthouse: { mobile, desktop },
};

await fs.mkdir('audit-output', { recursive: true });
await fs.writeFile('audit-output/seo-audit.json', JSON.stringify(report, null, 2));

const rootCheck = explicitChecks.find((item) => item.path === '/');
const robotsCheck = explicitChecks.find((item) => item.path === '/robots.txt');
const sitemapCheck = explicitChecks.find((item) => item.path === '/sitemap.xml');
const verificationCheck = explicitChecks.find((item) => item.path === verificationPath);
const privacyCheck = explicitChecks.find((item) => item.path === '/privacidad.html');
const missingCheck = explicitChecks.find((item) => item.path.includes('not-found-check'));

const summaryLines = [
  '# Auditoría SEO remota',
  '',
  `- Objetivo: ${target}`,
  `- Fecha: ${report.generatedAt}`,
  `- Página principal: HTTP ${rootCheck?.status ?? 'ERROR'} — ${rootCheck?.analysis?.title || 'sin título'}`,
  `- Meta description: ${rootCheck?.analysis?.description || 'ausente'}`,
  `- Canonical: ${rootCheck?.analysis?.canonical || 'ausente'}`,
  `- H1: ${rootCheck?.analysis?.h1?.length ?? 0} — ${(rootCheck?.analysis?.h1 || []).join(' | ') || 'ausente'}`,
  `- JSON-LD: ${(rootCheck?.analysis?.jsonLdTypes || []).join(', ') || 'no detectado'}`,
  `- robots.txt: HTTP ${robotsCheck?.status ?? 'ERROR'}`,
  `- sitemap.xml: HTTP ${sitemapCheck?.status ?? 'ERROR'}`,
  `- Archivo de verificación: HTTP ${verificationCheck?.status ?? 'ERROR'}`,
  `- Privacidad: HTTP ${privacyCheck?.status ?? 'ERROR'}`,
  `- URL inexistente: HTTP ${missingCheck?.status ?? 'ERROR'} (debe ser 404)`,
  `- URLs internas rastreadas: ${crawlPages.length}`,
  `- URLs internas rotas: ${brokenInternal.length}`,
  '',
  '## Lighthouse móvil',
  `- Categorías: ${JSON.stringify(mobile.categories || mobile)}`,
  `- Métricas: ${JSON.stringify(mobile.metrics || {})}`,
  '',
  '## Lighthouse escritorio',
  `- Categorías: ${JSON.stringify(desktop.categories || desktop)}`,
  `- Métricas: ${JSON.stringify(desktop.metrics || {})}`,
  '',
  '## Principales auditorías móviles con puntuación inferior a 0,9',
  ...(mobile.failedAudits || []).map((item) => `- ${item.title}: ${item.score} ${item.displayValue || ''}`),
  '',
  '## Principales auditorías de escritorio con puntuación inferior a 0,9',
  ...(desktop.failedAudits || []).map((item) => `- ${item.title}: ${item.score} ${item.displayValue || ''}`),
];

await fs.writeFile('audit-output/summary.md', `${summaryLines.join('\n')}\n`);
console.log(summaryLines.join('\n'));
