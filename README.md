# str3dlok.github.io

Web y bitácora de la investigación doctoral de Alejandro Baeza (Str3Dlok). Está hecha con Jekyll y la publica GitHub Pages.

## Estructura
- `index.html`: página de inicio.
- `bitacora.html`: archivo de entradas con filtro por hashtag (se generan solos a partir de las entradas). Admite `?tag=nombre`.
- `contacto.html`: perfil y redes.
- `_posts/`: una entrada por archivo, con el nombre `AAAA-MM-DD-titulo.md`.
- `_plantillas/entrada.md`: plantilla con todos los campos de una entrada (no se publica).
- `assets/`: estilos, scripts (`site.js` común, `bitacora.js` filtro) e imágenes. Las imágenes de las entradas van en `assets/img/posts/`.

## Campos de cada entrada
`title`, `date`, `author`, `image`, `description` (corta, se ve en la bitácora), `resumen` (amplia, dentro de la entrada) y `tags` (hashtags). Opcionales: `youtube`, `sketchfab`, `ia`.

## Interfaz
Tres temas (Oscuro, Claro y Plano) que se guardan en el navegador. Incluye una rejilla que se ilumina bajo el cursor, un botón flotante para ir arriba o abajo, desplazamiento suave en los enlaces internos, migas de pan y navegación anterior/siguiente (también con las flechas del teclado).

## Normas de contenido
La bitácora es pública. No incluye resultados concretos, tablas, parámetros, herramientas propias ni nombres de personas, entidades, obras o colaboradores.
