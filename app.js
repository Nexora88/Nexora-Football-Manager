const modal=document.getElementById('modal');
const startBtn=document.getElementById('startBtn');
const demoBtn=document.getElementById('demoBtn');
const closeBtn=document.getElementById('closeBtn');
const continueBtn=document.getElementById('continueBtn');
const choices=[...document.querySelectorAll('.career-choice')];
const clubGrid=document.getElementById('clubGrid');
const careerStep=document.getElementById('careerStep');
const createStep=document.getElementById('createStep');
const createClubBtn=document.getElementById('createClubBtn');
const saveClubBtn=document.getElementById('saveClubBtn');
const dashboard=document.getElementById('dashboard');
const hero=document.querySelector('.hero');
const backToStart=document.getElementById('backToStart');
const squadBtn=document.getElementById('squadBtn');

const clubs=[
{name:'Anadolu Yıldızı SK',city:'Bursa',code:'AYS',style:'Balanced'},
{name:'Marmara Kartalları',city:'İstanbul',code:'MRK',style:'Attacking'},
{name:'Ege Ateşi FK',city:'İzmir',code:'EAF',style:'Technical'},
{name:'Trakya Birlik 1926',city:'Edirne',code:'TB26',style:'Defensive'}
];

const opponent={name:'Kuzey Liman FK',code:'KLF'};
let selectedClub=null;
let selectedStyle='Tactical Genius';
let career={};
let squad=[];
let formation='4-3-3';
let startingXI=[];
let matchTimer=null;

function openModal(){modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}

function renderClubs(){
 clubGrid.innerHTML=clubs.map((club,i)=>`<button class="club-choice" data-index="${i}"><b>${club.code}</b><strong>${club.name}</strong><span>${club.city} · ${club.style}</span></button>`).join('');
 document.querySelectorAll('.club-choice').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.club-choice').forEach(c=>c.classList.remove('selected'));
  btn.classList.add('selected');selectedClub=clubs[Number(btn.dataset.index)];
 }));
}

function makeSquad(club){
 const names=['Emir Kaya','Mert Arslan','Bora Yılmaz','Kerem Demir','Efe Aydın','Can Korkmaz','Arda Şen','Yiğit Koç','Deniz Aksoy','Baran Çelik','Ozan Erdem','Ali Tunç','Eren Güneş','Kaan Polat','Berk Özkan','Umut Kaplan','Doruk Keskin','Metehan Kurt','Selim Çetin','Furkan Işık','Onur Taş','Burak Vural'];
 const positions=['GK','GK','RB','CB','CB','LB','DM','CM','CM','AM','RW','LW','ST','ST','CB','RB','LB','CM','DM','RW','LW','ST'];
 const base=club.style==='Attacking'?71:club.style==='Defensive'?68:69;
 return names.map((name,i)=>({id:i+1,name,pos:positions[i],age:18+(i*3)%15,rating:Math.max(60,Math.min(79,base+((i*7)%9)-4)),fitness:86+((i*5)%14),morale:72+((i*9)%24),wage:4500+(i*650)}));
}

function beginCareer(club){
 career={club,style:selectedStyle,season:'2026/27',reputation:100,board:60};
 document.getElementById('dashClub').textContent=club.name;
 document.getElementById('dashCity').textContent=club.city;
 document.getElementById('dashStyle').textContent=selectedStyle;
 document.getElementById('welcomeTitle').textContent=`Congratulations, ${club.name} Manager!`;
 document.getElementById('welcomeSub').textContent=`${club.city} · Your 2026/27 journey starts now.`;
 squad=makeSquad(club);startingXI=squad.slice(0,11).map(p=>p.id);
 modal.classList.remove('open');hero.hidden=true;dashboard.hidden=false;document.body.style.overflow='auto';
 localStorage.setItem('nexoraCareer',JSON.stringify({career,squad,startingXI,formation}));
 window.scrollTo({top:0,behavior:'smooth'});
}

function persist(){localStorage.setItem('nexoraCareer',JSON.stringify({career,squad,startingXI,formation}))}
function posLabel(pos){return {GK:'Goalkeeper',CB:'Centre Back',RB:'Right Back',LB:'Left Back',DM:'Defensive Midfielder',CM:'Central Midfielder',AM:'Attacking Midfielder',RW:'Right Wing',LW:'Left Wing',ST:'Striker'}[pos]||pos}

function openSquad(){
 const area=document.getElementById('gameArea')||document.createElement('section');
 area.id='gameArea';area.className='game-area';dashboard.appendChild(area);
 renderSquad();area.scrollIntoView({behavior:'smooth'});
}

