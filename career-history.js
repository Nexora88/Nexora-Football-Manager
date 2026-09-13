(()=>{
const get=()=>{try{return JSON.parse(localStorage.getItem('nexoraCareer')||'null')}catch{return null}};
const save=s=>localStorage.setItem('nexoraCareer',JSON.stringify(s));
const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
function ensure(s){
 const g=s.gameState;
 g.careerHistory||={appointments:[],seasons:[],trophies:[],matches:0,wins:0,draws:0,losses:0,bestFinish:null,milestones:[],totalClubs:0};
 const c=g.careerHistory;
 c.appointments=Array.isArray(c.appointments)?c.appointments:[];
 c.seasons=Array.isArray(c.seasons)?c.seasons:[];
 c.trophies=Array.isArray(c.trophies)?c.trophies:[];
 c.milestones=Array.isArray(c.milestones)?c.milestones:[];
 return c;
}
function appointment(s,c){
 const g=s.gameState;
 const id=`${g.club.id||g.club.code||g.club.name}-${g.season||'2026/27'}`;
 if(!c.appointments.some(x=>x.id===id)){
  c.appointments.push({id,club:g.club.name,season:g.season||'2026/27',style:g.managerStyle||'Tactical Genius',startDate:g.date||'2026-07-01',endDate:null});
  c.totalClubs=new Set(c.appointments.map(x=>x.club)).size;
 }
}
function sync(){
 const s=get();if(!s?.gameState?.club)return;
 const g=s.gameState,c=ensure(s),h=Array.isArray(g.matchHistory)?g.matchHistory:[];
 appointment(s,c);
 c.matches=h.length;
 c.wins=h.filter(x=>Number(x.homeGoals||0)>Number(x.awayGoals||0)).length;
 c.draws=h.filter(x=>Number(x.homeGoals||0)===Number(x.awayGoals||0)).length;
 c.losses=h.filter(x=>Number(x.homeGoals||0)<Number(x.awayGoals||0)).length;
 c.currentClub=g.club.name;c.currentSeason=g.season||'2026/27';c.reputation=Number(g.reputation||0);
 const wr=c.matches?Math.round(c.wins/c.matches*100):0;
 const milestones=[
  [1,'FIRST MATCH','Your managerial career has officially begun.'],
  [10,'10 MATCHES','Ten matches on the touchline.'],
  [25,'25 MATCHES','A serious coaching sample is taking shape.'],
  [50,'50 MATCHES','Fifty matches — experience is becoming reputation.'],
  [100,'CENTURY','One hundred matches as a manager.'],
  [10,'10 WINS','Double-digit victories achieved.']
 ];
 milestones.forEach(([n,title,detail],i)=>{
  const hit=i===5?c.wins>=n:c.matches>=n;
  const id=`m${i}`;if(hit&&!c.milestones.some(x=>x.id===id))c.milestones.push({id,title,detail,date:g.date});
 });
 save(s);render(s);
}
function render(s=get()){
 if(!s?.gameState?.club)return;const g=s.gameState,c=ensure(s);const host=document.getElementById('careerHistoryPanel')||(()=>{const x=document.createElement('section');x.id='careerHistoryPanel';x.className='career-history';document.getElementById('dashboard')?.appendChild(x);return x})();
 const wr=c.matches?Math.round(c.wins/c.matches*100):0;
 const gd=(g.matchHistory||[]).reduce((a,x)=>a+Number(x.homeGoals||0)-Number(x.awayGoals||0),0);
 const latest=(g.matchHistory||[]).slice(-5).reverse();
 const form=latest.map(x=>Number(x.homeGoals||0)>Number(x.awayGoals||0)?'W':Number(x.homeGoals||0)===Number(x.awayGoals||0)?'D':'L').join(' · ')||'—';
 const apps=c.appointments.slice().reverse();
 host.innerHTML=`<div class="media-card career-cv-card">
 <div class="media-head"><div><span class="eyebrow">NEXORA MANAGER CV</span><h3>${esc(g.managerName||'Manager')} — Career History</h3><p>${esc(c.currentClub||g.club.name)} · ${esc(c.currentSeason||'2026/27')} · ${esc(g.managerStyle||'Tactical Genius')}</p></div><span class="news-badge">REP ${Number(g.reputation||0)}</span></div>
 <div class="career-stats"><div><b>${c.matches}</b><small>MATCHES</small></div><div><b>${c.wins}</b><small>WINS</small></div><div><b>${c.draws}</b><small>DRAWS</small></div><div><b>${c.losses}</b><small>LOSSES</small></div><div><b>${wr}%</b><small>WIN RATE</small></div></div>
 <div class="career-mini-grid"><div><span>GOAL DIFF</span><b>${gd>=0?'+':''}${gd}</b></div><div><span>CLUBS</span><b>${c.totalClubs||1}</b></div><div><span>SEASONS</span><b>${new Set(apps.map(x=>x.season)).size||1}</b></div><div><span>FORM</span><b>${form}</b></div></div>
 <div class="career-section"><strong>CLUB HISTORY</strong>${apps.length?apps.map((x,i)=>`<div class="career-row"><div><b>${esc(x.club)}</b><small>${esc(x.season)} · ${esc(x.style)}</small></div><em>${i===0?'CURRENT':'COMPLETED'}</em></div>`).join(''):'<p>No appointments recorded yet.</p>'}</div>
 <div class="career-section"><strong>HONOURS</strong>${c.trophies.length?c.trophies.map(t=>`<div class="career-honour">🏆 ${esc(t)}</div>`).join(''):'<div class="career-empty">No trophies yet — the first chapter is still being written.</div>'}</div>
 <div class="career-section"><strong>CAREER MILESTONES</strong>${c.milestones.length?c.milestones.slice(-5).reverse().map(m=>`<div class="career-row"><div><b>${esc(m.title)}</b><small>${esc(m.detail)}</small></div><em>${esc(m.date||'')}</em></div>`).join(''):'<div class="career-empty">Your first milestone awaits.</div>'}</div>
 </div>`;
}
window.NEXORA_CAREER_HISTORY={sync,render,ensure};
['nexora:career-ready','nexora:match-event','nexora:day-advanced','nexora:fulltime'].forEach(e=>window.addEventListener(e,()=>setTimeout(sync,100)));
window.addEventListener('load',()=>setTimeout(sync,220));
})();