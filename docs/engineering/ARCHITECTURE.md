# Arquitectura de Soluciones GEA

Estado: vigente  
Última revisión: 2026-09-24

## Propósito
solucionesgea.com se diseña como una web empresarial rápida, segura, indexable y de baja complejidad operativa. No se introduce un framework o backend persistente mientras los requisitos no lo exijan.

## Principios
1. Static-first: HTML, CSS y JavaScript nativos.
2. Serverless only when needed: secretos y llamadas privilegiadas viven en Netlify Functions.
3. No secrets in browser or repository.
4. Progressive enhancement y fallbacks ante terceros.
5. Analytics solo después de consentimiento.
6. Terceros no críticos fuera del camino de carga inicial.
7. Accesibilidad: semántica, teclado, foco y reduced-motion.
8. Netlify es el único despliegue automático de producción.
9. Decisiones estructurales mediante ADR.
10. Todo release pasa quality gates reproducibles.

## Contexto C4
```mermaid
flowchart LR
  U[Visitante] -->|HTTPS| S[solucionesgea.com]
  S -->|contacto iniciado por usuario| W[WhatsApp]
  S -->|lazy /api/google-reviews| N[Netlify Function]
  N -->|API key server-side| G[Google Places]
  N -->|OAuth server-side + paginación| GBP[Google Business Profile]
  S -->|solo con consentimiento| A[Google Analytics]
  GH[GitHub Actions] -->|quality gates| S
```

## Contenedores
### Sitio estático
Contenido, SEO, navegación, formulario, tema, intro, accesibilidad y renderizado de reseñas.

### Netlify Function google-reviews
Lee credenciales desde entorno, consulta Google Places, normaliza un DTO mínimo y nunca expone secretos.

### Pipeline
- `scripts/release.js`: versionado, build metadata, protección de previews.
- `scripts/check.js`: estructura/SEO/release.
- `scripts/quality-gate.js`: arquitectura, seguridad, trazabilidad y mantenibilidad.

## Flujos
### WhatsApp
Los datos del formulario se validan en navegador y se convierten en un mensaje que el usuario decide enviar. GEA no los persiste en backend propio.

### Google Reviews
El navegador solicita `/api/google-reviews` cerca del viewport. La Function consulta Google. El cliente usa `textContent` para contenido externo y URLs controladas para navegación. El mapa es lazy.

### Analytics
Sin consentimiento no se carga Analytics y ninguna funcionalidad principal depende de él.

## Capas frontend
1. Foundation: `styles.css`, `brand.css`, `theme.css`.
2. Domain/page: `service-pages.css`, `service-media.css`.
3. Home base: `home-redesign.css`, `home-gauge-section.css`.
4. Home priority: `home-priority.css`, inyectado por release como última capa explícita.
5. Editorial/motion diferido: `gea-editorial-2026.css`, `gea-motion.css`, `service-icon-sizing.css`, cargados tras la intro.
6. Runtime: `app.js`, `home-redesign.js`, `hero-video.js`, `gea-motion.js`.
7. Critical intro: CSS mínimo embebido deliberadamente.

Regla: no crear una hoja global nueva para corregir un override. Se modifica el archivo propietario o se registra un ADR.

## Límites de confianza
- Browser: manipulable, sin secretos.
- Netlify Function: límite confiable para credenciales.
- Google/WhatsApp/Analytics/Maps: externos; su fallo no debe romper el sitio.
- GitHub Actions: evidencia reproducible, no sustituto de revisión humana.

## Degradación
- Sin JS: la intro no bloquea el contenido.
- Sin Google: fallback al perfil.
- Sin Analytics: sitio funcional.
- Error de ruta: 404 explícito.

## Evolución
Backend persistente, autenticación, pagos, órdenes o inventario requieren nuevo ADR, actualización del threat model y pruebas específicas.
