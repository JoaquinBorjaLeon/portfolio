(function () {
  var root = document.documentElement, body = document.body;
  root.classList.add('js');

  /* idioma: se guarda entre páginas */
  var btn = document.getElementById('langBtn'), saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  var initial = saved || ((navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en');
  var imgs = document.querySelectorAll('img[data-en]');
  imgs.forEach(function (i) { i.setAttribute('data-es', i.getAttribute('alt')); });
  function set(l) {
    body.setAttribute('data-lang', l);
    root.lang = l;
    var t = root.getAttribute('data-title-' + l);
    if (t) document.title = t;
    btn.textContent = l === 'es' ? 'EN' : 'ES';
    btn.setAttribute('aria-label', l === 'es' ? 'Switch to English' : 'Cambiar a español');
    imgs.forEach(function (i) { i.setAttribute('alt', i.getAttribute('data-' + l)); });
    try { localStorage.setItem('lang', l); } catch (e) {}
  }
  btn.addEventListener('click', function () { set(body.getAttribute('data-lang') === 'es' ? 'en' : 'es'); });
  set(initial);
  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  /* cabecera: sombra al bajar; en la portada el nombre aparece al salir del titular */
  var top = document.querySelector('.top'), brand = document.querySelector('.brand'), name = document.getElementById('name');
  function onScroll() { top.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var targets = document.querySelectorAll('.reveal,.chart');
  if ('IntersectionObserver' in window) {
    if (name && brand) {
      new IntersectionObserver(function (e) { brand.classList.toggle('hidden', e[0].isIntersecting); },
        { rootMargin: '-68px 0px 0px 0px' }).observe(name);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    if (brand) brand.classList.remove('hidden');
    targets.forEach(function (el) { el.classList.add('in'); });
  }
})();
