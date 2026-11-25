# str3dlok.github.io

Web y bitácora de la investigación doctoral de Alejandro Baeza (Str3Dlok). Está hecha con Jekyll y la publica GitHub Pages.

## Estructura
- `index.html`: página de inicio. Sus textos están en `_data/inicio.yml`.
- `bitacora.html`: archivo de entradas con filtro por hashtag (se generan solos a partir de las entradas). Admite `?tag=nombre`.
- `contacto.html`: perfil y redes. Sus textos están en `_data/perfil.yml`.
- `_data/`: textos editables. `inicio.yml`, `perfil.yml` y `sitio.yml` (menú y pie).
- `_posts/`: una entrada por archivo, con el nombre `AAAA-MM-DD-titulo.md`.
- `_plantillas/entrada.md`: plantilla con todos los campos de una entrada para quien escriba a mano (no se publica).
- `_includes/`: piezas reutilizables. `md-linea.html` (Markdown en línea para títulos), `url.html` (enlaces escritos en el gestor), `icono-red.html` (iconos de redes).
- `assets/`: estilos, scripts (`site.js` común, `bitacora.js` filtro) e imágenes. Las imágenes de las entradas van en `assets/img/posts/`.

## Modo desarrollo (ver la web en local)
GitHub Pages construye la web sola en cada `push`, así que esto solo hace falta para probar cambios antes de subirlos. Se necesita Ruby (con Bundler) y las herramientas para compilar algunas gemas.

### 1. Instalar Ruby
**Linux / WSL (Debian, Ubuntu)**
```bash
sudo apt update
sudo apt install ruby-full ruby-bundler build-essential zlib1g-dev libssl-dev pkg-config
```
- `ruby-bundler`: en Debian el comando `bundle` va en un paquete aparte; sin él aparece `command not found: bundle`.
- `libssl-dev` y `pkg-config`: la gema `openssl` (dependencia de `github-pages`) se compila al instalarla; sin ellos falla con `OpenSSL library could not be found`.

**macOS** (con [Homebrew](https://brew.sh); el Ruby que trae el sistema es antiguo)
```bash
brew install ruby
echo 'export PATH="$(brew --prefix ruby)/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

**Windows**: instalar [RubyInstaller](https://rubyinstaller.org/downloads/) en su versión *Ruby+Devkit* (3.3) y, al terminar, aceptar el paso `ridk install` (opción 3, MSYS2 y MINGW). También funciona usar WSL y seguir los pasos de Linux.

Comprobar: `ruby -v` (3.x) y `bundle -v`.

### 2. Instalar las dependencias (una vez)
Desde la carpeta del repositorio:
```bash
bundle config set --local path vendor/bundle   # las gemas se quedan en el proyecto, sin sudo
bundle install
```
Si se lanza `bundle install` sin la primera línea, intenta escribir en la carpeta del sistema y falla con `Bundler::PermissionError ... /var/lib/gems`. Basta con ejecutar la línea `bundle config` y repetir.

El `Gemfile` usa la gema `github-pages`, que instala exactamente la misma versión de Jekyll y de los plugins que usa GitHub Pages. Las carpetas `vendor/` y `.bundle/` y el `Gemfile.lock` no se suben al repositorio.

### 3. Arrancar la web
```bash
bundle exec jekyll serve --livereload
```
Abrir <http://localhost:4000>. La página se recarga sola al guardar cualquier archivo. Detener con `Ctrl+C`.

- Jekyll está instalado dentro del proyecto, no en el sistema: siempre `bundle exec jekyll ...`. Escribir solo `jekyll` da `command not found: jekyll`.
- Los cambios en `_config.yml` **no** se recargan: hay que parar y volver a arrancar.
- `--drafts` muestra también los borradores de `_drafts/`.
- `bundle exec jekyll build` solo genera la web en `_site/`, sin servidor.
- Avisos normales que se pueden ignorar: `To use retry middleware with Faraday v2.0+, install faraday-retry gem`, `GitHub Metadata: No GitHub API authentication could be found` y, en WSL, el de que la regeneración automática puede no funcionar en Windows (sí funciona si el repositorio está dentro de Linux, p. ej. en `~/code`, y no en `/mnt/c`).
- Para actualizar a la versión que use GitHub Pages en cada momento: `bundle update github-pages`.

## Campos de cada entrada
`title`, `date`, `author`, `image`, `description` (corta, se ve en la bitácora), `resumen` (amplia, dentro de la entrada) y `tags` (hashtags). Opcionales: `youtube` y `sketchfab`. La declaración de uso de IA va en el pie de todas las páginas.

## Interfaz
Tres temas (Oscuro, Claro y Neón) que se guardan en el navegador. Incluye una rejilla que se ilumina bajo el cursor, un botón flotante para ir arriba o abajo, desplazamiento suave en los enlaces internos, migas de pan y navegación anterior/siguiente (también con las flechas del teclado).

## Normas de contenido
La bitácora es pública. No incluye resultados concretos, tablas, parámetros, herramientas propias ni nombres de personas, entidades, obras o colaboradores.
