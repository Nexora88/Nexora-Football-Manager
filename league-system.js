(()=>{
const leagues={
 tr:{name:'Türkiye Süper Ligi',country:'Türkiye',code:'TR',teams:18,cl:4,el:2,ec:1,relegation:3,coefficient:14.2},
 gb:{name:'Premier League',country:'İngiltere',code:'ENG',teams:20,cl:5,el:1,ec:1,relegation:3,coefficient:18.6},
 de:{name:'Bundesliga',country:'Almanya',code:'GER',teams:18,cl:4,el:2,ec:1,relegation:2,coefficient:17.7},
 es:{name:'La Liga',country:'İspanya',code:'ESP',teams:20,cl:5,el:1,ec:1,relegation:3,coefficient:18.4},
 it:{name:'Serie A',country:'İtalya',code:'ITA',teams:20,cl:5,el:1,ec:1,relegation:3,coefficient:17.9},
 fr:{name:'Ligue 1',country:'Fransa',code:'FRA',teams:18,cl:3,el:2,ec:1,relegation:3,coefficient:14.1}
};
function key(s){return s?.gameState?.country||s?.gameState?.leagueCountry||s?.career?.country||'tr'}
function get(s){return leagues[key(s)]||leagues.tr}
function europeanSlots(s){const l=get(s),bonus=(s?.gameState?.europe?.extraCL||0);return{cl:l.cl+bonus,el:l.el,ec:l.ec,total:l.cl+l.el+l.ec+bonus}}
function qualification(s,row){const slots=europeanSlots(s),p=row?.position||0;if(p<=slots.cl)return 'CHAMPIONS LEAGUE';if(p<=slots.cl+slots.el)return 'EUROPA LEAGUE';if(p<=slots.total)return 'CONFERENCE LEAGUE';return '—'}
function rankFromCoefficients(){return Object.values(leagues).sort((a,b)=>b.coefficient-a.coefficient).map((x,i)=>({...x,rank:i+1}))}
window.NEXORA_LEAGUE={leagues,key,get,europeanSlots,qualification,rankFromCoefficients};
})();