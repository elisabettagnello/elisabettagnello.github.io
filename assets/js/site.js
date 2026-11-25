(function () {
  // Light / dark theme toggle (same behaviour as AcademicPages)
  var root = document.documentElement;
  var icon = document.getElementById('theme-icon');
  function show() {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (icon) icon.className = dark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
  show();
  var btn = document.querySelector('#theme-toggle button');
  if (btn) btn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark';
    if (dark) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('theme', dark ? 'light' : 'dark'); } catch (e) {}
    show();
  });

  // "Follow" button: opens the list of links on small screens
  var follow = document.querySelector('.author__urls-wrapper button');
  var urls = document.querySelector('.author__urls');
  if (follow && urls) follow.addEventListener('click', function () {
    var open = urls.style.display === 'block';
    urls.style.display = open ? '' : 'block';
    follow.classList.toggle('open', !open);
  });

  // Respect "reduce motion": stop the looping animation
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('video[autoplay]'), function (v) {
      v.removeAttribute('autoplay'); v.pause(); v.controls = true;
    });
  }
})();
