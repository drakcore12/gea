from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "img"
ORIGINALS = IMG / "originals" / "2026-06-20"
SERVICE_DIR = IMG / "services" / "electrico-comercial"
DOCS = ROOT / "docs"

PHOTOS = [
    {"id":"P01","original":"WhatsApp Image 2026-06-20 at 8.21.06 PM.jpeg","service":"sin-clasificar","stage":"contexto","subject":"estructura industrial","propertyType":"semiindustrial","orientation":"vertical","quality":"C","status":"archivo","publish":False,"privacy":"approved"},
    {"id":"P02","original":"WhatsApp Image 2026-06-20 at 8.21.07 PM (1).jpeg","service":"electrico-comercial","stage":"contexto","subject":"equipo industrial","propertyType":"semiindustrial","orientation":"vertical","quality":"C","status":"archivo","publish":False,"privacy":"approved"},
    {"id":"P03","original":"WhatsApp Image 2026-06-20 at 8.21.07 PM (2).jpeg","service":"electrico-comercial","stage":"detalle","subject":"cableado industrial","propertyType":"semiindustrial","orientation":"vertical","quality":"B","status":"seleccionada","publish":True,"privacy":"approved","newName":"gea-electrico-comercial-cableado-detalle-01.webp","alt":"Detalle de cableado eléctrico en equipo industrial atendido por Soluciones GEA"},
    {"id":"P04","original":"WhatsApp Image 2026-06-20 at 8.21.07 PM.jpeg","service":"electrico-comercial","stage":"diagnostico","subject":"equipo eléctrico industrial","propertyType":"semiindustrial","orientation":"vertical","quality":"B","status":"seleccionada","publish":True,"privacy":"approved","newName":"gea-electrico-comercial-equipo-diagnostico-01.webp","alt":"Diagnóstico de un equipo eléctrico industrial realizado por Soluciones GEA"},
    {"id":"P05","original":"WhatsApp Image 2026-06-20 at 8.21.08 PM (1).jpeg","service":"electrico-comercial","stage":"proceso","subject":"mantenimiento eléctrico","propertyType":"semiindustrial","orientation":"vertical","quality":"B","status":"seleccionada","publish":True,"privacy":"approved","newName":"gea-electrico-comercial-mantenimiento-proceso-01.webp","alt":"Proceso de mantenimiento eléctrico en una instalación semiindustrial"},
    {"id":"P06","original":"WhatsApp Image 2026-06-20 at 8.21.08 PM (2).jpeg","service":"electrico-comercial","stage":"proceso","subject":"instalación técnica","propertyType":"semiindustrial","orientation":"vertical","quality":"C","status":"archivo","publish":False,"privacy":"approved"},
    {"id":"P07","original":"WhatsApp Image 2026-06-20 at 8.21.08 PM.jpeg","service":"electrico-comercial","stage":"proceso","subject":"cableado eléctrico","propertyType":"semiindustrial","orientation":"vertical","quality":"B","status":"seleccionada","publish":True,"privacy":"approved","newName":"gea-electrico-comercial-cableado-proceso-01.webp","alt":"Proceso de instalación y revisión de cableado eléctrico"},
    {"id":"P08","original":"WhatsApp Image 2026-06-20 at 8.21.09 PM (1).jpeg","service":"electrico-comercial","stage":"contexto","subject":"sistema eléctrico industrial","propertyType":"semiindustrial","orientation":"horizontal","quality":"A","status":"seleccionada","publish":True,"privacy":"approved","newName":"gea-electrico-comercial-sistema-industrial-contexto-01.webp","alt":"Sistema eléctrico industrial revisado por Soluciones GEA en Medellín"},
    {"id":"P09","original":"WhatsApp Image 2026-06-20 at 8.21.09 PM.jpeg","service":"electrico-comercial","stage":"proceso","subject":"montaje de equipo","propertyType":"semiindustrial","orientation":"vertical","quality":"C","status":"archivo","publish":False,"privacy":"approved"},
    {"id":"P10","original":"WhatsApp Image 2026-06-20 at 8.21.10 PM (1).jpeg","service":"sin-clasificar","stage":"contexto","subject":"maquinaria industrial","propertyType":"semiindustrial","orientation":"horizontal","quality":"C","status":"archivo","publish":False,"privacy":"approved"},
    {"id":"P11","original":"WhatsApp Image 2026-06-20 at 8.21.10 PM.jpeg","service":"electrico-comercial","stage":"proceso","subject":"obra técnica","propertyType":"semiindustrial","orientation":"vertical","quality":"C","status":"archivo","publish":False,"privacy":"approved"},
    {"id":"P12","original":"WhatsApp Image 2026-06-20 at 8.21.11 PM (1).jpeg","service":"electrico-comercial","stage":"diagnostico","subject":"conexión eléctrica","propertyType":"semiindustrial","orientation":"vertical","quality":"B","status":"seleccionada","publish":True,"privacy":"approved","newName":"gea-electrico-comercial-conexion-diagnostico-01.webp","alt":"Revisión diagnóstica de una conexión eléctrica industrial"},
    {"id":"P13","original":"WhatsApp Image 2026-06-20 at 8.21.11 PM.jpeg","service":"electrico-comercial","stage":"contexto","subject":"instalación técnica","propertyType":"semiindustrial","orientation":"horizontal","quality":"C","status":"archivo","publish":False,"privacy":"approved"},
    {"id":"P14","original":"WhatsApp Image 2026-06-20 at 8.21.12 PM (1).jpeg","service":"sin-clasificar","stage":"detalle","subject":"detalle no identificable","propertyType":"semiindustrial","orientation":"horizontal","quality":"D","status":"descartada","publish":False,"privacy":"not-publishable"},
    {"id":"P15","original":"WhatsApp Image 2026-06-20 at 8.21.12 PM (2).jpeg","service":"sin-clasificar","stage":"contexto","subject":"estructura industrial","propertyType":"semiindustrial","orientation":"vertical","quality":"C","status":"archivo","publish":False,"privacy":"approved"},
    {"id":"P16","original":"WhatsApp Image 2026-06-20 at 8.21.12 PM.jpeg","service":"sin-clasificar","stage":"detalle","subject":"detalle no identificable","propertyType":"semiindustrial","orientation":"vertical","quality":"D","status":"descartada","publish":False,"privacy":"not-publishable"},
    {"id":"P17","original":"WhatsApp Image 2026-06-20 at 8.21.13 PM (1).jpeg","service":"electrico-comercial","stage":"proceso","subject":"instalación eléctrica","propertyType":"semiindustrial","orientation":"vertical","quality":"B","status":"seleccionada","publish":True,"privacy":"approved","newName":"gea-electrico-comercial-instalacion-proceso-01.webp","alt":"Proceso de reparación e instalación eléctrica en un inmueble semiindustrial"},
    {"id":"P18","original":"WhatsApp Image 2026-06-20 at 8.21.13 PM (2).jpeg","service":"sin-clasificar","stage":"detalle","subject":"detalle no identificable","propertyType":"semiindustrial","orientation":"horizontal","quality":"D","status":"descartada","publish":False,"privacy":"not-publishable"},
    {"id":"P19","original":"WhatsApp Image 2026-06-20 at 8.21.13 PM (3).jpeg","service":"sin-clasificar","stage":"contexto","subject":"obra industrial","propertyType":"semiindustrial","orientation":"vertical","quality":"C","status":"archivo","publish":False,"privacy":"approved"},
    {"id":"P20","original":"WhatsApp Image 2026-06-20 at 8.21.13 PM.jpeg","service":"electrico-comercial","stage":"detalle","subject":"equipo eléctrico","propertyType":"semiindustrial","orientation":"vertical","quality":"B","status":"seleccionada","publish":True,"privacy":"approved","newName":"gea-electrico-comercial-equipo-detalle-02.webp","alt":"Detalle de un equipo eléctrico durante una revisión técnica"},
    {"id":"P21","original":"WhatsApp Image 2026-06-20 at 8.21.14 PM (1).jpeg","service":"sin-clasificar","stage":"detalle","subject":"detalle no identificable","propertyType":"semiindustrial","orientation":"vertical","quality":"D","status":"descartada","publish":False,"privacy":"not-publishable"},
    {"id":"P22","original":"WhatsApp Image 2026-06-20 at 8.21.14 PM.jpeg","service":"sin-clasificar","stage":"contexto","subject":"contexto no identificable","propertyType":"semiindustrial","orientation":"horizontal","quality":"D","status":"descartada","publish":False,"privacy":"not-publishable"},
    {"id":"P23","original":"WhatsApp Image 2026-06-20 at 8.21.15 PM.jpeg","service":"sin-clasificar","stage":"detalle","subject":"detalle no identificable","propertyType":"semiindustrial","orientation":"vertical","quality":"D","status":"descartada","publish":False,"privacy":"not-publishable"},
]


