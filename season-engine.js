/* NEXORA FOOTBALL MANAGER — Phase 1/2 season loop */
(function(){
  'use strict';
  const DAY=86400000;
  const iso=d=>new Date(d+'T00:00:00').toISOString().slice(0,10);
  const addDays=(d,n)=>iso(new Date(new Date(d+'T00:00:00').getTime()+n*DAY));
  const event=(name,detail={})=>window.dispatchEvent(new CustomEvent(name,{detail}));
  const hash=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  function teamsFor(club){
    const base=(window.NEXORA_DATA?.clubs||[]).filter(c=>c.league===club?.league);
    const others=base.filter(c=>c.id!==club?.id);
    return [club,...others].slice(0,14).filter(Boolean);
  }
  function buildFixtures(club){
    const teams=teamsFor(club),n=teams.length,rounds=n-1,arr=[...teams],out=[];
    for(let r=0;r<rounds;r++){
      for(let i=0;i<n/2;i++){
        const a=arr[i],b=arr[n-1-i],home=r%2?a:b,away=r%2?b:a;
        out.push({id:'md-'+(r+1)+'-'+i,matchday:r+1,date:addDays('2026-07-01',(r+1)*7),homeId:home.id,awayId:away.id,home:home.name,away:away.name});
      }
      arr.splice(1,0,arr.pop());
    }
    return out;
  }
  function makeTable(fixtures,club){
    const ids=[...new Set(fixtures.flatMap(f=>[f.homeId,f.awayId]))],all=window.NEXORA_DATA?.clubs||[];
    return ids.map(id=>{const c=id===club.id?club:all.find(x=>x.id===id);return{id,name:c?.name||id,code:c?.code||id,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}}).sort(sort);
  }
  function sort(a,b){return b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name)}
  function ensure(state,force=false){
    if(!state.club)return null;
    if(force||!state.seasonLoop?.fixtures?.length){
      const fixtures=buildFixtures(state.club);
      state.seasonLoop={leagueId:'nexora-super-league',matchday:1,fixtures,results:[],table:makeTable(fixtures,state.club),currentFixtureId:null,phase:'calendar',seasonComplete:false,championId:null};
    }
    return state.seasonLoop;
  }
  function isUserFixture(f,state){return !!f&&(f.homeId===state.club?.id||f.awayId===state.club?.id)}
  function current(state){
    const s=ensure(state);if(!s)return null;
    if(s.currentFixtureId){const active=s.fixtures.find(f=>f.id===s.currentFixtureId);if(active&&!s.results.some(r=>r.fixtureId===active.id))return active}
    return s.fixtures.find(f=>isUserFixture(f,state)&&!s.results.some(r=>r.fixtureId===f.id))||null;
  }
  function fixtureForMatchday(state,matchday){return ensure(state)?.fixtures.filter(f=>f.matchday===matchday)||[]}
  function deterministicGoals(f,state,tag='cpu'){
    const key=(state.season||'2026/27')+'|'+f.id+'|'+f.homeId+'|'+f.awayId+'|'+tag;
    const seed=hash(key),r=(seed%1000)/1000;
    const homeBase=((seed>>>8)%6),awayBase=((seed>>>16)%6);
    return {homeGoals:Math.min(6,Math.floor(homeBase/2)+(r>.78?1:0)),awayGoals:Math.min(6,Math.floor(awayBase/2)+(((seed>>>24)%100)>82?1:0))};
  }
  function rebuildTable(s){
    s.table=makeTable(s.fixtures,window.gameState.club);
    for(const r of s.results){
      const h=s.table.find(t=>t.id===r.homeId),a=s.table.find(t=>t.id===r.awayId);if(!h||!a)continue;
      h.p++;a.p++;h.gf+=r.homeGoals;h.ga+=r.awayGoals;a.gf+=r.awayGoals;a.ga+=r.homeGoals;
      if(r.homeGoals>r.awayGoals){h.w++;h.pts+=3;a.l++}else if(r.homeGoals<r.awayGoals){a.w++;a.pts+=3;h.l++}else{h.d++;a.d++;h.pts++;a.pts++}
    }
    s.table.forEach(t=>t.gd=t.gf-t.ga);s.table.sort(sort);
    return s.table;
  }
  function addResult(state,f,homeGoals,awayGoals,source='user'){
    const s=ensure(state);if(!f||s.results.some(r=>r.fixtureId===f.id))return null;
    const result={fixtureId:f.id,matchday:f.matchday,date:f.date,homeId:f.homeId,awayId:f.awayId,homeGoals,awayGoals,source};
    s.results.push(result);return result;
  }
  function simulateMatchday(state,matchday,excludeFixtureId){
    const s=ensure(state),matches=fixtureForMatchday(state,matchday),simulated=[];
    for(const f of matches){
      if(f.id===excludeFixtureId||s.results.some(r=>r.fixtureId===f.id))continue;
      const g=deterministicGoals(f,state,'matchday-'+matchday);
      const r=addResult(state,f,g.homeGoals,g.awayGoals,'simulated');if(r)simulated.push(r);
    }
    return simulated;
  }
  function nextUserFixture(state){
    const s=ensure(state);return s?.fixtures.find(f=>isUserFixture(f,state)&&!s.results.some(r=>r.fixtureId===f.id))||null;
  }
  function advance(state,forceToNext=false){
    const s=ensure(state),next=nextUserFixture(state);
    if(!next){s.seasonComplete=true;s.phase='season-end';rebuildTable(s);event('nexora:season-complete',{state});window.saveState?.();event('nexora:career-saved',{state});return null}
    if(forceToNext)state.date=next.date;else state.date=addDays(state.date,1);
    s.currentFixtureId=next.id;s.matchday=next.matchday;s.phase='match';
    event('nexora:day-advance',{date:state.date,matchday:next.matchday});
    event('nexora:fixture-ready',{fixture:next});
    window.saveState?.();event('nexora:career-saved',{state});
    return next;
  }
  function start(state){
    const f=current(state);if(!f)return null;
    state.seasonLoop.phase='match';event('nexora:match-start',{fixture:f});return f;
  }
  function finish(state,homeGoals,awayGoals){
    const s=ensure(state),f=current(state);if(!f)return null;
    const userResult=addResult(state,f,homeGoals,awayGoals,'user');if(!userResult)return null;
    event('nexora:match-finished',{fixture:f,result:userResult});
    const simulated=simulateMatchday(state,f.matchday,f.id);
    rebuildTable(s);
    event('nexora:table-updated',{table:s.table,result:userResult,simulated});
    const next=nextUserFixture(state);
    s.currentFixtureId=next?.id||null;
    s.matchday=next?.matchday||s.matchday;
    s.phase=next?'calendar':'season-end';
    s.seasonComplete=!next;
    s.championId=s.seasonComplete?s.table[0]?.id||null:null;
    if(s.seasonComplete){const userRow=s.table.find(t=>t.id===state.club?.id),finalPosition=s.table.findIndex(t=>t.id===state.club?.id)+1;const reward=finalPosition===1?1000000:finalPosition<=3?500000:finalPosition<=6?250000:100000;s.awards={champion:s.table[0]?.name||'—',finalPosition,finalPoints:userRow?.pts||0,reward,title:finalPosition===1?'LEAGUE CHAMPION':finalPosition<=3?'PODIUM FINISH':'SEASON COMPLETE'};state.money=(state.money||0)+reward;state.reputation=Math.min(100,(state.reputation||0)+(finalPosition===1?10:finalPosition<=3?5:2));}
    window.saveState?.();event('nexora:career-saved',{state});
    if(s.seasonComplete)event('nexora:season-complete',{state});
    else {state.date=next.date;event('nexora:fixture-ready',{fixture:next});}
    return {userResult,simulated,next};
  }
  function getUserStanding(state){const s=ensure(state);return s?.table.findIndex(t=>t.id===state.club?.id)+1||0}
  function renderNext(state,host){
    if(!host)return;const s=ensure(state),f=current(state),position=getUserStanding(state),top=s?.table?.slice(0,5)||[];
    const en=window.NEXORA_I18N?.language==='en';
    const labels=en?{next:'NEXT MATCH',play:'PLAY NEXT MATCH →',advance:'ADVANCE DAY',table:'TABLE',season:'SEASON',complete:'SEASON COMPLETE',champ:'CHAMPION',you:'YOUR POSITION'}:{next:'SONRAKİ MAÇ',play:'SONRAKİ MAÇI OYNA →',advance:'GÜNÜ İLERLET',table:'PUAN DURUMU',season:'SEZON',complete:'SEZON TAMAMLANDI',champ:'ŞAMPİYON',you:'SIRANIZ'};
    if(!f){const a=s?.awards;host.innerHTML='<span class="eyebrow">'+labels.season+'</span><strong>'+labels.complete+'</strong><p>'+labels.champ+': '+(a?.champion||s?.table?.[0]?.name||'—')+' · '+labels.you+': '+(a?.finalPosition||position)+'</p><div class="season-reward"><b>'+(en?'SEASON REWARD':'SEZON ÖDÜLÜ')+'</b><span>'+(a?.title||'SEASON COMPLETE')+' · €'+((a?.reward||0)/1000).toLocaleString('en-US')+'K</span></div>';return}
    host.innerHTML='<span class="eyebrow">'+labels.next+'</span><strong>'+f.home+' <em>vs</em> '+f.away+'</strong><small>'+f.date+' · MATCHDAY '+f.matchday+' · '+labels.you+': '+position+'</small><div class="season-mini-table"><b>TOP 5</b>'+top.map((r,i)=>'<span>'+(i+1)+'. '+r.name+' <b>'+r.pts+'</b></span>').join('')+'</div><div class="season-actions"><button class="primary" id="playNextMatchBtn">'+labels.play+'</button><button class="secondary" id="advanceDayBtn">'+labels.advance+'</button><button class="secondary" id="tableBtn">'+labels.table+'</button></div>';
  }
  window.NEXORA_SEASON={ensure,current,advance,start,finish,opponent:function(state){const f=current(state);if(!f)return null;const id=f.homeId===state.club.id?f.awayId:f.homeId;return(window.NEXORA_DATA?.clubs||[]).find(c=>c.id===id)||{id,name:'Opponent',code:'OPP',style:'Balanced'}},renderNext,getUserStanding,rebuildTable};
})();