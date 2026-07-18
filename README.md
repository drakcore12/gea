# Soluciones GEA — sitio web

Sitio estático de Soluciones GEA, empresa de servicios técnicos de agua, gas y electricidad en Medellín y el Área Metropolitana.

## Tecnología

- HTML semántico y páginas estáticas indexables.
- CSS responsive con modo claro y oscuro.
- JavaScript sin dependencias.
- Despliegue en Netlify.
- Google Analytics opcional y condicionado al consentimiento.

## Arquitectura

- `index.html`: página principal.
- `servicios/index.html`: directorio de los siete servicios oficiales.
- `servicios/fugas-de-agua-y-gas-medellin/`: GEA Fugas Express.
- `servicios/mantenimiento-cocinas-comerciales-medellin/`: GEA Cocina Segura.
- `servicios/redes-internas-de-gas-medellin/`: GEA Gas Conforme.
- `servicios/servicios-electricos-comerciales-medellin/`: GEA Eléctrico Comercial.
- `servicios/lavado-de-tanques-medellin/`: GEA Agua Limpia.
- `servicios/bombas-y-presion-de-agua-medellin/`: GEA Presión y Bombas.
- `servicios/gea-care-mantenimiento-preventivo-negocios-medellin/`: planes GEA Care.
- `privacidad.html`: política de privacidad.
- `404.html`: página de error.

## Estilos y scripts

- `styles.css`: estructura, componentes y responsive general.
- `brand.css`: tipografía, radios, sombras, jerarquía y movimiento de marca.
- `social.css`: tarjetas de redes sociales.
- `theme.css`: carga la capa de marca y aplica el modo oscuro.
- `service-pages.css`: componentes de landings, precios, planes, breadcrumbs y enlaces relacionados.
- `theme-init.js`: aplica el tema antes del primer renderizado y enlaza el directorio desde el inicio.
- `app.js`: tema, menú, formulario, medición y consentimiento.
- `service-pages.js`: mensajes de WhatsApp específicos y navegación de servicios.

## SEO local

Cada landing tiene título, descripción, canonical, Open Graph, un solo H1, BreadcrumbList, datos estructurados `Service`, precios públicos desde, preguntas frecuentes y enlaces internos. `sitemap.xml` incluye todas las páginas indexables.

El sitio publica únicamente información comercial. Las tarifas internas por hora, fórmulas, factores de riesgo, márgenes y reglas de redondeo no se exponen.

## Reglas de marca

- Nav claro: imagotipo a color.
- Nav oscuro: imagotipo negativo.
- Footer: imagotipo negativo transparente.
- Azul principal: `#011949`.
- Naranja: `#FE8601`.
- Verde: `#57BB2D`.
- Azul agua: `#005BE7`.
- Manrope para títulos e interfaz; Inter para contenido.

## Validación local

```bash
node --check app.js
node --check theme-init.js
node --check service-pages.js
node scripts/check.js
```

## Despliegue e indexación

Netlify publica la raíz del repositorio desde `main`, sin comando de compilación. Después de cada publicación importante se debe comprobar `sitemap.xml`, inspeccionar las URLs en Google Search Console y solicitar indexación de las páginas prioritarias.
