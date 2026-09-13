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

/* CORE GAME STATE — the single source of truth for the career. */
const GRID_WIDTH=100,GRID_HEIGHT=60;
const pitchGrid={width:GRID_WIDTH,height:GRID_HEIGHT};
const gameState={date:'2026-07-01',money:5000000,managerName:'',club:null,managerStyle:'Tactical Genius',season:'2026/27',reputation:100,boardConfidence:60,formation:'4-3-3',grid:pitchGrid};
window.NEXORA_GAME_STATE=gameState;

const clubs=NEXORA_DATA.clubs;
const opponent={name:'Kuzey Liman FK',code:'KLF',style:'Balanced'};
let selectedClub=null,selectedStyle='Tactical Genius',career={},squad=[],formation='4-3-3',startingXI=[],matchTimer=null;

function getClubData(club){
 if(!club)return null;
 return clubs.find(c=>c.id===club.id||c.code===club.code||c.name===club.name)||club;
}
function gridToIso(x,y){const tileW=16,tileH=8;return{x:(x-y)*tileW/2,y:(x+y)*tileH/2}}
function clampGrid(x,y){return{x:Math.max(0,Math.min(GRID_WIDTH,x)),y:Math.max(0,Math.min(GRID_HEIGHT,y))}}
function formatMoney(value){return `€${(value/1000000).toFixed(1)}M`}
function formatDate(value){return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${value}T00:00:00`)).toUpperCase()}
function openModal(){modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}

function renderClubs(){
 clubGrid.innerHTML=clubs.map((club,i)=>`<button class="club-choice" data-index="${i}"><b>${club.code}</b><strong>${club.name}</strong><span>${club.city} · ${club.style} · ${club.difficulty}</span><small>€${(club.budget/1000000).toFixed(1)}M BUDGET · ${club.stadiumCapacity.toLocaleString('en-US')} CAP.</small></button>`).join('');
 document.querySelectorAll('.club-choice').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.club-choice').forEach(c=>c.classList.remove('selected'));btn.classList.add('selected');selectedClub=clubs[Number(btn.dataset.index)]}));
}

function makeSquad(club){return NEXORA_DATA.createSquad(club)}
function averageStat(ids,key){return Math.round(ids.reduce((sum,id)=>sum+(squad.find(p=>p.id===id)?.[key]||0),0)/Math.max(1,ids.length))}
function teamMetrics(ids=startingXI){return{rating:averageStat(ids,'rating'),pace:averageStat(ids,'pace'),passing:averageStat(ids,'passing'),shooting:averageStat(ids,'shooting'),defending:averageStat(ids,'defending'),dribbling:averageStat(ids,'dribbling'),physical:averageStat(ids,'physical'),vision:averageStat(ids,'vision')}}
function syncDashboard(){
 document.getElementById('dashClub').textContent=gameState.club?.name||'—';
 document.getElementById('dashCity').textContent=gameState.club?.city||'—';
 document.getElementById('dashManager').textContent=gameState.managerName||'—';
 document.getElementById('dashStyle').textContent=gameState.managerStyle||'—';
 document.getElementById('dashDate').textContent=formatDate(gameState.date);
 document.getElementById('dashMoney').textContent=formatMoney(gameState.money);
}
function saveState(){localStorage.setItem('nexoraGameState',JSON.stringify(gameState));localStorage.setItem('nexoraCareer',JSON.stringify({career,squad,startingXI,formation,gameState}))}

function beginCareer(club){
 const managerName=(document.getElementById('managerName')?.value||'').trim()||'Manager';
 const canonical=getClubData(club)||club;
 gameState.managerName=managerName;gameState.club=canonical;gameState.managerStyle=selectedStyle;gameState.date='2026-07-01';gameState.money=canonical.budget||5000000;gameState.season='2026/27';gameState.reputation=canonical.reputation||50;gameState.boardConfidence=60;gameState.formation='4-3-3';gameState.grid=pitchGrid;
 career={club:canonical,style:selectedStyle,season:gameState.season,reputation:gameState.reputation,board:60,managerName};formation='4-3-3';squad=makeSquad(canonical);startingXI=squad.slice(0,11).map(p=>p.id);
 syncDashboard();document.getElementById('welcomeTitle').textContent=`Congratulations, ${managerName}.`;document.getElementById('welcomeSub').textContent=`${canonical.city} · ${canonical.name} · Your 2026/27 journey starts now.`;
 closeModal();hero.hidden=true;dashboard.hidden=false;saveState();window.scrollTo({top:0,behavior:'smooth'});window.dispatchEvent(new CustomEvent('nexora:career-ready'));
}
function persist(){gameState.formation=formation;gameState.club=career.club||gameState.club;gameState.managerStyle=career.style||gameState.managerStyle;gameState.reputation=career.reputation??gameState.reputation;gameState.boardConfidence=career.board??gameState.boardConfidence;localStorage.setItem('nexoraGameState',JSON.stringify(gameState));localStorage.setItem('nexoraCareer',JSON.stringify({career,squad,startingXI,formation,gameState}))}
function loadState(){try{const saved=JSON.parse(localStorage.getItem('nexoraCareer')||'null');if(!saved?.gameState?.club)return;Object.assign(gameState,saved.gameState);career=saved.career||{};squad=saved.squad||[];startingXI=saved.startingXI||[];formation=saved.formation||'4-3-3';selectedClub=gameState.club;selectedStyle=gameState.managerStyle||'Tactical Genius';if(!squad.length)squad=makeSquad(gameState.club);syncDashboard();document.getElementById('welcomeTitle').textContent=`Welcome back, ${gameState.managerName}.`;document.getElementById('welcomeSub').textContent=`${gameState.club.city} · ${gameState.club.name} · ${formatDate(gameState.date)}`;hero.hidden=true;dashboard.hidden=false;window.dispatchEvent(new CustomEvent('nexora:career-ready'))}catch(error){console.warn('Career restore failed',error)}}

function posLabel(pos){return{GK:'Goalkeeper',CB:'Centre Back',RB:'Right Back',LB:'Left Back',DM:'Defensive Midfielder',CM:'Central Midfielder',AM:'Attacking Midfielder',RW:'Right Wing',LW:'Left Wing',ST:'Striker'}[pos]||pos}
function openSquad(){const area=document.getElementById('gameArea')||document.createElement('section');area.id='gameArea';area.className='game-area';dashboard.appendChild(area);renderSquad();area.scrollIntoView({behavior:'smooth'})}
function renderSquad(){
 const area=document.getElementById('gameArea'),m=teamMetrics();
 area.innerHTML=`<div class="game-head"><div><span class="eyebrow">SQUAD / ${career.club.code}</span><h2>FIRST TEAM</h2><p>Player attributes now drive the simulation: pace, passing, shooting, defending, dribbling, physicality and vision.</p></div><div class="game-actions"><button class="secondary" id="backDash">DASHBOARD</button><button class="primary" id="tacticsBtn">TACTICS →</button></div></div><div class="squad-layout"><div class="player-list"><div class="list-head"><span>PLAYER</span><span>POS</span><span>OVR</span><span>FIT</span></div>${squad.map(p=>`<button class="player-row ${startingXI.includes(p.id)?'starter':''}" data-player="${p.id}"><strong>${p.name}</strong><span>${p.pos}</span><b>${p.rating}</b><span>${p.fitness}%</span></button>`).join('')}</div><div class="squad-summary"><span class="eyebrow">DATA PROFILE</span><h3>${startingXI.length}/11 STARTERS</h3><p>Each player has a full simulation profile. Select your XI to change team performance.</p><div class="mini-stat"><span>OVERALL</span><b>${m.rating}</b></div><div class="mini-stat"><span>PACE / PASS</span><b>${m.pace} / ${m.passing}</b></div><div class="mini-stat"><span>SHOT / DRIBBLE</span><b>${m.shooting} / ${m.dribbling}</b></div><div class="mini-stat"><span>DEF / PHYS</span><b>${m.defending} / ${m.physical}</b></div><div class="mini-stat"><span>VISION</span><b>${m.vision}</b></div><button class="primary full" id="matchFromSquad" ${startingXI.length!==11?'disabled':''}>PREPARE MATCH →</button></div></div>`;
 document.querySelectorAll('.player-row').forEach(row=>row.addEventListener('click',()=>toggleStarter(Number(row.dataset.player))));document.getElementById('tacticsBtn').addEventListener('click',renderTactics);document.getElementById('matchFromSquad').addEventListener('click',startMatch);document.getElementById('backDash').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}
function toggleStarter(id){if(startingXI.includes(id))startingXI=startingXI.filter(x=>x!==id);else if(startingXI.length<11)startingXI=[...startingXI,id];else return;persist();renderSquad()}

function renderTactics(){
 const area=document.getElementById('gameArea'),m=teamMetrics(),forms=['4-3-3','4-2-3-1','4-4-2'];
 area.innerHTML=`<div class="game-head"><div><span class="eyebrow">TACTICAL BOARD / 2.5D READY</span><h2>YOUR GAME PLAN</h2><p>The pitch uses a 100 × 60 logical grid. Player attributes will drive movement and actions.</p></div><button class="secondary" id="squadBack">← SQUAD</button></div><div class="tactics-layout"><div class="pitch pitch-25d"><div class="pitch-line"></div><div class="pitch-box top"></div><div class="pitch-box bottom"></div><div class="center-circle"></div><div class="pitch-label">${career.club.code}</div></div><div class="tactic-panel"><span class="eyebrow">FORMATION</span><div class="formation-grid">${forms.map(f=>`<button class="formation ${formation===f?'active':''}" data-form="${f}">${f}</button>`).join('')}</div><div class="mini-stat"><span>TEAM OVERALL</span><b>${m.rating}</b></div><div class="mini-stat"><span>PASSING / VISION</span><b>${m.passing} / ${m.vision}</b></div><div class="mini-stat"><span>ATTACK / DEFENCE</span><b>${Math.round((m.shooting+m.dribbling+m.pace)/3)} / ${m.defending}</b></div><div class="mini-stat"><span>MANAGER</span><b>${gameState.managerName}</b></div><div class="mini-stat"><span>OPPONENT</span><b>${opponent.name}</b></div><button class="primary full" id="startMatchTactic" ${startingXI.length!==11?'disabled':''}>START MATCH →</button></div></div>`;
 document.querySelectorAll('.formation').forEach(b=>b.addEventListener('click',()=>{formation=b.dataset.form;gameState.formation=formation;persist();renderTactics()}));document.getElementById('squadBack').addEventListener('click',renderSquad);document.getElementById('startMatchTactic').addEventListener('click',startMatch)
}

function startMatch(){
 if(startingXI.length!==11)return;
 const area=document.getElementById('gameArea');let homeGoals=0,awayGoals=0,minute=0,events=[];const m=teamMetrics();
 const attack=Math.round((m.pace+m.passing+m.shooting+m.dribbling+m.vision)/5),defence=Math.round((m.defending+m.physical+m.pace)/3);const tactical=selectedStyle==='Tactical Genius'?4:selectedStyle==='Defensive Strategist'?2:0;const strength=Math.max(35,Math.min(90,Math.round((attack+defence)/2)+tactical+(formation==='4-3-3'?2:0)));
 if(window.generateAttendance)window.generateAttendance({reputation:gameState.reputation,ticketPrice:gameState.stadium?.ticketPrice||18,importance:'normal'});
 area.innerHTML=`<div class="game-head"><div><span class="eyebrow">MATCHDAY 01 / 2026-27 / 2.5D ENGINE</span><h2>${career.club.code} <em>VS</em> ${opponent.code}</h2><p>${formation} · DATA-DRIVEN SIMULATION · Strength ${strength}</p></div><span class="live-badge">● LIVE</span></div><div class="match-board"><div class="score-big"><b id="homeScore">0</b><span>—</span><b id="awayScore">0</b></div><div class="score-teams"><strong>${career.club.name}</strong><strong>${opponent.name}</strong></div><div class="match-minute" id="matchMinute">01'</div><div class="event-log" id="eventLog"><div class="event">Match started. Player data is now driving the simulation.</div></div><div class="match-controls"><button class="primary" id="playMatch">PLAY 90 MINUTES</button><button class="secondary" id="skipMatch">SIMULATE FULL MATCH</button></div></div>`;
 const log=document.getElementById('eventLog');const addEvent=text=>{events.unshift({minute,text});log.innerHTML=events.slice(0,8).map(e=>`<div class="event"><b>${String(e.minute).padStart(2,'0')}'</b>${e.text}</div>`).join('')};
 const goalHome=()=>{homeGoals++;const scorer=squad.find(p=>p.id===startingXI[Math.floor(Math.random()*startingXI.length)]);addEvent(`GOAL! ${scorer.name} scores. SHOT ${scorer.shooting} · PACE ${scorer.pace}.`);document.getElementById('homeScore').textContent=homeGoals;if(window.triggerGoalCelebration)window.triggerGoalCelebration()};
 const goalAway=()=>{awayGoals++;addEvent(`GOAL! ${opponent.name} exploits space behind the defence.`);document.getElementById('awayScore').textContent=awayGoals;if(window.triggerGoalCelebration)window.triggerGoalCelebration()};
 const tick=()=>{minute+=Math.floor(Math.random()*5)+1;if(minute>90){finishMatch(homeGoals,awayGoals);return}document.getElementById('matchMinute').textContent=`${minute}'`;const attackChance=Math.random()*(strength/70);if(attackChance<0.075)goalHome();else if(attackChance<0.13)goalAway();else if(attackChance<0.22)addEvent(`${career.club.name} builds an attack through ${m.passing} passing and ${m.vision} vision.`);else if(attackChance<0.28)addEvent(`${opponent.name} forces a save. Defensive index ${defence}.`);else if(attackChance<0.31)addEvent(`Yellow card after a late challenge.`)};
 const play=()=>{document.getElementById('playMatch').disabled=true;matchTimer=setInterval(tick,260)};document.getElementById('playMatch').addEventListener('click',play);
 document.getElementById('skipMatch').addEventListener('click',()=>{clearInterval(matchTimer);while(minute<90){minute+=Math.floor(Math.random()*6)+1;const chance=Math.random()*(strength/70);if(chance<0.075)homeGoals++;if(Math.random()*(Math.max(35,defence)/70)<0.06)awayGoals++}document.getElementById('homeScore').textContent=homeGoals;document.getElementById('awayScore').textContent=awayGoals;finishMatch(homeGoals,awayGoals)})
}
function finishMatch(home,away){clearInterval(matchTimer);career.board=Math.max(0,Math.min(100,career.board+(home>away?5:home===away?1:-5)));career.reputation=Math.max(0,career.reputation+(home>away?2:home===away?1:-2));gameState.boardConfidence=career.board;gameState.reputation=career.reputation;persist();syncDashboard();const log=document.getElementById('eventLog');if(log)log.insertAdjacentHTML('afterbegin',`<div class="final-event">FULL TIME · ${home} — ${away}</div><button class="primary full" id="returnSquad">RETURN TO SQUAD</button>`);const btn=document.getElementById('returnSquad');if(btn)btn.addEventListener('click',renderSquad)}

