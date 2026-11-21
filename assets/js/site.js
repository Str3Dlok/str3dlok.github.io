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

  /* ---- Fondo reactivo: halo y rejilla dorada que siguen al cursor ----
     Se mueven con transform (GPU), así que no se repinta toda la pantalla en cada movimiento. */
  var fx = document.querySelector('.bg-fx');
  var glow = fx && fx.querySelector('.fx-glow'), grid = fx && fx.querySelector('.fx-grid');
  var fino = window.matchMedia('(any-pointer:fine)').matches;
  var calma = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var suave = calma ? 1 : 0.16;
  var tx = innerWidth / 2, ty = innerHeight * 0.3, cx = tx, cy = ty, corriendo = false;
  function pintar() {
    var t = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
    glow.style.transform = t; grid.style.transform = t;
    // la rejilla de acento se recoloca para quedar alineada con la rejilla base
    grid.style.backgroundPosition = ((340 - cx) % 64).toFixed(1) + 'px ' + ((340 - cy) % 64).toFixed(1) + 'px';
  }
  function paso() {
    cx += (tx - cx) * suave; cy += (ty - cy) * suave; pintar();
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4) requestAnimationFrame(paso); else corriendo = false;
  }
  function mover(x, y) { tx = x; ty = y; if (!corriendo) { corriendo = true; requestAnimationFrame(paso); } }
  if (fx && fino) {
    document.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') mover(e.clientX, e.clientY); }, { passive: true });
    fx.classList.add('on'); pintar();
  }
  /* Onda al hacer clic o tocar (también en móvil, donde además lleva el halo al punto tocado) */
  document.addEventListener('pointerdown', function (e) {
    var p = document.createElement('span');
    p.className = 'pulso'; p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
    document.body.appendChild(p);
    setTimeout(function () { p.remove(); }, 950);
    if (fx && e.pointerType === 'touch') { fx.classList.add('on'); cx = tx = e.clientX; cy = ty = e.clientY; pintar(); }
  }, { passive: true });

  /* ---- Botón flotante: abajo cuando estás arriba, arriba cuando has bajado ---- */
  var sb = document.getElementById('scroll-btn');
  function actualizarScroll() {
    var largo = document.documentElement.scrollHeight > window.innerHeight * 1.3;
    sb.hidden = !largo;
    var abajo = window.scrollY < 200;
    sb.classList.toggle('up', !abajo);
    sb.setAttribute('aria-label', abajo ? 'Ir abajo' : 'Volver arriba');
    sb.firstElementChild.textContent = abajo ? '↓' : '↑';
  }
  if (sb) {
    sb.addEventListener('click', function () {
      var abajo = !sb.classList.contains('up');
      window.scrollTo({ top: abajo ? document.documentElement.scrollHeight : 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', actualizarScroll, { passive: true });
    window.addEventListener('resize', actualizarScroll);
    actualizarScroll();
    window.actualizarScroll = actualizarScroll;
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
