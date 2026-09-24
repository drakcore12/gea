# Requisitos verificables — Soluciones GEA

Versión: 1.0 — 2026-09-24

## Funcionales
- **FR-001** Descubrir servicios principales y especializados en páginas indexables.
- **FR-002** Iniciar solicitud por WhatsApp con datos del formulario.
- **FR-003** Iniciar llamada desde enlaces publicados.
- **FR-004** Mostrar horarios y atención de emergencias claramente.
- **FR-005** Mostrar rating, total y hasta tres reseñas de Google cuando esté disponible.
- **FR-006** Abrir directamente el flujo de Google para escribir opinión.
- **FR-007** Abrir perfil/ubicación/direcciones de Google.
- **FR-008** Tema automático/manual sin bloquear contenido.
- **FR-009** Intro visible, omitible y compatible con teclado/reduced-motion.
- **FR-010** Analytics solo después de consentimiento.

## No funcionales
- **NFR-001** Cero secretos operativos en bundle/repositorio.
- **NFR-002** Datos de usuario/terceros no llegan a sinks HTML ejecutables sin control.
- **NFR-003** Responsive desde 320 px sin overflow horizontal estructural.
- **NFR-004** Controles operables por teclado, con nombre accesible y foco visible.
- **NFR-005** Maps/Reviews/Analytics fuera del camino crítico inicial.
- **NFR-006** Degradación segura ante fallo de JS/Google/Analytics.
- **NFR-007** Assets locales versionados por deploy.
- **NFR-008** CSP, HSTS, nosniff, Referrer-Policy y Permissions-Policy.
- **NFR-009** Límites de tamaño/complejidad definidos por quality gate.
- **NFR-010** Sin runtime global muerto y decisiones estructurales mediante ADR.

## SEO
- **SEO-001** Página indexable con title, description, canonical y un H1.
- **SEO-002** Canonical incluido en sitemap.
- **SEO-003** JSON-LD válido.
- **SEO-004** Intenciones de servicio diferenciadas y enlazado útil.

## Operación
- **OPS-001** Netlify único deploy automático de producción.
- **OPS-002** Release reproducible con `scripts/release.js`.
- **OPS-003** Artefacto post-release supera `scripts/check.js`.
- **OPS-004** Smoke periódico de producción.

## QA
- **QA-001** Push/PR ejecuta sintaxis, tests, gate, source check y release simulation.
- **QA-002** Blocker/Critical conocido bloquea release.
- **QA-003** High de seguridad/reliability bloquea release o exige aceptación de riesgo documentada.
- **QA-004** Cada requisito posee método de verificación trazable.
- **QA-005** Cambio de arquitectura/seguridad/proveedor actualiza documentación aplicable.
