(function () {
  'use strict';

  var S = window.SITE || {};
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var COLORS = ['#FF6F91', '#FFC857', '#FFF3F0', '#7BC8A4', '#8EC5FF', '#FF9F1C', '#C79BFF'];
  var TYPES = ['sphere', 'heart', 'ring', 'sphere', 'heart'];

  /* ------------------------------------------------------------------
     Text from config.js
  ------------------------------------------------------------------ */
  var words = document.querySelectorAll('#title .w');
  if (words[2]) words[2].textContent = S.mom || 'แม่';
  if (S.tagline) $('#tagline').textContent = S.tagline;
  $('#foot').textContent = S.footer || '';

  var tz = S.tz || '+07:00';
  var start = new Date((S.date || '2026-11-25') + 'T00:00:00' + tz).getTime();
  var end = start + 86400000;
  try {
    $('#dateChip').textContent = new Date(start).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok'
    });
  } catch (e) { /* keep default text */ }

  /* ------------------------------------------------------------------
     Fireworks + confetti canvas
  ------------------------------------------------------------------ */
  var cv = $('#fx');
  var ctx = cv.getContext('2d');
  var W = 0, H = 0;
  var rockets = [], sparks = [], bits = [], flashes = [];
  var running = false, last = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  function ensure() {
    if (!running) { running = true; last = 0; requestAnimationFrame(loop); }
  }

  function launch(x, targetY, type) {
    var g = 0.18;
    var rise = Math.max(120, H - targetY);
    rockets.push({
      x: x, y: H + 8,
      vx: rnd(-0.5, 0.5),
      vy: -Math.sqrt(2 * g * rise),
      type: type || pick(TYPES),
      color: pick(COLORS)
    });
    ensure();
  }

  function explode(x, y, color, type) {
    flashes.push({ x: x, y: y, life: 1 });
    var n = type === 'ring' ? 72 : type === 'heart' ? 96 : 110;
    var pal = Math.random() < 0.5 ? [color] : [color, pick(COLORS), '#FFF3F0'];
    var scale = rnd(0.9, 1.15);
    for (var i = 0; i < n; i++) {
      var vx, vy, f = 0.972, a, sp, t;
      if (type === 'heart') {
        t = (i / n) * Math.PI * 2;
        vx = 16 * Math.pow(Math.sin(t), 3) * 0.26 * scale;
        vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.26 * scale;
        f = 0.955;
      } else if (type === 'ring') {
        a = (i / n) * Math.PI * 2;
        sp = 4.2 * scale;
        vx = Math.cos(a) * sp;
        vy = Math.sin(a) * sp;
        f = 0.965;
      } else {
        a = rnd(0, Math.PI * 2);
        sp = rnd(1, 5.4) * (Math.random() < 0.3 ? 0.55 : 1);
        vx = Math.cos(a) * sp;
        vy = Math.sin(a) * sp;
      }
      sparks.push({
        x: x, y: y, px: x, py: y, vx: vx, vy: vy, f: f, g: 0.05,
        life: 1, decay: rnd(0.008, 0.015), size: rnd(1.4, 2.6), color: pick(pal)
      });
    }
    ensure();
  }

  function cannon(x, dir) {
    for (var i = 0; i < 64; i++) {
      bits.push({
        x: x, y: H + 6,
        vx: dir * rnd(0.5, 7.5) + rnd(-1, 1),
        vy: -rnd(12, 20),
        w: rnd(6, 11), h: rnd(9, 16),
        rot: rnd(0, 6.28), vr: rnd(-0.25, 0.25),
        t: rnd(0, 6.28), color: pick(COLORS)
      });
    }
    ensure();
  }

  function confettiAt(x, y, n) {
    for (var i = 0; i < n; i++) {
      var a = rnd(0, Math.PI * 2), sp = rnd(2, 8);
      bits.push({
        x: x, y: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
        w: rnd(6, 10), h: rnd(8, 14),
        rot: rnd(0, 6.28), vr: rnd(-0.3, 0.3),
        t: rnd(0, 6.28), color: pick(COLORS)
      });
    }
    ensure();
  }

  function loop(now) {
    var dt = Math.min(40, last ? now - last : 16);
    last = now;
    var k = dt / 16.667;
    var i, r, s, b, fl;

    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'lighter';

    for (i = rockets.length - 1; i >= 0; i--) {
      r = rockets[i];
      r.x += r.vx * k;
      r.y += r.vy * k;
      r.vy += 0.18 * k;
      if (sparks.length < 1800) {
        sparks.push({
          x: r.x, y: r.y, px: r.x, py: r.y,
          vx: rnd(-0.3, 0.3), vy: rnd(0.2, 1), f: 0.96, g: 0.03,
          life: 1, decay: 0.05, size: 1.6, color: '#FFE3A8'
        });
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FFF6DD';
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.2, 0, 6.2832);
      ctx.fill();
      if (r.vy >= -0.6) {
        explode(r.x, r.y, r.color, r.type);
        rockets.splice(i, 1);
      }
    }

    for (i = flashes.length - 1; i >= 0; i--) {
      fl = flashes[i];
      fl.life -= 0.08 * k;
      if (fl.life <= 0) { flashes.splice(i, 1); continue; }
      var rad = 30 + (1 - fl.life) * 110;
      var gr = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, rad);
      gr.addColorStop(0, 'rgba(255,240,210,' + (0.55 * fl.life) + ')');
      gr.addColorStop(1, 'rgba(255,240,210,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, rad, 0, 6.2832);
      ctx.fill();
    }

    for (i = sparks.length - 1; i >= 0; i--) {
      s = sparks[i];
      s.px = s.x;
      s.py = s.y;
      var fr = Math.pow(s.f, k);
      s.vx *= fr;
      s.vy *= fr;
      s.vy += s.g * k;
      s.x += s.vx * k;
      s.y += s.vy * k;
      s.life -= s.decay * k;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, s.life) * (s.life < 0.3 ? 0.5 + Math.random() * 0.5 : 1);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size * (0.4 + s.life * 0.6);
      ctx.beginPath();
      ctx.moveTo(s.px, s.py);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    for (i = bits.length - 1; i >= 0; i--) {
      b = bits[i];
      b.t += 0.12 * k;
      b.vy += 0.13 * k;
      var dr = Math.pow(0.97, k);
      b.vx = b.vx * dr + Math.sin(b.t) * 0.12 * k;
      b.vy *= dr;
      b.x += b.vx * k;
      b.y += b.vy * k;
      b.rot += b.vr * k;
      if (b.y > H + 30) { bits.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.scale(1, Math.cos(b.t * 1.3));
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }

    if (rockets.length || sparks.length || bits.length || flashes.length) {
      requestAnimationFrame(loop);
    } else {
      running = false;
      ctx.clearRect(0, 0, W, H);
    }
  }

  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function finale() {
    cannon(W * 0.06, 1);
    cannon(W * 0.94, -1);
    var seq = ['heart', 'sphere', 'ring', 'sphere', 'heart', 'ring', 'sphere', 'heart', 'sphere', 'ring', 'heart', 'sphere'];
    seq.forEach(function (t, i) {
      later(function () { launch(W * rnd(0.12, 0.88), H * rnd(0.1, 0.45), t); }, i * 320);
    });
    later(function () { cannon(W * 0.2, 1); cannon(W * 0.8, -1); }, 2200);
    later(function () {
      for (var i = 0; i < 6; i++) {
        (function (j) { later(function () { launch(W * rnd(0.1, 0.9), H * rnd(0.1, 0.4)); }, j * 220); })(i);
      }
    }, 3800);
  }

  /* ------------------------------------------------------------------
     Hero: stars, balloons, hearts, interactions
  ------------------------------------------------------------------ */
  var hero = $('#hero');
  var heroVisible = true;

  var starBox = $('#stars');
  for (var si = 0; si < 70; si++) {
    var st = el('span', 'star');
    var sz = rnd(1, 3);
    st.style.left = rnd(0, 100) + '%';
    st.style.top = rnd(0, 100) + '%';
    st.style.width = sz + 'px';
    st.style.height = sz + 'px';
    st.style.setProperty('--t', rnd(2, 5) + 's');
    st.style.setProperty('--dl', -rnd(0, 5) + 's');
    starBox.appendChild(st);
  }

  var balloonBox = $('#balloons');
  var BCOL = ['#FF6F91', '#FFC857', '#8EC5FF', '#7BC8A4', '#C79BFF', '#FF9F7A'];
  function makeBalloon(initial) {
    var b = el('div', 'balloon');
    b.appendChild(el('i'));
    b.style.setProperty('--c', pick(BCOL));
    b.style.setProperty('--x', rnd(2, 90) + '%');
    b.style.setProperty('--s', rnd(0.75, 1.2).toFixed(2));
    b.style.setProperty('--d', rnd(12, 22).toFixed(1) + 's');
    b.style.setProperty('--delay', (initial ? -rnd(0, 20) : 0).toFixed(1) + 's');
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var rc = b.getBoundingClientRect();
      confettiAt(rc.left + rc.width / 2, rc.top + rc.height / 2, 30);
      if (b.parentNode) b.parentNode.removeChild(b);
      setTimeout(function () { makeBalloon(false); }, 1500);
    });
    balloonBox.appendChild(b);
  }
  for (var bi = 0; bi < 9; bi++) makeBalloon(true);

  for (var hi = 0; hi < 12; hi++) {
    var h = el('span', 'heart', '♥︎');
    h.style.setProperty('--x', rnd(2, 96) + '%');
    h.style.setProperty('--s', rnd(0.7, 1.6).toFixed(2));
    h.style.setProperty('--d', rnd(16, 28).toFixed(1) + 's');
    h.style.setProperty('--delay', (-rnd(0, 26)).toFixed(1) + 's');
    balloonBox.appendChild(h);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }, { threshold: 0.1 }).observe(hero);
  }

  hero.addEventListener('click', function (e) {
    if (e.target.closest('button, a, .balloon')) return;
    launch(e.clientX, Math.max(40, e.clientY), pick(TYPES));
  });

  var lastTrail = 0;
  hero.addEventListener('pointermove', function (e) {
    if (reduce || e.pointerType !== 'mouse') return;
    var now = performance.now();
    if (now - lastTrail < 30) return;
    lastTrail = now;
    for (var i = 0; i < 2; i++) {
      sparks.push({
        x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY,
        vx: rnd(-0.7, 0.7), vy: rnd(-0.3, 0.9), f: 0.95, g: 0.04,
        life: 1, decay: 0.04, size: 2.2, color: pick(['#FFC857', '#FF6F91', '#FFF3F0'])
      });
    }
    ensure();
  });

  if (!reduce) {
    setInterval(function () {
      if (document.hidden || !heroVisible || sparks.length > 600) return;
      launch(W * rnd(0.1, 0.9), H * rnd(0.1, 0.4));
    }, 2200);
    setTimeout(function () {
      launch(W * 0.25, H * 0.25, 'heart');
      setTimeout(function () { launch(W * 0.75, H * 0.3, 'sphere'); }, 350);
      setTimeout(function () { launch(W * 0.5, H * 0.2, 'ring'); }, 700);
    }, 700);
  }

  $('#fab').addEventListener('click', finale);

  /* cake */
  var cake = $('#cake'), blow = $('#blow'), note = $('#blowNote'), blown = false;
  blow.addEventListener('click', function () {
    blown = !blown;
    cake.classList.toggle('blown', blown);
    blow.textContent = blown ? 'จุดเทียนใหม่' : 'เป่าเทียน';
    note.textContent = blown ? 'ขอให้พรเป็นจริงนะคะแม่' : 'แตะปุ่มเพื่อเป่าเทียนให้แม่';
    if (blown) finale();
  });

  /* ------------------------------------------------------------------
     Countdown
  ------------------------------------------------------------------ */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var now = Date.now();
    var diff = start - now;
    if (diff > 0) {
      var s = Math.floor(diff / 1000);
      $('#d').textContent = Math.floor(s / 86400);
      $('#h').textContent = pad(Math.floor((s % 86400) / 3600));
      $('#m').textContent = pad(Math.floor((s % 3600) / 60));
      $('#s').textContent = pad(s % 60);
      $('#countLabel').textContent = 'อีกไม่นานถึงวันเกิดแม่';
      $('#tiles').hidden = false;
      $('#today').hidden = true;
    } else {
      $('#tiles').hidden = true;
      $('#today').hidden = false;
      if (now < end) {
        $('#countLabel').textContent = 'วันนี้เป็นวันของแม่';
        $('#today').textContent = 'สุขสันต์วันเกิดนะคะแม่';
      } else {
        $('#countLabel').textContent = 'วันเกิดแม่ผ่านไปแล้ว';
        $('#today').textContent = 'ขอให้แม่มีความสุขทุกวันค่ะ';
      }
    }
  }
  tick();
  setInterval(tick, 1000);
  if (Date.now() >= start && Date.now() < end) setTimeout(finale, 1200);

  /* ------------------------------------------------------------------
     Wishes
  ------------------------------------------------------------------ */
  var wishBox = $('#wishList');
  (S.wishes || []).forEach(function (w) {
    var c = el('article', 'wcard reveal');
    c.appendChild(el('p', '', w.text || ''));
    c.appendChild(el('p', 'from', w.from || ''));
    wishBox.appendChild(c);
  });

  /* ------------------------------------------------------------------
     Photos + lightbox
  ------------------------------------------------------------------ */
  var HEART = 'M12 21C3 14 2 7.500 6.500 4.500c3-2 5.500 0 5.500 2.500 0-2.500 2.500-4.500 5.500-2.500C22 7.500 21 14 12 21z';
  function svgIcon(path) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(ns, 'path');
    p.setAttribute('d', path);
    svg.appendChild(p);
    return svg;
  }

  var photos = S.photos || [];
  var photoBox = $('#photos');
  var ROT = [-3, 2, -1.5, 3, -2, 1.5];
  var dlg = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), idx = 0;

  function show(i) {
    idx = (i + photos.length) % photos.length;
    lbImg.src = photos[idx].src;
    lbImg.alt = photos[idx].caption || '';
    lbCap.textContent = photos[idx].caption || '';
  }
  function openLb(i) {
    show(i);
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute('open', '');
  }

  if (photos.length) {
    photos.forEach(function (p, i) {
      var b = el('button', 'polaroid reveal');
      b.type = 'button';
      b.style.setProperty('--r', ROT[i % ROT.length] + 'deg');
      var fr = el('span', 'frame');
      var img = el('img');
      img.src = p.src;
      img.alt = p.caption || '';
      img.loading = 'lazy';
      fr.appendChild(img);
      b.appendChild(fr);
      b.appendChild(el('span', 'cap', p.caption || ''));
      b.addEventListener('click', function () { openLb(i); });
      photoBox.appendChild(b);
    });
  } else {
    var caps = ['รูปความทรงจำ', 'รูปครอบครัว', 'รูปวันสำคัญ', 'รูปทริปด้วยกัน', 'รูปรอยยิ้มของแม่', 'รูปวันเกิดปีที่แล้ว'];
    caps.forEach(function (c, i) {
      var d = el('div', 'polaroid is-empty reveal');
      d.style.setProperty('--r', ROT[i % ROT.length] + 'deg');
      var fr = el('span', 'frame');
      fr.appendChild(svgIcon(HEART));
      d.appendChild(fr);
      d.appendChild(el('span', 'cap', c));
      photoBox.appendChild(d);
    });
  }

  $('#lbClose').addEventListener('click', function () { dlg.close(); });
  $('#lbPrev').addEventListener('click', function () { show(idx - 1); });
  $('#lbNext').addEventListener('click', function () { show(idx + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  var tx = 0;
  dlg.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50 && photos.length) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ------------------------------------------------------------------
     Videos
  ------------------------------------------------------------------ */
  var videoBox = $('#videos');
  var videos = S.videos || [];
  var PLAY = 'M8 5v14l11-7z';

  if (videos.length) {
    videos.forEach(function (v) {
      var card = el('article', 'vcard reveal');
      var fr = el('div', 'vframe');
      if (v.youtube) {
        var ifr = el('iframe');
        ifr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.youtube);
        ifr.title = v.title || 'คลิป';
        ifr.loading = 'lazy';
        ifr.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
        ifr.setAttribute('allowfullscreen', '');
        fr.appendChild(ifr);
      } else if (v.src) {
        var vid = el('video');
        vid.src = v.src;
        vid.controls = true;
        vid.preload = 'metadata';
        vid.setAttribute('playsinline', '');
        if (v.poster) vid.poster = v.poster;
        fr.appendChild(vid);
      }
      card.appendChild(fr);
      if (v.title) card.appendChild(el('h3', '', v.title));
      videoBox.appendChild(card);
    });
  } else {
    ['คลิปความทรงจำ', 'คลิปจากครอบครัว'].forEach(function (t) {
      var card = el('article', 'vcard reveal');
      var fr = el('div', 'vframe empty');
      fr.appendChild(svgIcon(PLAY));
      card.appendChild(fr);
      card.appendChild(el('h3', '', t));
      videoBox.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal
  ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (n) { io.observe(n); });
  } else {
    revealEls.forEach(function (n) { n.classList.add('in'); });
  }
})();
