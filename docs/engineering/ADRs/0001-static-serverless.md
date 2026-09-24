# ADR-0001 — Static-first con serverless mínimo

Estado: aceptado  
Fecha: 2026-09-24

## Contexto
GEA requiere SEO local, contenido, contacto e integraciones puntuales; no necesita cuentas, base de datos ni transacciones propias.

## Decisión
HTML/CSS/JS nativos como núcleo y Netlify Functions únicamente para operaciones que requieren secretos o aislamiento del navegador.

## Consecuencias
Positivas: menor superficie de ataque, coste y complejidad; excelente cacheabilidad y SEO.  
Negativas: interacciones complejas exigen disciplina DOM; persistencia futura requerirá reevaluación.

## Revisión
Revisar ante autenticación, pagos, órdenes, inventario, almacenamiento de leads o lógica transaccional.
