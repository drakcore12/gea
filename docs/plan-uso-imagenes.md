# Plan de uso de fotografías reales — Soluciones GEA

Fecha de revisión: 21 de julio de 2026.

## Hallazgo principal

Las 23 fotografías no representan los siete servicios de Soluciones GEA. La colección documenta principalmente una intervención eléctrica semiindustrial con maquinaria, cableado, equipos y obra civil asociada.

Por esa razón, las imágenes se clasifican bajo **GEA Eléctrico Comercial** y no deben utilizarse para representar fugas, gas, cocinas comerciales, lavado de tanques o sistemas de presión.

## Resultado de la selección

- **Clase A — destacada:** 1 fotografía, P08.
- **Clase B — publicable:** 13 fotografías.
- **Clase C — documental:** 7 fotografías archivadas, no destinadas a publicación inicial.
- **Clase D — descartada:** 2 fotografías, P18 y P21, eliminadas porque no muestran un trabajo técnico reconocible.

La fuente de verdad para el sitio es `assets/images.json`.

## Uso en la página principal

Usar inicialmente una sola fotografía del caso:

- `gea-electrico-comercial-sistema-industrial-contexto-01.jpeg`

Puede aparecer en la sección **Trabajos reales** como caso de servicio eléctrico semiindustrial. No debe utilizarse como hero general de agua, gas y electricidad, porque no representa las tres líneas de negocio.

Texto sugerido:

> Intervención eléctrica en instalación semiindustrial
>
> Revisión de equipos, cableado e instalación técnica asociada.

No afirmar que hubo certificación, reparación terminada, ahorro energético o resultado medido si esos datos no están documentados.

## Landing GEA Eléctrico Comercial

### Imagen principal

- P08 — `gea-electrico-comercial-sistema-industrial-contexto-01.jpeg`

### Diagnóstico

- P04 — equipo eléctrico industrial.
- P12 — conexión eléctrica.
- P16 — cableado y conexión eléctrica.

### Proceso

- P05 — mantenimiento eléctrico.
- P07 — instalación y reparación de cableado.
- P13 — instalación técnica.
- P14 — instalación en muro.
- P17 — reparación eléctrica.
- P22 — instalación técnica en muro.

### Detalles

- P03 — cableado eléctrico industrial.
- P20 — equipo eléctrico.
- P23 — detalle de instalación en muro.

### Contexto complementario

- P10 — maquinaria e instalación industrial.

Mostrar un máximo inicial de cinco fotografías en la landing: una principal, dos de proceso y dos detalles. El resto puede emplearse en un caso de estudio o galería filtrada.

## Caso real para SEO

La secuencia puede convertirse en un solo caso de estudio con esta estructura:

1. Contexto de la instalación semiindustrial.
2. Elementos eléctricos observados.
3. Revisión de equipos y conexiones.
4. Trabajo de cableado e instalación asociado.
5. Recomendaciones de mantenimiento y seguridad.

No presentar las fotografías como una comparación antes/después, porque la secuencia visual no demuestra con certeza un estado inicial y un resultado final equivalente.

## Uso en GEA Care

Estas fotografías pueden demostrar únicamente la parte eléctrica de una inspección preventiva. Para representar GEA Care correctamente todavía se necesitan fotografías reales adicionales de:

- Revisión de puntos de agua.
- Revisión visual de gas.
- Informe o checklist de visita.
- Técnico identificado usando EPP adecuado.

## Fotografías que todavía hacen falta

1. Fuga visible, proceso y reparación terminada.
2. Red o punto de gas: diagnóstico y adecuación.
3. Cocina comercial, desagüe o trampa de grasa.
4. Lavado y desinfección de tanque.
5. Bomba, flotador o sistema de presión.
6. Inspección GEA Care en agua, gas y electricidad.
7. Fotografías horizontales limpias con técnico identificado y EPP.

## Revisión obligatoria antes de publicar

Aunque la clasificación ya está hecha, cada fotografía marcada como `requires-final-human-check` debe revisarse a resolución completa antes de incorporarla al HTML para confirmar:

- Ausencia de rostros, placas, direcciones, documentos y teléfonos.
- Uso seguro de herramientas y elementos de protección.
- Ausencia de prácticas que puedan interpretarse como inseguras.
- Autorización para publicar el espacio del cliente.
- Correspondencia entre el texto comercial y lo que realmente demuestra la imagen.

## Tratamiento técnico pendiente

Para las fotografías aprobadas:

- Eliminar EXIF y posibles coordenadas GPS.
- Generar AVIF y WebP sin sobrescribir el JPEG clasificado.
- Hero: hasta 1600 × 900 y menos de 220 KB.
- Tarjeta: hasta 1200 × 900 y menos de 160 KB.
- Miniatura: 640 × 480 y menos de 80 KB.
- Declarar `width` y `height`.
- Usar `loading="lazy"` fuera del primer viewport.
- Usar `fetchpriority="high"` únicamente en la imagen principal.
- Crear `srcset` para móvil y escritorio.
- No repetir la misma fotografía en múltiples secciones.

## Regla de implementación

El frontend debe publicar únicamente imágenes con:

```json
{
  "publish": true,
  "privacy": "approved"
}
```

Actualmente las seleccionadas conservan `privacy: "requires-final-human-check"`; por tanto, todavía no deben incorporarse automáticamente al sitio hasta completar esa última validación humana de privacidad y seguridad.
