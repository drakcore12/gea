# Plan de pruebas — GEA Web

ID: TP-GEA-001  
Versión: 1.0  
Fecha: 2026-09-24

## Alcance
Homepage, páginas de servicios, formulario/contacto, tema/intro, SEO técnico, snapshot local de reseñas/evidencias, release y headers.

## Fuera de alcance
Disponibilidad interna de WhatsApp/Google/Netlify y pruebas intrusivas contra terceros. La veracidad del snapshot se valida editorialmente contra evidencia externa al actualizarlo.

## Riesgos
R-01 XSS/inyección; R-02 secreto expuesto; R-03 lead roto; R-04 SEO roto; R-05 layout móvil; R-06 snapshot de reputación desactualizado; R-07 release/cache mezclado; R-08 accesibilidad.

## Técnicas
Análisis estático, pruebas negativas/fallback, contrato, smoke, revisión responsive y regresión basada en requisitos.

## Suspensión
Se suspende release si existe Critical/Blocker no aceptado, falla el contacto, falla release, canonical/sitemap se corrompen, aparece un secreto o homepage falla.

## Reanudación
Causa corregida + regresión + pipeline verde.

## Entregables
Requisitos, trazabilidad, casos, incidentes, reporte, evidencia CI/deploy.
