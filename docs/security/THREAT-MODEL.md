# Modelo de amenazas — Soluciones GEA

Versión: 1.0 — 2026-09-24

## Activos
Disponibilidad/reputación, API key Google, integridad SEO, datos pre-envío a WhatsApp, consentimiento y pipeline.

## Límites
1. visitante ↔ navegador;
2. navegador ↔ Netlify;
3. Function ↔ Google;
4. GitHub Actions ↔ Netlify;
5. navegador ↔ WhatsApp/Analytics/Maps.

| ID | Amenaza | Control |
| --- | --- | --- |
| T-01 | XSS desde reseñas/entrada | textContent, URLs controladas, CSP, CodeQL |
| T-02 | API key expuesta | Netlify.env, gate, server-side |
| T-03 | abuso de key | restricción API/cuota |
| T-04 | clickjacking | frame-ancestors none + DENY |
| T-05 | MIME confusion | nosniff |
| T-06 | downgrade | HSTS + upgrade-insecure-requests |
| T-07 | fuga referrer | strict-origin-when-cross-origin |
| T-08 | permisos innecesarios | Permissions-Policy |
| T-09 | Google caído | fallback + lazy |
| T-10 | analytics sin permiso | consent gating |
| T-11 | release mezclado | asset version + build id |
| T-12 | cambio inseguro | CI + CodeQL + ADR |
| T-13 | contenido técnico peligroso | revisión editorial |
| T-14 | deploy dual | Netlify único automático |

El formulario no se persiste en infraestructura propia. Nunca registrar sus valores en Analytics.

Un secreto expuesto debe rotarse aunque se elimine después del código.

Actualizar ante auth, almacenamiento, pagos, base de datos, uploads, panel o nuevo proveedor con credenciales.
