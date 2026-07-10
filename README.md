# Soluciones GEA — sitio web

Landing page estática para Soluciones GEA, empresa de servicios técnicos de agua, gas y electricidad en Medellín y el Área Metropolitana.

## Tecnología

- HTML semántico
- CSS responsive con modo claro y oscuro
- JavaScript sin dependencias
- Despliegue en Netlify
- Google Analytics opcional y condicionado al consentimiento

## Archivos principales

- `index.html`: página principal.
- `styles.css`: estructura, componentes y responsive.
- `brand.css`: tipografía, radios, sombras, jerarquía, acentos y motion alineados con el manual de identidad.
- `social.css`: tarjetas de redes sociales.
- `theme.css`: carga la capa de marca y aplica diferencias del modo oscuro.
- `theme-init.js`: aplica el tema antes del primer renderizado.
- `app.js`: tema, menú, WhatsApp, formulario, medición y consentimiento.
- `privacidad.html`: política de privacidad.
- `404.html`: página de error.
- `_headers`: cabeceras de seguridad y caché para Netlify.
- `netlify.toml`: configuración de despliegue y redirecciones.
- `robots.txt` y `sitemap.xml`: indexación.

## Reglas de marca

- Nav en modo claro: imagotipo a color.
- Nav en modo oscuro: imagotipo negativo.
- Footer en ambos modos: imagotipo negativo transparente.
- Azul principal: `#011949`.
- Naranja: `#FE8601`.
- Verde: `#57BB2D`.
- Azul agua: `#005BE7`.
- Manrope: títulos, botones, navegación e interfaz.
- Inter: párrafos, formularios, ayudas y contenido extenso.
- Tarjetas y botones: radio base de 12 px.
- Campos compactos: radio base de 8 px.
- Transiciones de interfaz: 200–300 ms.
- Animación inicial de marca: 0.9 s.
- Toda animación respeta `prefers-reduced-motion`.

## Privacidad

Google Analytics no se carga hasta que el visitante acepta la medición. El formulario no envía información a un backend: prepara un mensaje localmente y abre WhatsApp.

## Validación local

```bash
node --check app.js
node --check theme-init.js
node scripts/check.js
```

## Despliegue

Netlify debe publicar la raíz del repositorio desde la rama `main`. No se requiere comando de compilación.
