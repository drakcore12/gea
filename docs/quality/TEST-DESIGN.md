# Diseño de pruebas

ID: TD-GEA-001  
Versión: 1.0

## Condiciones de prueba
- navegación y descubrimiento de servicios;
- contacto por llamada/WhatsApp;
- integridad y disponibilidad del snapshot local de Google Reviews;
- consentimiento de Analytics;
- tema/intro/reduced-motion;
- SEO y datos estructurados;
- headers y límites de confianza;
- release/versionado;
- responsive y accesibilidad.

## Técnicas
- clases válidas/inválidas para formulario;
- boundary values para rating 0..5 y reviewCount >= 0;
- negative testing sin JavaScript y sin conectividad con Google;
- consistencia entre snapshot JSON y contenido HTML;
- structural testing HTML/SEO;
- risk-based regression para P0/P1;
- exploratory testing para geometría responsive y motion.

## Cobertura
Cada condición se enlaza con REQUIREMENTS, TRACEABILITY y TEST-CASES. Un caso manual es válido cuando el atributo no puede demostrarse de forma fiable con el stack sin dependencias, pero debe registrar viewport/navegador/commit.
