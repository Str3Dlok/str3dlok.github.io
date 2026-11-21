// Str3Dlok · interacción común (sin dependencias)
(function () {
  var root = document.documentElement;

  /* ---- Temas: oscuro → claro → neón ---- */
  var temas = ['oscuro', 'claro', 'neon'];
  var nombres = { oscuro: 'Oscuro', claro: 'Claro', neon: 'Neón' };
  if (temas.indexOf(root.dataset.theme) < 0) root.dataset.theme = 'oscuro';
  var btn = document.getElementById('theme-btn');
  function pintarTema() {
    var t = root.dataset.theme || 'oscuro';
    if (btn) btn.querySelector('.theme-name').textContent = nombres[t];
  }
  if (btn) btn.addEventListener('click', function () {
    var t = temas[(temas.indexOf(root.dataset.theme) + 1) % temas.length];
    root.dataset.theme = t;
    try { localStorage.setItem('tema', t); } catch (e) {}
    pintarTema();
  });
  pintarTema();

  /* ---- Fondo reactivo: halo dorado que sigue al cursor ----
     Solo cambia "transform" de una capa pequeña: el navegador lo resuelve en la GPU sin repintar. */
  var fx = document.querySelector('.bg-fx'), glow = fx && fx.querySelector('.fx-glow');
  var fino = window.matchMedia('(any-pointer:fine)').matches;
  var calma = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var suave = calma ? 1 : 0.16;
  var tx = innerWidth / 2, ty = innerHeight * 0.3, cx = tx, cy = ty, corriendo = false;
  function pintar() { glow.style.transform = 'translate3d(' + (cx | 0) + 'px,' + (cy | 0) + 'px,0)'; }
  function paso() {
    cx += (tx - cx) * suave; cy += (ty - cy) * suave; pintar();
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5) requestAnimationFrame(paso); else corriendo = false;
  }
  function mover(x, y) { tx = x; ty = y; if (!corriendo) { corriendo = true; requestAnimationFrame(paso); } }
  if (glow && fino) {
    document.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') mover(e.clientX, e.clientY); }, { passive: true });
    fx.classList.add('on'); pintar();
  }
  /* Onda al hacer clic o tocar (en móvil, además, lleva el halo al punto tocado) */
  document.addEventListener('pointerdown', function (e) {
    var p = document.createElement('span');
    p.className = 'pulso'; p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
    p.addEventListener('animationend', function () { p.remove(); });
    document.body.appendChild(p);
    if (glow && e.pointerType === 'touch') { fx.classList.add('on'); cx = tx = e.clientX; cy = ty = e.clientY; pintar(); }
  }, { passive: true });

  /* ---- Botón flotante: abajo cuando estás arriba, arriba cuando has bajado ----
     El scroll se procesa una vez por fotograma y solo toca el DOM cuando cambia el estado. */
  var sb = document.getElementById('scroll-btn'), alto = 0, estado = '', pendiente = false;
  function medir() { alto = document.documentElement.scrollHeight; }
  function actualizarScroll() {
    pendiente = false;
    var largo = alto > innerHeight * 1.3, abajo = scrollY < 200;
    var nuevo = !largo ? 'oculto' : abajo ? 'abajo' : 'arriba';
    if (nuevo === estado) return;
    estado = nuevo;
    sb.hidden = nuevo === 'oculto';
    sb.classList.toggle('up', nuevo === 'arriba');
    sb.setAttribute('aria-label', nuevo === 'arriba' ? 'Volver arriba' : 'Ir abajo');
    sb.firstElementChild.textContent = nuevo === 'arriba' ? '↑' : '↓';
  }
  if (sb) {
    sb.addEventListener('click', function () {
      window.scrollTo({ top: estado === 'arriba' ? 0 : alto, behavior: calma ? 'auto' : 'smooth' });
    });
    addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(actualizarScroll); } }, { passive: true });
    addEventListener('resize', function () { medir(); actualizarScroll(); }, { passive: true });
    addEventListener('load', function () { medir(); actualizarScroll(); });
    medir(); actualizarScroll();
    window.actualizarScroll = function () { medir(); estado = ''; actualizarScroll(); };
  }

  /* ---- Enlaces internos (#seccion): desplazamiento suave ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').charAt(1) === '/') return;
    var dest = document.getElementById(a.getAttribute('href').slice(1));
    if (!dest) return;
    e.preventDefault();
    dest.scrollIntoView({ behavior: calma ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---- Entradas: flechas del teclado para anterior / siguiente ---- */
  document.addEventListener('keydown', function (e) {
    if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey) return;
    var k = e.key === 'ArrowLeft' ? 'prev' : e.key === 'ArrowRight' ? 'next' : null;
    if (!k) return;
    var vis = document.querySelectorAll('[data-key="' + k + '"]');
    for (var i = 0; i < vis.length; i++) if (vis[i].offsetParent) { vis[i].click(); break; }
  });
})();
