// Str3Dlok · interacción común (sin dependencias)
(function () {
  var root = document.documentElement;
  var fino = matchMedia('(any-pointer:fine)').matches;

  /* ================= Temas: oscuro → claro → neón ================= */
  var temas = ['oscuro', 'claro', 'neon'], nombres = { oscuro: 'Oscuro', claro: 'Claro', neon: 'Neón' };
  if (temas.indexOf(root.dataset.theme) < 0) root.dataset.theme = 'oscuro';
  var btn = document.getElementById('theme-btn');
  function pintarTema() { if (btn) btn.querySelector('.theme-name').textContent = nombres[root.dataset.theme]; }
  if (btn) btn.addEventListener('click', function () {
    var t = temas[(temas.indexOf(root.dataset.theme) + 1) % temas.length];
    root.dataset.theme = t;
    try { localStorage.setItem('tema', t); } catch (e) {}
    pintarTema(); leerColores();
  });
  pintarTema();

  /* ================= Fondo de píxeles y glitch =================
     Un canvas diminuto (1 píxel = 1 celda de 8 px) que el navegador amplía con "image-rendering: pixelated".
     Solo se redibuja cuando hay algo que mostrar: halo del cursor y su estela, onda al clic, píxeles que parpadean o un glitch. */
  var CEL = 8, cv = document.querySelector('.fx-pix'), cx2 = cv && cv.getContext('2d', { alpha: true });
  var cols = 0, filas = 0, oro = '#c9a44c', txt = '#ecedef';
  var mx = -99, my = -99, tx = -99, ty = -99, ondas = [], chispas = [], glitch = null, pendiente = false, ultimo = 0;
  var estela = [], VIDA = 650; // puntos recientes del cursor (la "cola") y su duración en ms
  // Matriz de Bayer 4x4: tramado retro para que el halo se vea "pixelado" y no como un degradado liso
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function leerColores() {
    var s = getComputedStyle(root);
    oro = s.getPropertyValue('--gold').trim() || oro; txt = s.getPropertyValue('--text').trim() || txt; pedir();
  }
  function medir() {
    if (!cv) return;
    cols = Math.ceil(innerWidth / CEL); filas = Math.ceil(innerHeight / CEL);
    cv.width = cols; cv.height = filas; cv.style.width = cols * CEL + 'px'; cv.style.height = filas * CEL + 'px'; pedir();
  }
  function pedir() { if (!pendiente && cv) { pendiente = true; requestAnimationFrame(dibujar); } }
  function dibujar(t) {
    pendiente = false; ultimo = t;
    cx2.clearRect(0, 0, cols, filas);
    var vivo = false, rapido = false;
    // 1) Halo del cursor, suavizado y tramado
    if (tx > -50) {
      mx += (tx - mx) * 0.22; my += (ty - my) * 0.22;
      if (Math.abs(tx - mx) + Math.abs(ty - my) > 0.05) vivo = rapido = true;
      var R = 18, R2 = R * R, ccx = mx / CEL, ccy = my / CEL;
      cx2.fillStyle = oro;
      for (var y = Math.max(0, ccy - R | 0); y <= Math.min(filas - 1, ccy + R | 0); y++) {
        for (var x = Math.max(0, ccx - R | 0); x <= Math.min(cols - 1, ccx + R | 0); x++) {
          var dx = x + .5 - ccx, dy = y + .5 - ccy, d2 = dx * dx + dy * dy;
          if (d2 > R2) continue;
          var k = 1 - Math.sqrt(d2) / R; k = k * k;
          if (k * 16 > BAYER[(y & 3) * 4 + (x & 3)]) { cx2.globalAlpha = .12 + k * .5; cx2.fillRect(x, y, 1, 1); }
        }
      }
    }
    // 1b) Estela: la cola del cursor se desvanece hasta cero, como una serpiente de píxeles
    if (tx > -50) {
      var ult = estela[estela.length - 1];
      if (!ult || Math.abs(ult.x - mx) + Math.abs(ult.y - my) > 3) estela.push({ x: mx, y: my, t: t });
    }
    while (estela.length && t - estela[0].t > VIDA) estela.shift();
    if (estela.length > 1) {
      vivo = rapido = true; cx2.fillStyle = oro;
      for (var e = 1; e < estela.length; e++) {
        var A = estela[e - 1], B = estela[e], vida = 1 - (t - B.t) / VIDA;
        var pasos = Math.max(1, Math.hypot(B.x - A.x, B.y - A.y) / CEL | 0), grosor = 1 + vida * 2 | 0;
        cx2.globalAlpha = vida * vida * .55;
        for (var s = 0; s <= pasos; s++) {
          var px = (A.x + (B.x - A.x) * s / pasos) / CEL | 0, py = (A.y + (B.y - A.y) * s / pasos) / CEL | 0;
          cx2.fillRect(px - (grosor >> 1), py - (grosor >> 1), grosor, grosor);
        }
      }
    }
    // 2) Ondas de píxeles al hacer clic / tocar
    for (var i = ondas.length - 1; i >= 0; i--) {
      var o = ondas[i], p = (t - o.t0) / 700;
      if (p >= 1) { ondas.splice(i, 1); continue; }
      vivo = rapido = true; var r = 4 + p * 28, a = 1 - p;
      cx2.fillStyle = oro;
      for (var ang = 0; ang < 6.283; ang += 1.2 / r) {
        cx2.globalAlpha = a * .8; cx2.fillRect(Math.round(o.x + Math.cos(ang) * r), Math.round(o.y + Math.sin(ang) * r), 1, 1);
      }
    }
    // 3) Píxeles sueltos que se encienden y apagan
    for (i = chispas.length - 1; i >= 0; i--) {
      var c = chispas[i], q = (t - c.t0) / c.dur;
      if (q >= 1) { chispas.splice(i, 1); continue; }
      vivo = true; cx2.fillStyle = c.oro ? oro : txt; cx2.globalAlpha = Math.sin(q * Math.PI) * (c.oro ? .55 : .25);
      cx2.fillRect(c.x, c.y, 1, 1);
    }
    // 4) Glitch: franjas horizontales desplazadas con separación de color durante unos milisegundos
    if (glitch) {
      if (t - glitch.t0 > glitch.dur) glitch = null;
      else {
        vivo = rapido = true;
        glitch.franjas.forEach(function (f) {
          var off = (Math.random() * 12 - 6) | 0;
          cx2.globalAlpha = .18; cx2.fillStyle = oro; cx2.fillRect(f.x + off, f.y, f.w, f.h);
          cx2.globalAlpha = .12; cx2.fillStyle = txt; cx2.fillRect(f.x - off + 1, f.y, f.w, 1);
        });
      }
    }
    cx2.globalAlpha = 1;
    // Movimiento (halo, onda, glitch) a 60 fps; solo ambiente (chispas) a ~24 fps para ahorrar
    if (vivo) { if (rapido) pedir(); else setTimeout(pedir, 42); }
  }
  if (cv) {
    medir(); leerColores();
    addEventListener('resize', medir, { passive: true });
    if (fino) document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      if (tx < -50) { mx = e.clientX; my = e.clientY; }
      tx = e.clientX; ty = e.clientY; pedir();
    }, { passive: true });
    document.addEventListener('pointerdown', function (e) {
      ondas.push({ x: e.clientX / CEL | 0, y: e.clientY / CEL | 0, t0: performance.now() }); pedir();
    }, { passive: true });
    // Ambiente: chispas y glitch esporádicos, en pausa si la pestaña no está visible
    setInterval(function () {
      if (document.hidden) return;
      var n = 3 + Math.random() * 4 | 0, ahora = performance.now();
      for (var j = 0; j < n; j++) chispas.push({ x: Math.random() * cols | 0, y: Math.random() * filas | 0, t0: ahora + Math.random() * 600, dur: 700 + Math.random() * 900, oro: Math.random() < .5 });
      if (!glitch && Math.random() < .14) {
        var fr = [], m = 1 + Math.random() * 3 | 0, y0 = Math.random() * filas | 0;
        for (var k = 0; k < m; k++) fr.push({ x: Math.random() * cols * .5 | 0, y: y0 + k * (1 + Math.random() * 3 | 0), w: 12 + Math.random() * cols * .4 | 0, h: 1 + Math.random() * 2 | 0 });
        glitch = { t0: ahora, dur: 140 + Math.random() * 160, franjas: fr };
      }
      pedir();
    }, 900);
  }

  /* ================= Desplazamiento animado entre secciones =================
     Los enlaces internos (#seccion) y el botón flotante viajan con una curva suave y un velo degradado. */
  var velo = document.createElement('div'); velo.className = 'velo'; velo.setAttribute('aria-hidden', 'true');
  document.body.appendChild(velo);
  var animando = 0;
  function irA(y, destino) {
    y = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
    var y0 = scrollY, dist = y - y0;
    if (Math.abs(dist) < 2) return;
    var dur = Math.min(1300, 600 + Math.abs(dist) * 0.25), t0 = performance.now(), id = ++animando;
    velo.classList.add('on');
    (function paso(t) {
      if (id !== animando) return;
      var p = Math.min(1, (t - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      scrollTo(0, y0 + dist * e);
      if (p < 1) requestAnimationFrame(paso);
      else {
        velo.classList.remove('on');
        if (destino) { destino.classList.remove('llega'); void destino.offsetWidth; destino.classList.add('llega'); }
      }
    })(t0);
  }
  addEventListener('wheel', function () { animando++; velo.classList.remove('on'); }, { passive: true });
  addEventListener('touchstart', function () { animando++; velo.classList.remove('on'); }, { passive: true });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').charAt(1) === '/') return;
    var dest = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (!dest) return;
    e.preventDefault();
    irA(dest.getBoundingClientRect().top + scrollY - 76, dest);
  });

  /* ================= Aparición de bloques al hacer scroll ================= */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('main .head, main .card, main .pipe, main .post, main .facts, main .bio, main .social, main .post-body, main .pn').forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('rev'); io.observe(el); }
    });
  }

  /* ================= Botón flotante: abajo cuando estás arriba, arriba cuando has bajado ================= */
  var sb = document.getElementById('scroll-btn'), alto = 0, estado = '', esperando = false;
  function medirAlto() { alto = document.documentElement.scrollHeight; }
  function actualizarScroll() {
    esperando = false;
    var nuevo = alto <= innerHeight * 1.3 ? 'oculto' : scrollY < 200 ? 'abajo' : 'arriba';
    if (nuevo === estado) return;
    estado = nuevo;
    sb.hidden = nuevo === 'oculto';
    sb.classList.toggle('up', nuevo === 'arriba');
    sb.setAttribute('aria-label', nuevo === 'arriba' ? 'Volver arriba' : 'Ir abajo');
    sb.firstElementChild.textContent = nuevo === 'arriba' ? '↑' : '↓';
  }
  if (sb) {
    sb.addEventListener('click', function () { irA(estado === 'arriba' ? 0 : alto); });
    addEventListener('scroll', function () { if (!esperando) { esperando = true; requestAnimationFrame(actualizarScroll); } }, { passive: true });
    addEventListener('resize', function () { medirAlto(); actualizarScroll(); }, { passive: true });
    addEventListener('load', function () { medirAlto(); actualizarScroll(); });
    medirAlto(); actualizarScroll();
    window.actualizarScroll = function () { medirAlto(); estado = ''; actualizarScroll(); };
  }

  /* ================= Entradas: flechas del teclado para anterior / siguiente ================= */
  document.addEventListener('keydown', function (e) {
    if (e.target.closest('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key === 'ArrowLeft' ? 'prev' : e.key === 'ArrowRight' ? 'next' : null;
    if (!k) return;
    var l = document.querySelectorAll('[data-key="' + k + '"]');
    for (var i = 0; i < l.length; i++) if (l[i].offsetParent) { l[i].click(); break; }
  });
})();
