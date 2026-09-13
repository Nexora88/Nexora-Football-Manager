(()=>{
const leagues={
 tr:{name:'Türkiye Süper Ligi',country:'Türkiye',code:'TR',teams:18,relegation:3,coefficient:14.2},
 gb:{name:'Premier League',country:'İngiltere',code:'ENG',teams:20,relegation:3,coefficient:18.6},
 de:{name:'Bundesliga',country:'Almanya',code:'GER',teams:18,relegation:2,coefficient:17.7},
 es:{name:'La Liga',country:'İspanya',code:'ESP',teams:20,relegation:3,coefficient:18.4},
 it:{name:'Serie A',country:'İtalya',code:'ITA',teams:20,relegation:3,coefficient:17.9},
 fr:{name:'Ligue 1',country:'Fransa',code:'FRA',teams:18,relegation:3,coefficient:14.1}
};
function key(s){return s?.gameState?.country||s?.gameState?.leagueCountry||s?.career?.country||'tr'}
function get(s){return leagues[key(s)]||leagues.tr}
function europeanSlots(s){const l=get(s),bonus=Number(s?.gameState?.europe?.extraCL||0),cl=(l.coefficient>=18?5:l.coefficient>=16?4:3)+bonus;return{cl,el:2,ec:1,total:cl+3}}
function qualification(s,position){const x=europeanSlots(s);if(position<=x.cl)return 'ŞAMPİYONLAR LİGİ';if(position<=x.cl+x.el)return 'AVRUPA LİGİ';if(position<=x.total)return 'KONFERANS LİGİ';return '—'}
function rankFromCoefficients(){return Object.values(leagues).sort((a,b)=>b.coefficient-a.coefficient).map((x,i)=>({...x,rank:i+1}))}
window.NEXORA_LEAGUE={leagues,key,get,europeanSlots,qualification,rankFromCoefficients};
})();