(()=>{
let last=0,card=0,inj=0,sub=0;
const log=t=>{const e=document.getElementById('matchLog');if(!e)return;const d=document.createElement('div');d.className='match-polish-event';d.innerHTML=`<b>${String(last).padStart(2,'0')}'</b>${t}`;e.prepend(d);};
function minute(){const e=document.getElementById('meMinute');return e?parseInt(e.textContent)||0:0}
function setPiece(m){const type=Math.random()<.55?'KORNER':'SERBEST VURUŞ';log(`DURAN TOP · ${type}`);window.dispatchEvent(new CustomEvent('nexora:match-event',{detail:{type:type==='KORNER'?'corner':'free-kick',minute:m}}));}
function keeper(m){const side=Math.random()<.5?'home':'away';log(`KALECİ KURTARDI · ${side==='home'?'Ev':'Deplasman'} kalecisi`);const pitch=document.getElementById('matchPitch');pitch?.classList.add('keeper-save');setTimeout(()=>pitch?.classList.remove('keeper-save'),500);window.dispatchEvent(new CustomEvent('nexora:match-event',{detail:{type:'save',team:side,minute:m}}));}
function cardEvent(m){card++;const side=Math.random()<.5?'home':'away';log(`🟨 SARI KART · ${side==='home'?'Ev sahibi':'Deplasman'} oyuncusu`);window.dispatchEvent(new CustomEvent('nexora:match-event',{detail:{type:'card',card:'yellow',team:side,minute:m}}));}
function injury(m){inj++;const side=Math.random()<.5?'home':'away';log(`SAKATLIK · ${side==='home'?'Ev sahibi':'Deplasman'} oyuncusu sağlık ekibi tarafından kontrol ediliyor`);window.dispatchEvent(new CustomEvent('nexora:match-event',{detail:{type:'injury',team:side,minute:m}}));}
function substitution(m){sub++;log(`OYUNCU DEĞİŞİKLİĞİ · Taze oyuncu oyuna girdi, tempo değişiyor`);window.dispatchEvent(new CustomEvent('nexora:match-event',{detail:{type:'substitution',minute:m}}));}
function tick(){const m=minute();if(m<=last||!document.getElementById('matchPitch'))return;last=m;if(m>5&&m%13===0&&Math.random()<.42)setPiece(m);if(m>10&&m%17===0&&Math.random()<.3)keeper(m);if(m>8&&m%19===0&&Math.random()<.35)cardEvent(m);if(m>20&&m%29===0&&Math.random()<.18)injury(m);if(m>30&&m%31===0&&Math.random()<.28)substitution(m);}
setInterval(tick,120);window.NEXORA_MATCH_POLISH={reset:()=>{last=0;card=0;inj=0;sub=0}};
window.addEventListener('nexora:match-start',()=>window.NEXORA_MATCH_POLISH.reset());
})();