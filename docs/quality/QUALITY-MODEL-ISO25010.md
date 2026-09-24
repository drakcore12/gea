# Modelo de calidad — alineación ISO/IEC 25010:2023

GEA usa ISO/IEC 25010:2023 como referencia interna de calidad de producto. No constituye certificación ni declaración auditada de conformidad.

| Característica | Aplicación en GEA | Evidencia |
| --- | --- | --- |
| Functional suitability | Flujos comerciales cumplen requisitos | requisitos + trazabilidad + tests |
| Performance efficiency | lazy third-party, assets versionados | release + PageSpeed |
| Compatibility | estándares web y progressive enhancement | static/browser review |
| Interaction capability | teclado, semántica, labels, foco, reduced-motion | tests + manual |
| Reliability | fallos externos no rompen contenido principal | fallbacks + smoke |
| Security | secretos server-side, CSP, CodeQL | gate + threat model |
| Maintainability | ADR, CI, límites de tamaño | quality gate |
| Flexibility | bajo acoplamiento y plataforma web | arquitectura/ADR |
| Safety | no inducir prácticas técnicas peligrosas | revisión editorial |

## Objetivos internos
- 0 secretos en fuente actual.
- 0 fallos de quality gate.
- 0 Blocker/Critical conocidos antes de release.
- 100% requisitos trazados.
- 100% páginas indexables con metadata obligatoria.
- 100% `target="_blank"` protegido.
- JSON-LD parseable.
- headers defensivos presentes.
- JS aplicación <=1100 líneas; CSS <=2000 salvo excepción documentada.
- Reviews/Maps fuera de carga crítica.

Estos objetivos son criterios GEA, no valores prescritos por ISO.
