# Release y rollback

## Fuente de verdad
GitHub drakcore12/gea, branch main.

## Producción
Netlify soluciones-gea es el único despliegue automático de producción.

## Pipeline
1. cambio/PR;
2. Quality checks;
3. CodeQL;
4. main;
5. Netlify ejecuta release.js;
6. publicación;
7. smoke.

## Gates
Syntax, repository tests, quality-gate, check fuente, release simulation y check post-release.

## Rollback
1. identificar último deploy sano;
2. restaurarlo o revertir commit;
3. comprobar homepage, contacto y headers;
4. ejecutar smoke;
5. registrar incidente/causa;
6. añadir prueba de regresión.

Nunca editar producción manualmente fuera del repositorio.

Rollback inmediato ante caída homepage, contacto inutilizable, secreto expuesto, headers defensivos ausentes, XSS explotable o corrupción de contenido legal/identidad.
