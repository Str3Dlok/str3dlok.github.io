// Filtro por hashtag de la bitácora. Admite ?tag=nombre en la URL.
(function () {
  function filtrar(f) {
    var btns = document.querySelectorAll('#filters button');
    var posts = document.querySelectorAll('#list .post');
    var n = 0, existe = false;
    btns.forEach(function (b) { if (b.dataset.f === f) existe = true; });
    if (!existe) f = 'Todas';
    btns.forEach(function (b) { b.classList.toggle('on', b.dataset.f === f); });
    posts.forEach(function (p) {
      var show = f === 'Todas' || (p.dataset.tags || '').split('|').indexOf(f) > -1;
      p.hidden = !show; if (show) n++;
    });
    document.getElementById('empty').hidden = n > 0;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#filters button');
    if (b) filtrar(b.dataset.f);
  });
  window.filtrarBitacora = filtrar;
  var q = new URLSearchParams(location.search).get('tag');
  filtrar(q || 'Todas');
})();