startBtn.addEventListener('click',()=>{renderClubs();openModal()});demoBtn.addEventListener('click',()=>{renderClubs();openModal()});closeBtn.addEventListener('click',closeModal);choices.forEach(choice=>choice.addEventListener('click',()=>{choices.forEach(c=>c.classList.remove('selected'));choice.classList.add('selected');selectedStyle=choice.dataset.style||choice.querySelector('strong').textContent}));continueBtn.addEventListener('click',()=>{if(!selectedClub){selectedClub=clubs[0];document.querySelector('.club-choice').classList.add('selected')}beginCareer(selectedClub)});createClubBtn.addEventListener('click',()=>{careerStep.hidden=true;createStep.hidden=false});saveClubBtn.addEventListener('click',()=>{const name=document.getElementById('clubName').value.trim(),city=document.getElementById('clubCity').value.trim();if(!name||!city){alert('Kulüp adı ve şehir girin.');return}selectedClub={id:`custom-${Date.now()}`,name,city,code:(name.replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ]/g,'').slice(0,3)||'NEX').toUpperCase(),style:'Balanced',league:'Nexora Super League',difficulty:'CUSTOM',budget:4000000,reputation:40,stadiumCapacity:5000,colors:['#b7ff3c','#ffffff']};createStep.hidden=true;careerStep.hidden=false;beginCareer(selectedClub)});squadBtn.addEventListener('click',openSquad);backToStart.addEventListener('click',()=>{clearInterval(matchTimer);localStorage.removeItem('nexoraCareer');localStorage.removeItem('nexoraGameState');dashboard.hidden=true;hero.hidden=false;selectedClub=null;selectedStyle='Tactical Genius';career={};squad=[];startingXI=[];const area=document.getElementById('gameArea');if(area)area.remove();window.scrollTo({top:0,behavior:'smooth'})});modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});loadState();