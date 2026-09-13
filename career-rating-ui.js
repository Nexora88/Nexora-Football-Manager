/* NEXORA — MANAGER RATING DASHBOARD UI */
(()=>{
  function render(){
    const grid=document.querySelector('.dash-grid');if(!grid||!window.NEXORA_MANAGER)return;
    let card=document.getElementById('nxmRatingCard');
    if(!card){card=document.createElement('article');card.id='nxmRatingCard';grid.appendChild(card)}
    const rating=window.NEXORA_MANAGER.getRating();
    card.innerHTML=`<span>MANAGER RATING</span><strong>${rating}/100</strong><small>${rating>=90?'WORLD CLASS':rating>=75?'ELITE':rating>=60?'ESTABLISHED':rating>=40?'RISING':'PROSPECT'}</small>`;
  }
  const boot=()=>{render();new MutationObserver(render).observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
