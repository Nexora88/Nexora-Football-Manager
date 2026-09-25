(()=>{
const K='nexoraCareer';
const read=()=>{try{return JSON.parse(localStorage.getItem(K)||'null')}catch{return null}};
const save=s=>localStorage.setItem(K,JSON.stringify(s));
const opponents=['London Royals','Munich 04','Madrid Athletic','Milano Calcio','Paris Union','Amsterdam FC','Lisbon Sporting','Prague Dynamo'];
function next(s){const q=s.gameState.europeQualification;if(!q||q.eliminated||q.winner)return;const m=q.schedule?.[q.matchIndex];if(!m)return;s.gameState.nextCompetition='europe-modern';s.gameState.nextFixture={id:'eu-'+s.gameState.season+'-'+q.phase+'-'+q.matchIndex,round:q.phase,date:s.gameState.date,home:m.home,opponent:m.opponent,homeName:m.home?s.gameState.club.name:m.opponent,awayName:m.home?m.opponent:s.gameState.club.name,daysUntil:0};save(s)}
function start(){const s=read(),q=s?.gameState?.europeQualification;if(!s||!q||q.modern)return;q.modern=true;q.phase='LEAGUE PHASE';q.schedule=opponents.slice(0,q.competition==='CL'?6:4).map((op,i)=>({opponent:op,home:i%2===0,played:false,user:0,opp:0}));q.matchIndex=0;q.points=0;save(s);next(s)}
function done(e){const s=read(),q=s?.gameState?.europeQualification;if(!s||!q||!q.modern||s.gameState.nextCompetition!=='europe-modern'||e.detail?.type!=='fulltime')return;const m=q.schedule?.[q.matchIndex];if(!m)return;const h=Number(e.detail.homeGoals)||0,a=Number(e.detail.awayGoals)||0;m.user=m.home?h:a;m.opp=m.home?a:h;m.played=true;if(q.phase==='LEAGUE PHASE'){q.points+=m.user>m.opp?3:m.user===m.opp?1:0;q.matchIndex++;if(q.matchIndex>=q.schedule.length){q.phase='KNOCKOUT';q.matchIndex=0;q.schedule=opponents.slice(0,4).map((op,i)=>({opponent:op,home:i%2===0,played:false,user:0,opp:0}))}}else{q.matchIndex++;if(q.matchIndex>=q.schedule.length){q.winner=true;s.gameState.nextCompetition='league';s.gameState.nextFixture=null;s.gameState.trophies??=[];s.gameState.trophies.push({name:q.competition==='CL'?'UEFA ŞAMPİYONLAR LİGİ':q.competition==='EL'?'UEFA AVRUPA LİGİ':'UEFA KONFERANS LİGİ',season:s.gameState.season,date:s.gameState.date})}}save(s);if(!q.winner)next(s);window.dispatchEvent(new CustomEvent('nexora:europe-season-updated'))}
window.NEXORA_EUROPE_SEASON={start,next};
window.addEventListener('nexora:europe-qualified',start);
window.addEventListener('nexora:match-event',done);
setTimeout(()=>{const s=read();if(s?.gameState?.europeQualification&&!s.gameState.europeQualification.modern)start()},500);
})();
