// Bitácora: buscador por palabras clave / #hashtag + hashtags (varios) + rango de fechas + orden.
// Todos los filtros se combinan. El estado se refleja en la URL (?q=&tag=a,b&desde=&hasta=&orden=).
(function () {
  var list = document.getElementById('list');
  if (!list) return;
  var posts = [].slice.call(list.querySelectorAll('.post'));
  var q = document.getElementById('q'), desde = document.getElementById('desde'),
      hasta = document.getElementById('hasta'), orden = document.getElementById('orden'),
      chips = [].slice.call(document.querySelectorAll('#filters button')),
      cuenta = document.getElementById('cuenta'), limpiar = document.getElementById('limpiar'),
      empty = document.getElementById('empty');

  // Texto normalizado (sin tildes ni mayúsculas) para que "fotogrametria" encuentre "fotogrametría"
  function norm(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  posts.forEach(function (p) {
    p._tags = (p.dataset.tags || '').split('|').filter(Boolean);
    p._text = norm(p.dataset.text + ' ' + p._tags.join(' '));
  });

  // Meses disponibles (a partir de las entradas) para los selectores de fecha
  var meses = posts.map(function (p) { return p.dataset.date; })
    .filter(function (m, i, a) { return m && a.indexOf(m) === i; }).sort();
  var fmt = new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' });
  meses.forEach(function (m) {
    var etiqueta = fmt.format(new Date(m + '-15'));
    etiqueta = etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
    [desde, hasta].forEach(function (s) { var o = document.createElement('option'); o.value = m; o.textContent = etiqueta; s.appendChild(o); });
  });

  var elegidos = [];
  function aplicar(guardar) {
    var texto = norm(q.value.trim());
    var terminos = texto.split(/\s+/).filter(Boolean);
    var d = desde.value, h = hasta.value, n = 0;
    posts.forEach(function (p) {
      var ok = terminos.every(function (t) {
        return t.charAt(0) === '#' ? p._tags.some(function (g) { return norm(g).indexOf(t.slice(1)) === 0; }) : p._text.indexOf(t) > -1;
      });
      if (ok && elegidos.length) ok = elegidos.some(function (e) { return p._tags.indexOf(e) > -1; });
      if (ok && d) ok = p.dataset.date >= d;
      if (ok && h) ok = p.dataset.date <= h;
      p.hidden = !ok; if (ok) n++;
    });
    // Orden por fecha
    var asc = orden.value === 'asc';
    posts.slice().sort(function (a, b) { return asc ? a.dataset.ts - b.dataset.ts : b.dataset.ts - a.dataset.ts; })
      .forEach(function (p) { list.appendChild(p); });
    chips.forEach(function (c) { var on = elegidos.indexOf(c.dataset.f) > -1; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
    var activo = terminos.length || elegidos.length || d || h || asc;
    cuenta.textContent = n + (n === 1 ? ' entrada' : ' entradas') + (activo ? ' de ' + posts.length : '');
    limpiar.hidden = !activo;
    empty.hidden = n > 0;
    if (guardar !== false && history.replaceState && location.protocol !== 'file:') {
      var u = new URLSearchParams();
      if (q.value.trim()) u.set('q', q.value.trim());
      if (elegidos.length) u.set('tag', elegidos.join(','));
      if (d) u.set('desde', d); if (h) u.set('hasta', h); if (asc) u.set('orden', 'asc');
      var s = u.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
    }
  }

  var temporizador;
  q.addEventListener('input', function () { clearTimeout(temporizador); temporizador = setTimeout(aplicar, 120); });
  [desde, hasta, orden].forEach(function (s) { s.addEventListener('change', aplicar); });
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var i = elegidos.indexOf(c.dataset.f);
      if (i > -1) elegidos.splice(i, 1); else elegidos.push(c.dataset.f);
      aplicar();
    });
  });
  limpiar.addEventListener('click', function () {
    q.value = ''; desde.value = ''; hasta.value = ''; orden.value = 'desc'; elegidos = []; aplicar(); q.focus();
  });

  // Estado inicial desde la URL (también lo usan los enlaces de hashtag de cada entrada: ?tag=nombre)
  window.filtrarBitacora = function (params) {
    var u = new URLSearchParams(params || location.search);
    q.value = u.get('q') || '';
    elegidos = (u.get('tag') || '').split(',').filter(function (t) { return chips.some(function (c) { return c.dataset.f === t; }); });
    desde.value = u.get('desde') || ''; hasta.value = u.get('hasta') || ''; orden.value = u.get('orden') === 'asc' ? 'asc' : 'desc';
    aplicar(false);
  };
  window.filtrarBitacora();
})();
