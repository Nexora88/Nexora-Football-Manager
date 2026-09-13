/* NEXORA — connect every club to the fictional player engine */
(()=>{
  const original=window.NEXORA_DATA?.createSquad;
  if(!original)return;
  const universal=window.NEXORA_UNIVERSAL_PLAYER_FACTORY;
  const turkishFactory=window.NEXORA_TURKISH_PLAYER_FACTORY;
  const legacyFactory=window.NEXORA_PLAYER_FACTORY;
  window.NEXORA_DATA.createSquad=function(club){
    const generated=universal?.(club);
    if(generated?.length)return generated;
    const turkish=turkishFactory?.(club);
    if(turkish?.length)return turkish;
    const legacy=legacyFactory?.(club);
    if(legacy?.length)return legacy;
    return original(club);
  };
})();
