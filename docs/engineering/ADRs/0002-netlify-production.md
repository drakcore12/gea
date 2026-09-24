# ADR-0002 — Netlify como único despliegue automático de producción

Estado: aceptado  
Fecha: 2026-09-24

## Contexto
El dominio, Functions, headers, redirects y release dependen de Netlify. Un segundo deploy automático en GitHub Pages crea ambigüedad.

## Decisión
Netlify es el único runtime de producción. GitHub Pages queda como preview manual opcional.

## Consecuencias
Una fuente de verdad, un artefacto de release y menor riesgo de diferencias de configuración.
