/* ==========================================================================
   Fleur de Marrakech — interactions
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------ La carte ------------------------------ */
  var MENU = {
    entrees: [
      { name: 'Harira', desc: 'Soupe de tomates, lentilles et pois chiches, dattes et chebakia', price: '8 €' },
      { name: 'Zaalouk & taktouka', desc: 'Caviar d\'aubergine fumée et poivrons grillés, pain maison', price: '9 €' },
      { name: 'Briouates', desc: 'Feuilles croustillantes au bœuf épicé ou au fromage frais', price: '10 €' },
      { name: 'Pastilla au poulet', desc: 'Amandes, cannelle et sucre glace, feuille de brick dorée', price: '14 €' }
    ],
    tajines: [
      { name: 'Tajine d\'agneau aux pruneaux', desc: 'Amandes grillées, sésame, sauce au miel et cannelle', price: '22 €' },
      { name: 'Tajine de poulet au citron', desc: 'Citron confit, olives violettes, gingembre et safran', price: '19 €' },
      { name: 'Tajine de kefta', desc: 'Boulettes de bœuf, sauce tomate épicée, œuf cassé', price: '18 €' },
      { name: 'Tangia marrakchie', desc: 'Jarret de veau cuit sept heures au cumin et à l\'ail', price: '24 €' }
    ],
    couscous: [
      { name: 'Couscous royal', desc: 'Agneau, poulet, merguez, sept légumes et bouillon', price: '24 €' },
      { name: 'Couscous tfaya', desc: 'Oignons caramélisés, raisins secs, pois chiches, agneau', price: '21 €' },
      { name: 'Couscous aux légumes', desc: 'Sept légumes de saison, pois chiches, bouillon épicé', price: '16 €' },
      { name: 'Méchoui', desc: 'Épaule d\'agneau rôtie au cumin, pour deux personnes', price: '48 €' }
    ],
    desserts: [
      { name: 'Pastilla au lait', desc: 'Feuilles croustillantes, crème à la fleur d\'oranger, amandes', price: '9 €' },
      { name: 'Assortiment de pâtisseries', desc: 'Cornes de gazelle, chebakia, ghriba', price: '8 €' },
      { name: 'Salade d\'oranges', desc: 'Cannelle, eau de fleur d\'oranger, menthe', price: '7 €' },
      { name: 'Thé à la menthe', desc: 'Servi à la théière, menthe fraîche', price: '4 €' }
    ]
  };

  /* ------------------------------ La fleur (logo) ------------------------------ */
  var PETAL = 'M0,-9 C11,-20 11,-34 0,-46 C-11,-34 -11,-20 0,-9Z';
  var INNER = 'M0,-6 C6,-11 6,-19 0,-26 C-6,-19 -6,-11 0,-6Z';

  function el(tag, attrs) {
    var n = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // Fleur à huit pétales ; « animated » la dessine trait par trait puis la fait tourner.
  function flower(color, animated) {
    var svg = el('svg', {
      viewBox: '-50 -50 100 100', fill: 'none', stroke: color,
      'stroke-width': 3.2, 'stroke-linejoin': 'round', 'aria-hidden': 'true'
    });
    var root = el('g', {});
    var outer = el('g', {});
    var inner = el('g', {});
    for (var i = 0; i < 8; i++) {
      var o = el('path', { d: PETAL, transform: 'rotate(' + i * 45 + ')' });
      var n = el('path', { d: INNER, transform: 'rotate(' + (i * 45 + 22.5) + ')' });
      if (animated && !reduceMotion) {
        [[o, '1.2s', i * 0.09], [n, '1s', 0.8 + i * 0.07]].forEach(function (p) {
          p[0].setAttribute('pathLength', 1);
          p[0].style.strokeDasharray = 1;
          p[0].style.strokeDashoffset = 1;
          p[0].style.animation = 'fdmDraw ' + p[1] + ' cubic-bezier(.6,0,.2,1) ' + p[2] + 's forwards';
        });
      }
      outer.appendChild(o);
      inner.appendChild(n);
    }
    var dot = el('circle', { r: 3.2, fill: color });
    if (animated) {
      root.style.cssText = 'animation:fdmSpin 60s linear 2s infinite;transform-origin:0 0';
      inner.style.cssText = 'animation:fdmSpin 24s linear 2s infinite reverse;transform-origin:0 0';
      dot.style.cssText = 'animation:fdmPulse 3s ease-in-out 2s infinite;transform-origin:0 0';
    }
    root.appendChild(outer);
    root.appendChild(inner);
    root.appendChild(dot);
    svg.appendChild(root);
    return svg;
  }

  document.querySelectorAll('[data-flower]').forEach(function (host) {
    var v = host.getAttribute('data-flower');
    host.appendChild(v === 'anim' ? flower('currentColor', true) : flower(v, false));
  });

  /* ------------------------------ Bandeau défilant ------------------------------ */
  var marquee = document.getElementById('marquee');
  if (marquee) {
    var words = ['TAJINES', 'COUSCOUS', 'PASTILLA', 'TANGIA', 'MÉCHOUI', 'THÉ À LA MENTHE', 'PÂTISSERIES'];
    for (var r = 0; r < 2; r++) {
      var row = document.createElement('div');
      row.className = 'marquee-row';
      words.forEach(function (w) {
        var s = document.createElement('span');
        s.textContent = w;
        var f = document.createElement('span');
        f.setAttribute('data-flower', '');
        f.appendChild(flower('#e8c98f', false));
        row.appendChild(s);
        row.appendChild(f);
      });
      marquee.appendChild(row);
    }
  }

  /* ------------------------------ Ouvert / fermé ------------------------------ */
  // Midi : tous les jours sauf lundi, 12h00–14h30. Soir : mardi à samedi, 19h00–23h00.
  function slots(d) {
    var s = [];
    if (d !== 1) s.push([720, 870]);
    if (d >= 2 && d <= 6) s.push([1140, 1380]);
    return s;
  }
  function fmt(m) { return Math.floor(m / 60) + 'h' + String(m % 60).padStart(2, '0'); }
  function openStatus(now) {
    var days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    var d = now.getDay(), t = now.getHours() * 60 + now.getMinutes(), i, s = slots(d);
    for (i = 0; i < s.length; i++) if (t >= s[i][0] && t < s[i][1]) return { open: true, text: 'Ouvert · jusqu\'à ' + fmt(s[i][1]) };
    for (i = 0; i < s.length; i++) if (t < s[i][0]) return { open: false, text: 'Ouvre aujourd\'hui à ' + fmt(s[i][0]) };
    for (i = 1; i < 8; i++) {
      var nd = (d + i) % 7, ns = slots(nd);
      if (ns.length) return { open: false, text: 'Fermé · réouverture ' + (i === 1 ? 'demain' : days[nd]) + ' à ' + fmt(ns[0][0]) };
    }
  }
  function renderStatus() {
    var st = openStatus(new Date());
    var box = document.querySelector('.status');
    document.getElementById('statusText').textContent = st.text;
    box.classList.toggle('is-open', st.open);
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  /* ------------------------------ Apparitions ------------------------------ */
  function reveal(node, delay) {
    node.style.transition = 'opacity .9s ' + EASE + ' ' + delay + 'ms, transform 1s ' + EASE + ' ' + delay + 'ms';
    node.classList.add('is-in');
    // Une fois apparu, on rend la main aux transitions de survol définies en CSS.
    setTimeout(function () { node.style.transition = ''; }, delay + 1100);
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      reveal(e.target, +e.target.dataset.delay || 0);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

  function observe(nodes) {
    nodes.forEach(function (n) {
      var sib = n.parentElement ? Array.prototype.indexOf.call(n.parentElement.children, n) : 0;
      n.dataset.delay = Math.min(sib, 6) * 90;
      if (io) io.observe(n); else n.classList.add('is-in');
    });
  }
  observe(document.querySelectorAll('[data-reveal]'));

  // Accueil : entrée en cascade au chargement.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.querySelectorAll('[data-intro]').forEach(function (n) {
        var d = (+n.dataset.intro) * 120;
        n.style.transition = 'opacity 1s ' + EASE + ' ' + d + 'ms, transform 1.1s ' + EASE + ' ' + d + 'ms';
        n.classList.add('is-in');
        setTimeout(function () { n.style.transition = ''; }, d + 1200);
      });
    });
  });

  /* ------------------------------ Onglets de la carte ------------------------------ */
  var dishes = document.getElementById('dishes');
  var tabs = document.querySelectorAll('#tabs [data-tab]');

  function renderDishes(key) {
    dishes.innerHTML = '';
    MENU[key].forEach(function (d) {
      var item = document.createElement('div');
      item.className = 'dish';
      item.innerHTML =
        '<div class="dish-row"><span class="dish-name"></span><span class="dish-dots"></span><span class="dish-price"></span></div>' +
        '<span class="dish-desc"></span>';
      item.querySelector('.dish-name').textContent = d.name;
      item.querySelector('.dish-price').textContent = d.price;
      item.querySelector('.dish-desc').textContent = d.desc;
      dishes.appendChild(item);
    });
    observe(dishes.querySelectorAll('.dish'));
  }

  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      renderDishes(btn.dataset.tab);
    });
  });
  renderDishes('tajines');

  /* ------------------------------ Menu latéral ------------------------------ */
  var body = document.body;
  var panel = document.getElementById('panel');
  var openBtn = document.getElementById('menuOpen');

  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) document.getElementById('menuClose').focus();
  }
  openBtn.addEventListener('click', function () { setMenu(true); });
  document.getElementById('menuClose').addEventListener('click', function () { setMenu(false); });
  document.getElementById('overlay').addEventListener('click', function () { setMenu(false); });
  panel.querySelectorAll('.panel-nav a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); openBtn.focus(); }
  });

  /* ------------------------------ Défilement : en-tête et parallaxe ------------------------------ */
  var header = document.getElementById('header');
  var parallax = document.querySelectorAll('[data-parallax]');
  var stuck = false;
  var ticking = false;

  function onScroll() {
    ticking = false;
    var vh = window.innerHeight;

    if (!reduceMotion) {
      parallax.forEach(function (n) {
        var r = n.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var off = r.top + r.height / 2 - vh / 2;
        n.style.transform = 'translate3d(0,' + (-off * parseFloat(n.dataset.parallax)).toFixed(1) + 'px,0)';
      });
    }

    var s = window.scrollY > vh * 0.75;
    if (s === stuck) return;
    stuck = s;
    if (s) {
      // L'en-tête se détache du visuel d'accueil et glisse depuis le haut.
      header.classList.add('is-stuck', 'is-hidden');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { header.classList.remove('is-hidden'); });
      });
    } else {
      header.classList.remove('is-stuck', 'is-hidden');
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ------------------------------ Réservation ------------------------------ */
  var guestsBox = document.getElementById('guests');
  var guests = 2;
  var guestBtns = [];
  for (var g = 1; g <= 8; g++) {
    (function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.textContent = n === 8 ? '8+' : String(n);
      b.addEventListener('click', function () { guests = n; paintGuests(); });
      guestBtns.push(b);
      guestsBox.appendChild(b);
    })(g);
  }
  function paintGuests() {
    guestBtns.forEach(function (b, i) {
      var on = i + 1 === guests;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }
  paintGuests();

  var dateInput = document.getElementById('dateInput');
  if (dateInput) {
    var t = new Date();
    dateInput.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  var form = document.getElementById('bookingForm');
  var sent = document.getElementById('sent');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('guestCount').textContent = guests === 8 ? '8+' : guests;
    form.hidden = true;
    sent.hidden = false;
  });
  document.getElementById('again').addEventListener('click', function () {
    form.reset();
    guests = 2;
    paintGuests();
    sent.hidden = true;
    form.hidden = false;
  });
})();
