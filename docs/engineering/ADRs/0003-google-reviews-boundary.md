# ADR-0003 — Google Reviews detrás de serverless

Estado: sustituido por ADR-0004  
Fecha original: 2026-09-24  
Sustituido: 2026-10-03

## Contexto histórico
Esta decisión introdujo `/api/google-reviews`, Google Places y Google Business Profile detrás de una Netlify Function para mantener credenciales fuera del navegador.

## Motivo de sustitución
La necesidad actual no requiere datos en tiempo real. Mantener una integración externa añadía coste operativo, cuota, latencia, superficie de fallo y complejidad innecesaria para una sección que cambia con poca frecuencia.

## Decisión vigente
Ver **ADR-0004 — Snapshot local de reputación y evidencias**. El runtime ya no consume Google Reviews/Places API y las Functions asociadas se retiran.
