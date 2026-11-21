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
    var raf = 0, x = -999, y = -999;
    document.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () {
        root.style.setProperty('--mx', x + 'px');
        root.style.setProperty('--my', y + 'px');
        raf = 0;
      });
    }, { passive: true });
    document.body.classList.add('spot');
    document.addEventListener('pointerleave', function () { root.style.setProperty('--mx', '-999px'); });
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