function renderSquad(){
 const area=document.getElementById('gameArea');
 area.innerHTML=`<div class="game-head"><div><span class="eyebrow">SQUAD / ${career.club.code}</span><h2>FIRST TEAM</h2><p>Select your starting eleven. Your tactical choices will affect the match simulation.</p></div><div class="game-actions"><button class="secondary" id="backDash">DASHBOARD</button><button class="primary" id="tacticsBtn">TACTICS →</button></div></div><div class="squad-layout"><div class="player-list"><div class="list-head"><span>PLAYER</span><span>POS</span><span>OVR</span><span>FIT</span></div>${squad.map(p=>`<button class="player-row ${startingXI.includes(p.id)?'starter':''}" data-player="${p.id}"><strong>${p.name}</strong><span>${p.pos}</span><b>${p.rating}</b><span>${p.fitness}%</span></button>`).join('')}</div><div class="squad-summary"><span class="eyebrow">SQUAD STATUS</span><h3>${startingXI.length}/11 STARTERS</h3><p>Click a player to toggle the starting XI.</p><div class="mini-stat"><span>AVERAGE RATING</span><b>${Math.round(startingXI.reduce((a,id)=>a+squad.find(p=>p.id===id).rating,0)/Math.max(1,startingXI.length))}</b></div><div class="mini-stat"><span>AVERAGE FITNESS</span><b>${Math.round(startingXI.reduce((a,id)=>a+squad.find(p=>p.id===id).fitness,0)/Math.max(1,startingXI.length))}%</b></div><button class="primary full" id="matchFromSquad" ${startingXI.length!==11?'disabled':''}>PREPARE MATCH →</button></div></div>`;
 document.querySelectorAll('.player-row').forEach(row=>row.addEventListener('click',()=>toggleStarter(Number(row.dataset.player))));
 document.getElementById('tacticsBtn').addEventListener('click',renderTactics);
 document.getElementById('matchFromSquad').addEventListener('click',startMatch);
 document.getElementById('backDash').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

function toggleStarter(id){
 if(startingXI.includes(id)){startingXI=startingXI.filter(x=>x!==id)}else if(startingXI.length<11){startingXI=[...startingXI,id]}else{return}
 persist();renderSquad();
}

function renderTactics(){
 const area=document.getElementById('gameArea');
 const forms=['4-3-3','4-2-3-1','4-4-2'];
 area.innerHTML=`<div class="game-head"><div><span class="eyebrow">TACTICAL BOARD</span><h2>YOUR GAME PLAN</h2><p>Choose a formation before your first match.</p></div><button class="secondary" id="squadBack">← SQUAD</button></div><div class="tactics-layout"><div class="pitch"><div class="pitch-line"></div><div class="pitch-box top"></div><div class="pitch-box bottom"></div><div class="center-circle"></div><div class="pitch-label">${career.club.code}</div></div><div class="tactic-panel"><span class="eyebrow">FORMATION</span><div class="formation-grid">${forms.map(f=>`<button class="formation ${formation===f?'active':''}" data-form="${f}">${f}</button>`).join('')}</div><div class="mini-stat"><span>MANAGER STYLE</span><b>${selectedStyle}</b></div><div class="mini-stat"><span>OPPONENT</span><b>${opponent.name}</b></div><button class="primary full" id="startMatchTactic" ${startingXI.length!==11?'disabled':''}>START MATCH →</button></div></div>`;
 document.querySelectorAll('.formation').forEach(b=>b.addEventListener('click',()=>{formation=b.dataset.form;persist();renderTactics()}));
 document.getElementById('squadBack').addEventListener('click',renderSquad);
 document.getElementById('startMatchTactic').addEventListener('click',startMatch);
}

function startMatch(){
 if(startingXI.length!==11)return;
 const area=document.getElementById('gameArea');
 let homeGoals=0,awayGoals=0,minute=0,events=[];
 const avg=Math.round(startingXI.reduce((a,id)=>a+squad.find(p=>p.id===id).rating,0)/11);
 const strength=Math.max(35,Math.min(85,avg+(selectedStyle==='Tactical Genius'?3:0)+(formation==='4-3-3'?2:0)));
 area.innerHTML=`<div class="game-head"><div><span class="eyebrow">MATCHDAY 01 / 2026-27</span><h2>${career.club.code} <em>VS</em> ${opponent.code}</h2><p>${formation} · Live simulation · Decisions matter.</p></div><span class="live-badge">● LIVE</span></div><div class="match-board"><div class="score-big"><b id="homeScore">0</b><span>—</span><b id="awayScore">0</b></div><div class="score-teams"><strong>${career.club.name}</strong><strong>${opponent.name}</strong></div><div class="match-minute" id="matchMinute">01'</div><div class="event-log" id="eventLog"><div class="event">Match started. The referee has blown the whistle.</div></div><div class="match-controls"><button class="primary" id="playMatch">PLAY 90 MINUTES</button><button class="secondary" id="skipMatch">SIMULATE FULL MATCH</button></div></div>`;
 const log=document.getElementById('eventLog');const addEvent=text=>{events.unshift({minute,text});log.innerHTML=events.slice(0,8).map(e=>`<div class="event"><b>${String(e.minute).padStart(2,'0')}'</b>${e.text}</div>`).join('')};
 const tick=()=>{minute+=Math.floor(Math.random()*5)+1;if(minute>90){finishMatch(homeGoals,awayGoals);return}document.getElementById('matchMinute').textContent=`${minute}'`;const chance=Math.random();if(chance<0.075){homeGoals++;const scorer=squad.find(p=>p.id===startingXI[Math.floor(Math.random()*startingXI.length)]);addEvent(`GOAL! ${scorer.name} finishes a ${formation} attack.`);document.getElementById('homeScore').textContent=homeGoals}else if(chance<0.13){awayGoals++;addEvent(`GOAL! ${opponent.name} finds space behind the defence.`);document.getElementById('awayScore').textContent=awayGoals}else if(chance<0.22){addEvent(`${career.club.name} creates a dangerous chance.`)}else if(chance<0.28){addEvent(`${opponent.name} forces a save.`)}else if(chance<0.31){addEvent(`Yellow card after a late challenge.`)} };
 const play=()=>{document.getElementById('playMatch').disabled=true;matchTimer=setInterval(tick,260);};
 document.getElementById('playMatch').addEventListener('click',play);document.getElementById('skipMatch').addEventListener('click',()=>{clearInterval(matchTimer);while(minute<90){minute+=Math.floor(Math.random()*6)+1;if(Math.random()<0.075)homeGoals++;if(Math.random()<0.06)awayGoals++}document.getElementById('homeScore').textContent=homeGoals;document.getElementById('awayScore').textContent=awayGoals;finishMatch(homeGoals,awayGoals)});
}

function finishMatch(home,away){clearInterval(matchTimer);career.board=Math.max(0,Math.min(100,career.board+(home>away?5:home===away?1:-5)));career.reputation=Math.max(0,career.reputation+(home>away?2:home===away?1:-2));persist();const log=document.getElementById('eventLog');if(log)log.insertAdjacentHTML('afterbegin',`<div class="final-event">FULL TIME · ${home} — ${away}</div><button class="primary full" id="returnSquad">RETURN TO SQUAD</button>`);const btn=document.getElementById('returnSquad');if(btn)btn.addEventListener('click',renderSquad)}

startBtn.addEventListener('click',()=>{renderClubs();openModal()});
demoBtn.addEventListener('click',()=>{renderClubs();openModal()});
closeBtn.addEventListener('click',closeModal);
choices.forEach(choice=>choice.addEventListener('click',()=>{choices.forEach(c=>c.classList.remove('selected'));choice.classList.add('selected');selectedStyle=choice.dataset.style||choice.querySelector('strong').textContent}));
continueBtn.addEventListener('click',()=>{if(!selectedClub){selectedClub=clubs[0];document.querySelector('.club-choice').classList.add('selected')}beginCareer(selectedClub)});
createClubBtn.addEventListener('click',()=>{careerStep.hidden=true;createStep.hidden=false});
saveClubBtn.addEventListener('click',()=>{const name=document.getElementById('clubName').value.trim();const city=document.getElementById('clubCity').value.trim();if(!name||!city){alert('Kulüp adı ve şehir girin.');return}selectedClub={name,city,code:name.replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]/g,'').slice(0,3).toUpperCase(),style:'Custom'};createStep.hidden=true;careerStep.hidden=false;beginCareer(selectedClub)});
squadBtn.addEventListener('click',openSquad);
backToStart.addEventListener('click',()=>{clearInterval(matchTimer);dashboard.hidden=true;hero.hidden=false;selectedClub=null;selectedStyle='Tactical Genius';const area=document.getElementById('gameArea');if(area)area.remove();window.scrollTo({top:0,behavior:'smooth'})});
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
