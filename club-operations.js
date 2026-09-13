(()=>{
const KEY='nexoraCareer';
const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
const put=s=>{localStorage.setItem(KEY,JSON.stringify(s));localStorage.setItem('nexoraGameState',JSON.stringify(s.gameState))};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const money=n=>`€${Math.round(n||0).toLocaleString('tr-TR')}`;
function ensure(s){
 const g=s.gameState;
 g.finance ||= {};
 Object.assign(g.finance,{dailyOperatingCost:0,weeklyPayroll:0,utilities:0,staffPayroll:0,maintenance:0,stadiumMaintenance:0,lastOpsDate:g.date},g.finance);
 g.staff ||= {headCoach:1,assistant:1,scout:1,physio:1,groundskeepers:2,security:2,operations:2};
 g.clubOps ||= {lastDate:g.date,alerts:[],facilities:{led:55,pitch:72,lines:88,lights:64},referee:{errorRate:.07,integrity:100},discipline:100,fanMood:62,meetings:[],dialogueHistory:[]};
 const o=g.clubOps;
 o.facilities ||= {led:55,pitch:72,lines:88,lights:64};
 o.referee ||= {errorRate:.07,integrity:100};
 o.alerts ||= [];o.meetings ||= [];o.dialogueHistory ||= [];
 return s;
}
function calcCosts(s){const g=s.gameState,o=g.clubOps,st=g.staff;
 const staffBase=st.headCoach*24000+st.assistant*13000+st.scout*12000+st.physio*11000+st.groundskeepers*7500+st.security*6500+st.operations*6000;
 const utilities=1800+(o.facilities.lights>70?900:400)+(o.facilities.led>70?700:250);
 const maintenance=700+Math.max(0,70-o.facilities.pitch)*35+Math.max(0,70-o.facilities.lines)*22;
 const stadium=500+Math.max(0,(s.gameState.stadium?.capacity||5000)-5000)*.045;
 g.finance.staffPayroll=staffBase;g.finance.utilities=utilities;g.finance.maintenance=maintenance;g.finance.stadiumMaintenance=Math.round(stadium);g.finance.dailyOperatingCost=Math.round(staffBase/7+utilities+maintenance+stadium);return g.finance;
}
function alertOp(s,text,level='warning'){const o=s.gameState.clubOps;o.alerts.unshift({id:Date.now()+Math.random(),date:s.gameState.date,text,level});o.alerts=o.alerts.slice(0,8)}
function degrade(s,days){const o=s.gameState.clubOps,f=o.facilities;f.led=clamp(f.led-days*.11,0,100);f.pitch=clamp(f.pitch-days*.16,0,100);f.lines=clamp(f.lines-days*.13,0,100);f.lights=clamp(f.lights-days*.09,0,100);
 if(f.led<35)alertOp(s,'LED sistemleri kritik seviyede. Maç atmosferi ve yayın kalitesi düşebilir.');
 if(f.pitch<40)alertOp(s,'Çim kalitesi kritik. Saha oyuncu sakatlık riskini artırıyor.','critical');
 if(f.lines<45)alertOp(s,'Saha çizgileri silik. Hakem raporunda uyarı ve disiplin cezası riski var.');
 if(f.lights<40)alertOp(s,'Stadyum aydınlatması yetersiz. Maç organizasyonu ceza riski taşıyor.','critical');
 if(f.pitch<25||f.lights<25){const fine=25000;s.gameState.money-=fine;alertOp(s,`Federasyon organizasyon cezası: ${money(fine)}. Tesis seviyesi çok düştü.`,'critical');}
}
function payDaily(s,days){const g=s.gameState,f=calcCosts(s),cost=Math.round(f.dailyOperatingCost*days);g.money-=cost;g.finance.totalOperatingPaid=(g.finance.totalOperatingPaid||0)+cost;}
function upgrade(key,cost,amount){const s=get();if(!s?.gameState?.club)return;ensure(s);if(s.gameState.money<cost){alert(`Yetersiz bütçe: ${money(cost)}`);return}s.gameState.money-=cost;s.gameState.clubOps.facilities[key]=clamp(s.gameState.clubOps.facilities[key]+amount,0,100);put(s);render(s)}
function processDays(s,days){ensure(s);degrade(s,days);payDaily(s,days);s.gameState.clubOps.lastDate=s.gameState.date;calcCosts(s);if(s.gameState.money<0){alertOp(s,'Kulüp hesabı eksi bakiyede. Yönetim baskısı artıyor.','critical');s.gameState.boardConfidence=clamp((s.gameState.boardConfidence||60)-2,0,100)}
 const o=s.gameState.clubOps;if(o.facilities.pitch<50||o.facilities.led<50||o.facilities.lines<50||o.facilities.lights<50) s.gameState.boardConfidence=clamp((s.gameState.boardConfidence||60)-1,0,100);
 put(s);
}
function staffHTML(s){const st=s.gameState.staff;return `<div class="ops-staff"><span class="eyebrow">CLUB STAFF</span><div class="staff-grid">${[['headCoach','TEKNİK EKİP',24000],['assistant','YARDIMCI',13000],['scout','SCOUT',12000],['physio','FİZYOTERAPİ',11000],['groundskeepers','ÇİM BAKIM',7500],['security','GÜVENLİK',6500],['operations','OPERASYON',6000]].map(x=>`<div class="staff-card"><b>${x[1]}</b><span>${st[x[0]]} kişi · ${money(st[x[0]]*x[2])}/hf</span></div>`).join('')}</div></div>`}
function render(s=get()){if(!s?.gameState?.club)return;ensure(s);calcCosts(s);const host=document.getElementById('clubOperations')||(()=>{const e=document.createElement('section');e.id='clubOperations';e.className='club-operations';(document.getElementById('clubFacilities')||document.querySelector('.dashboard-panels'))?.insertAdjacentElement('afterend',e);return e})();const g=s.gameState,o=g.clubOps,f=o.facilities;host.innerHTML=`<div class="ops-head"><div><span class="eyebrow">CLUB OPERATIONS / DAILY ECONOMY</span><h3>THE CLUB NEVER STOPS.</h3><p>Personel, elektrik, su, saha ve stadyum bakımının tamamı zaman ilerledikçe bütçeyi etkiler.</p></div><div class="ops-cash">${money(g.money)}<small>AVAILABLE</small></div></div><div class="ops-cost-grid"><div><span>GÜNLÜK OPERASYON</span><b>${money(g.finance.dailyOperatingCost)}</b></div><div><span>PERSONEL / HAFTA</span><b>${money(g.finance.staffPayroll)}</b></div><div><span>ELEKTRİK + SU / GÜN</span><b>${money(g.finance.utilities)}</b></div><div><span>BAKIM / GÜN</span><b>${money(g.finance.maintenance+g.finance.stadiumMaintenance)}</b></div></div>${staffHTML(s)}<div class="ops-facility"><div><span class="eyebrow">MATCHDAY SYSTEMS</span><h4>Stadyum Kalitesi</h4>${[['led','LED IŞIK SİSTEMİ','LED SATIN AL · €120K',120000,18],['lights','PROJEKTÖRLER','AYDINLATMA YENİLE · €90K',90000,16],['pitch','ÇİM BAKIMI','ÇİM BAKIM PAKETİ · €65K',65000,20],['lines','SAHA ÇİZGİLERİ','ÇİZGİ YENİLE · €18K',18000,24]].map(x=>`<div class="ops-meter"><div><span>${x[1]}</span><b>${Math.round(f[x[0]])}%</b></div><i><em style="width:${f[x[0]]}%"></em></i><button data-upgrade="${x[0]}" data-cost="${x[3]}" data-amount="${x[4]}">${x[2]}</button></div>`).join('')}</div><div class="ops-alerts"><span class="eyebrow">FACILITY WATCH</span>${o.alerts.length?o.alerts.slice(0,5).map(a=>`<div class="ops-alert ${a.level}"><b>${a.level==='critical'?'KRİTİK':'UYARI'}</b><span>${a.text}</span><small>${a.date}</small></div>`).join(''):'<div class="ops-ok">Tüm kritik sistemler güvenli seviyede.</div>'}</div></div>`;host.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>upgrade(b.dataset.upgrade,Number(b.dataset.cost),Number(b.dataset.amount)))}
window.NEXORA_CLUB_OPS={ensure,processDays,render,calcCosts,upgrade};
window.addEventListener('load',()=>{const s=get();if(s){ensure(s);render(s)}});window.addEventListener('nexora:career-ready',()=>{const s=get();if(s){ensure(s);render(s)}});window.addEventListener('nexora:day-advanced',e=>{const s=get();if(s){ensure(s);render(s)}});
})();