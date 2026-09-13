(()=>{
  const gs=()=>window.NEXORA_GAME_STATE;
  const setClock=value=>{const g=gs();if(!g)return;g.clock=value;if(window.NEXORA_WEATHER?.calculate)window.NEXORA_WEATHER.calculate();try{persist();syncDashboard()}catch(e){}};
  const inject=()=>{
    const board=document.querySelector('.match-board');
    const g=gs();
    if(!board||!g||board.querySelector('.matchday-status'))return;
    const w=window.NEXORA_WEATHER?.calculate?.();
    if(!w)return;
    const status=document.createElement('div');status.className='matchday-status';
    status.innerHTML=`<span>${w.icon} ${w.label}</span><span>${g.clock} · ${w.temperature}°C</span><span>WIND ${w.wind} km/h</span><span>PRECIP ${w.precipitation}%</span>`;
    board.insertBefore(status,board.firstChild);
    board.dataset.weather=w.id;
  };
  const prepare=()=>{
    const g=gs();if(!g?.club)return;
    if(g.clock!=='19:00')setClock('19:00');
    setTimeout(inject,0);
  };
  const observer=new MutationObserver(mutations=>{
    for(const m of mutations){
      if([...m.addedNodes].some(n=>n.nodeType===1&&n.querySelector?.('.final-event'))){
        setTimeout(()=>{try{window.NEXORA_WEATHER?.advance?.(120)}catch(e){}},100);
      }
    }
    inject();
  });
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('#startMatchTactic,#matchFromSquad');
    if(!b||b.disabled)return;
    prepare();
  },true);
  window.addEventListener('nexora:career-ready',()=>setTimeout(inject,100));
})();
