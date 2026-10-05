# ADR-0005 — Cinco reseñas y avatares resilientes

Estado: vigente para la sección de reseñas; actualiza ADR-0004  
Fecha: 2026-10-05

La página conserva las tres opiniones verificadas del HTML mientras consulta
Google Places mediante `/api/google-reviews`. Frontend y función limitan la
lista a cinco reseñas únicas. Las consultas independientes tienen un timeout
de ocho segundos; una consulta fallida no descarta las respuestas válidas.

Las fotos usan primero el proxy del mismo origen. Si falla, el navegador
intenta la URL HTTPS de Google, validada contra googleusercontent.com y sus
subdominios. La CSP permite únicamente esos hosts adicionales para imágenes.
La petición de foto no envía referrer. Las iniciales permanecen visibles durante
la carga y después de un fallo definitivo, sin bucles de reintento.

Validación: pruebas de recuperación ante fallo de la API legacy, límite de cinco
y secuencia de recuperación de avatares. La verificación general sigue limitada
por problemas previos: presupuesto de líneas CSS y validación de rutas `/api/`
como si fueran archivos locales.
