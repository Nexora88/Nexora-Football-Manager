(()=>{
  const LANGS=[['tr','TÜRKÇE'],['en','ENGLISH'],['de','DEUTSCH'],['es','ESPAÑOL'],['pt','PORTUGUÊS']];
  const labels={
    tr:{title:'DİLİNİZİ SEÇİN',sub:'Nexora Football Manager deneyiminize başlamak için dil seçin.',continue:'DEVAM ET'},
    en:{title:'SELECT YOUR LANGUAGE',sub:'Choose a language to begin your Nexora Football Manager experience.',continue:'CONTINUE'},
    de:{title:'SPRACHE AUSWÄHLEN',sub:'Wählen Sie eine Sprache für Ihr Nexora Football Manager Erlebnis.',continue:'WEITER'},
    es:{title:'SELECCIONA TU IDIOMA',sub:'Elige un idioma para comenzar tu experiencia en Nexora Football Manager.',continue:'CONTINUAR'},
    pt:{title:'SELECIONE SEU IDIOMA',sub:'Escolha um idioma para começar sua experiência no Nexora Football Manager.',continue:'CONTINUAR'}
  };
  const KEY='nexoraLanguage';
  function syncI18n(lang){
    document.documentElement.lang=lang;
    document.documentElement.dataset.language=lang;
    window.NEXORA_LANGUAGE=lang;
    try{window.NEXORA_I18N?.setLanguage?.(lang)}catch(e){console.warn('NEXORA i18n sync failed',e)}
    try{window.NEXORA_I18N?.refresh?.()}catch(e){console.warn('NEXORA i18n refresh failed',e)}
    window.dispatchEvent(new CustomEvent('nexora:language-changed',{detail:{language:lang}}));
  }
  function openLanguage(){
    if(document.getElementById('languageGate')) return;
    const saved=localStorage.getItem(KEY);
    const gate=document.createElement('div');
    gate.id='languageGate';
    gate.innerHTML=`<div class="language-card"><div class="brand-mark">N</div><p class="eyebrow">NEXORA FOOTBALL MANAGER</p><h2 id="langTitle"></h2><p id="langSub"></p><div class="language-grid">${LANGS.map(([code,name])=>`<button class="language-choice" data-lang="${code}">${name}</button>`).join('')}</div><button class="primary full" id="languageContinue"></button></div>`;
    document.body.appendChild(gate);
    const setLang=lang=>{
      if(!labels[lang]) lang='tr';
      localStorage.setItem(KEY,lang);
      gate.dataset.lang=lang;
      document.getElementById('langTitle').textContent=labels[lang].title;
      document.getElementById('langSub').textContent=labels[lang].sub;
      document.getElementById('languageContinue').textContent=labels[lang].continue+' →';
      document.querySelectorAll('.language-choice').forEach(b=>b.classList.toggle('selected',b.dataset.lang===lang));
      syncI18n(lang);
    };
    document.querySelectorAll('.language-choice').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
    document.getElementById('languageContinue').addEventListener('click',()=>{syncI18n(gate.dataset.lang||localStorage.getItem(KEY)||'tr');gate.classList.add('hidden');setTimeout(()=>gate.remove(),180)});
    setLang(saved&&labels[saved]?saved:'tr');
  }
  function injectStyle(){
    const s=document.createElement('style');
    s.textContent=`#languageGate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:rgba(3,5,4,.97);backdrop-filter:blur(18px);padding:24px;opacity:1;transition:opacity .18s ease}#languageGate.hidden{opacity:0;pointer-events:none}.language-card{width:min(520px,100%);padding:38px;border:1px solid rgba(183,255,60,.22);border-radius:24px;background:rgba(10,13,11,.96);box-shadow:0 30px 100px rgba(0,0,0,.5);text-align:center}.language-card .brand-mark{margin:0 auto 22px;width:52px;height:52px;display:grid;place-items:center;border:1px solid rgba(183,255,60,.45);border-radius:14px;color:#b7ff3c;font-weight:800;font-size:24px}.language-card h2{margin:8px 0 10px;font-size:clamp(26px,6vw,42px)}.language-card>p:not(.eyebrow){opacity:.68;line-height:1.6}.language-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:26px 0 14px}.language-choice{padding:15px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025);color:inherit;border-radius:12px;cursor:pointer;font-weight:700;letter-spacing:.06em}.language-choice:hover,.language-choice.selected{border-color:rgba(183,255,60,.65);background:rgba(183,255,60,.08);color:#b7ff3c}.language-card button{pointer-events:auto}`;
    document.head.appendChild(s);
  }
  function fallbackInteractions(){
    document.addEventListener('click',e=>{
      const el=e.target.closest('button,a');if(!el)return;
      const id=el.id;
      try{
        if(id==='startBtn'||id==='demoBtn'){
          const modal=document.getElementById('modal');
          if(modal){modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';if(window.NEXORA_DATA?.clubs){const grid=document.getElementById('clubGrid');if(grid&&!grid.children.length)grid.innerHTML=window.NEXORA_DATA.clubs.map((c,i)=>`<button class="club-choice" data-index="${i}"><b>${c.code}</b><strong>${c.name}</strong><span>${c.city} · ${c.style} · ${c.difficulty}</span><small>€${(c.budget/1000000).toFixed(1)}M BUDGET · ${c.stadiumCapacity.toLocaleString('en-US')} CAP.</small></button>`).join('')}}
        }
        if(id==='closeBtn'){const m=document.getElementById('modal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow=''}}
      }catch(err){console.warn('NEXORA interaction fallback:',err)}
    },true);
  }
  function keepLanguage(){
    const lang=localStorage.getItem(KEY);if(lang&&labels[lang])syncI18n(lang);
    window.addEventListener('nexora:language-changed',e=>{if(e.detail?.language) localStorage.setItem(KEY,e.detail.language)});
    const observer=new MutationObserver(()=>{
      if(window.NEXORA_I18N?.refresh){clearTimeout(observer._t);observer._t=setTimeout(()=>window.NEXORA_I18N.refresh(),30)}
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  injectStyle();
  const boot=()=>{openLanguage();fallbackInteractions();keepLanguage()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
