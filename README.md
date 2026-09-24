# Soluciones GEA

Sitio web de captación local para servicios técnicos de electricidad, plomería/agua y gas en Medellín y el Valle de Aburrá.

## Arquitectura
- HTML/CSS/JavaScript nativos.
- Sin framework ni dependencias runtime.
- Netlify como único despliegue automático de producción.
- Netlify Functions para operaciones con secretos.
- Analytics condicionado al consentimiento.
- SEO local con páginas por intención, JSON-LD, sitemap y enlazado.
- Progressive enhancement y fallbacks.

Ver `docs/engineering/ARCHITECTURE.md`.

## Ingeniería y calidad
El repositorio versiona:
- requisitos;
- ADR;
- modelo de calidad alineado con ISO/IEC 25010:2023;
- estrategia de pruebas alineada con ISO/IEC/IEEE 29119-2:2021;
- documentación de pruebas alineada con el propósito de ISO/IEC/IEEE 29119-3:2021;
- trazabilidad, casos e incidentes;
- threat model;
- release/rollback.

La alineación es interna y no implica certificación ISO.

## QA local
```bash
node --check app.js
node --check theme-init.js
node --check service-pages.js
node --check home-redesign.js
node --check scripts/release.js
node --check scripts/check.js
node scripts/verify.js
# Simulación completa de producción:
node scripts/verify.js --release
```

## CI
- Quality checks: ejecuta el mismo pipeline unificado que producción.
- Netlify: ejecuta el release liviano de producción con `node scripts/release.js`.
- Las verificaciones ampliadas quedan en QA/CI para no convertir una web publicitaria en un pipeline innecesariamente pesado.
- CodeQL security: push/PR + semanal.
- Production smoke: diario/manual.
- GitHub Pages: preview manual, no producción.

## Documentación
- `docs/quality/REQUIREMENTS.md`
- `docs/quality/QUALITY-MODEL-ISO25010.md`
- `docs/quality/TEST-STRATEGY-ISO29119.md`
- `docs/quality/TRACEABILITY.md`
- `docs/security/THREAT-MODEL.md`
- `docs/operations/RELEASE-ROLLBACK.md`
- `SECURITY.md`
- `CONTRIBUTING.md`

## Ecommerce futuro
`/tienda/` permanecerá separado de servicios. Backend, auth, pagos o persistencia requieren ADR, threat model y pruebas específicas.
