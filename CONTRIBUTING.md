# Contribuir a Soluciones GEA

## Regla
Preservar captación, SEO, accesibilidad, seguridad y rendimiento.

## Antes
- identifica requisito;
- modifica el archivo propietario;
- evita hojas parche;
- no agregues dependencias sin necesidad;
- arquitectura => ADR;
- seguridad => threat model.

## Validación
```bash
node --check app.js
node --check theme-init.js
node --check service-pages.js
node --check home-redesign.js
node --check scripts/check.js
node --check scripts/release.js
node --check scripts/quality-gate.js
node --test tests/repository.test.js
node scripts/quality-gate.js
node scripts/check.js
```

## UI
Usar matriz manual de TEST-CASES; no aprobar responsive mirando un solo viewport.

## Seguridad
No secrets; no javascript:; datos externos con textContent; evitar innerHTML para datos variables; target=_blank con noopener noreferrer.

## Definition of Done
Código + pruebas + docs aplicables + CI verde + cero deuda Blocker/Critical conocida.