def optimized_image(source: Path, webp_path: Path, avif_path: Path) -> None:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        if max(image.size) > 1600:
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        webp_path.parent.mkdir(parents=True, exist_ok=True)
        image.save(webp_path, "WEBP", quality=82, method=6, exif=b"")
        try:
            import pillow_avif  # noqa: F401
            image.save(avif_path, "AVIF", quality=58, speed=6, exif=b"")
        except Exception as exc:
            print(f"AVIF omitido para {source.name}: {exc}")


def main() -> None:
    ORIGINALS.mkdir(parents=True, exist_ok=True)
    SERVICE_DIR.mkdir(parents=True, exist_ok=True)
    DOCS.mkdir(parents=True, exist_ok=True)

    missing = [photo["original"] for photo in PHOTOS if not (IMG / photo["original"]).exists()]
    if missing:
        raise SystemExit(f"Faltan originales: {missing}")

    for photo in PHOTOS:
        source = IMG / photo["original"]
        archived = ORIGINALS / photo["original"]
        if not archived.exists():
            shutil.copy2(source, archived)
        photo["archivePath"] = archived.relative_to(ROOT).as_posix()

        if photo["publish"]:
            webp = SERVICE_DIR / photo["newName"]
            avif = webp.with_suffix(".avif")
            optimized_image(source, webp, avif)
            photo["webp"] = webp.relative_to(ROOT).as_posix()
            photo["avif"] = avif.relative_to(ROOT).as_posix() if avif.exists() else None
            photo["uses"] = ["service-page", "real-work-gallery"]
            if photo["quality"] == "A":
                photo["uses"].insert(0, "hero")
        else:
            photo["newName"] = None
            photo["alt"] = None
            photo["uses"] = []

    manifest = {
        "version": 1,
        "reviewedAt": "2026-07-21",
        "summary": {
            "total": len(PHOTOS),
            "selected": sum(p["publish"] for p in PHOTOS),
            "documentary": sum(p["quality"] == "C" for p in PHOTOS),
            "discardedFromPublishing": sum(p["quality"] == "D" for p in PHOTOS),
            "primaryService": "electrico-comercial"
        },
        "images": PHOTOS
    }
    (ROOT / "assets" / "images.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    plan = """# Plan de uso de fotografías reales — Soluciones GEA

## Hallazgo

Las 23 fotografías corresponden principalmente a una intervención eléctrica o semiindustrial. No existe evidencia suficiente para asignarlas a gas, fugas, tanques, bombas o cocinas. Por eso se evita reutilizarlas como si representaran servicios diferentes.

## Selección

- **1 imagen A:** P08, horizontal, apta para encabezado de Eléctrico Comercial o caso real.
- **7 imágenes B:** P03, P04, P05, P07, P12, P17 y P20, aptas para tarjetas, detalles y secuencia de proceso.
- **9 imágenes C:** se conservan únicamente como documentación del trabajo.
- **6 imágenes D:** P14, P16, P18, P21, P22 y P23 quedan fuera de publicación.

Los 23 originales permanecen intactos en `assets/img/originals/2026-06-20/`. Las imágenes publicables están optimizadas en WebP y AVIF dentro de `assets/img/services/electrico-comercial/`.

## Uso recomendado en la web

1. **Landing Eléctrico Comercial:** P08 como imagen principal; P03/P04 para diagnóstico; P05/P07/P17 para proceso; P12/P20 como detalles.
2. **Página principal:** mostrar un solo caso real con P08 y enlace a la landing. No presentar estas fotos como gas o agua.
3. **Caso SEO:** crear una historia única: contexto → diagnóstico → intervención → detalles técnicos. Evitar afirmar “antes/después” porque la secuencia no lo demuestra con certeza.
4. **GEA Care:** usar únicamente P03, P04 o P12 como evidencia de revisión eléctrica, junto con nuevas fotografías reales de agua y gas.
5. **Hero general:** no usar las ocho imágenes en carrusel. P08 puede funcionar como apoyo temporal, pero el hero definitivo debe mostrar variedad real de agua, gas y electricidad.

## Próximas fotografías necesarias

- Fuga visible y reparación terminada.
- Red o punto de gas antes, diagnóstico y resultado.
- Cocina comercial y trampa de grasa.
- Lavado de tanque.
- Bomba o sistema de presión.
- Inspección preventiva GEA Care en agua, gas y electricidad.

## Reglas de publicación

- Leer `assets/images.json` como fuente de verdad.
- Publicar solo entradas con `publish: true`.
- Usar AVIF con fallback WebP.
- Declarar `width` y `height`, cargar en lazy salvo la imagen principal y no repetir la misma foto en varias secciones.
- No exponer nombres antiguos de WhatsApp ni rutas de originales.
"""
    (DOCS / "plan-uso-imagenes.md").write_text(plan, encoding="utf-8")

    for photo in PHOTOS:
        (IMG / photo["original"]).unlink(missing_ok=True)

    shutil.rmtree(ROOT / "audit", ignore_errors=True)
    for temporary in (ROOT / "image-review.json", ROOT / "image-review.html"):
        temporary.unlink(missing_ok=True)

    print(json.dumps(manifest["summary"], ensure_ascii=False))


if __name__ == "__main__":
    main()
