/* NEXORA FOOTBALL MANAGER — UNIVERSAL FICTIONAL PLAYER ENGINE
   Every club receives a fictional roster. No real player names, photos or likenesses are used.
   22-player squads, age/potential, youth prospects, development rate, salary and match attributes. */
(function(){
  const POS=['GK','GK','GK','RB','CB','CB','LB','DM','CM','CM','AM','RW','LW','ST','ST','CB','RB','LB','CM','AM','RW','ST'];
  const FIRST={tr:['Efe','Kaan','Mert','Aras','Emirhan','Berkay','Doruk','Yiğit','Alp','Tuna','Eren','Ozan','Baran','Metehan','Umut','Kerem','Can','Kuzey'],gb:['Evan','Callum','Mason','Riley','Theo','Harvey','Owen','Finley','Lewis','Noah','Jude','Reece','Alfie','Jamie','Archie','Liam','Elliot','Tyler'],es:['Iker','Mateo','Hugo','Adrian','Nico','Diego','Sergio','Pablo','Alex','Gael','Bruno','Ivan','Mario','Ruben','Dario','Leo','Enzo','Javi'],it:['Luca','Matteo','Marco','Davide','Andrea','Gabriele','Nicolo','Tommaso','Federico','Edoardo','Alessio','Riccardo','Samuele','Daniele','Fabio','Lorenzo','Pietro','Elia']};
  const LAST={tr:['Karaca','Yıldız','Şahin','Tunç','Koç','Demir','Aydın','Kılıç','Kaya','Çelik','Aksoy','Polat','Arslan','Keskin','Ekin','Yalçın','Korkut','Acar'],gb:['Carter','Bennett','Hayes','Turner','Walker','Collins','Parker','Cooper','Morgan','Foster','Reed','Hughes','Mason','Ward','Brooks','Price','Stone','Murphy'],es:['Navarro','Serrano','Vidal','Molina','Castro','Ortega','Marin','Rojas','Santos','Cabrera','Fuentes','Vega','Pardo','Leon','Duran','Mendez','Sola','Campos'],it:['Riva','Conti','Moretti','Ferraro','Romano','Gallo','Marino','Greco','Fontana','Lombardi','Serra','De Luca','Costa','Rinaldi','Caruso','Ferri','Bianchi','Vitale']};
  const COUNTRY=club=>club?.leagueCountry||'tr';
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0};
  const n=(seed,max)=>hash(seed)%max;
  function make(club){
    if(!club?.id)return [];
    const c=COUNTRY(club), f=FIRST[c]||FIRST.tr, l=LAST[c]||LAST.tr, seed=hash(club.id);
    const level=Math.max(52,Math.min(78,Math.round((club.reputation||50)*.72)));
    return POS.map((pos,i)=>{
      const s=`${seed}-${i}`, age=i<7?16+n(s,6):22+n(s,12), youth=age<=20;
      const potential=Math.min(92,Math.max(level+2,level+(n(s+'p',22)-4)+(youth?10:0)));
      const rating=Math.min(potential-2,Math.max(50,level+(n(s+'r',13)-6)));
      const pace=55+n(s+'a',38), passing=54+n(s+'b',40), shooting=46+n(s+'c',45), defending=48+n(s+'d',43), dribbling=52+n(s+'e',40), physical=55+n(s+'f',40), vision=52+n(s+'g',43);
      const value=Math.round(Math.max(250000,(rating-42)*95000+(potential-rating)*120000+(youth?450000:0)));
      return {id:`${club.id}-p${i+1}`,name:`${f[n(s+'f1',f.length)]} ${l[n(s+'l1',l.length)]}`,pos,rating,pace,passing,shooting,defending,dribbling,physical,vision,value,fitness:88+n(s+'fit',10),morale:72+n(s+'mor',20),age,potential,developmentRate:youth?1.25:age<=24?0.9:0.45,salary:Math.round(value*.045/12),wage:Math.round(value*.045/12),contract:2+n(s+'ct',4),academy:youth,development:0,role:youth?'YOUNG TALENT':'FIRST TEAM'};
    });
  }
  window.NEXORA_UNIVERSAL_PLAYER_FACTORY=make;
  window.NEXORA_ACADEMY_PROSPECTS=club=>make({...club,id:`${club?.id||'academy'}-academy`}).filter(p=>p.academy).slice(0,7);
})();
