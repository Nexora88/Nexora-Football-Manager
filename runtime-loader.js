(()=>{
  const batches=[
    ['career-loop.js','matchday-bridge.js','uefa-coefficients.js','league-system.js','season-teams.js'],
    ['fixture-engine.js','fixture-match-ui.js','competition-draws.js','domestic-cup.js','cup-engine.js','europe-engine.js','europe-season.js'],
    ['season-end.js','season-awards.js','career-jobs.js','match-polish.js','newspaper.js','press-conference.js'],
    ['fan-system.js','world-sim.js','career-history.js','club-archive.js','career-timeline.js','stadium-branding.js','manager-career.js','career-rating-ui.js','youth-development.js']
  ];

  const load=(src)=>new Promise(resolve=>{
    if(document.querySelector(`script[src="${src}"]`)) return resolve();
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    let done=false;
    const finish=()=>{if(done)return;done=true;clearTimeout(timer);resolve()};
    const timer=setTimeout(()=>{console.warn(`NEXORA module timeout: ${src}`);finish()},5000);
    s.onload=finish;
    s.onerror=()=>{console.warn(`NEXORA module failed: ${src}`);finish()};
    document.body.appendChild(s);
  });

  (async()=>{
    for(const batch of batches) await Promise.all(batch.map(load));
    window.dispatchEvent(new CustomEvent('nexora:runtime-ready'));
  })();
})();
