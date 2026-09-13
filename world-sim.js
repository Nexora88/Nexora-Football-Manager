(()=>{
const K='nexoraCareer';
const get=()=>{try{return JSON.parse(localStorage.getItem(K)||'null')}catch{return null}};
const save=s=>localStorage.setItem(K,JSON.stringify(s));
const CLUBS=[
 ['Bosphorus United','Istanbul'],['Capital 1907','Ankara'],['Aegean Stars','Izmir'],['Black Sea Athletic','Trabzon'],
 ['Central Anatolia FC','Konya'],['Mediterranean 1899','Antalya'],['Northgate SK','Samsun'],['Golden Horn City','Istanbul']
];
const MANAGERS=['Marco Bellini','Daniel Hartmann','Carlos Mendez','Emre Kaya','Lucas Ferreira','Jonas Weber','Mateo Silva','Andreas Keller','David Laurent','Milan Kovac'];
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const money=n=>`€${(Math.max(0,n)/1000000).toFixed(1)}M`;
function ensure(s){
 if(!s.gameState.worldSim)s.gameState.worldSim={
  clubs:CLUBS.map((x,i)=>({id:i,name:x[0],city:x[1],manager:MANAGERS[i],rating:62+i*2,budget:2000000+i*350000,morale:60+(i%4)*7,form:50+(i%5)*8,pressure:25,lastAction:'Season preparation'})),
  history:[],seed:0,lastDate:null
 };
}
function addNews(s,title,tag,detail){
 s.gameState.media||={news:[],events:[],press:[]};
 s.gameState.media.news.unshift({id:Date.now()+Math.random(),title,tag,detail,date:s.gameState.date,market:'GLOBAL'});
 s.gameState.media.news=s.gameState.media.news.slice(0,24);
}
function chooseManager(w,c){let idx=(w.seed+c.id*3)%MANAGERS.length;return MANAGERS[idx]}
function simulateClub(s,c,w){
 const roll=(w.seed*13+c.id*7)%100;
 c.form=clamp(c.form+(roll>72?5:roll<22?-6:1),15,95);
 c.morale=clamp(c.morale+(c.form>70?3:c.form<35?-4:0));
 c.pressure=clamp(c.pressure+(c.morale<40?4:-1));
 if(roll<14){
  const old=c.manager;c.manager=chooseManager(w,c);c.morale=clamp(c.morale-5);c.pressure=clamp(c.pressure+12);
  addNews(s,`${c.name} teknik direktör değişikliğine gitti`,'WORLD',`${old} dönemi sona erdi. ${c.manager} göreve başladı.`);return 'MANAGER CHANGE';
 }
 if(roll<31){
  const fee=Math.round((c.budget*(0.06+(roll%4)*0.015)+c.rating*18000)/50000)*50000;
  c.budget=Math.max(0,c.budget-fee);c.rating=clamp(c.rating+1,45,90);
  addNews(s,`${c.name} transfer piyasasında aktif`,'GLOBAL',`${c.name}, kadrosunu güçlendirmek için yaklaşık ${money(fee)} yatırım yaptı.`);return 'TRANSFER';
 }
 if(roll<48){c.form=clamp(c.form+9);c.morale=clamp(c.morale+7);c.pressure=clamp(c.pressure-6);addNews(s,`${c.name} formunu yükseltiyor`,'LEAGUE',`${c.manager} yönetiminde üst üste iyi sonuçlar geliyor.`);return 'FORM RISE';}
 if(roll<64){c.morale=clamp(c.morale-8);c.pressure=clamp(c.pressure+7);addNews(s,`${c.name} kulübünde baskı artıyor`,'WORLD',`Sonuçlar yönetim ve teknik heyet üzerindeki baskıyı yükseltti.`);return 'PRESSURE';}
 if(roll<78){c.budget=Math.max(0,c.budget-75000);c.pressure=clamp(c.pressure+5);addNews(s,`${c.name} finansal baskı altında`,'FINANCE',`Kulüp bütçesini korumak için maaş ve operasyon giderlerini gözden geçiriyor.`);return 'FINANCE';}
 c.morale=clamp(c.morale+2);c.form=clamp(c.form+2);return 'STABLE';
}
function tick(){
 const s=get();if(!s?.gameState?.club)return;ensure(s);const w=s.gameState.worldSim;
 if(w.lastDate===s.gameState.date)return;
 w.seed++;w.lastDate=s.gameState.date;
 const actions=[];
 w.clubs.forEach(c=>{if(c.id%2===w.seed%2||w.seed%3===0)actions.push({club:c.name,action:simulateClub(s,c,w)});});
 w.history.unshift({date:s.gameState.date,actions});w.history=w.history.slice(0,30);save(s);render(s);
}
function render(s=get()){
 if(!s?.gameState?.club)return;ensure(s);
 let host=document.getElementById('worldSimulation');if(!host){host=document.createElement('section');host.id='worldSimulation';host.className='world-sim';document.getElementById('dashboard')?.appendChild(host)}
 const w=s.gameState.worldSim;
 const rows=w.clubs.map(c=>`<div class="world-club"><div><b>${c.name}</b><small>${c.city} · ${c.manager}</small></div><div class="world-bars"><span>OVR ${c.rating}</span><span>FORM ${Math.round(c.form)}</span><span>MOOD ${Math.round(c.morale)}</span></div></div>`).join('');
 const recent=w.history.slice(0,5).map(h=>`<div class="world-event"><b>${h.date}</b><span>${h.actions.map(a=>`${a.club} · ${a.action}`).join(' | ')||'World remains stable'}</span></div>`).join('');
 host.innerHTML=`<div class="media-card"><div class="media-head"><div><span class="eyebrow">GLOBAL FOOTBALL WORLD</span><h3>Living Football World</h3><p>Sen oynarken diğer kulüpler kendi hikâyelerini yazıyor.</p></div><span class="news-badge">${w.clubs.length} CLUBS</span></div><div class="world-clubs">${rows}</div><div class="world-history"><strong>WORLD TIMELINE</strong>${recent||'<small>Henüz dünya olayı oluşmadı.</small>'}</div></div>`;
}
window.NEXORA_WORLD={tick,render};
let last='';setInterval(()=>{const s=get();if(s?.gameState?.date&&s.gameState.date!==last){last=s.gameState.date;setTimeout(tick,30)}},500);
window.addEventListener('load',()=>setTimeout(render,200));
window.addEventListener('nexora:career-ready',()=>setTimeout(()=>{const s=get();if(s){ensure(s);save(s);render(s)}},100));
window.addEventListener('nexora:day-advanced',()=>setTimeout(tick,60));
})();