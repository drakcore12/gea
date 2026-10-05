# Modelo de amenazas — Soluciones GEA

Versión: 1.1 — 2026-10-03

## Activos
Disponibilidad/reputación, integridad del snapshot de reseñas, integridad SEO, datos pre-envío a WhatsApp, consentimiento y pipeline.

## Límites
1. visitante ↔ navegador;
2. navegador ↔ Netlify;
3. GitHub Actions ↔ Netlify;
4. navegador ↔ WhatsApp/Analytics/Google mediante acciones explícitas.

| ID | Amenaza | Control |
| --- | --- | --- |
| T-01 | Manipulación/falsificación del snapshot de reseñas | snapshot versionado, revisión humana, pruebas de regresión, fecha visible |
| T-02 | Secreto expuesto | no existen credenciales de Google Reviews; secret scan + gate |
| T-03 | Dependencia externa rompe reputación visible | rating/reseñas/evidencias locales en HTML/assets |
| T-04 | clickjacking | frame-ancestors none + DENY |
| T-05 | MIME confusion | nosniff |
| T-06 | downgrade | HSTS + upgrade-insecure-requests |
| T-07 | fuga referrer | strict-origin-when-cross-origin |
| T-08 | permisos innecesarios | Permissions-Policy |
| T-09 | enlaces externos no disponibles | contenido principal permanece funcional |
| T-10 | analytics sin permiso | consent gating |
| T-11 | release mezclado | asset version + build id |
| T-12 | cambio inseguro | CI + CodeQL + ADR |
| T-13 | contenido técnico peligroso | revisión editorial |
| T-14 | deploy dual | Netlify único automático |

El formulario no se persiste en infraestructura propia. Nunca registrar sus valores en Analytics.

Un secreto expuesto debe rotarse aunque se elimine después del código.

Actualizar ante auth, almacenamiento, pagos, base de datos, uploads, panel o nuevo proveedor con credenciales.
