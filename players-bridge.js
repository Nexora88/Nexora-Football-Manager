/* NEXORA — connect fictional Turkish players to the existing squad factory */
(()=>{
  const original=window.NEXORA_DATA?.createSquad;
  if(!original)return;
  const turkishFactory=window.NEXORA_TURKISH_PLAYER_FACTORY;
  const legacyFactory=window.NEXORA_PLAYER_FACTORY;
  window.NEXORA_DATA.createSquad=function(club){
    const turkish=turkishFactory?.(club);
    if(turkish?.length)return turkish;
    /* Foreign clubs can keep the existing database until their fictional rosters are added. */
    const legacy=legacyFactory?.(club);
    if(legacy?.length)return legacy;
    return original(club);
  };
})();
