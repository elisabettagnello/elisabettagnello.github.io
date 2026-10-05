(function () {
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[data-page]'));
  var ids = pages.map(function (p) { return p.id; });

  function show(id, push) {
    if (ids.indexOf(id) === -1) id = ids[0];
    pages.forEach(function (p) { p.classList.toggle('on', p.id === id); });
    links.forEach(function (a) {
      if (a.dataset.page === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (push) history.replaceState(null, '', '#' + id);
    document.title = (id === ids[0] ? '' : links.filter(function (a) { return a.dataset.page === id; })[0].textContent + ' | ') + 'Elisabetta Agnello';
  }

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      show(a.dataset.page, true);
      window.scrollTo({ top: 0 });
    });
  });
  window.addEventListener('hashchange', function () { show(location.hash.slice(1), false); });

  document.documentElement.classList.add('js');
  show(location.hash.slice(1), false);

  var btn = document.getElementById('toggle');
  var more = document.getElementById('side-more');
  if (btn && more) {
    btn.addEventListener('click', function () {
      var open = more.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? 'Hide contacts' : 'Show contacts';
    });
  }
})();
