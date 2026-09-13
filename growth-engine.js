/* NEXORA — fictional player progression engine */
(function(){
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function apply(squad,result,style){
    const win=result.home>result.away, draw=result.home===result.away;
    squad.forEach(p=>{
      const age=p.age||25, cap=p.potential||p.rating||60;
      let g=age<=20?.55:age<=23?.32:age<=26?.12:.02;
      if(style==='Youth Developer'&&age<=23)g*=1.65;
      if(win)g*=1.12; else if(draw)g*=1.04;
      g*=p.developmentRate||1;
      const room=Math.max(0,cap-p.rating), gain=Math.min(room,g);
      if(gain>0){
        const key=['passing','vision','dribbling','pace','shooting'][p.id.length%5];
        p.rating=Math.round((p.rating+gain)*10)/10;
        p[key]=clamp(Math.round((p[key]+gain*.7)*10)/10,1,99);
        p.development=Math.round(((p.development||0)+gain)*10)/10;
      }
    });
    return squad;
  }
  function prospects(squad){return squad.filter(p=>p.age<=20).sort((a,b)=>(b.potential-b.rating)-(a.potential-a.rating)).slice(0,5)}
  window.NEXORA_GROWTH={apply,prospects};
})();
