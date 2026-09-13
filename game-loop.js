(()=>{
  const KEY='nexoraCareer';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const save=s=>{if(!s)return;localStorage.setItem(KEY,JSON.stringify(s));localStorage.setItem('nexoraGameState',JSON.stringify(s.gameState));};
  const dateAdd=(date,n)=>{const d=new Date(`${date}T00:00:00`);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
  const dateObj=d=>new Date(`${d}T00:00:00`);
  const money=v=>`€${(v/1000).toFixed(0)}K`;
  const calcWages=s=>(s?.squad||[]).reduce((sum,p)=>sum+(Number(p.wage)||0),0);
  const ensure=s=>{
    s.gameState.finance ||= {wageBill:0,wageBudget:Math.max(50000,Math.round((s.gameState.money||0)*.025)),seasonWagePaid:0};
    s.gameState.media ||= {news:[],events:[]};
    s.gameState.finance.wageBill=calcWages(s);
    if(!s.gameState.finance.wageBudget)s.gameState.finance.wageBudget=Math.max(50000,Math.round((s.gameState.money||0)*.025));
    return s;
  };
  function dailyNews(s){
    const m=s.gameState.media,d=dateObj(s.gameState.date),day=d.getDay(),stamp=s.gameState.date;
    if(m.lastDailyNews===stamp)return;
    const club=s.gameState.club?.name||'Kulübün',pool=[
      ['LEAGUE','Lig gündemi hareketli',`${club} antrenman temposunu artırdı. Teknik ekip sezon planını sürdürüyor.`],
      ['WORLD','Transfer masası ısınıyor','Kulüpler sezon öncesi kadrolarını şekillendirirken scout ekipleri yeni isimleri izliyor.`],
      ['MEDIA','Basın toplantısı','Yerel spor basını, kulüplerin hazırlık dönemindeki performansını yakından takip ediyor.`],
      ['SUPPORTERS','Tribünlerde beklenti','Taraftarlar yeni sezon öncesi kadronun gelişimini ve yönetimin hamlelerini konuşuyor.']
    ];
    const item=pool[(day+Number(stamp.replaceAll('-','')))%pool.length];
    m.news.unshift({id:Date.now(),title:item[1],tag:item[0],detail:item[2],date:stamp});m.news=m.news.slice(0,12);m.lastDailyNews=stamp;
  }
  function developYouth(s){
    const a=s.gameState.facilities?.academy;if(!a?.owned||!a.signed?.length)return;
    const training=s.gameState.facilities?.training?.level||0,academy=a.level||0,today=dateObj(s.gameState.date);
    a.signed.forEach(p=>{
      const last=dateObj(p.lastDevelopment||s.gameState.date),weeks=Math.floor((today-last)/604800000);if(weeks<=0)return;
      for(let i=0;i<weeks;i++){
        const ceiling=Number(p.potential)||70,gain=(0.15+academy*.10+training*.08)*(Math.random()>.18?1:0);
        p.rating=Math.min(ceiling,Math.round((Number(p.rating)||50)+gain));p.value=Math.max(Number(p.value)||50000,Math.round((p.rating||50)*(p.rating||50)*900));p.morale=Math.max(45,Math.min(100,(p.morale||75)+(Math.random()*6-2)));
      }p.lastDevelopment=s.gameState.date;
    });
  }
  function processDay(s){ensure(s);window.NEXORA_FACILITIES?.complete?.();developYouth(s);dailyNews(s);s.gameState.finance.wageBill=calcWages(s);s.gameState.finance.lastProcessed=s.gameState.date;save(s)}
  function syncUI(s){
    if(window.NEXORA_GAME_STATE)Object.assign(window.NEXORA_GAME_STATE,s.gameState);
    window.syncDashboard?.();window.NEXORA_FACILITIES?.render?.();window.NEXORA_MEDIA?.render?.();window.NEXORA_TRANSFER?.render?.();window.dispatchEvent(new CustomEvent('nexora:day-advanced',{detail:{date:s.gameState.date}}));
  }
  function advance(days=1){const s=read();if(!s?.gameState?.club)return;for(let i=0;i<days;i++){s.gameState.date=dateAdd(s.gameState.date,1);processDay(s)}save(s);syncUI(s);return s.gameState.date}
  function renderFinance(s){
    const dash=document.getElementById('dashboard');if(!dash||!s?.gameState?.club)return;let host=document.getElementById('gameFinance');
    if(!host){host=document.createElement('section');host.id='gameFinance';host.className='game-finance';const panels=document.querySelector('.dashboard-panels');(panels||dash).appendChild(host)}
    ensure(s);const f=s.gameState.finance;
    host.innerHTML=`<div><span class="eyebrow">CLUB FINANCE / LIVE</span><h3>FINANCIAL PULSE</h3></div><div class="finance-grid"><div><span>TRANSFER BUDGET</span><b>${money(s.gameState.money)}</b></div><div><span>WAGE BILL / WEEK</span><b>${money(f.wageBill)}</b></div><div><span>WAGE BUDGET</span><b>${money(f.wageBudget)}</b></div><div><span>WAGE HEADROOM</span><b>${money(Math.max(0,f.wageBudget-f.wageBill))}</b></div></div><div class="time-controls"><span><b>${s.gameState.date}</b> · ${s.gameState.season||'2026/27'}</span><button class="primary" id="nextDay">NEXT DAY →</button><button class="secondary" id="nextWeek">+7 DAYS</button></div>`;
    host.querySelector('#nextDay').onclick=()=>advance(1);host.querySelector('#nextWeek').onclick=()=>advance(7);
  }
  function refresh(){const s=read();if(!s?.gameState?.club)return;ensure(s);save(s);renderFinance(s)}
  window.NEXORA_GAME_LOOP={advanceDay:()=>advance(1),advanceWeek:()=>advance(7),advance,refresh,calcWages};
  window.addEventListener('load',refresh);
  window.addEventListener('nexora:career-ready',()=>{const s=read();if(s){processDay(s);syncUI(s)}});
  window.addEventListener('nexora:transfer-updated',()=>{const s=read();if(s){ensure(s);save(s);if(window.NEXORA_GAME_STATE)Object.assign(window.NEXORA_GAME_STATE,s.gameState);renderFinance(s)}});
})();