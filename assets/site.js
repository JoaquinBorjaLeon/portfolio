(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var lang = root.lang || 'es';
  var en = lang === 'en';
  var main = document.querySelector('main');
  var top = document.querySelector('.top'), brand = document.querySelector('.brand'), name = document.getElementById('name');

  /* punto de lectura: el bloque más pequeño que cruza una línea a un tercio de la pantalla
     y cuánto se ha avanzado dentro de él. Las dos versiones comparten estructura, así que
     el mismo bloque existe en el otro idioma aunque el texto mida distinto. */
  var PICK = 'section,article,figure,div,h1,h2,h3,h4,p,li,dt,dd,tr,img,video';
  function nodes() { return main ? main.querySelectorAll(PICK) : []; }
  function docTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
  function readLine() {
    var hb = top ? top.offsetHeight : 0;
    return hb + Math.round((window.innerHeight - hb) * 0.3);
  }
  function locate(list, line) {
    var best = -1, bestH = Infinity, next = -1, nextT = 0;
    for (var i = 0; i < list.length; i++) {
      var h = list[i].offsetHeight;
      if (!h) continue;
      var t = docTop(list[i]);
      if (t <= line && t + h > line) { if (h <= bestH) { best = i; bestH = h; } }
      else if (next < 0 && t > line) { next = i; nextT = t; }
    }
    if (best >= 0) {
      var b = list[best];
      return { i: best, n: list.length, tag: b.tagName, f: (line - docTop(b)) / b.offsetHeight };
    }
    if (next >= 0) return { i: next, n: list.length, tag: list[next].tagName, px: nextT - line };
    return null;
  }
  function spot(list, r) {
    if (!r || list.length !== r.n) return null;
    var el = list[r.i];
    if (!el || el.tagName !== r.tag || !el.offsetHeight) return null;
    var t = docTop(el);
    return r.px != null ? t - r.px : t + r.f * el.offsetHeight;
  }
  function where() {
    var y = window.scrollY, max = root.scrollHeight - window.innerHeight;
    if (y < 4) return null;
    if (max > 0 && y >= max - 4) return { end: 1 };
    var line = y + readLine();
    return { el: locate(nodes(), line), top: locate(main ? main.children : [], line) };
  }

  /* idioma: cada idioma tiene su dirección; la elección se recuerda y al cambiar
     se abre la otra versión en el mismo punto, sin volver arriba */
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
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var dest = sw.getAttribute('href');
      if (!document.querySelector('.nf')) {
        var at = where();
        if (at) {
          try { sessionStorage.setItem('pos', JSON.stringify({ to: new URL(dest, location.href).pathname, at: at })); } catch (x) {}
        }
      }
      e.preventDefault();
      location.href = dest;
    });
    var saved = null;
    try { saved = localStorage.getItem('lang'); } catch (x) {}
    var nav = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
    if (saved === target && !document.querySelector('.nf') && !(nav && nav.type === 'back_forward')) {
      location.replace(sw.getAttribute('href') + mapHash(location.hash, target));
      return;
    }
  }

  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  /* cabecera: sombra al bajar; en la portada el nombre aparece al salir del titular */
  function onScroll() { if (top) top.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* menú en móvil y tablet: el botón abre las secciones bajo la cabecera */
  var menu = document.querySelector('.menu'), closeMenu = function () {};
  if (menu && top) {
    var shut = menu.textContent, opened = menu.getAttribute('data-close') || shut;
    var setMenu = function (open) {
      top.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.textContent = open ? opened : shut;
    };
    closeMenu = function () { setMenu(false); };
    menu.addEventListener('click', function () { setMenu(!top.classList.contains('open')); });
    document.querySelectorAll('#nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && top.classList.contains('open')) { setMenu(false); menu.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (top.classList.contains('open') && !top.contains(e.target)) setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (top.classList.contains('open') && getComputedStyle(menu).display === 'none') setMenu(false);
    });
  }

  /* el nombre de la cabecera: en la portada sube arriba con suavidad en vez de recargar */
  if (brand) {
    brand.addEventListener('click', function (e) {
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (new URL(brand.href, location.href).pathname !== location.pathname) return;
      e.preventDefault();
      closeMenu();
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
    });
  }

  /* al llegar desde el otro idioma: lo que ya estabas viendo aparece sin animación y en su sitio */
  var pend = null;
  try { pend = JSON.parse(sessionStorage.getItem('pos') || 'null'); sessionStorage.removeItem('pos'); } catch (x) {}
  if (pend && pend.at && pend.to === location.pathname) {
    root.classList.add('still');
    document.querySelectorAll('.reveal,.chart').forEach(function (el) { el.classList.add('in'); });
    var restored = false;
    var restore = function () {
      if (restored) return;
      restored = true;
      try {
        var a = pend.at, to = null;
        if (a.end) to = root.scrollHeight;
        else {
          to = spot(nodes(), a.el);
          if (to == null) to = spot(main ? main.children : [], a.top);
          if (to != null) to -= readLine();
        }
        if (to != null) {
          to = Math.max(0, Math.round(to));
          try { window.scrollTo({ top: to, left: 0, behavior: 'instant' }); } catch (x) { window.scrollTo(0, to); }
        }
        onScroll();
        if (name && brand) brand.classList.toggle('hidden', name.getBoundingClientRect().bottom > (top ? top.offsetHeight : 0));
        void root.offsetHeight;
      } finally {
        root.classList.remove('hold', 'still');
      }
    };
    void root.offsetHeight;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(restore, restore);
      setTimeout(restore, 800);
    } else restore();
  } else root.classList.remove('hold', 'kept');

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
