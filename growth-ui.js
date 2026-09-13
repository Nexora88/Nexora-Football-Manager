/* NEXORA — progression bridge for the career UI */
(function(){
  let handled=false;
  function run(){
    const final=document.querySelector('.final-event');
    if(!final||handled||!window.NEXORA_GROWTH)return;
    handled=true;
    const m=final.textContent.match(/(\d+)\s*[—-]\s*(\d+)/); if(!m)return;
    try{
      const saved=JSON.parse(localStorage.getItem('nexoraCareer')||'null');
      if(!saved?.squad?.length)return;
      window.NEXORA_GROWTH.apply(saved.squad,{home:Number(m[1]),away:Number(m[2])},saved.gameState?.managerStyle||'');
      localStorage.setItem('nexoraCareer',JSON.stringify(saved));
      const prospects=window.NEXORA_GROWTH.prospects(saved.squad);
      const log=document.getElementById('eventLog');
      if(log){
        const names=prospects.slice(0,3).map(p=>`${p.name} ${Math.round(p.rating)} OVR / ${p.potential} POT`).join(' · ');
        log.insertAdjacentHTML('afterbegin',`<div class="event"><b>DEVELOPMENT</b> Young players progressed after the match. ${names||'Squad development updated.'}</div>`);
      }
      const btn=document.getElementById('returnSquad');
      if(btn)btn.addEventListener('click',()=>setTimeout(()=>location.reload(),80),{once:true});
    }catch(e){console.warn('Progression update failed',e)}
  }
  new MutationObserver(run).observe(document.body,{subtree:true,childList:true});
})();
