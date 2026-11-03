(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var lang = root.lang || 'es';
  var en = lang === 'en';

  /* idioma: cada idioma tiene su dirección; la elección se recuerda */
  var ids = { proyectos: 'projects', experiencia: 'experience', formacion: 'education', contacto: 'contact' };
  function mapHash(hash, to) {
    var id = (hash || '').replace('#', '');
    if (!id) return '';
    if (to === 'en' && ids[id]) return '#' + ids[id];
    if (to === 'es') for (var k in ids) if (ids[k] === id) return '#' + k;
    return '#' + id;
  }
  var sw = document.querySelector('[data-switch]');
  if (sw) {
    var target = sw.getAttribute('data-switch');
    sw.addEventListener('click', function (e) {
      try { localStorage.setItem('lang', target); } catch (x) {}
      var h = mapHash(location.hash, target);
      if (h) { e.preventDefault(); location.href = sw.getAttribute('href') + h; }
    });
    var saved = null;
    try { saved = localStorage.getItem('lang'); } catch (x) {}
    if (saved === target && !document.querySelector('.nf')) {
      location.replace(sw.getAttribute('href') + mapHash(location.hash, target));
      return;
    }
  }

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
      entries.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add('in'); io.unobserve(it.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    if (brand) brand.classList.remove('hidden');
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* vídeos: sin reproducción automática si el sistema pide reducir movimiento */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(function (vd) {
      vd.removeAttribute('autoplay'); vd.pause(); vd.setAttribute('controls', '');
    });
  }

  /* YouTube: el reproductor solo se carga al pulsar */
  document.querySelectorAll('.yt').forEach(function (box) {
    var a = box.querySelector('.yt-play');
    if (!a) return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-yt') + '?autoplay=1&rel=0';
      f.title = box.getAttribute('data-title') || 'YouTube';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      box.appendChild(f);
      a.remove();
    });
  });

  /* visor: las capturas se amplían al pulsarlas */
  var zoomables = document.querySelectorAll('.stage img, .gallery img, .phone-gallery img');
  if (zoomables.length && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', en ? 'Enlarged image' : 'Imagen ampliada');
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'lb-close';
    close.setAttribute('aria-label', en ? 'Close' : 'Cerrar');
    close.textContent = '×';
    var big = document.createElement('img');
    dlg.appendChild(close);
    dlg.appendChild(big);
    document.body.appendChild(dlg);
    var last = null;
    zoomables.forEach(function (im) {
      im.setAttribute('tabindex', '0');
      im.setAttribute('role', 'button');
      im.setAttribute('aria-label', (en ? 'Enlarge: ' : 'Ampliar: ') + im.alt);
      function open() {
        last = im;
        big.src = im.currentSrc || im.src;
        big.alt = im.alt;
        dlg.showModal();
      }
      im.addEventListener('click', open);
      im.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
    dlg.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('close', function () { if (last) last.focus(); });
  }
})();
