// Str3Dlok · interacción común (sin dependencias)
(function () {
  var root = document.documentElement;

  /* ---- Temas: oscuro → claro → plano ---- */
  var temas = ['oscuro', 'claro', 'plano'];
  var nombres = { oscuro: 'Oscuro', claro: 'Claro', plano: 'Plano' };
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

  /* ---- Rejilla de fondo que se ilumina bajo el cursor ---- */
  var fino = window.matchMedia('(pointer:fine)').matches;
  var calma = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (fino && !calma) {
    // El halo sigue al cursor con un pequeño retardo (interpolación) para que se sienta fluido
    var tx = innerWidth / 2, ty = innerHeight * 0.3, cx = tx, cy = ty, corriendo = false;
    function paso() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      root.style.setProperty('--mx', cx.toFixed(1) + 'px');
      root.style.setProperty('--my', cy.toFixed(1) + 'px');
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5) requestAnimationFrame(paso); else corriendo = false;
    }
    document.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!corriendo) { corriendo = true; requestAnimationFrame(paso); }
    }, { passive: true });
    document.body.classList.add('spot');
    paso();
  }

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
