(()=>{
  const LANGS=[['tr','TÜRKÇE'],['en','ENGLISH'],['de','DEUTSCH'],['es','ESPAÑOL']];
  const labels={
    tr:{title:'DİLİNİZİ SEÇİN',sub:'Nexora Football Manager deneyiminize başlamak için dil seçin.',continue:'DEVAM ET'},
    en:{title:'SELECT YOUR LANGUAGE',sub:'Choose a language to begin your Nexora Football Manager experience.',continue:'CONTINUE'},
    de:{title:'SPRACHE AUSWÄHLEN',sub:'Wählen Sie eine Sprache für Ihr Nexora Football Manager Erlebnis.',continue:'WEITER'},
    es:{title:'SELECCIONA TU IDIOMA',sub:'Elige un idioma para comenzar tu experiencia en Nexora Football Manager.',continue:'CONTINUAR'}
  };
  function openLanguage(){
    if(document.getElementById('languageGate')) return;
    const saved=localStorage.getItem('nexoraLanguage');
    const gate=document.createElement('div');
    gate.id='languageGate';
    gate.innerHTML=`<div class="language-card"><div class="brand-mark">N</div><p class="eyebrow">NEXORA FOOTBALL MANAGER</p><h2 id="langTitle"></h2><p id="langSub"></p><div class="language-grid">${LANGS.map(([code,name])=>`<button class="language-choice" data-lang="${code}">${name}</button>`).join('')}</div><button class="primary full" id="languageContinue"></button></div>`;
    document.body.appendChild(gate);
    const setLang=lang=>{
      if(!labels[lang]) lang='tr';
      document.documentElement.lang=lang;
      localStorage.setItem('nexoraLanguage',lang);
      gate.dataset.lang=lang;
      document.getElementById('langTitle').textContent=labels[lang].title;
      document.getElementById('langSub').textContent=labels[lang].sub;
      document.getElementById('languageContinue').textContent=labels[lang].continue+' →';
      document.querySelectorAll('.language-choice').forEach(b=>b.classList.toggle('selected',b.dataset.lang===lang));
      window.NEXORA_LANGUAGE=lang;
    };
    document.querySelectorAll('.language-choice').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
    document.getElementById('languageContinue').addEventListener('click',()=>{gate.classList.add('hidden');setTimeout(()=>gate.remove(),180)});
    setLang(saved||'tr');
  }
  function injectStyle(){
    const s=document.createElement('style');
    s.textContent=`#languageGate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:rgba(3,5,4,.97);backdrop-filter:blur(18px);padding:24px;opacity:1;transition:opacity .18s ease}#languageGate.hidden{opacity:0;pointer-events:none}.language-card{width:min(520px,100%);padding:38px;border:1px solid rgba(183,255,60,.22);border-radius:24px;background:rgba(10,13,11,.96);box-shadow:0 30px 100px rgba(0,0,0,.5);text-align:center}.language-card .brand-mark{margin:0 auto 22px;width:52px;height:52px;display:grid;place-items:center;border:1px solid rgba(183,255,60,.45);border-radius:14px;color:#b7ff3c;font-weight:800;font-size:24px}.language-card h2{margin:8px 0 10px;font-size:clamp(26px,6vw,42px)}.language-card>p:not(.eyebrow){opacity:.68;line-height:1.6}.language-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:26px 0 14px}.language-choice{padding:15px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025);color:inherit;border-radius:12px;cursor:pointer;font-weight:700;letter-spacing:.06em}.language-choice:hover,.language-choice.selected{border-color:rgba(183,255,60,.65);background:rgba(183,255,60,.08);color:#b7ff3c}.language-card button{pointer-events:auto}`;
    document.head.appendChild(s);
  }
  function fallbackInteractions(){
    document.addEventListener('click',e=>{
      const el=e.target.closest('button,a'); if(!el)return;
      const id=el.id;
      try{
        if(id==='startBtn'||id==='demoBtn'){
          if(typeof window.openModal==='function'){window.openModal();if(typeof window.renderClubs==='function')window.renderClubs();return;}
          const modal=document.getElementById('modal');if(modal){modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}
        }
        if(id==='closeBtn'){if(typeof window.closeModal==='function')window.closeModal();else{const m=document.getElementById('modal');if(m)m.classList.remove('open');}}
        if(id==='createClubBtn'&&typeof window.openCreateClub==='function')window.openCreateClub();
        if(id==='saveClubBtn'&&typeof window.saveCustomClub==='function')window.saveCustomClub();
        if(id==='continueBtn'&&typeof window.continueCareer==='function')window.continueCareer();
        if(id==='squadBtn'&&typeof window.openSquad==='function')window.openSquad();
      }catch(err){console.warn('NEXORA interaction fallback:',err)}
    },true);
  }
  injectStyle();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{openLanguage();fallbackInteractions()});else{openLanguage();fallbackInteractions()}
})();
