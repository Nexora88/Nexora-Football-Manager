/* NEXORA PHASE 1 — squad identity + 2.5D tactical positioning */
(function(){
  const formationMap={
    '4-3-3':[
      ['GK',50,91],['LB',20,72],['CB',40,76],['CB',60,76],['RB',80,72],
      ['CM',34,56],['DM',50,61],['CM',66,56],['LW',20,31],['ST',50,22],['RW',80,31]
    ],
    '4-2-3-1':[
      ['GK',50,91],['LB',20,72],['CB',40,76],['CB',60,76],['RB',80,72],
      ['DM',39,61],['DM',61,61],['LW',20,38],['AM',50,39],['RW',80,38],['ST',50,20]
    ],
    '4-4-2':[
      ['GK',50,91],['LB',20,72],['CB',40,76],['CB',60,76],['RB',80,72],
      ['LM',20,52],['CM',40,56],['CM',60,56],['RM',80,52],['ST',42,25],['ST',58,25]
    ]
  };

  function squadData(){
    const club=window.NEXORA_GAME_STATE?.club;
    return window.NEXORA_DATA?.createSquad?.(club)||[];
  }
  function formation(){return window.NEXORA_GAME_STATE?.formation||'4-3-3'}
  function starterIds(){
    try{return JSON.parse(localStorage.getItem('nexoraCareer')||'null')?.startingXI||[]}catch{return []}
  }
  function buildPitch(){
    const pitch=document.querySelector('.pitch-25d');
    if(!pitch||pitch.dataset.phase1Ready==='1')return;
    pitch.dataset.phase1Ready='1';
    pitch.classList.add('phase1-host');
    const wrapper=document.createElement('div');wrapper.className='phase1-pitch';
    const field=document.createElement('div');field.className='phase1-field';wrapper.appendChild(field);
    const profile=document.createElement('aside');profile.className='phase1-profile';profile.hidden=true;wrapper.appendChild(profile);
    const readout=document.createElement('div');readout.className='phase1-tactical-readout';
    const players=squadData(),ids=starterIds();
    const chosen=ids.length===11?ids:players.slice(0,11).map(p=>p.id);
    const positions=formationMap[formation()]||formationMap['4-3-3'];
    const club=window.NEXORA_GAME_STATE?.club;const clubColor=club?.colors?.[0]||'#b7ff3c';
    positions.forEach((pos,i)=>{
      const p=players.find(x=>x.id===chosen[i])||players[i];if(!p)return;
      const node=document.createElement('button');node.type='button';node.className='phase1-player';node.style.left=pos[1]+'%';node.style.top=pos[2]+'%';node.style.setProperty('--club-color',clubColor);node.style.setProperty('--slow',Math.max(.05,(100-p.pace)/100)+'s');node.title=`${p.name} · ${p.pos} · OVR ${p.rating}`;
      node.innerHTML=`<span>${p.pos}</span><em>${p.rating}</em><small>${p.name.split(' ')[0]}</small>`;
      node.addEventListener('click',()=>showProfile(profile,p,clubColor));field.appendChild(node);
    });
    const m=window.NEXORA_DATA?.createSquad?.(club)||[];const xi=chosen.map(id=>m.find(p=>p.id===id)).filter(Boolean);
    const avg=k=>Math.round(xi.reduce((s,p)=>s+(p[k]||0),0)/Math.max(1,xi.length));
    readout.innerHTML=`<div class="phase1-readout"><span>PACE</span><b>${avg('pace')}</b></div><div class="phase1-readout"><span>PASS</span><b>${avg('passing')}</b></div><div class="phase1-readout"><span>SHOT</span><b>${avg('shooting')}</b></div>`;
    pitch.appendChild(wrapper);pitch.appendChild(readout);
  }
  function showProfile(profile,p,color){
    profile.hidden=false;profile.style.setProperty('--club-color',color);
    const stats=[['PACE',p.pace],['PASS',p.passing],['SHOT',p.shooting],['DEF',p.defending],['DRIBBLE',p.dribbling],['PHYSICAL',p.physical],['VISION',p.vision],['STAMINA',p.stamina]];
    profile.innerHTML=`<h4>${p.name}</h4><div class="profile-pos">${p.pos} · AGE ${p.age} · OVR ${p.rating}</div><div class="phase1-bars">${stats.map(([n,v])=>`<div class="phase1-bar"><span>${n}</span><i><b style="--w:${v}%"></b></i><strong>${v}</strong></div>`).join('')}</div><div class="phase1-hint">ATTRIBUTES → MOVEMENT · DECISION · EXECUTION<br>Potential ${p.potential} · Value €${Math.round(p.value/1000)}K · Wage €${p.wage}/wk</div>`;
  }
  function refresh(){
    const pitch=document.querySelector('.pitch-25d');
    if(pitch){pitch.dataset.phase1Ready='';pitch.querySelector('.phase1-pitch')?.remove();pitch.querySelector('.phase1-tactical-readout')?.remove();buildPitch()}
  }
  const observer=new MutationObserver(()=>{if(document.querySelector('.pitch-25d'))buildPitch()});
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('nexora:career-ready',refresh);
  window.NEXORA_PHASE1={buildPitch,refresh};
})();