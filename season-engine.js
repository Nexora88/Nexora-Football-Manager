/* NEXORA FOOTBALL MANAGER — minimal season loop (Phase 1) */
(function(){
  'use strict';
  const DAY=86400000;
  const iso=d=>new Date(d+'T00:00:00').toISOString().slice(0,10);
  const addDays=(d,n)=>iso(new Date(new Date(d+'T00:00:00').getTime()+n*DAY));
  const event=(name,detail={})=>window.dispatchEvent(new CustomEvent(name,{detail}));
  function teamsFor(club){
    const base=(window.NEXORA_DATA?.clubs||[]).filter(c=>c.league===club?.league);
    const others=base.filter(c=>c.id!==club?.id);
    return [club,...others].slice(0,14).filter(Boolean);
  }
  function buildFixtures(club){
    const teams=teamsFor(club), n=teams.length, rounds=n-1, arr=[...teams], out=[];
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
    const ids=[...new Set(fixtures.flatMap(f=>[f.homeId,f.awayId]))];
    const all=window.NEXORA_DATA?.clubs||[];
    return ids.map(id=>{const c=id===club.id?club:all.find(x=>x.id===id);return {id,name:c?.name||id,code:c?.code||id,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0}}).sort(sort);
  }
  function sort(a,b){return b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.name.localeCompare(b.name)}
  function ensure(state,force=false){
    if(!state.club)return null;
    if(force||!state.seasonLoop?.fixtures?.length){
      const fixtures=buildFixtures(state.club);
      state.seasonLoop={leagueId:'nexora-super-league',matchday:1,fixtures,results:[],table:makeTable(fixtures,state.club),currentFixtureId:null,phase:'calendar',seasonComplete:false};
    }
    return state.seasonLoop;
  }
  function current(state){const s=ensure(state);return s?.fixtures.find(f=>f.id===s.currentFixtureId)||s?.fixtures.find(f=>!s.results.some(r=>r.fixtureId===f.id))||null}
  function advance(state,forceToNext=false){
    const s=ensure(state), next=current(state);
    if(!next)return event('nexora:season-complete',{state});
    if(forceToNext)state.date=next.date;
    else state.date=addDays(state.date,1);
    const ready=current(state);
    if(ready&&state.date>=ready.date){s.currentFixtureId=ready.id;s.matchday=ready.matchday;s.phase='match';event('nexora:day-advance',{date:state.date});event('nexora:fixture-ready',{fixture:ready});}
    else event('nexora:day-advance',{date:state.date});
    window.saveState?.();event('nexora:career-saved',{state});
    return ready&&state.date>=ready.date?ready:null;
  }
  function start(state){
    const f=current(state);if(!f)return null;state.seasonLoop.phase='match';event('nexora:match-start',{fixture:f});return f;
  }
  function finish(state,homeGoals,awayGoals){
    const s=ensure(state),f=current(state);if(!f)return;
    if(s.results.some(r=>r.fixtureId===f.id))return;
    const result={fixtureId:f.id,matchday:f.matchday,date:state.date,homeId:f.homeId,awayId:f.awayId,homeGoals,awayGoals};
    s.results.push(result);
    s.table=makeTable(s.fixtures,state.club);
    s.results.forEach(r=>{const h=s.table.find(t=>t.id===r.homeId),a=s.table.find(t=>t.id===r.awayId);if(!h||!a)return;h.p++;a.p++;h.gf+=r.homeGoals;h.ga+=r.awayGoals;a.gf+=r.awayGoals;a.ga+=r.homeGoals;if(r.homeGoals>r.awayGoals){h.w++;h.pts+=3;a.l++}else if(r.homeGoals<r.awayGoals){a.w++;a.pts+=3;h.l++}else{h.d++;a.d++;h.pts++;a.pts++}});s.table.forEach(t=>t.gd=t.gf-t.ga);s.table.sort(sort);
    const done=s.results.length>=s.fixtures.length;s.phase=done?'season-end':'calendar';s.seasonComplete=done;s.currentFixtureId=done?null:f.id;
    event('nexora:match-finished',{fixture:f,result});event('nexora:table-updated',{table:s.table,result});
    window.saveState?.();event('nexora:career-saved',{state});
    if(done)event('nexora:season-complete',{state});
  }
  function opponent(state){const f=current(state);if(!f)return null;const id=f.homeId===state.club.id?f.awayId:f.homeId;return (window.NEXORA_DATA?.clubs||[]).find(c=>c.id===id)||{id,name:f.home,code:'OPP',style:'Balanced'};}
  function renderNext(state,host){
    const f=current(state);if(!host)return;
    const en=window.NEXORA_I18N?.language==='en'; const labels=en?{next:'NEXT MATCH',play:'PLAY NEXT MATCH →',advance:'ADVANCE DAY',table:'TABLE',season:'SEASON',complete:'SEASON COMPLETE'}:{next:'SONRAKİ MAÇ',play:'SONRAKİ MAÇI OYNA →',advance:'GÜNÜ İLERLET',table:'PUAN DURUMU',season:'SEZON',complete:'SEZON TAMAMLANDI'}; host.innerHTML=f?'<span class="eyebrow">'+labels.next+'</span><strong>'+f.home+' <em>vs</em> '+f.away+'</strong><small>'+f.date+' · MATCHDAY '+f.matchday+'</small><div class="season-actions"><button class="primary" id="playNextMatchBtn">'+labels.play+'</button><button class="secondary" id="advanceDayBtn">'+labels.advance+'</button><button class="secondary" id="tableBtn">'+labels.table+'</button></div>':'<span class="eyebrow">'+labels.season+'</span><strong>'+labels.complete+'</strong>';
  }
  window.NEXORA_SEASON={ensure,current,advance,start,finish,opponent,renderNext};
})();