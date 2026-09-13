/* NEXORA FOOTBALL MANAGER — MANAGER CAREER / REPUTATION SYSTEM */
(function(){
  const KEY='nexoraManagerRating';
  const START_RATING=25;
  const getRating=()=>Math.max(0,Math.min(100,Number(localStorage.getItem(KEY)||START_RATING)));
  const setRating=value=>{const rating=Math.max(0,Math.min(100,Math.round(value)));localStorage.setItem(KEY,String(rating));return rating};

  function requiredRating(club){
    const rep=Number(club?.reputation||50);
    if(rep<=55)return 20;
    if(rep<=65)return 25;
    if(rep<=75)return 35;
    if(rep<=84)return 50;
    if(rep<=92)return 65;
    if(rep<=96)return 80;
    return 90;
  }

  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

  function injectStyle(){
    if(document.getElementById('manager-career-style'))return;
    const style=document.createElement('style');style.id='manager-career-style';
    style.textContent=`
      .club-choice.nxm-unlocked{position:relative;overflow:hidden;border-color:rgba(183,255,60,.34)!important;background:linear-gradient(145deg,rgba(183,255,60,.12),rgba(255,255,255,.035))!important;box-shadow:0 10px 28px rgba(0,0,0,.22)}
      .club-choice.nxm-unlocked:before{content:'';position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,var(--club-c1),var(--club-c2));opacity:.95}
      .club-choice.nxm-locked{filter:saturate(.08);opacity:.55!important;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(0,0,0,.25))!important;border-color:rgba(255,255,255,.06)!important;cursor:not-allowed!important;box-shadow:none!important}
      .club-choice .nxm-lock{display:block;margin-top:8px;font-size:9px;letter-spacing:.12em;color:#ffb300}
      .nxm-career-meter{margin:14px 0 18px;padding:14px 16px;border:1px solid rgba(183,255,60,.15);border-radius:14px;background:rgba(255,255,255,.025)}
      .nxm-career-meter .nxm-meter-top{display:flex;justify-content:space-between;gap:12px;align-items:center;font-size:10px;letter-spacing:.12em;opacity:.8}
      .nxm-career-meter b{font-size:22px;letter-spacing:0;color:#b7ff3c}
      .nxm-meter-bar{height:5px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-top:9px}.nxm-meter-bar i{display:block;height:100%;background:#b7ff3c;transition:width .25s ease}
      .nxm-transfer-modal{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.78);backdrop-filter:blur(10px)}
      .nxm-transfer-card{width:min(560px,100%);padding:28px;border:1px solid rgba(183,255,60,.25);border-radius:20px;background:#090b0a;box-shadow:0 30px 90px rgba(0,0,0,.55)}
      .nxm-transfer-card .eyebrow{color:#b7ff3c}.nxm-transfer-card h2{margin:7px 0 8px}.nxm-transfer-card p{line-height:1.65;opacity:.78}.nxm-offer-club{font-size:25px;font-weight:800;margin:16px 0 4px}.nxm-offer-meta{font-size:11px;letter-spacing:.1em;opacity:.55}.nxm-transfer-actions{display:flex;gap:10px;margin-top:22px}.nxm-transfer-actions button{flex:1}
      .nxm-dash-rating{display:flex;align-items:center;gap:12px;margin-top:18px}.nxm-dash-rating strong{font-size:28px;color:#b7ff3c}.nxm-dash-rating span{font-size:10px;letter-spacing:.12em;opacity:.62}
    `;
    document.head.appendChild(style);
  }

  function clubList(){return Array.from(document.querySelectorAll('.club-choice')).map(btn=>NEXORA_DATA.clubs[Number(btn.dataset.index)]).filter(Boolean)}

  function decorateClubs(){
    const rating=getRating();
    document.querySelectorAll('.club-choice').forEach(btn=>{
      const club=NEXORA_DATA.clubs[Number(btn.dataset.index)];if(!club)return;
      const required=requiredRating(club);const unlocked=rating>=required;
      btn.classList.toggle('nxm-unlocked',unlocked);btn.classList.toggle('nxm-locked',!unlocked);
      btn.style.setProperty('--club-c1',club.colors?.[0]||'#b7ff3c');btn.style.setProperty('--club-c2',club.colors?.[1]||'#ffffff');
      const old=btn.querySelector('.nxm-lock');if(old)old.remove();
      if(!unlocked){const lock=document.createElement('small');lock.className='nxm-lock';lock.textContent=`MANAGER RATING ${required} REQUIRED · YOURS ${rating}`;btn.appendChild(lock)}
    });
    updateMeter();
  }

  function updateMeter(){
    const grid=document.getElementById('clubGrid');if(!grid)return;
    let meter=document.getElementById('nxmCareerMeter');
    if(!meter){meter=document.createElement('div');meter.id='nxmCareerMeter';meter.className='nxm-career-meter';grid.parentNode.insertBefore(meter,grid)}
    const rating=getRating();meter.innerHTML=`<div class="nxm-meter-top"><span>MANAGER RATING</span><b>${rating}/100</b></div><div class="nxm-meter-bar"><i style="width:${rating}%"></i></div>`;
  }

  function showMessage(title,text,buttons){
    const old=document.querySelector('.nxm-transfer-modal');if(old)old.remove();
    const wrap=document.createElement('div');wrap.className='nxm-transfer-modal';
    wrap.innerHTML=`<div class="nxm-transfer-card"><span class="eyebrow">NEXORA CAREER OFFICE</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p><div class="nxm-transfer-actions">${buttons.map(b=>`<button class="${b.primary?'primary':'secondary'}" data-nxm-action="${escapeHtml(b.id)}">${escapeHtml(b.label)}</button>`).join('')}</div></div>`;
    document.body.appendChild(wrap);
    buttons.forEach(b=>wrap.querySelector(`[data-nxm-action="${b.id}"]`).addEventListener('click',()=>{wrap.remove();b.onClick?.()}));
  }

  function boardTalk(){
    const saved=JSON.parse(localStorage.getItem('nexoraCareer')||'null');const board=Number(saved?.gameState?.boardConfidence??saved?.career?.board??60);
    const rating=getRating();
    if(board>=72 && rating>=30){
      showMessage('Başkan: Kalmanı istiyoruz.','Yönetim seninle kurulan projenin devam etmesini istiyor. Soyunma odasında ve kulübün geleceğinde senin liderliğine güveniyoruz.',[
        {id:'stay',label:'KULÜPTE KAL',primary:true},
        {id:'later',label:'DAHA SONRA KARAR VER',primary:false}
      ]);
    }
  }

  function offerFromClub(){
    const rating=getRating();
    const pool=clubList().filter(c=>c && c.reputation<=rating+12 && c.reputation>=rating-15);
    if(!pool.length)return boardTalk();
    const target=pool[Math.floor(Math.random()*pool.length)];
    const saved=JSON.parse(localStorage.getItem('nexoraCareer')||'null');const current=saved?.gameState?.club?.id;
    if(!target || target.id===current)return boardTalk();
    showMessage('Bir kulüp seni istiyor.',`${target.name} yönetimi seni yeni teknik direktörü olarak görmek istiyor. Bu, kariyerinde yeni bir sayfa açabilir.`,[
      {id:'accept',label:'TEKLİFİ KABUL ET',primary:true,onClick:()=>acceptOffer(target)},
      {id:'reject',label:'TEKLİFİ REDDET',primary:false,onClick:()=>{}}
    ]);
  }

  function acceptOffer(target){
    const saved=JSON.parse(localStorage.getItem('nexoraCareer')||'null');
    if(!saved)return;
    saved.gameState.club=target;saved.gameState.money=target.budget;saved.gameState.reputation=target.reputation;saved.gameState.boardConfidence=60;
    saved.career.club=target;saved.career.reputation=target.reputation;saved.career.board=60;saved.squad=[];saved.startingXI=[];
    localStorage.setItem('nexoraCareer',JSON.stringify(saved));
    location.reload();
  }

  function processMatchResult(){
    const final=document.querySelector('.final-event');if(!final||final.dataset.nxmDone)return;
    final.dataset.nxmDone='1';
    const match=final.textContent.match(/FULL TIME\s*·\s*(\d+)\s*[—-]\s*(\d+)/i);if(!match)return;
    const home=Number(match[1]),away=Number(match[2]);let delta=home>away?3:home===away?1:-2;const rating=setRating(getRating()+delta);updateMeter();decorateClubs();
    const wait=Math.random();
    if(home>away && rating>=50 && wait<.38)setTimeout(offerFromClub,900);
    else if(home>away && wait<.60)setTimeout(boardTalk,900);
  }

  function boot(){
    injectStyle();setRating(getRating());
    const observer=new MutationObserver(()=>{decorateClubs();processMatchResult()});
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(decorateClubs,80);
    document.addEventListener('click',event=>{
      const btn=event.target.closest('.club-choice');if(!btn)return;
      const club=NEXORA_DATA.clubs[Number(btn.dataset.index)];if(!club)return;
      if(getRating()<requiredRating(club)){
        event.preventDefault();event.stopImmediatePropagation();
        showMessage('Kulüp henüz sana hazır değil.',`${club.name} için en az ${requiredRating(club)} manager rating gerekiyor. Mevcut rating'in ${getRating()}. Kariyerini geliştir, daha büyük kulüpler seni arayacak.`,[{id:'ok',label:'ANLADIM',primary:true}]);
      }
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.NEXORA_MANAGER={getRating,setRating,requiredRating,decorateClubs};
})();
