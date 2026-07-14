# Celebración de Vida de Teresa Luna

Abra `index.html` para ver el memorial.

## Libro de recuerdos con Google Sheets

El formulario ya está incluido. Para activarlo, cree una hoja de Google y una implementación de Google Apps Script que acepte POST y GET. Después pegue la URL de la aplicación web en esta línea de `index.html`:

```js
const SHEETS_WEB_APP_URL = "PEGUE_AQUI_LA_URL";
```

Mientras la URL esté vacía, el memorial funciona normalmente y muestra un aviso amable al intentar enviar un recuerdo.
