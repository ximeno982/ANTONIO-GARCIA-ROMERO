/* ============ DRIFT — script.js ============ */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Dibujo de un auto de lado (hero y tarjetas sin foto) ---------- */
  function sideCar(color, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M14 88C14 74 30 70 58 66L96 46C108 39 120 36 136 36H186C202 36 214 42 226 56L262 63C282 67 288 76 288 88V94H14Z" fill="' + color + '"/>' +
      '<path d="M104 50L130 41H150V62H86Z" fill="#0b0b12" opacity=".85"/>' +
      '<path d="M158 41H186C196 41 204 46 212 58L158 61Z" fill="#0b0b12" opacity=".85"/>' +
      '<path d="M8 56H46V63H8Z" fill="' + color + '"/><rect x="20" y="62" width="4" height="10" fill="#050508"/>' +
      '<rect x="282" y="76" width="8" height="6" rx="2" fill="#fff6c8"/>' +
      '<g><circle cx="76" cy="96" r="20" fill="#050508"/><circle cx="76" cy="96" r="11" fill="#9aa0b4"/><circle cx="76" cy="96" r="4" fill="#050508"/></g>' +
      '<g><circle cx="228" cy="96" r="20" fill="#050508"/><circle cx="228" cy="96" r="11" fill="#9aa0b4"/><circle cx="228" cy="96" r="4" fill="#050508"/></g>' +
      '</svg>';
  }

  /* ---------- Menú ---------- */
  (function () {
    var btn = $('#menuBtn'), panel = $('#menuPanel'), nav = $('nav');
    if (!btn || !panel) return;
    function set(open) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? '✕ Cerrar' : '☰ Menú';
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(panel.hidden); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('click', function (e) { if (!panel.hidden && !e.target.closest('nav')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    function sc() { nav.classList.toggle('sc', window.scrollY > 30); }
    window.addEventListener('scroll', sc, { passive: true }); sc();
  })();

  /* ---------- Aparecer al hacer scroll ---------- */
  var revealIO = null;
  function reveal(els) {
    if (reduce || !('IntersectionObserver' in window)) return;
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); revealIO.unobserve(x.target); } });
      }, { threshold: 0.1 });
    }
    els.forEach(function (el) { el.classList.add('rv'); revealIO.observe(el); });
  }
  reveal($$('.panel,.kpi,.ev,.mod,.glos>div,details,.rf-prize,.rf-card'));

  /* ---------- Hero: auto derrapando + humo ---------- */
  (function () {
    var cv = $('#smoke'), car = $('#heroCar'), hero = $('.hero');
    if (!cv || !car || !hero) return;
    car.innerHTML = sideCar('#ff2e63');
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, parts = [], running = true, t0 = performance.now(), raf = 0;
    var CYCLE = 9000;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size);

    function frame(now) {
      ctx.clearRect(0, 0, W, H);
      var cw = car.offsetWidth, ch = car.offsetHeight;
      var u = ((now - t0) % CYCLE) / CYCLE;
      var x = -cw + (W + cw * 2) * u;
      var wob = Math.sin(u * Math.PI * 6);
      car.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (wob * 3).toFixed(1) + 'px,0) rotate(' + (-3 + wob * 2).toFixed(2) + 'deg)';

      if (x > -cw * 0.2 && x < W) {
        var rx = x + cw * 0.26, ry = car.offsetTop + ch * 0.82;
        for (var i = 0; i < 3; i++) {
          parts.push({ x: rx + Math.random() * 10 - 5, y: ry + Math.random() * 6 - 3,
            vx: -(0.4 + Math.random() * 1.1), vy: -(0.15 + Math.random() * 0.6),
            r: 10 + Math.random() * 12, g: 0.5 + Math.random() * 0.6, a: 1, d: 0.008 + Math.random() * 0.01 });
        }
      }
      for (var k = parts.length - 1; k >= 0; k--) {
        var p = parts[k];
        p.x += p.vx; p.y += p.vy; p.r += p.g; p.a -= p.d;
        if (p.a <= 0) { parts.splice(k, 1); continue; }
        var gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        gr.addColorStop(0, 'rgba(235,235,248,' + (p.a * 0.32).toFixed(3) + ')');
        gr.addColorStop(1, 'rgba(235,235,248,0)');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      if (parts.length > 260) parts.splice(0, parts.length - 260);
      if (running) raf = requestAnimationFrame(frame);
    }

    if (reduce) {
      car.style.transform = 'translate3d(' + Math.round((W - car.offsetWidth) / 2) + 'px,0,0) rotate(-3deg)';
      return;
    }
    raf = requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting;
        if (vis && !running) { running = true; raf = requestAnimationFrame(frame); }
        else if (!vis) { running = false; cancelAnimationFrame(raf); }
      }).observe(hero);
    }
  })();

  /* ---------- Datos de los autos ---------- */
  // snd: ppr = pulsos de combustión por vuelta · idle/red = rpm · demás = carácter del sonido
  var FL = { jp: '🇯🇵 Japón', us: '🇺🇸 EE.UU.', eu: '🇩🇪 Alemania' };
  var CARS = [
    { n: 'Toyota AE86 Sprinter Trueno', c: 'jp', a: 'na', t: 'Atmosférico', eng: '4A-GE · 1.6 L I4', hp: '≈130 hp', dr: 'RWD', col: '#ff2e63',
      d: 'El ícono de Initial D: pequeño, ligero y de tracción trasera.', snd: { ppr: 2, idle: 900, red: 7800, lp: 1.4, noise: 0.9 } },
    { n: 'Nissan Silvia S13', c: 'jp', a: 'turbo', t: 'Turbo', eng: 'SR20DET · 2.0 L turbo I4', hp: '≈205 hp', dr: 'RWD', col: '#9aa0b4',
      d: 'Ligero, equilibrado y fácil de modificar. Un clásico de las pistas.', snd: { ppr: 2, idle: 900, red: 7400, turbo: 1 } },
    { n: 'Nissan Silvia S15', c: 'jp', a: 'turbo', t: 'Turbo', eng: 'SR20DET · 2.0 L turbo I4', hp: '≈250 hp', dr: 'RWD', col: '#c9cde0',
      d: 'La última generación de la familia Silvia, con turbo y gran balance.', snd: { ppr: 2, idle: 900, red: 7600, turbo: 1 } },
    { n: 'Nissan Skyline GT-R R32', c: 'jp', a: 'turbo', t: 'Biturbo', eng: 'RB26DETT · 2.6 L biturbo I6', hp: '≈280 hp', dr: 'AWD', col: '#e8e8f2',
      d: 'Skyline GT-R con motor RB26DETT. Muchos se convierten a tracción trasera para drift.', snd: { ppr: 3, idle: 900, red: 8000, turbo: 1 } },
    { n: 'Toyota Chaser JZX100', c: 'jp', a: 'turbo', t: 'Turbo', eng: '1JZ-GTE · 2.5 L turbo I6', hp: '≈280 hp', dr: 'RWD', col: '#9aa0b4',
      d: 'Sedán japonés muy popular en el estilo VIP y también en el drift.', snd: { ppr: 3, idle: 800, red: 7000, turbo: 1 } },
    { n: 'Toyota Supra A80', c: 'jp', a: 'turbo', t: 'Biturbo', eng: '2JZ-GTE · 3.0 L biturbo I6', hp: '≈280–320 hp', dr: 'RWD', col: '#ff8a3d',
      d: 'Famosa por su motor 2JZ, muy resistente y con mucho potencial de potencia.', snd: { ppr: 3, idle: 800, red: 7200, turbo: 1 } },
    { n: 'Mazda RX-7 (FD)', c: 'jp', a: 'turbo', t: 'Rotativo', eng: '13B-REW · 1.3 L rotativo biturbo', hp: '≈255–280 hp', dr: 'RWD', col: '#ff8a3d',
      d: 'Motor rotativo compacto que gira altísimo, con un sonido inconfundible.', snd: { ppr: 2, idle: 1000, red: 8000, wave: 'square', turbo: 1, rotary: 1, lp: 2, noise: 1.3 } },
    { n: 'Nissan 350Z', c: 'jp', a: 'na', t: 'Atmosférico', eng: 'VQ35DE · 3.5 L V6', hp: '≈287 hp', dr: 'RWD', col: '#ffd166',
      d: 'Coupé con V6 atmosférico: mucho par disponible sin necesitar turbo.', snd: { ppr: 3, idle: 750, red: 7200 } },
    { n: 'Toyota GR86', c: 'jp', a: 'na', t: 'Atmosférico', eng: 'FA24 · 2.4 L bóxer', hp: '≈228 hp', dr: 'RWD', col: '#ffd166',
      d: 'Moderno, ligero y de tracción trasera, con motor bóxer atmosférico.', snd: { ppr: 2, idle: 800, red: 7400, boxer: 1 } },
    { n: 'Mazda MX-5 Miata', c: 'jp', a: 'na', t: 'Atmosférico', eng: '1.8 L I4', hp: '≈130 hp', dr: 'RWD', col: '#08d9d6',
      d: 'Pequeño, ligero y accesible: ideal para aprender a controlar el ángulo.', snd: { ppr: 2, idle: 850, red: 7000, lp: 1.2 } },
    { n: 'BMW M3 (E36)', c: 'eu', a: 'na', t: 'Atmosférico', eng: 'S50 · 3.0 L I6', hp: '≈240 hp', dr: 'RWD', col: '#3d7bff',
      d: 'Seis cilindros en línea atmosférico con un sonido muy característico.', snd: { ppr: 3, idle: 800, red: 7200 } },
    { n: 'BMW M3 (E46)', c: 'eu', a: 'na', t: 'Atmosférico', eng: 'S54 · 3.2 L I6', hp: '≈340 hp', dr: 'RWD', col: '#9aa0b4',
      d: 'Seis cilindros en línea que gira alto y suena a carrera.', snd: { ppr: 3, idle: 850, red: 8000, lp: 1.3 } },
    { n: 'Ford Mustang', c: 'us', a: 'na', t: 'V8', eng: '5.0 L V8', hp: '≈480 hp', dr: 'RWD', col: '#e8e8f2',
      d: 'V8 de Detroit: mucho par y mucho humo. Muy presente en Formula Drift.', snd: { ppr: 4, idle: 700, red: 7400, v8: 1, lp: 0.9 } },
    { n: 'Chevrolet Corvette', c: 'us', a: 'na', t: 'V8', eng: 'LS · V8', hp: '≈350–400 hp', dr: 'RWD', col: '#ffd166',
      d: 'V8 con motor delantero y tracción trasera, muy visto en competencia.', snd: { ppr: 4, idle: 650, red: 6500, v8: 1, lp: 0.8 } }
  ];

  /* ---------- Motor de sonido (Web Audio) ---------- */
  var AC = null, cur = null, CYC = 7.0;

  function getAC() {
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  function curve(k) {
    var n = 1024, c = new Float32Array(n);
    for (var i = 0; i < n; i++) { var x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
    return c;
  }
  function noiseBuf(ac) {
    var len = ac.sampleRate * 2, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function blowOff(e) {
    var ac = AC, b = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime;
    b.buffer = e.nbuf; hp.type = 'highpass'; hp.frequency.value = 2500;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.3, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    b.connect(hp); hp.connect(g); g.connect(e.out); b.start(t); b.stop(t + 0.6);
  }

  // Guion de revoluciones: ralentí → acelerada → limitador → soltar → "blip" → ralentí
  function script(p, tc) {
    var I = p.idle, R = p.red, rpm, thr = 0.05, lim = false, u;
    if (tc < 1.0) { rpm = I + Math.sin(tc * 9) * 20; }
    else if (tc < 3.0) { u = (tc - 1) / 2; rpm = I + (R - 300 - I) * Math.pow(u, 1.6); thr = 0.6 + 0.4 * u; }
    else if (tc < 4.2) { lim = Math.floor(tc * 14) % 2 === 0; rpm = lim ? R : R - 450; thr = 1; }
    else if (tc < 5.4) { u = (tc - 4.2) / 1.2; rpm = I + (R - I) * Math.exp(-u * 4.2); thr = 0; }
    else if (tc < 6.2) { u = (tc - 5.4) / 0.8; rpm = I + 0.55 * (R - I) * Math.pow(Math.sin(u * Math.PI), 1.2); thr = 0.4 * Math.sin(u * Math.PI); }
    else { rpm = I; }
    return { rpm: rpm, thr: thr, lim: lim };
  }

  function stopEngine() {
    if (!cur) return;
    var e = cur; cur = null;
    cancelAnimationFrame(e.raf);
    try { var t = AC.currentTime; e.out.gain.cancelScheduledValues(t); e.out.gain.setTargetAtTime(0, t, 0.04); } catch (_) {}
    setTimeout(function () {
      [e.o1, e.o2, e.o3, e.lfo, e.wo, e.ns].forEach(function (n) { try { n.stop(); } catch (_) {} });
      try { e.out.disconnect(); } catch (_) {}
    }, 250);
    e.card.classList.remove('playing');
    e.btn.textContent = '🔊 Escuchar';
    e.btn.setAttribute('aria-pressed', 'false');
    $('#player').classList.remove('on');
  }

  function startEngine(car, card, btn) {
    stopEngine();
    var ac = getAC();
    if (!ac) { alert('Tu navegador no permite reproducir audio.'); return; }
    var p = car.snd, e = { card: card, btn: btn, t0: performance.now(), blown: false };

    var out = ac.createGain(); out.gain.value = 0;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.2;
    var sh = ac.createWaveShaper(); sh.curve = curve(p.v8 ? 18 : 30); sh.oversample = '2x';
    var comp = ac.createDynamicsCompressor();
    var an = ac.createAnalyser(); an.fftSize = 1024;

    var o1 = ac.createOscillator(); o1.type = p.wave || 'sawtooth';
    var o2 = ac.createOscillator(); o2.type = 'square';
    var o3 = ac.createOscillator(); o3.type = 'sawtooth';
    var g1 = ac.createGain(), g2 = ac.createGain(), g3 = ac.createGain();
    g1.gain.value = 0.55; g2.gain.value = 0.22; g3.gain.value = p.v8 ? 0.5 : 0.12;
    o1.connect(g1); o2.connect(g2); o3.connect(g3);
    g1.connect(sh); g2.connect(sh); g3.connect(sh); sh.connect(lp); lp.connect(out);

    // vibración del ralentí (bóxer / V8 / rotativo)
    var lfo = ac.createOscillator(), lg = ac.createGain();
    lfo.type = 'sine'; lg.gain.value = 0; lfo.connect(lg); lg.connect(g1.gain);

    // aire / escape
    e.nbuf = noiseBuf(ac);
    var ns = ac.createBufferSource(); ns.buffer = e.nbuf; ns.loop = true;
    var nbp = ac.createBiquadFilter(); nbp.type = 'bandpass'; nbp.Q.value = 0.8;
    var ng = ac.createGain(); ng.gain.value = 0;
    ns.connect(nbp); nbp.connect(ng); ng.connect(out);

    // silbido del turbo
    var wo = ac.createOscillator(); wo.type = 'sine';
    var wg = ac.createGain(); wg.gain.value = 0;
    wo.connect(wg); wg.connect(out);

    out.connect(an); out.connect(comp); comp.connect(ac.destination);
    [o1, o2, o3, lfo, wo, ns].forEach(function (n) { n.start(); });
    out.gain.setTargetAtTime(0.3, ac.currentTime, 0.05);

    e.out = out; e.o1 = o1; e.o2 = o2; e.o3 = o3; e.lfo = lfo; e.wo = wo; e.ns = ns;
    cur = e;

    card.classList.add('playing');
    btn.textContent = '⏹ Detener'; btn.setAttribute('aria-pressed', 'true');
    $('#pName').textContent = car.n;
    $('#player').classList.add('on');

    var vz = $('#viz'), vx = vz.getContext('2d'), buf = new Uint8Array(an.fftSize);
    var rpmEl = $('#pRpm');

    function tick(now) {
      if (cur !== e) return;
      if (now - e.t0 > 90000) { stopEngine(); return; }
      var tc = ((now - e.t0) / 1000) % CYC;
      var s = script(p, tc), t = ac.currentTime, f = s.rpm / 60 * p.ppr, th = s.thr;

      o1.frequency.setTargetAtTime(f, t, 0.02);
      o2.frequency.setTargetAtTime(f * 2, t, 0.02);
      o3.frequency.setTargetAtTime(f * 0.5, t, 0.02);
      lp.frequency.setTargetAtTime(700 + (s.rpm / p.red) * 3200 * (p.lp || 1) + th * 1400, t, 0.03);
      nbp.frequency.setTargetAtTime(800 + s.rpm * 0.6, t, 0.03);
      ng.gain.setTargetAtTime(0.02 + th * 0.12 * (p.noise || 0.6), t, 0.03);

      if (p.turbo) {
        wo.frequency.setTargetAtTime(1800 + s.rpm * 0.9, t, 0.05);
        wg.gain.setTargetAtTime(th * th * 0.05 * (s.rpm / p.red), t, 0.05);
      }
      if (p.boxer || p.v8 || p.rotary) {
        lfo.frequency.setTargetAtTime(s.rpm / 60, t, 0.05);
        lg.gain.setTargetAtTime(0.25 * (1 - th), t, 0.05);
      }
      out.gain.setTargetAtTime(s.lim ? 0.3 : (tc >= 3.0 && tc < 4.2 ? 0.07 : 0.3), t, 0.008);

      if (p.turbo && tc >= 4.2 && tc < 4.4 && !e.blown) { e.blown = true; blowOff(e); }
      if (tc < 1) e.blown = false;

      rpmEl.textContent = Math.round(s.rpm / 10) * 10;
      an.getByteTimeDomainData(buf);
      vx.clearRect(0, 0, vz.width, vz.height);
      vx.lineWidth = 2; vx.strokeStyle = '#08d9d6'; vx.beginPath();
      var n = 512;
      for (var i = 0; i < n; i++) {
        var x = i / (n - 1) * vz.width, y = buf[i] / 255 * vz.height;
        if (i) vx.lineTo(x, y); else vx.moveTo(x, y);
      }
      vx.stroke();
      e.raf = requestAnimationFrame(tick);
    }
    e.raf = requestAnimationFrame(tick);
  }

  $('#pStop').addEventListener('click', stopEngine);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') stopEngine(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopEngine(); });

  /* ---------- Tarjetas de autos + filtros ---------- */
  (function () {
    var wrap = $('#cars'); if (!wrap) return;
    var photos = {};
    $$('#fotos img').forEach(function (i) { photos[i.alt] = i.src; });
    var cards = [];

    CARS.forEach(function (c) {
      var el = document.createElement('article');
      el.className = 'car'; el.dataset.c = c.c; el.dataset.a = c.a;
      el.innerHTML =
        '<div class="ph"><span class="flag">' + FL[c.c] + '</span><span class="tag">' + c.t + '</span></div>' +
        '<div class="bd"><h3>' + c.n + '</h3><div class="eng">' + c.eng + '</div>' +
        '<div class="specs"><span>' + c.hp + '</span><span>' + c.dr + '</span></div>' +
        '<p class="desc">' + c.d + '</p>' +
        '<button type="button" class="listen" aria-pressed="false" aria-label="Escuchar el motor del ' + c.n + '">🔊 Escuchar</button></div>';
      var ph = $('.ph', el);
      if (photos[c.n]) {
        var img = document.createElement('img');
        img.src = photos[c.n]; img.alt = c.n; img.decoding = 'async';
        ph.insertBefore(img, ph.firstChild);
      } else {
        ph.insertAdjacentHTML('afterbegin', sideCar(c.col, 'sil'));
      }
      var btn = $('.listen', el);
      btn.addEventListener('click', function () {
        if (cur && cur.btn === btn) stopEngine(); else startEngine(c, el, btn);
      });
      wrap.appendChild(el); cards.push(el);
    });
    reveal(cards);

    var chips = $('#chips');
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', chips).forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      var f = b.dataset.f;
      cards.forEach(function (el) {
        el.hidden = !(f === 'all' || el.dataset.c === f || el.dataset.a === f);
      });
    });
    $$('.chip', chips).forEach(function (x) { x.setAttribute('aria-pressed', String(x.classList.contains('on'))); });
  })();

  /* ---------- Formulario ----------
     Solo front-end de demostración: no envía ni guarda ningún dato.
     El número de tarjeta se borra al terminar y solo se muestran los últimos 4 dígitos.
     Para cobrar de verdad usa un procesador de pagos (Stripe, Mercado Pago, etc.). */
  (function () {
    var form = $('#form'); if (!form) return;
    var KEYS = ['nombre', 'paterno', 'materno', 'fecha', 'tel', 'email', 'tarjeta'];
    var state = {}, touched = {};
    var send = $('#send');

    function paint(key, res) {
      var box = $('#f-' + key), m = $('#m-' + key);
      box.classList.remove('ok', 'bad');
      if (res.ok) { box.classList.add('ok'); m.textContent = '✔ ' + res.msg; }
      else if (touched[key]) { box.classList.add('bad'); m.textContent = '✖ ' + res.msg; }
      else m.textContent = '';
    }
    function progress() {
      var n = KEYS.filter(function (k) { return state[k]; }).length;
      $('#bar').style.width = (n / KEYS.length * 100) + '%';
      $('#progtext').textContent = n + ' de ' + KEYS.length + ' campos listos';
      send.disabled = n < KEYS.length;
      send.textContent = n < KEYS.length ? '🔒 Completa todos los campos' : '🎟 Participar y recibir mi boleto';
    }
    // aplica la limpieza y conserva la posición del cursor
    function setVal(el, clean) {
      var raw = el.value, pos = el.selectionStart, nv = clean(raw);
      if (nv === raw) return nv;
      var n = 0;
      if (pos != null) n = clean(raw.slice(0, pos)).replace(/ /g, '').length;
      el.value = nv;
      if (pos != null && document.activeElement === el) {
        var k = 0, i = 0;
        if (n > 0) for (; i < nv.length; i++) { if (nv[i] !== ' ') k++; if (k === n) { i++; break; } }
        try { el.setSelectionRange(i, i); } catch (_) {}
      }
      return nv;
    }
    function bind(id, key, clean, validate, countId, countFn) {
      var el = $('#' + id);
      function run() {
        var v = setVal(el, clean);
        if (countId) $('#' + countId).textContent = countFn(v);
        var res = validate(v);
        state[key] = res.ok; paint(key, res); progress();
      }
      el.addEventListener('input', run);
      el.addEventListener('blur', function () { touched[key] = true; run(); });
      return run;
    }

    // Nombres
    var NAME_RE = /^[A-ZÁÉÍÓÚÜÑ]{2,}(?:[ '\-][A-ZÁÉÍÓÚÜÑ]+)*$/;
    function cleanName(v) {
      return v.toUpperCase().replace(/[^A-ZÁÉÍÓÚÜÑ '\-]/g, '').replace(/ {2,}/g, ' ').replace(/^[ '\-]+/, '').slice(0, 100);
    }
    function nameCheck(label) {
      return function (v) {
        v = v.trim();
        if (!v) return { ok: false, msg: 'Escribe ' + label };
        if (!NAME_RE.test(v)) return { ok: false, msg: 'Solo letras (mínimo 2)' };
        return { ok: true, msg: 'Listo' };
      };
    }
    var len = function (v) { return v.length + '/100'; };
    bind('nombre', 'nombre', cleanName, nameCheck('tu nombre'), 'c-nombre', len);
    bind('paterno', 'paterno', cleanName, nameCheck('tu apellido paterno'), 'c-paterno', len);
    bind('materno', 'materno', cleanName, nameCheck('tu apellido materno'), 'c-materno', len);

    // Fecha de nacimiento
    var dia = $('#dia'), mes = $('#mes'), anio = $('#anio');
    var MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    function opt(sel, v, t) { var o = document.createElement('option'); o.value = v; o.textContent = t; sel.appendChild(o); }
    opt(dia, '', 'Día'); for (var d = 1; d <= 31; d++) opt(dia, d, d);
    opt(mes, '', 'Mes'); MESES.forEach(function (m, i) { opt(mes, i + 1, m); });
    opt(anio, '', 'Año'); var Y = new Date().getFullYear(); for (var y = Y; y >= Y - 100; y--) opt(anio, y, y);
    function fechaRes() {
      var dd = +dia.value, mm = +mes.value, yy = +anio.value;
      if (!dd || !mm || !yy) return { ok: false, msg: 'Selecciona día, mes y año', partial: true };
      var dt = new Date(yy, mm - 1, dd);
      if (dt.getFullYear() !== yy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return { ok: false, msg: 'Esa fecha no existe' };
      var now = new Date();
      if (dt > now) return { ok: false, msg: 'La fecha no puede ser futura' };
      var age = now.getFullYear() - yy;
      if (now.getMonth() < mm - 1 || (now.getMonth() === mm - 1 && now.getDate() < dd)) age--;
      if (age < 18) return { ok: false, msg: 'Debes ser mayor de 18 años' };
      return { ok: true, msg: 'Tienes ' + age + ' años' };
    }
    function fechaRun() {
      var r = fechaRes();
      if (!r.partial) touched.fecha = true;
      state.fecha = r.ok; paint('fecha', r); progress();
    }
    [dia, mes, anio].forEach(function (s) { s.addEventListener('change', fechaRun); });

    // Teléfono (10 dígitos, México)
    function cleanTel(v) {
      var d = v.replace(/\D/g, '');
      if (d.length > 10 && d.indexOf('52') === 0) d = d.slice(2);
      return d.slice(0, 10);
    }
    bind('tel', 'tel', cleanTel, function (v) {
      if (v.length < 10) return { ok: false, msg: v.length ? 'Faltan ' + (10 - v.length) + ' dígitos' : 'Escribe tu teléfono a 10 dígitos' };
      if (!/^[1-9]\d{9}$/.test(v) || /^(\d)\1{9}$/.test(v)) return { ok: false, msg: 'Número no válido' };
      return { ok: true, msg: 'Teléfono válido' };
    }, 'c-tel', function (v) { return v.length + '/10'; });

    // Correo
    var TYPOS = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gamil.com': 'gmail.com',
      'hotmial.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'outlok.com': 'outlook.com', 'yahooo.com': 'yahoo.com' };
    var MAIL_RE = /^[a-z0-9._%+\-]+@[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?)*\.[a-z]{2,}$/;
    bind('email', 'email', function (v) { return v.replace(/\s/g, '').toLowerCase().slice(0, 254); }, function (v) {
      if (!v) return { ok: false, msg: 'Escribe tu correo' };
      var at = v.indexOf('@'), local = v.slice(0, at), dom = v.slice(at + 1);
      if (!MAIL_RE.test(v) || v.indexOf('..') > -1 || local.charAt(0) === '.' || local.slice(-1) === '.')
        return { ok: false, msg: 'Correo no válido, ej. nombre@correo.com' };
      if (TYPOS[dom]) return { ok: false, msg: '¿Quisiste decir ' + local + '@' + TYPOS[dom] + '?' };
      return { ok: true, msg: 'Correo válido' };
    });

    // Tarjeta
    function brand(d) {
      if (/^4/.test(d)) return 'Visa';
      if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(d)) return 'Mastercard';
      if (/^3[47]/.test(d)) return 'American Express';
      return '';
    }
    function luhn(d) {
      var s = 0, alt = false;
      for (var i = d.length - 1; i >= 0; i--) { var n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; }
      return s % 10 === 0;
    }
    function cleanCard(v) {
      var d = v.replace(/\D/g, ''), amex = /^3[47]/.test(d);
      d = d.slice(0, amex ? 15 : 16);
      return (amex ? [d.slice(0, 4), d.slice(4, 10), d.slice(10)] : d.match(/.{1,4}/g) || []).filter(Boolean).join(' ');
    }
    bind('tarjeta', 'tarjeta', cleanCard, function (v) {
      var d = v.replace(/\D/g, ''), need = /^3[47]/.test(d) ? 15 : 16;
      if (d.length < need) return { ok: false, msg: d.length ? 'Faltan ' + (need - d.length) + ' dígitos' : 'Escribe el número de tu tarjeta' };
      if (/^(\d)\1+$/.test(d) || !luhn(d)) return { ok: false, msg: 'Número de tarjeta no válido' };
      return { ok: true, msg: (brand(d) || 'Tarjeta') + ' válida' };
    }, 'c-tarjeta', function (v) { return v.length + '/19'; });

    function validAll() { return KEYS.every(function (k) { return state[k]; }); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validAll()) {
        KEYS.forEach(function (k) { touched[k] = true; });
        var bad = $('.field.bad input, .field.bad select') || $('#nombre');
        bad.focus(); return;
      }
      var rnd;
      try { rnd = crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000; }
      catch (_) { rnd = Math.floor(100000 + Math.random() * 900000); }
      var last4 = $('#tarjeta').value.replace(/\D/g, '').slice(-4);
      $('#folio').textContent = 'DRFT-' + rnd;
      $('#who').textContent = [$('#nombre').value, $('#paterno').value, $('#materno').value].join(' ').trim();
      $('#cardlast').textContent = 'Tarjeta •••• ' + last4;
      form.reset(); resetUI();            // se borra todo, incluida la tarjeta
      form.hidden = true;
      var ok = $('#success'); ok.hidden = false;
      ok.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });

    function resetUI() {
      KEYS.forEach(function (k) { state[k] = false; touched[k] = false; var b = $('#f-' + k); b.classList.remove('ok', 'bad'); $('#m-' + k).textContent = ''; });
      $('#c-nombre').textContent = $('#c-paterno').textContent = $('#c-materno').textContent = '0/100';
      $('#c-tel').textContent = '0/10'; $('#c-tarjeta').textContent = '0/19';
      progress();
    }
    $('#again').addEventListener('click', function () {
      resetUI(); $('#success').hidden = true; form.hidden = false;
      $('#nombre').focus();
    });
    resetUI();
  })();
})();
