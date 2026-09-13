(()=>{
  const boot=()=>{
    const modal=document.getElementById('modal');
    const dashboard=document.getElementById('dashboard');
    if(!modal)return;
    const open=()=>{
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      if(typeof window.renderClubs==='function')window.renderClubs();
      else if(window.NEXORA_DATA?.clubs){
        const grid=document.getElementById('clubGrid');
        if(grid&&!grid.children.length)grid.innerHTML=window.NEXORA_DATA.clubs.map((c,i)=>`<button class="club-choice" data-index="${i}"><b>${c.code}</b><strong>${c.name}</strong><span>${c.city} · ${c.style} · ${c.difficulty}</span></button>`).join('');
      }
    };
    const close=()=>{
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
    };
    const fallbackCareer=()=>{
      const g=window.NEXORA_GAME_STATE,clubs=window.NEXORA_DATA?.clubs||[];
      if(!g||g.club||!clubs.length)return;
      const selected=document.querySelector('.club-choice.selected')||document.querySelector('.club-choice');
      const club=clubs[Number(selected?.dataset.index)||0];
      if(!club)return;
      const style=document.querySelector('.career-choice.selected')?.dataset.style||'Tactical Genius';
      const name=(document.getElementById('managerName')?.value||'').trim()||'Manager';
      g.managerName=name;g.club=club;g.managerStyle=style;g.date='2026-07-01';g.clock='09:00';g.money=club.budget||5000000;g.season='2026/27';g.reputation=club.reputation||50;g.boardConfidence=60;g.formation='4-3-3';
      const squad=window.NEXORA_DATA.createSquad(club);
      const career={club,style,season:g.season,reputation:g.reputation,board:60,managerName:name};
      localStorage.setItem('nexoraGameState',JSON.stringify(g));
      localStorage.setItem('nexoraCareer',JSON.stringify({career,squad,startingXI:squad.slice(0,11).map(p=>p.id),formation:'4-3-3',gameState:g}));
      const wt=document.getElementById('welcomeTitle'),ws=document.getElementById('welcomeSub');
      if(wt)wt.textContent=`Congratulations, ${name}.`;
      if(ws)ws.textContent=`${club.city} · ${club.name} · Your 2026/27 journey starts now.`;
      const hero=document.querySelector('.hero');if(hero)hero.hidden=true;if(dashboard)dashboard.hidden=false;
      close();window.dispatchEvent(new CustomEvent('nexora:career-ready'));
    };
    document.addEventListener('click',e=>{
      const b=e.target.closest?.('button');if(!b)return;
      if(b.id==='startBtn'||b.id==='demoBtn'){e.preventDefault();e.stopImmediatePropagation();open();return;}
      if(b.id==='closeBtn'){e.preventDefault();e.stopImmediatePropagation();close();return;}
      if(b.id==='continueBtn'){
        setTimeout(()=>{if(!window.NEXORA_GAME_STATE?.club&&modal.classList.contains('open'))fallbackCareer();},180);
        return;
      }
      if(b.id==='squadBtn'&&!window.NEXORA_GAME_STATE?.club){
        e.preventDefault();e.stopImmediatePropagation();return;
      }
    },true);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
