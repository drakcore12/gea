# ADR-0003 — Google Reviews detrás de serverless

Estado: aceptado  
Fecha: 2026-09-24

## Decisión
El navegador consume solo `/api/google-reviews`. La Function obtiene la credencial de Netlify, consulta Google Places y devuelve un DTO mínimo.

## Reglas
- ninguna API key en cliente;
- no-store en endpoint;
- contenido externo con `textContent`;
- URLs de navegación controladas por GEA;
- Place ID controlado;
- máximo tres reseñas en la UI;
- error externo => fallback, no bloqueo.

## Riesgos residuales
Cuota/coste, latencia y disponibilidad de Google. Se mitigan con lazy loading, fallback y smoke monitoring.
