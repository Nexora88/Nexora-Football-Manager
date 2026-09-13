/* NEXORA — ACTIVE YOUTH DEVELOPMENT */
(()=>{
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const develop=s=>{
    if(!s?.squad?.length)return;
    const style=s.gameState?.managerStyle||'Tactical Genius';
    s.gameState.playerDevelopment ||= {lastGrowthDate:null,weeklyCycles:0};
    if(s.gameState.playerDevelopment.lastGrowthDate===s.gameState.date)return;
    s.squad.forEach(p=>{
      const age=Number(p.age)||25, rating=Number(p.rating)||50, potential=Number(p.potential)||rating;
      if(rating>=potential)return;
      let gain=age<=20?.55:age<=23?.32:age<=26?.12:.02;
      if(style==='Youth Developer'&&age<=23)gain*=1.65;
      gain*=Number(p.developmentRate)||1;
      gain=Math.min(potential-rating,gain);
      p.rating=Math.round((rating+gain)*10)/10;
      p.development=Math.round(((Number(p.development)||0)+gain)*10)/10;
      p.value=Math.max(Number(p.value)||0,Math.round(p.rating*p.rating*900));
      p.fitness=clamp((Number(p.fitness)||80)+1,0,100);
    });
    s.gameState.playerDevelopment.lastGrowthDate=s.gameState.date;
    s.gameState.playerDevelopment.weeklyCycles++;
  };
  const tick=()=>{try{const s=JSON.parse(localStorage.getItem('nexoraCareer')||'null');if(!s?.squad?.length)return;const day=new Date(`${s.gameState.date}T00:00:00`).getDay();if(day!==1)return;develop(s);localStorage.setItem('nexoraCareer',JSON.stringify(s));localStorage.setItem('nexoraGameState',JSON.stringify(s.gameState));window.dispatchEvent(new CustomEvent('nexora:youth-developed',{detail:{count:s.squad.filter(p=>p.development>0).length}}));}catch(e){console.warn('Youth development failed',e)}};
  window.NEXORA_YOUTH_DEVELOPMENT={develop};
  window.addEventListener('nexora:day-advanced',tick);
})();
