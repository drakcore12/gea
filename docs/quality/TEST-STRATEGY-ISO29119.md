# Estrategia de pruebas — alineación ISO/IEC/IEEE 29119

Versión 1.0 — 2026-09-24

GEA adopta los principios públicos de ISO/IEC/IEEE 29119-2:2021 para gobernar/gestionar/implementar pruebas y organiza artefactos según el propósito de ISO/IEC/IEEE 29119-3:2021. No reproduce plantillas propietarias ni declara certificación.

## Riesgo
P0: secretos, XSS, caída de sitio, contacto roto, release corrupto.  
P1: Google Reviews, navegación, SEO, responsive, consentimiento.  
P2: motion y detalle visual.

## Capas
- Static: `scripts/check.js`.
- Engineering gate: `scripts/quality-gate.js`.
- Repository tests: Node test runner.
- Release integration: release + post-check.
- Security: CodeQL.
- Production: smoke programado.
- Manual/exploratory: responsive, teclado, intro, tema y formularios.

## Entrada
Requisito/bug entendido, archivos identificados, sin secretos y cambio reproducible.

## Salida
CI verde; tests/gates verdes; sin Critical nuevo; UI revisada si cambió; ADR/threat model actualizados cuando aplique.

## Evidencia
Commit SHA, GitHub Actions, deploy Netlify, logs de scripts y evidencia manual con viewport/navegador.

## Incidentes
Todo defecto que alcance producción se registra con impacto, reproducción, causa, corrección y prueba de regresión.
