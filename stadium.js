(() => {
  const tiers = [
    { capacity: 5000, cost: 0, days: 0, name: 'LOCAL GROUND' },
    { capacity: 8000, cost: 750000, days: 30, name: 'STAND EXPANSION I' },
    { capacity: 12000, cost: 1200000, days: 45, name: 'STAND EXPANSION II' },
    { capacity: 18000, cost: 1800000, days: 60, name: 'MODERNIZATION' },
    { capacity: 25000, cost: 2700000, days: 75, name: 'NATIONAL STANDARD' },
    { capacity: 35000, cost: 4000000, days: 90, name: 'MAJOR EXPANSION' },
    { capacity: 50000, cost: 6000000, days: 120, name: 'ELITE STADIUM' }
  ];

  const money = value => `€${(value / 1000000).toFixed(1)}M`;
  const iso = value => new Date(`${value}T00:00:00`);
  const dateKey = date => date.toISOString().slice(0, 10);
  const addDays = (value, days) => {
    const date = iso(value);
    date.setDate(date.getDate() + days);
    return dateKey(date);
  };
  const daysBetween = (from, to) => Math.max(0, Math.ceil((iso(to) - iso(from)) / 86400000));

  function ensureStadium() {
    if (!gameState.stadium) {
      gameState.stadium = {
        level: 0,
        capacity: 5000,
        construction: null,
        totalInvested: 0
      };
    }
    if (!Number.isFinite(gameState.stadium.capacity)) gameState.stadium.capacity = 5000;
    if (!Number.isFinite(gameState.stadium.level)) gameState.stadium.level = 0;
    return gameState.stadium;
  }

  function refreshStadium() {
    ensureStadium();
    const stadium = gameState.stadium;
    const next = tiers[stadium.level + 1];
    const construction = stadium.construction;
    const current = tiers[stadium.level] || tiers[0];
    const occupancy = Math.round(Math.min(96, 52 + (gameState.reputation || 0) * 0.18 + (gameState.boardConfidence || 0) * 0.08));
    const attendance = Math.max(500, Math.round(stadium.capacity * occupancy / 100));
    const remaining = construction ? daysBetween(gameState.date, construction.endDate) : 0;
    const finished = construction && gameState.date >= construction.endDate;

    const host = document.getElementById('stadiumDevelopment');
    if (!host) return;

    host.innerHTML = `<div class="stadium-head"><div><span class="eyebrow">CLUB INFRASTRUCTURE / STADIUM</span><h3>Build it over time.</h3><p>Your club does not start with a 50,000-seat arena. Expand the ground as the club earns money, grows its supporters and builds its reputation.</p></div><span class="eyebrow stadium-level">LEVEL ${stadium.level + 1} / ${tiers.length}</span></div><div class="stadium-grid"><div class="stadium-visual"><div class="stadium-lights"></div><div class="stadium-capacity"><span>CAPACITY</span><b>${stadium.capacity.toLocaleString('en-US')}</b></div></div><div class="stadium-panel"><span class="eyebrow">${current.name}</span><h4>${stadium.capacity.toLocaleString('en-US')} SEATS</h4><div class="stadium-stat"><span>EST. ATTENDANCE</span><b>${attendance.toLocaleString('en-US')}</b></div><div class="stadium-stat"><span>OCCUPANCY</span><b>${occupancy}%</b></div><div class="stadium-stat"><span>TRANSFER BUDGET</span><b>${money(gameState.money)}</b></div>${construction ? `<div class="stadium-construction"><strong>${finished ? 'CONSTRUCTION COMPLETE' : 'CONSTRUCTION IN PROGRESS'}</strong><br>${finished ? `The ${tiers[construction.targetLevel].capacity.toLocaleString('en-US')}-seat expansion is ready.` : `${remaining} days remaining · finishes ${construction.endDate}`}</div>` : ''}<div class="stadium-progress"><i style="width:${Math.max(4,Math.round((stadium.capacity / 50000) * 100))}%"></i></div><div class="stadium-stat"><span>LONG-TERM TARGET</span><b>50,000</b></div><div class="stadium-actions"><button class="primary" id="stadiumUpgrade" ${(!next || construction) ? 'disabled' : ''}>${next ? `EXPAND → ${next.capacity.toLocaleString('en-US')}` : 'MAXIMUM CAPACITY'}</button><button class="secondary" id="advanceWeek" ${construction && !finished ? '' : ''}>+7 DAYS</button></div>${next ? `<p class="stadium-note">NEXT: ${next.name} · ${money(next.cost)} · ${next.days} DAYS</p>` : '<p class="stadium-note">The stadium has reached the 50,000-seat cap.</p>'}</div></div>`;

    const upgrade = document.getElementById('stadiumUpgrade');
    if (upgrade) upgrade.addEventListener('click', () => startConstruction(stadium.level + 1));
    const advance = document.getElementById('advanceWeek');
    if (advance) advance.addEventListener('click', () => advanceTime(7));

    if (finished) completeConstruction();
  }

  function startConstruction(targetLevel) {
    const stadium = ensureStadium();
    const target = tiers[targetLevel];
    if (!target || stadium.construction) return;
    if (gameState.money < target.cost) {
      alert(`Not enough funds. Required: ${money(target.cost)}`);
      return;
    }
    gameState.money -= target.cost;
    stadium.construction = {
      targetLevel,
      endDate: addDays(gameState.date, target.days)
    };
    stadium.totalInvested += target.cost;
    persist();
    syncDashboard();
    refreshStadium();
  }

  function completeConstruction() {
    const stadium = ensureStadium();
    if (!stadium.construction || gameState.date < stadium.construction.endDate) return;
    const target = tiers[stadium.construction.targetLevel];
    stadium.level = stadium.construction.targetLevel;
    stadium.capacity = target.capacity;
    stadium.construction = null;
    persist();
    syncDashboard();
    refreshStadium();
  }

  function advanceTime(days) {
    if (!gameState.club) return;
    gameState.date = addDays(gameState.date, days);
    completeConstruction();
    persist();
    syncDashboard();
    refreshStadium();
  }

  function mount() {
    if (!document.getElementById('dashboard')) return;
    const dashboardPanels = document.querySelector('.dashboard-panels');
    if (!dashboardPanels || document.getElementById('stadiumDevelopment')) return;
    const section = document.createElement('section');
    section.id = 'stadiumDevelopment';
    section.className = 'stadium-development';
    dashboardPanels.insertAdjacentElement('afterend', section);
    ensureStadium();
    refreshStadium();
  }

  window.addEventListener('load', mount);
  window.addEventListener('nexora:career-ready', refreshStadium);
  setTimeout(mount, 50);
})();