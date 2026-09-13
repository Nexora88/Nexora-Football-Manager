(()=>{
  const boot=()=>{
    const modal=document.getElementById('modal');
    const start=document.getElementById('startBtn');
    const demo=document.getElementById('demoBtn');
    if(!modal)return;
    const open=()=>{
      try{if(typeof window.renderClubs==='function')window.renderClubs()}catch(e){console.error('NEXORA renderClubs failed',e)}
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
    };
    [start,demo].forEach(btn=>{
      if(!btn||btn.dataset.clickFixBound)return;
      btn.dataset.clickFixBound='1';
      btn.addEventListener('click',open,{capture:true});
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
