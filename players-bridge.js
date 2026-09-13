/* NEXORA — connect real player database to the existing squad factory */
(()=>{
  const original=window.NEXORA_DATA?.createSquad;
  if(!original)return;
  const realFactory=window.NEXORA_PLAYER_FACTORY;
  window.NEXORA_DATA.createSquad=function(club){
    const real=realFactory?.(club);
    if(real?.length)return real;
    return original(club);
  };
})();
