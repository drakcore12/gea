# Procedimiento de ejecución de pruebas

ID: TPR-GEA-001

## Local
1. Checkout del commit.
2. Ejecutar `node scripts/verify.js`.
3. Si cambia UI, ejecutar matriz manual.
4. Corregir cualquier fallo antes de push.

## CI
GitHub Actions ejecuta `node scripts/verify.js --release` cuando el servicio está disponible.

## Producción
Netlify ejecuta obligatoriamente `node scripts/verify.js --release`. Un status distinto de cero detiene el build y evita publicación.

## Post-release
1. Confirmar deploy `ready`.
2. Ejecutar/esperar production smoke.
3. Para cambios visuales, revisar el dominio publicado en móvil y desktop.
4. Si falla P0: rollback.
5. Registrar incidente si el defecto llegó a producción.

## Evidencia mínima
Commit SHA, deploy ID, resultado de verify, smoke y evidencia manual cuando aplique.
