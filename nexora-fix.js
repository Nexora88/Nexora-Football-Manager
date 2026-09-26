/* NEXORA FIX — squad ID bug + language system */
(() => {
  // ---- 1) Squad ID bug fix (string ID'ler bozulmasın) ----
  if (typeof window.toggleStarter === 'function' || true) {
    window.toggleStarter = function (id) {
      // Number() KULLANMA — ID string veya number olabilir
      const sid = id;
      if (!window.startingXI) window.startingXI = [];
      if (window.startingXI.includes(sid)) {
        window.startingXI = window.startingXI.filter(x => x !== sid);
      } else if (window.startingXI.length < 11) {
        window.startingXI = [...window.startingXI, sid];
      } else {
        return;
      }
      if (typeof window.persist === 'function') window.persist();
      if (typeof window.renderSquad === 'function') window.renderSquad();
    };
  }

  // app.js içindeki Number() çağrılarını runtime'da düzelt
  const originalRenderSquad = window.renderSquad;
  if (typeof originalRenderSquad === 'function') {
    window.renderSquad = function () {
      originalRenderSquad.apply(this, arguments);
      // Event listener'ları güvenli ID ile yeniden bağla
      document.querySelectorAll('.player-row').forEach(row => {
        const newRow = row.cloneNode(true);
        row.parentNode.replaceChild(newRow, row);
        newRow.addEventListener('click', () => {
          // dataset.player string kalsın
          window.toggleStarter(newRow.dataset.player);
        });
      });
    };
  }

  // openSquad güvenli hale getir
  const originalOpenSquad = window.openSquad;
  window.openSquad = function () {
    try {
      if (!window.career?.club && !window.NEXORA_GAME_STATE?.club) {
        alert('Önce bir kariyer başlatın.');
        return;
      }
      // career yoksa gameState'ten doldur
      if (!window.career?.club && window.NEXORA_GAME_STATE?.club) {
        window.career = window.career || {};
        window.career.club = window.NEXORA_GAME_STATE.club;
      }
      if (typeof originalOpenSquad === 'function') {
        originalOpenSquad();
      } else {
        // Fallback
        let area = document.getElementById('gameArea');
        if (!area) {
          area = document.createElement('section');
          area.id = 'gameArea';
          area.className = 'game-area';
          document.getElementById('dashboard')?.appendChild(area);
        }
        if (typeof window.renderSquad === 'function') window.renderSquad();
        area.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('[NEXORA] openSquad error', err);
      alert('Kadro açılamadı. Konsolu kontrol edin.');
    }
  };

  // squadBtn'a güvenli bağla
  document.addEventListener('click', (e) => {
    if (e.target?.closest?.('#squadBtn')) {
      e.preventDefault();
      e.stopPropagation();
      window.openSquad();
    }
  }, true);

  // ---- 2) Dil sistemi ----
  const LANGS = {
    tr: { name: 'Türkçe', flag: '🇹🇷' },
    en: { name: 'English', flag: '🇬🇧' },
    de: { name: 'Deutsch', flag: '🇩🇪' }
  };

  function getLang() {
    return localStorage.getItem('nexoraLang') || null;
  }

  function setLang(code) {
    localStorage.setItem('nexoraLang', code);
    window.NEXORA_LANG = code;
    document.documentElement.lang = code === 'tr' ? 'tr' : code === 'de' ? 'de' : 'en';
    // i18n varsa uygula
    if (window.NEXORA_I18N?.setLanguage) {
      window.NEXORA_I18N.setLanguage(code);
    }
    window.dispatchEvent(new CustomEvent('nexora:lang-changed', { detail: code }));
  }

  function showLangModal(onDone) {
    if (document.getElementById('nexoraLangModal')) return;
    const m = document.createElement('div');
    m.id = 'nexoraLangModal';
    m.className = 'modal open';
    m.setAttribute('aria-hidden', 'false');
    m.innerHTML = `
      <div class="modal-card" style="max-width:420px;text-align:center">
        <p class="eyebrow">LANGUAGE / DİL</p>
        <h2>Choose your language</h2>
        <p style="opacity:.7;margin-bottom:24px">Select the language for the game interface</p>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${Object.entries(LANGS).map(([code, l]) => `
            <button class="primary full lang-choice" data-lang="${code}" style="display:flex;align-items:center;justify-content:center;gap:12px">
              <span style="font-size:1.4em">${l.flag}</span>
              <strong>${l.name}</strong>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';

    m.querySelectorAll('.lang-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        setLang(btn.dataset.lang);
        m.remove();
        document.body.style.overflow = '';
        if (typeof onDone === 'function') onDone(btn.dataset.lang);
      });
    });
  }

  // Kariyer başlarken dil sor
  window.addEventListener('nexora:career-ready', () => {
    if (!getLang()) {
      showLangModal();
    } else {
      setLang(getLang());
    }
  }, { once: false });

  // İlk açılışta da kontrol (eğer kayıtlı kariyer varsa)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (getLang()) setLang(getLang());
    });
  } else if (getLang()) {
    setLang(getLang());
  }

  // Global erişim
  window.NEXORA_LANG_API = { getLang, setLang, showLangModal, LANGS };
})();
