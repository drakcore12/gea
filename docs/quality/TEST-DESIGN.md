# Diseño de pruebas

ID: TD-GEA-001  
Versión: 1.0

## Condiciones de prueba
- navegación y descubrimiento de servicios;
- contacto por llamada/WhatsApp;
- disponibilidad y fallback de Google Reviews;
- consentimiento de Analytics;
- tema/intro/reduced-motion;
- SEO y datos estructurados;
- headers y límites de confianza;
- release/versionado;
- responsive y accesibilidad.

## Técnicas
- clases válidas/inválidas para formulario;
- boundary values para rating 0..5 y reviewCount >= 0;
- negative testing cuando Google falla;
- contract testing del DTO público;
- structural testing HTML/SEO;
- risk-based regression para P0/P1;
- exploratory testing para geometría responsive y motion.

## Cobertura
Cada condición se enlaza con REQUIREMENTS, TRACEABILITY y TEST-CASES. Un caso manual es válido cuando el atributo no puede demostrarse de forma fiable con el stack sin dependencias, pero debe registrar viewport/navegador/commit.
