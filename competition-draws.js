(()=>{
const KEY='nexoraCareer';
const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
const put=s=>localStorage.setItem(KEY,JSON.stringify(s));
const league=s=>window.NEXORA_LEAGUE?.get(s)||{code:'TR',country:'Türkiye'};
const euro=()=>{const s=get();return window.NEXORA_LEAGUE?.europeanSlots(s)||{cl:4,el:2,ec:1,total:7}};
const teams=s=>(s?.gameState?.standings||[]).slice(0,18);
const pick=(arr,n)=>{const a=[...arr].sort(()=>Math.random()-.5);return a.slice(0,n)};
function drawName(type){return type==='CL'?'UEFA CHAMPIONS LEAGUE DRAW':type==='EL'?'EUROPA LEAGUE DRAW':'CONFERENCE LEAGUE DRAW'}
function run(type='CL'){
 const s=get();if(!s?.gameState?.club)return;
 const slots=euro(),count=type==='CL'?slots.cl:type==='EL'?slots.el:slots.ec;
 const pool=teams(s);if(!pool.length)return;
 const selected=pick(pool,Math.min(count,pool.length));
 const opponents=pick(pool.filter(x=>!selected.some(y=>y.clubId===x.clubId)),Math.min(count*4,pool.length-count));
 const pairs=selected.map((t,i)=>({club:t.name,opponents:[...opponents].sort(()=>Math.random()-.5).slice(0,Math.min(4,opponents.length)).map(x=>x.name)}));
 s.gameState.europeDraws=s.gameState.europeDraws||{};s.gameState.europeDraws[type]={date:s.gameState.date,season:s.gameState.season,pairs};
 s.gameState.media=s.gameState.media||{news:[]};s.gameState.media.news=s.gameState.media.news||[];
 s.gameState.media.news.unshift({tag:'EUROPE',market:'GLOBAL',title:drawName(type),detail:`${league(s).country} representatives enter the European draw. The next continental journey is now confirmed.`,date:s.gameState.date});
 s.gameState.media.news=s.gameState.media.news.slice(0,20);
 put(s);render();window.dispatchEvent(new CustomEvent('nexora:europe-draw',{detail:{type,pairs}}));
}
function render(){const s=get(),dash=document.getElementById('dashboard');if(!s?.gameState?.club||!dash)return;let box=document.getElementById('europeDrawDesk');if(!box){box=document.createElement('section');box.id='europeDrawDesk';dash.appendChild(box)}const draws=s.gameState.europeDraws||{};const slots=euro();box.innerHTML=`<div class="euro-draw"><div class="euro-top"><div><span>CONTINENTAL FOOTBALL · LIVE</span><h2>EUROPEAN DRAW CENTRE</h2><p>${league(s).country} · CL ${slots.cl} · EL ${slots.el} · ECL ${slots.ec}</p></div><b>TV LIVE</b></div><div class="draw-tabs"><button data-d="CL">CHAMPIONS LEAGUE</button><button data-d="EL">EUROPA LEAGUE</button><button data-d="EC">CONFERENCE LEAGUE</button></div><div class="draw-stage"><div class="draw-globe">NEXORA<br>FOOTBALL</div><div class="draw-title">${draws.CL?drawName('CL'):'DRAW AWAITING'}</div><div class="draw-ball">●</div><button id="runEuropeanDraw">${draws.CL?'RE-DRAW SIMULATION':'START LIVE DRAW'}</button></div><div class="draw-results">${draws.CL?.pairs?.map((p,i)=>`<article><small>SEED ${i+1}</small><strong>${p.club}</strong><div>${p.opponents.map(o=>`<span>vs ${o}</span>`).join('')}</div></article>`).join('')||'<p>European qualification will trigger the draw centre at season end.</p>'}</div></div>`;box.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>run(b.dataset.d));box.querySelector('#runEuropeanDraw').onclick=()=>run('CL')}
window.NEXORA_DRAWS={run,render};window.addEventListener('load',()=>setTimeout(render,180));['nexora:career-ready','nexora:day-advanced','nexora:match-event','nexora:press-completed'].forEach(e=>window.addEventListener(e,()=>setTimeout(render,100)));
})();