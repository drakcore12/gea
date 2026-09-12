# Soluciones GEA

Sitio web estático de Soluciones GEA para captación local de servicios técnicos en Medellín y el Valle de Aburrá.

## Enfoque comercial actual

La web prioriza tres intenciones de búsqueda y conversión:

- `servicios/electricista-medellin/`: electricista en Medellín para hogares, negocios y empresas.
- `servicios/plomero-fugas-agua-medellin/`: plomería y fugas de agua en Medellín.
- `servicios/gas-medellin/`: revisión, adecuación y servicios relacionados con gas en Medellín.

La oferta comercial visible ya no incluye planes GEA Care. La estrategia actual prioriza servicios puntuales, diagnóstico, reparación, instalaciones y contacto directo por llamada o WhatsApp.

## Arquitectura

- HTML, CSS y JavaScript sin framework.
- JavaScript sin dependencias.
- Despliegue en Netlify.
- Google Analytics opcional y condicionado al consentimiento.
- SEO local mediante páginas por intención de servicio, datos estructurados, sitemap y enlazado interno.

## Páginas de servicios especializados

- `servicios/servicios-electricos-comerciales-medellin/`: electricidad comercial.
- `servicios/fugas-de-agua-y-gas-medellin/`: diagnóstico de fugas.
- `servicios/redes-internas-de-gas-medellin/`: redes internas de gas.
- `servicios/lavado-de-tanques-medellin/`: lavado de tanques.
- `servicios/bombas-y-presion-de-agua-medellin/`: bombas y presión de agua.
- `servicios/mantenimiento-cocinas-comerciales-medellin/`: mantenimiento técnico para cocinas comerciales.

## Multimedia SEO temporal

Las imágenes de electricidad, agua y gas ubicadas en `assets/img/seo/` son ilustrativas. Se deben reemplazar progresivamente con fotografías reales de trabajos de Soluciones GEA, conservando nombres de archivo, dimensiones optimizadas y textos alternativos descriptivos.

## Ecommerce futuro

La futura tienda debe mantenerse separada de la intención de servicio usando una arquitectura `/tienda/`, por ejemplo:

- `/tienda/electricidad/`
- `/tienda/agua-y-plomeria/`
- `/tienda/gas/`
- `/tienda/medidores-y-contadores/`
- `/tienda/repuestos/`

Esto permitirá vender repuestos, contadores o medidores nuevos y usados, bombas, componentes y accesorios sin canibalizar las páginas SEO de servicios.

## Validación local

```bash
node --check app.js
node --check theme-init.js
node --check service-pages.js
node scripts/check.js
```
