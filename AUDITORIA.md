# Auditoría de QR Studio

## Alcance
- `index.html`
- `script.js`
- `style.css`
- `manifest.json`
- `sw.js`

## Resumen Ejecutivo
- El proyecto está bien encaminado para una app estática/PWA. El XSS del historial ya fue corregido; siguen abiertos la dependencia de CDNs externos en el camino crítico y una afirmación de privacidad que no es completamente precisa.
- No se encontró lógica de backend ni exposición obvia de secretos.

## Hallazgos

### Alto
1. XSS almacenado en el historial
- Estado: corregido en el árbol actual.
- Evidencia histórica: `script.js:752-803`
- Problema original: `renderHistory()` construía HTML con `innerHTML` usando `item.data` y `desc` sin escape.
- Impacto: un valor malicioso guardado en `localStorage` podía ejecutar JavaScript al volver a renderizar el historial.
- Remediación: se reescribió `renderHistory()` para usar `createElement` y `textContent`.

2. Dependencias externas en el camino crítico
- Evidencia: `index.html:13-15, 72-78`, `sw.js:22-24`
- Problema: la app depende de Google Fonts y scripts de `unpkg.com` para funcionar y visualmente verse completa.
- Impacto: pérdida de privacidad por solicitudes a terceros, peor disponibilidad offline y mayor fragilidad si esos CDNs fallan.
- Recomendación: alojar dependencias localmente o agregar fallback robusto y no precachear recursos externos como parte del install.

### Medio
3. Service Worker vulnerable a fallos de instalación
- Evidencia: `sw.js:27-31`
- Problema: `cache.addAll(ASSETS)` falla si una sola URL no responde.
- Impacto: la instalación del SW puede romperse por una caída temporal de un recurso externo.
- Recomendación: separar recursos locales de externos y evitar que un fallo de CDN bloquee toda la instalación.

4. Mensaje de privacidad potencialmente engañoso
- Evidencia: `index.html:471-477`, `script.js:1061-1075`, `index.html:543-546`
- Problema: la UI afirma privacidad total, pero el formulario de contacto envía datos a FormSubmit y la donación redirige a PayPal.
- Impacto: la promesa de privacidad puede interpretarse como absoluta cuando hay flujos que sí salen del navegador.
- Recomendación: acotar el texto de privacidad a la generación de QR e indicar explícitamente los flujos externos opcionales.

### Bajo
5. Manejo frágil en copia al portapapeles
- Evidencia: `script.js:507-533`, `script.js:656-671`
- Problema: la lógica asume soporte para `ClipboardItem`/`navigator.clipboard` y no maneja del todo errores dentro del callback asíncrono de `toBlob`.
- Impacto: errores silenciosos o unhandled exceptions en navegadores con soporte parcial.
- Recomendación: añadir detección de capacidades y fallback a descarga.

## Observaciones Positivas
- La app usa `textContent` en gran parte de la interfaz, reduciendo superficie de inyección.
- Hay soporte multiidioma, PWA y modo escáner bien integrados.
- El procesamiento del QR ocurre mayormente en cliente.

## Prioridad Recomendada
1. Corregir el XSS del historial.
2. Eliminar o aislar dependencias externas críticas.
3. Ajustar el Service Worker para que no falle por recursos de terceros.
4. Revisar el texto de privacidad y divulgación de servicios externos.

## Limitaciones
- Auditoría estática manual; no se ejecutaron pruebas automáticas porque el proyecto no incluye suite de tests ni build toolchain visible.

## Revisión GitHub
- Hay referencias explícitas a GitHub Pages en `index.html` (`canonical`, `hreflang`, `url` apuntando a `https://hyperioncvr.github.io/qr-studio/`).
- El repo sí tenía `origin` configurado y `HEAD` en `main`.
- La URL del remote contenía credenciales embebidas; ya fue limpiada para dejar el remote sin secretos.
- Se añadió `.github/workflows/pages.yml` para publicar automáticamente en GitHub Pages desde `main` o `master`.
- Conclusión: el proyecto ya queda preparado para subirse/desplegarse en GitHub Pages, pero el remote local debe limpiarse si esas credenciales siguen vigentes.

## Remediaciones Aplicadas
- El historial ahora se renderiza con nodos DOM seguros.
- El `sw.js` ya no precachea recursos externos.
- Se agregó un workflow de GitHub Pages listo para publicar la app estática.
