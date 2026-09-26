/* NEXORA FIX — squad ID + avatar/VIP kilit + dashboard geçişi */
(() => {
  // ---------- Squad ID bug (string id: "ays-1") ----------
  function safeToggleStarter(id) {
    if (!Array.isArray(window.startingXI)) window.startingXI = [];
    const sid = id; // Number() YAPMA
    if (window.startingXI.includes(sid)) {
      window.startingXI = window.startingXI.filter((x) => x !== sid);
    } else if (window.startingXI.length < 11) {
      window.startingXI = [...window.startingXI, sid];
    } else {
      return;
    }
    if (typeof window.persist === 'function') window.persist();
    if (typeof window.renderSquad === 'function') window.renderSquad();
  }
  window.toggleStarter = safeToggleStarter;

  // renderSquad sonrası listener'ları güvenli bağla
  const patchRenderSquad = () => {
    const orig = window.renderSquad;
    if (typeof orig !== 'function' || orig.__nexoraPatched) return;
    window.renderSquad = function () {
      orig.apply(this, arguments);
      document.querySelectorAll('.player-row').forEach((row) => {
        const clone = row.cloneNode(true);
        row.parentNode.replaceChild(clone, row);
        clone.addEventListener('click', () => safeToggleStarter(clone.dataset.player));
      });
    };
    window.renderSquad.__nexoraPatched = true;
  };

  // openSquad güvenli
  window.openSquad = function () {
    try {
      if (!window.career?.club && window.NEXORA_GAME_STATE?.club) {
        window.career = window.career || {};
        window.career.club = window.NEXORA_GAME_STATE.club;
      }
      if (!window.career?.club) {
        alert('Önce bir kariyer başlatın.');
        return;
      }
      patchRenderSquad();
      let area = document.getElementById('gameArea');
      if (!area) {
        area = document.createElement('section');
        area.id = 'gameArea';
        area.className = 'game-area';
        document.getElementById('dashboard')?.appendChild(area);
      }
      if (typeof window.renderSquad === 'function') window.renderSquad();
      area.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('[NEXORA] openSquad', err);
      alert('Kadro açılamadı: ' + (err.message || err));
    }
  };

  document.addEventListener(
    'click',
    (e) => {
      if (e.target?.closest?.('#squadBtn')) {
        e.preventDefault();
        e.stopPropagation();
        window.openSquad();
      }
    },
    true
  );

  // ---------- Avatar + VIP Terminal kilidini kır ----------
  function showDashboard() {
    const hero = document.querySelector('.hero');
    const dash = document.getElementById('dashboard');
    if (hero) hero.hidden = true;
    if (dash) dash.hidden = false;
    document.body.style.overflow = '';
    // engelleyen katmanları kaldır
    document.getElementById('nexoraAvatarModal')?.remove();
    document.querySelector('.airport-vip')?.remove();
    window.NEXORA_AIRPORT?.close?.();
  }

  function bindAvatarBypass() {
    const modal = document.getElementById('nexoraAvatarModal');
    if (!modal) return;
    const btn = modal.querySelector('#confirmAvatar');
    if (!btn || btn.__nexoraBound) return;
    btn.__nexoraBound = true;
    btn.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const outfit =
          modal.querySelector('#nexoraAvatarPreview')?.dataset?.outfit || 'formal';
        localStorage.setItem('nexoraAvatar', JSON.stringify({ outfit }));
        modal.remove();
        window.NEXORA_SOUND?.unlock?.();
        // VIP terminali atla — direkt dashboard
        showDashboard();
        // İstersen kısa VIP animasyonu gösterip kapat:
        try {
          window.NEXORA_AIRPORT?.open?.('NEW CAREER');
          setTimeout(() => {
            window.NEXORA_AIRPORT?.close?.();
            showDashboard();
          }, 2200);
        } catch (_) {
          showDashboard();
        }
      },
      true
    );
  }

  // airport auto-close (sonsuz takılmasın)
  const patchAirport = () => {
    if (!window.NEXORA_AIRPORT?.open || window.NEXORA_AIRPORT.__patched) return;
    const origOpen = window.NEXORA_AIRPORT.open.bind(window.NEXORA_AIRPORT);
    window.NEXORA_AIRPORT.open = function (reason) {
      origOpen(reason);
      setTimeout(() => {
        window.NEXORA_AIRPORT.close?.();
        showDashboard();
      }, 2500);
    };
    window.NEXORA_AIRPORT.__patched = true;
  };

  // career-ready sonrası
  window.addEventListener('nexora:career-ready', () => {
    patchRenderSquad();
    patchAirport();
    setTimeout(bindAvatarBypass, 150);
    setTimeout(bindAvatarBypass, 500);
    // 8 sn sonra hâlâ avatar/VIP varsa zorla dashboard
    setTimeout(() => {
      if (
        document.getElementById('nexoraAvatarModal') ||
        document.querySelector('.airport-vip')
      ) {
        showDashboard();
      }
    }, 8000);
  });

  // Sayfa yüklenince de dene (kayıtlı kariyer)
  const boot = () => {
    patchRenderSquad();
    patchAirport();
    if (window.NEXORA_GAME_STATE?.club) showDashboard();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', () => {
    patchAirport();
    setTimeout(bindAvatarBypass, 200);
  });
})();
