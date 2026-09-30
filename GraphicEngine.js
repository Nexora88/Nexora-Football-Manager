/**
 * NEXORA GraphicEngine — stilize 2.5D maç sahası (PixiJS 8)
 * Sadece #nexora-pitch-host içinde çalışır; tüm sayfayı KAPLAMAZ.
 */
(function () {
  'use strict';

  const FORMATIONS = {
    '4-3-3': {
      home: [
        [0.08, 0.5],
        [0.22, 0.18], [0.22, 0.38], [0.22, 0.62], [0.22, 0.82],
        [0.4, 0.28], [0.4, 0.5], [0.4, 0.72],
        [0.62, 0.2], [0.62, 0.5], [0.62, 0.8]
      ],
      away: [
        [0.92, 0.5],
        [0.78, 0.18], [0.78, 0.38], [0.78, 0.62], [0.78, 0.82],
        [0.6, 0.28], [0.6, 0.5], [0.6, 0.72],
        [0.38, 0.2], [0.38, 0.5], [0.38, 0.8]
      ]
    },
    '4-2-3-1': {
      home: [
        [0.08, 0.5],
        [0.22, 0.18], [0.22, 0.38], [0.22, 0.62], [0.22, 0.82],
        [0.36, 0.38], [0.36, 0.62],
        [0.52, 0.22], [0.52, 0.5], [0.52, 0.78],
        [0.68, 0.5]
      ],
      away: [
        [0.92, 0.5],
        [0.78, 0.18], [0.78, 0.38], [0.78, 0.62], [0.78, 0.82],
        [0.64, 0.38], [0.64, 0.62],
        [0.48, 0.22], [0.48, 0.5], [0.48, 0.78],
        [0.32, 0.5]
      ]
    },
    '4-4-2': {
      home: [
        [0.08, 0.5],
        [0.22, 0.18], [0.22, 0.38], [0.22, 0.62], [0.22, 0.82],
        [0.42, 0.18], [0.42, 0.38], [0.42, 0.62], [0.42, 0.82],
        [0.62, 0.38], [0.62, 0.62]
      ],
      away: [
        [0.92, 0.5],
        [0.78, 0.18], [0.78, 0.38], [0.78, 0.62], [0.78, 0.82],
        [0.58, 0.18], [0.58, 0.38], [0.58, 0.62], [0.58, 0.82],
        [0.38, 0.38], [0.38, 0.62]
      ]
    }
  };

  let app = null;
  let host = null;
  let pitch = null;
  let homePlayers = [];
  let awayPlayers = [];
  let ball = null;
  let glowFilter = null;
  let formation = '4-3-3';
  let teams = { home: { color: 0xb7ff3c, code: 'NEX' }, away: { color: 0x5b8cff, code: 'RIV' } };
  let pulse = 0;
  let time = 0;
  let mounted = false;
  let ro = null;

  function isMobile() {
    return window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent || '');
  }

  function waitForPIXI(timeoutMs) {
    return new Promise(function (resolve, reject) {
      if (window.PIXI && PIXI.Application) return resolve(window.PIXI);
      var t0 = Date.now();
      var id = setInterval(function () {
        if (window.PIXI && PIXI.Application) {
          clearInterval(id);
          resolve(window.PIXI);
        } else if (Date.now() - t0 > (timeoutMs || 8000)) {
          clearInterval(id);
          reject(new Error('PIXI not loaded'));
        }
      }, 50);
    });
  }

  function drawPitch(g, w, h) {
    g.clear();
    // Çim
    g.rect(0, 0, w, h);
    g.fill(0x0c1a12);
    // Şeritler
    var stripes = 10;
    for (var i = 0; i < stripes; i++) {
      if (i % 2 === 0) {
        g.rect((w / stripes) * i, 0, w / stripes, h);
        g.fill(0x0f2218);
      }
    }
    var pad = Math.min(w, h) * 0.04;
    var line = 0xb7ff3c;
    var lw = Math.max(1.5, Math.min(w, h) * 0.003);

    g.setStrokeStyle({ width: lw, color: line, alpha: 0.85 });
    // Dış çizgi
    g.rect(pad, pad, w - pad * 2, h - pad * 2);
    g.stroke();
    // Orta çizgi
    g.moveTo(w / 2, pad);
    g.lineTo(w / 2, h - pad);
    g.stroke();
    // Orta daire
    var r = Math.min(w, h) * 0.12;
    g.circle(w / 2, h / 2, r);
    g.stroke();
    g.circle(w / 2, h / 2, 3);
    g.fill(line);
    // Ceza sahaları
    var boxW = w * 0.14;
    var boxH = h * 0.44;
    g.rect(pad, h / 2 - boxH / 2, boxW, boxH);
    g.stroke();
    g.rect(w - pad - boxW, h / 2 - boxH / 2, boxW, boxH);
    g.stroke();
    // Kale sahası
    var sixW = w * 0.05;
    var sixH = h * 0.22;
    g.rect(pad, h / 2 - sixH / 2, sixW, sixH);
    g.stroke();
    g.rect(w - pad - sixW, h / 2 - sixH / 2, sixW, sixH);
    g.stroke();
  }

  function makePlayer(color, label) {
    var c = new PIXI.Container();
    var body = new PIXI.Graphics();
    var radius = isMobile() ? 9 : 12;
    body.circle(0, 0, radius);
    body.fill(color);
    body.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 0.35 });
    body.circle(0, 0, radius);
    body.stroke();
    c.addChild(body);

    var txt = new PIXI.Text({
      text: String(label || ''),
      style: {
        fontFamily: 'system-ui,Segoe UI,sans-serif',
        fontSize: isMobile() ? 8 : 10,
        fontWeight: '700',
        fill: 0x0a0a0a
      }
    });
    txt.anchor.set(0.5);
    c.addChild(txt);
    c._body = body;
    c._baseColor = color;
    c._radius = radius;
    c._tx = 0;
    c._ty = 0;
    return c;
  }

  function layoutPlayers() {
    if (!app || !pitch) return;
    var w = app.screen.width;
    var h = app.screen.height;
    var form = FORMATIONS[formation] || FORMATIONS['4-3-3'];
    homePlayers.forEach(function (p, i) {
      var pos = form.home[i] || form.home[0];
      p._tx = pos[0] * w;
      p._ty = pos[1] * h;
      if (!p._inited) {
        p.x = p._tx;
        p.y = p._ty;
        p._inited = true;
      }
    });
    awayPlayers.forEach(function (p, i) {
      var pos = form.away[i] || form.away[0];
      p._tx = pos[0] * w;
      p._ty = pos[1] * h;
      if (!p._inited) {
        p.x = p._tx;
        p.y = p._ty;
        p._inited = true;
      }
    });
  }

  function rebuildPlayers() {
    if (!app) return;
    homePlayers.forEach(function (p) { app.stage.removeChild(p); });
    awayPlayers.forEach(function (p) { app.stage.removeChild(p); });
    homePlayers = [];
    awayPlayers = [];
    for (var i = 1; i <= 11; i++) {
      var hp = makePlayer(teams.home.color, i);
      var ap = makePlayer(teams.away.color, i);
      homePlayers.push(hp);
      awayPlayers.push(ap);
      app.stage.addChild(hp);
      app.stage.addChild(ap);
    }
    if (ball) app.stage.addChild(ball);
    layoutPlayers();
  }

  function ensureBall() {
    if (ball || !app) return;
    ball = new PIXI.Graphics();
    ball.circle(0, 0, isMobile() ? 4 : 5);
    ball.fill(0xf5f5f5);
    ball.setStrokeStyle({ width: 1, color: 0x222222, alpha: 0.5 });
    ball.circle(0, 0, isMobile() ? 4 : 5);
    ball.stroke();
    ball.x = app.screen.width / 2;
    ball.y = app.screen.height / 2;
    app.stage.addChild(ball);
  }

  function onTick(ticker) {
    if (!mounted || !app) return;
    time += ticker.deltaTime * 0.04;
    pulse = Math.max(0, pulse - ticker.deltaTime * 0.05);

    homePlayers.forEach(function (p, i) {
      var breathe = Math.sin(time + i * 0.7) * 2;
      p.x += (p._tx - p.x) * 0.08;
      p.y += (p._ty + breathe - p.y) * 0.08;
    });
    awayPlayers.forEach(function (p, i) {
      var breathe = Math.sin(time + i * 0.7 + 1) * 2;
      p.x += (p._tx - p.x) * 0.08;
      p.y += (p._ty + breathe - p.y) * 0.08;
    });

    if (ball) {
      var bx = app.screen.width / 2 + Math.cos(time * 0.9) * (app.screen.width * 0.12);
      var by = app.screen.height / 2 + Math.sin(time * 1.1) * (app.screen.height * 0.1);
      if (pulse > 0) {
        bx += Math.sin(time * 8) * 18 * pulse;
        by += Math.cos(time * 7) * 12 * pulse;
      }
      ball.x += (bx - ball.x) * 0.1;
      ball.y += (by - ball.y) * 0.1;
    }
  }

  async function mount(hostEl, options) {
    options = options || {};
    try {
      if (mounted) unmount();
      host = typeof hostEl === 'string' ? document.querySelector(hostEl) : hostEl;
      if (!host) {
        console.warn('[NEXORA_GFX] host not found');
        return false;
      }
      host.hidden = false;
      host.removeAttribute('hidden');

      await waitForPIXI(8000);

      var mobile = isMobile();
      var rect = host.getBoundingClientRect();
      var w = Math.max(320, Math.floor(rect.width) || 640);
      var h = Math.max(200, Math.floor(rect.height) || 400);

      app = new PIXI.Application();
      await app.init({
        width: w,
        height: h,
        backgroundAlpha: 1,
        backgroundColor: 0x0c1a12,
        antialias: !mobile,
        resolution: Math.min(mobile ? 1.25 : 2, window.devicePixelRatio || 1),
        autoDensity: true,
        preference: 'webgl',
        powerPreference: 'high-performance'
      });

      host.innerHTML = '';
      host.appendChild(app.canvas);

      pitch = new PIXI.Graphics();
      drawPitch(pitch, w, h);
      app.stage.addChild(pitch);

      if (options.formation) formation = options.formation;
      if (options.teams) {
        teams.home = Object.assign({}, teams.home, options.teams.home || {});
        teams.away = Object.assign({}, teams.away, options.teams.away || {});
      }

      rebuildPlayers();
      ensureBall();

      app.ticker.add(onTick);
      mounted = true;

      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(function () { resize(); });
        ro.observe(host);
      }

      console.log('[NEXORA_GFX] mounted', w, 'x', h, mobile ? '(mobile)' : '(desktop)');
      return true;
    } catch (err) {
      console.error('[NEXORA_GFX] mount failed', err);
      mounted = false;
      return false;
    }
  }

  function unmount() {
    try {
      if (ro && host) {
        ro.disconnect();
        ro = null;
      }
      if (app) {
        app.ticker.remove(onTick);
        app.destroy(true);
        app = null;
      }
      if (host) {
        host.innerHTML = '';
        host.hidden = true;
      }
    } catch (e) {
      console.warn('[NEXORA_GFX] unmount', e);
    }
    pitch = null;
    ball = null;
    homePlayers = [];
    awayPlayers = [];
    mounted = false;
    host = null;
  }

  function resize() {
    if (!app || !host || !mounted) return;
    var rect = host.getBoundingClientRect();
    var w = Math.max(320, Math.floor(rect.width));
    var h = Math.max(200, Math.floor(rect.height));
    app.renderer.resize(w, h);
    if (pitch) drawPitch(pitch, w, h);
    layoutPlayers();
  }

  function setFormation(name) {
    if (FORMATIONS[name]) formation = name;
    layoutPlayers();
  }

  function setTeams(next) {
    if (!next) return;
    if (next.home) teams.home = Object.assign({}, teams.home, next.home);
    if (next.away) teams.away = Object.assign({}, teams.away, next.away);
    if (mounted) rebuildPlayers();
  }

  function pulseEvent(type) {
    if (type === 'goal') pulse = 1.4;
    else if (type === 'chance') pulse = 0.8;
    else pulse = 0.3;
  }

  window.NEXORA_GFX = {
    mount: mount,
    unmount: unmount,
    setFormation: setFormation,
    setTeams: setTeams,
    pulseEvent: pulseEvent,
    resize: resize,
    get mounted() { return mounted; }
  };
})();
