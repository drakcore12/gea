# ADR-0004 — Snapshot local de reputación y evidencias

Estado: aceptado  
Fecha: 2026-10-03

## Contexto
Soluciones GEA necesita conservar en la web la prueba social visible —rating, total de calificaciones, reseñas destacadas, ubicación y evidencias— sin depender de una API de Google para renderizar la página.

## Decisión
- conservar rating, total y reseñas verificadas en `data/google-reviews.snapshot.json`;
- renderizar las reseñas directamente en HTML para que sean visibles sin JavaScript;
- mostrar de forma explícita el mes de verificación y que el contenido no es tiempo real;
- mantener enlaces al perfil oficial, escritura de reseña y direcciones como navegación iniciada por el usuario;
- servir evidencias desde assets locales versionados;
- eliminar `/api/google-reviews`, `/api/google-photo` y sus credenciales/runtime;
- no usar el snapshot como afirmación de actualización automática.

## Consecuencias
### Positivas
- menor latencia y menos JavaScript;
- cero cuota o disponibilidad de Google para renderizar reputación;
- mejor degradación y reproducibilidad;
- menor superficie de secretos y de red;
- contenido de reputación disponible incluso con JavaScript deshabilitado.

### Trade-off
El snapshot puede quedar desactualizado. Se mitiga mostrando la fecha de verificación y un enlace directo al perfil oficial. Una actualización del snapshot debe basarse en evidencia verificada y actualizar datos + HTML + pruebas en el mismo cambio.

## Regla de integridad
Nunca aumentar rating, cantidad o alterar el texto de una reseña sin una fuente verificable. La interfaz debe distinguir siempre entre snapshot local y datos en tiempo real.
