// Filtro de categorías de la bitácora (sin dependencias)
(function () {
  var btns = document.querySelectorAll('#filters button');
  var posts = document.querySelectorAll('#list .post');
  var empty = document.getElementById('empty');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.f, n = 0;
      btns.forEach(function (x) { x.classList.toggle('on', x === b); });
      posts.forEach(function (p) {
        var show = f === 'Todas' || p.dataset.cat === f;
        p.hidden = !show; if (show) n++;
      });
      empty.hidden = n > 0;
    });
  });
})();
