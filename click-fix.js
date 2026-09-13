(()=>{
  const boot=()=>{
    const modal=document.getElementById('modal');
    if(!modal)return;
    const open=()=>{
      try{if(typeof window.renderClubs==='function')window.renderClubs()}catch(e){console.warn('NEXORA renderClubs failed',e)}
      modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    };
    const rescue=e=>{
      const el=e.target.closest('button');if(!el)return;
      const id=el.id;
      try{
        if(id==='startBtn'||id==='demoBtn'){open();return;}
        if(id==='closeBtn'&&typeof window.closeModal==='function'){window.closeModal();return;}
        if(id==='squadBtn'&&typeof window.openSquad==='function'){window.openSquad();return;}
        if(id==='continueBtn'){
          const selected=document.querySelector('.club-choice.selected');
          if(selected&&window.NEXORA_DATA&&typeof window.beginCareer==='function'){
            const club=window.NEXORA_DATA.clubs[Number(selected.dataset.index)];
            if(club)window.beginCareer(club);
          }
        }
      }catch(err){console.warn('NEXORA click rescue failed',err)}
    };
    document.addEventListener('click',rescue,true);
    [document.getElementById('startBtn'),document.getElementById('demoBtn')].forEach(btn=>{
      if(!btn||btn.dataset.clickFixBound)return;
      btn.dataset.clickFixBound='1';btn.addEventListener('click',open,{capture:true});
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
