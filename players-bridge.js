/* NEXORA — connect fictional players to every club */
(()=>{
  const original=window.NEXORA_DATA?.createSquad;
  if(!original)return;
  const turkishFactory=window.NEXORA_TURKISH_PLAYER_FACTORY;
  const universal=window.NEXORA_UNIVERSAL_PLAYER_FACTORY;
  const legacyFactory=window.NEXORA_PLAYER_FACTORY;
  const enrichTurkish=players=>players.map((p,i)=>{
    const age=Number(p.age)||25;
    const youth=age<=21;
    const potential=Math.min(90,Math.max(Number(p.rating)||50,(Number(p.rating)||50)+(youth?9+(i%6):3+(i%5))));
    return {...p,potential,developmentRate:youth?1.25:age<=24?.9:.45,academy:youth,development:Number(p.development)||0,role:youth?'YOUNG TALENT':'FIRST TEAM',wage:p.wage||Math.round((Number(p.value)||500000)*.045/12)};
  });
  window.NEXORA_DATA.createSquad=function(club){
    const turkish=turkishFactory?.(club);
    if(turkish?.length)return enrichTurkish(turkish);
    const generated=universal?.(club);
    if(generated?.length)return generated;
    const legacy=legacyFactory?.(club);
    if(legacy?.length)return legacy;
    return original(club);
  };
})();
