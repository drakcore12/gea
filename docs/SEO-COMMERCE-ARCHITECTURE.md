# Arquitectura SEO comercial — Soluciones GEA

## Objetivo actual

La captación orgánica local se organiza alrededor de tres páginas pilar:

1. `/servicios/electricista-medellin/`
2. `/servicios/plomero-fugas-agua-medellin/`
3. `/servicios/gas-medellin/`

Las páginas especializadas de servicios deben enlazar hacia una o más de estas páginas pilar. El hub `/servicios/` enlaza primero a los tres pilares y después a los servicios específicos.

## Regla de intención de búsqueda

No mezclar en una sola URL intenciones comerciales distintas si pueden competir entre sí.

- Electricidad: electricista, fallas, breakers, tableros, tomas, iluminación, instalaciones.
- Agua/plomería: plomero, fugas de agua, tuberías, sanitarios, griferías, bombas y presión.
- Gas: redes internas, puntos, conexiones, fugas, adecuaciones y cocinas comerciales.

Las páginas especializadas pueden atacar búsquedas de cola larga, pero deben devolver autoridad mediante enlaces internos hacia el pilar correspondiente.

## Ecommerce futuro

La tienda no debe compartir las mismas URLs de servicios. Se reserva el namespace `/tienda/` para separar intención de servicio e intención de compra.

Estructura recomendada:

- `/tienda/`
- `/tienda/electricidad/`
- `/tienda/agua-y-plomeria/`
- `/tienda/gas/`
- `/tienda/medidores-y-contadores/`
- `/tienda/repuestos/`
- `/tienda/producto/<slug>/`

Para productos nuevos y usados se debe almacenar y mostrar de forma explícita:

- estado: nuevo/usado/reacondicionado cuando aplique;
- marca y referencia;
- SKU interno;
- precio y moneda;
- inventario/disponibilidad;
- fotografías reales del artículo;
- especificaciones técnicas;
- compatibilidad;
- garantía y condiciones de devolución;
- entrega, envío o recogida;
- procedencia y trazabilidad cuando corresponda.

Cuando la tienda se publique, usar datos estructurados `Product`, `Offer` y, cuando aplique, `AggregateRating`. No publicar páginas vacías ni categorías sin inventario solo para posicionar palabras clave.

## Conexión servicios ↔ tienda

La tienda debe apoyar el negocio de servicios sin canibalizarlo. Ejemplos:

- una página de electricista puede enlazar a breakers, tomas o luminarias relevantes;
- una página de plomería puede enlazar a válvulas, griferías, bombas o repuestos;
- una página de gas puede enlazar únicamente a componentes cuya venta sea legal y adecuada para el alcance del negocio;
- una ficha de producto puede ofrecer `¿Necesita instalación?` y enlazar a la página pilar correspondiente.

Los enlaces deben ser contextuales y útiles; no insertar catálogos completos dentro de las páginas de servicio.

## Próximos clusters locales

Después de consolidar las tres páginas pilar en Medellín, crear páginas geográficas solamente cuando exista contenido y demanda suficientes. Prioridad sugerida: Bello, Envigado y Sabaneta. Evitar páginas clonadas que solo cambien el nombre del municipio.
