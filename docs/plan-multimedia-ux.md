# Plan multimedia y UX — Soluciones GEA

## Objetivo

Usar fotografías, video y evidencia real para explicar qué hace GEA, aumentar confianza y ayudar a personas con poca experiencia digital, sin ralentizar la web ni distraer de la llamada y WhatsApp.

## Prioridad 1 — fotografías esenciales

### 1. Imagen principal de GEA Care

- Técnico GEA conversando con el responsable de un negocio.
- Deben verse elementos reales de agua, gas o electricidad sin representar una emergencia falsa.
- Uniforme y elementos de marca visibles, pero naturales.
- Formato horizontal 16:9.
- Entregar una versión de 1600 × 900 px y otra de 900 × 900 px.
- Exportar en AVIF y WebP, procurando menos de 220 KB por versión.
- Nombre sugerido: `gea-care-chequeo-negocio-medellin`.

### 2. Serie “qué revisamos”

Tres fotografías independientes:

- Agua: revisión visible de grifería, tanque, bomba o fuga.
- Gas: revisión visual segura de llave, punto o red accesible.
- Electricidad: revisión de tablero, breaker o toma accesible.

Formato 4:3, mínimo 1200 × 900 px. Evitar fotografías genéricas de banco de imágenes.

### 3. Equipo y confianza

- Retrato del técnico o equipo principal.
- Foto del vehículo, herramientas y elementos de protección.
- Foto del técnico explicando un hallazgo al cliente.
- Foto del informe técnico digital en un teléfono o tableta.

Estas imágenes deben aparecer cerca del proceso, contacto y GEA Care.

## Prioridad 2 — casos reales

Por cada servicio se necesitan al menos dos casos documentados:

1. Fotografía del problema antes de intervenir.
2. Fotografía del proceso cuando sea segura y útil.
3. Fotografía del resultado final.
4. Municipio o sector general, sin publicar datos privados.
5. Descripción de 40 a 80 palabras: problema, diagnóstico, solución y recomendación.
6. Testimonio autorizado cuando exista.

Servicios prioritarios:

- Fugas Express.
- Eléctrico Comercial.
- Gas Conforme.
- Cocina Segura.
- Presión y Bombas.
- Agua Limpia.

Los pares antes/después deben mantener el mismo ángulo y encuadre. No alterar fotografías para exagerar resultados.

## Prioridad 3 — video explicativo

### Video principal de GEA Care

- Duración: 35 a 50 segundos.
- Formato horizontal 16:9 para la web.
- Versión vertical 9:16 para redes sociales.
- Explicar: qué revisamos, qué recibe el cliente y qué no incluye el plan.
- Incluir subtítulos incrustados y archivo de subtítulos separado.
- No reproducir automáticamente.
- Usar imagen de portada clara con botón “Ver cómo funciona”.
- Peso web recomendado: menos de 5 MB.
- Formatos: MP4 H.264 y WebM.

Guion orientativo:

1. “Una falla pequeña puede detener un negocio”.
2. “GEA Care revisa puntos visibles de agua, gas y electricidad”.
3. “Registramos hallazgos y recomendaciones”.
4. “Elija el plan según tamaño y puntos críticos”.
5. “Las reparaciones y materiales se cotizan por separado”.
6. CTA: “Consulte su plan por WhatsApp”.

### Videos cortos por servicio

- Duración: 15 a 25 segundos.
- Una pregunta y una respuesta por video.
- Ejemplos: “¿Por qué se dispara un breaker?”, “¿Qué puede causar baja presión?”, “¿Cuándo revisar una trampa de grasa?”.
- Siempre con subtítulos y sin música que impida entender la voz.

## Prioridad 4 — recursos visuales de apoyo

- Diagrama simple del Chequeo Integral GEA: agua, gas y electricidad → hallazgos → informe → recomendaciones.
- Ejemplo anonimizado del informe técnico digital.
- Infografía “qué cuenta como punto crítico”.
- Mapa simplificado de cobertura, sin sustituir el mapa real.
- Iconos consistentes para agua, gas, electricidad, prevención, informe y llamada.

## Reglas de accesibilidad

- Toda imagen informativa debe tener texto alternativo concreto.
- Las imágenes decorativas deben usar `alt=""`.
- Cada video debe incluir controles, subtítulos y transcripción.
- No comunicar información únicamente con color.
- No usar texto pequeño dentro de fotografías.
- Evitar destellos, movimiento rápido y reproducción automática.
- Mantener controles de pausa cuando exista animación.

## Reglas de rendimiento y SEO

- Usar AVIF como primera opción y WebP como respaldo.
- Declarar `width` y `height` para evitar saltos de diseño.
- Cargar de forma diferida todo lo que esté debajo del primer pantallazo.
- La imagen principal puede usar `fetchpriority="high"`; las demás deben usar `loading="lazy"`.
- Añadir títulos y pies de foto cuando aporten contexto local o técnico.
- Crear una URL propia para cada caso real importante.
- Añadir `VideoObject` únicamente cuando el video exista y sea visible en la página.
- No usar videos de fondo ni carruseles automáticos.

## Lista mínima para la primera producción

- 1 fotografía principal de GEA Care.
- 3 fotografías de revisión: agua, gas y electricidad.
- 1 fotografía del técnico o equipo.
- 1 fotografía del informe digital.
- 6 casos antes/después, uno por servicio puntual.
- 1 video explicativo de GEA Care.
- 3 videos cortos: fuga, falla eléctrica y gas.

Con este paquete la web puede mostrar evidencia real sin llenar la página de elementos pesados o decorativos.
