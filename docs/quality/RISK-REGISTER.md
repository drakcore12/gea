# Registro de riesgos de calidad

Versión: 1.0 — 2026-09-24

| ID | Riesgo | Probabilidad | Impacto | Prioridad | Controles | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | XSS/inyección | Baja | Crítico | P0 | textContent, CSP, CodeQL, gate | Mitigado/monitor |
| R-02 | Secreto expuesto | Baja | Crítico | P0 | Netlify.env, secret scan, gate | Mitigado/monitor |
| R-03 | Contacto/lead roto | Media | Alto | P0 | repository tests, manual, smoke | Monitor |
| R-04 | SEO técnico roto | Media | Alto | P1 | check.js, sitemap/canonical tests | Monitor |
| R-05 | Regresión responsive/accesibilidad | Media | Alto | P1 | matriz manual + static checks | Monitor |
| R-06 | Google Places no disponible/cuota | Media | Medio | P1 | fallback, lazy, smoke | Aceptado con mitigación |
| R-07 | Release/cache inconsistente | Baja | Alto | P1 | versionado + verify --release | Mitigado |
| R-08 | Barrera de accesibilidad | Media | Alto | P1 | labels, teclado, foco, reduced-motion | Monitor |

## Regla de tratamiento
P0 bloquea release. P1 exige mitigación o aceptación explícita documentada. Todo riesgo nuevo recibe ID estable y se enlaza en trazabilidad.
