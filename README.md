# str3dlok.github.io

Web y bitácora de la investigación doctoral de Alejandro Baeza (Str3Dlok). Está hecha con Jekyll y la publica GitHub Pages.

## Estructura
- `index.html`: página de inicio.
- `bitacora.html`: archivo de entradas con filtros (las categorías se definen en `_config.yml`).
- `contacto.html`: perfil y redes.
- `_posts/`: una entrada por archivo, con el nombre `AAAA-MM-DD-titulo.md`.
- `_plantillas/entrada.md`: plantilla para nuevas entradas (no se publica).
- `assets/`: estilos, script del filtro e imágenes. Las imágenes de las entradas van en `assets/img/posts/`.

## Publicar una entrada
1. Copiar `_plantillas/entrada.md` a `_posts/` con la fecha y un título corto.
2. Rellenar el título, la categoría y el texto.
3. Hacer commit en `main`. GitHub Pages reconstruye la web en 1–2 minutos.

## Normas de contenido
La bitácora es pública. No incluye resultados concretos, tablas, parámetros, herramientas propias ni nombres de personas, entidades, obras o colaboradores.
