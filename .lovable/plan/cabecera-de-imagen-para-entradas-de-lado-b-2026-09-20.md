# Cabecera de imagen para entradas de Lado B

## Cambios
- Incluir en la respuesta de cada entrada la imagen guardada en la propiedad `URL` de Notion.
- Mostrarla como una cabecera horizontal en `/jardin/:slug`, antes del contenido de la entrada.
- Aplicar una capa oscura en degradado sobre la imagen, manteniendo una proporción estable en móvil y escritorio.
- Mantener intactos Lado A y el resto de páginas.

## Verificación
- Desplegar la función que obtiene cada entrada.
- Comprobar una entrada real de Lado B en escritorio y móvil, incluyendo el caso sin imagen.
