# ADR-0003 — Google Reviews detrás de serverless

Estado: aceptado  
Fecha: 2026-09-24

## Decisión
El navegador consume solo `/api/google-reviews`. La Function mantiene todas las credenciales en Netlify. Cuando existe OAuth aprobado de Google Business Profile, pagina `accounts.locations.reviews.list` hasta recuperar todas las opiniones. Google Places permanece como fallback para rating, enlaces, ubicación, fotos y hasta tres reseñas destacadas.

## Reglas
- ninguna API key, client secret ni refresh token en cliente;
- Business Profile API tiene prioridad cuando está configurada;
- Places funciona como degradación segura;
- el endpoint usa caché CDN corta y durable para limitar cuota sin almacenar datos sensibles en el navegador;
- contenido externo se inserta con `textContent`;
- URLs de navegación controladas por GEA;
- Place ID controlado;
- todas las reseñas disponibles se muestran cuando Business Profile API responde correctamente;
- la UI refresca periódicamente solo con la pestaña visible;
- error externo => fallback, no bloqueo.

## Riesgos residuales
Cuota/coste, latencia, revocación OAuth, disponibilidad de Google y eventual inconsistencia en páginas posteriores del listado de reseñas. Se mitigan con paginación defensiva, caché CDN, fallback, lazy loading y smoke monitoring.
