/* NEXORA — connect fictional players to every club */
(()=>{
  const original=window.NEXORA_DATA?.createSquad;
  if(!original)return;
  const turkishFactory=window.NEXORA_TURKISH_PLAYER_FACTORY;
  const universal=window.NEXORA_UNIVERSAL_PLAYER_FACTORY;
  const legacyFactory=window.NEXORA_PLAYER_FACTORY;
  window.NEXORA_DATA.createSquad=function(club){
    const turkish=turkishFactory?.(club);
    if(turkish?.length)return turkish;
    const generated=universal?.(club);
    if(generated?.length)return generated;
    const legacy=legacyFactory?.(club);
    if(legacy?.length)return legacy;
    return original(club);
  };
})();
