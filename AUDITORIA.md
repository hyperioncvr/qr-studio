# Auditoria QR Studio

## Estado actual

La aplicacion es una PWA estatica para generar, exportar y escanear codigos QR con procesamiento local. No requiere backend para las funciones principales. Los servicios externos son opcionales y estan limitados a FormSubmit para contacto y PayPal para donaciones.

## Correcciones aplicadas

- Payloads QR estructurados: Wi-Fi, vCard y email ahora escapan caracteres reservados para evitar QRs invalidos.
- Historial local: ya no guarda Data URLs pesadas de logos o fondos, evitando errores de cuota en `localStorage`.
- Render de QR: se evita que renders asincronos antiguos sobrescriban estados recientes y se muestra error localizado si el contenido no puede renderizarse.
- Service worker: se actualizo cache a `qr-studio-v1.7`, instalacion estricta y fallback offline para rutas con query como `?lang=en`.
- i18n: la UI usa fallback en ingles y todos los locales contienen las claves requeridas por la app.
- Accesibilidad: tabs con roles/estado ARIA, modales con `role="dialog"`, cierre por Escape, foco inicial y botones de cierre etiquetados.
- SEO: canonical, hreflang y recursos sociales apuntan al dominio de produccion `https://qr-studio-ochre.vercel.app/`.
- Repo: se agregaron `.gitignore`, `.gitattributes`, `package.json`, `scripts/audit.mjs` y workflow de validacion.

## Validacion

Ejecutar:

```bash
npm run check
```

El comando valida sintaxis JavaScript, JSON, claves i18n y assets referenciados/cacheados.
