(() => {
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const getCareer=()=>{try{return JSON.parse(localStorage.getItem('nexoraCareer')||'null')}catch{return null}};
  const bind=()=>{
    const pitch=document.getElementById('matchPitch');
    const stage=document.getElementById('matchStage');
    if(!pitch||!stage||pitch.dataset.playerControl==='1')return;
    pitch.dataset.playerControl='1';
    const career=getCareer(); const players=career?.squad||[];
    let panel=document.getElementById('playerTacticalPanel');
    if(!panel){panel=document.createElement('aside');panel.id='playerTacticalPanel';panel.className='player-tactical-panel';panel.innerHTML='<div class="pt-empty"><span>PLAYER LINK</span><strong>Bir oyuncu seç</strong><small>Sahadaki oyuncuya dokunarak bireysel durumunu ve görevini kontrol et.</small></div>';stage.appendChild(panel);}
    pitch.querySelectorAll('.match-player').forEach(el=>{
      el.addEventListener('click',e=>{
        e.stopPropagation();pitch.querySelectorAll('.match-player').forEach(p=>p.classList.remove('selected'));el.classList.add('selected');
        const p=players.find(x=>String(x.id)===String(el.dataset.id));if(!p)return;
        panel.innerHTML=`<div class="pt-head"><span>PLAYER LINK / LIVE</span><button id="ptClose">×</button></div><h4>${esc(p.name)}</h4><div class="pt-role">${esc(p.pos)} · OVR ${esc(p.rating)}</div><div class="pt-stats"><b><i>${p.pace}</i> PACE</b><b><i>${p.passing}</i> PASS</b><b><i>${p.shooting}</i> SHOT</b><b><i>${p.defending}</i> DEF</b><b><i>${p.dribbling}</i> DRIBBLE</b><b><i>${p.stamina}</i> STAMINA</b></div><div class="pt-status">CANLI GÖREV: <strong id="ptTask">NORMAL</strong></div><div class="pt-actions"><button data-task="normal">NORMAL</button><button data-task="press">PRES</button><button data-task="run">KOŞU</button><button data-task="hold">POZİSYONU KORU</button></div>`;
        panel.classList.add('visible');panel.querySelector('#ptClose').onclick=()=>{el.classList.remove('selected');panel.classList.remove('visible');};
        panel.querySelectorAll('[data-task]').forEach(btn=>btn.onclick=()=>{const task=btn.dataset.task;panel.querySelector('#ptTask').textContent=btn.textContent;el.classList.toggle('pressing',task==='press');el.classList.toggle('running',task==='run');el.classList.toggle('holding',task==='hold');window.dispatchEvent(new CustomEvent('nexora:player-command',{detail:{playerId:p.id,playerName:p.name,task}}));});
      });
    });
  };
  new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});bind();
})();