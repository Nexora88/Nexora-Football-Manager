(()=>{
  const boot=()=>{
    const modal=document.getElementById('modal');
    if(!modal)return;
    let forwarding=false;
    const open=()=>{
      try{if(typeof window.renderClubs==='function')window.renderClubs()}catch(e){console.warn('NEXORA renderClubs failed',e)}
      modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
    };
    const rescue=e=>{
      const el=e.target.closest('button');if(!el||forwarding)return;
      const id=el.id;
      try{
        if(id==='startBtn'||id==='demoBtn'){open();return}
        if(id==='closeBtn'){
          if(typeof window.closeModal==='function')window.closeModal();
          else{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
          return;
        }
        if(id==='continueBtn'||id==='squadBtn'){
          /* app.js owns these handlers. If its lexical functions are not on window,
             forward the click once instead of trying to call a missing global. */
          forwarding=true;
          el.click();
          forwarding=false;
        }
      }catch(err){forwarding=false;console.warn('NEXORA click rescue failed',err)}
    };
    document.addEventListener('click',rescue,true);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
