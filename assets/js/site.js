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

  /* ---- Rejilla de fondo que se ilumina bajo el cursor ---- */
  // Con ratón (aunque el equipo tenga "reducir animaciones") el fondo sigue al cursor.
  // Si se pide menos movimiento, el halo va directo al cursor sin suavizado.
  var fino = window.matchMedia('(any-pointer:fine)').matches;
  var calma = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var suave = calma ? 1 : 0.14;
  if (fino) {
    // El halo sigue al cursor con un pequeño retardo (interpolación) para que se sienta fluido
    var tx = innerWidth / 2, ty = innerHeight * 0.3, cx = tx, cy = ty, corriendo = false;
    function paso() {
      cx += (tx - cx) * suave; cy += (ty - cy) * suave;
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
  /* Onda en el fondo al hacer clic o tocar (también en móvil) */
  document.addEventListener('pointerdown', function (e) {
    var p = document.createElement('span');
    p.className = 'pulso'; p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
    document.body.appendChild(p);
    setTimeout(function () { p.remove(); }, 950);
    if (!fino) { root.style.setProperty('--mx', e.clientX + 'px'); root.style.setProperty('--my', e.clientY + 'px'); }
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
