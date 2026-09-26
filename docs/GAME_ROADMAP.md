# Nexora Football Manager — Game Roadmap

## North Star
Mobile-first, browser-based football career game: build a fictional club identity, make meaningful management decisions, and experience a readable, fast matchday loop. Vanilla HTML/CSS/JS on Vercel; `app.js` remains the pre-alpha runtime source of truth.

## 1. Four-Phase Roadmap

### Phase 1 — One Season, Fully Playable
**Player value:** Start a club, manage a squad, play a complete minimum season, and reach a clear league outcome.
**Acceptance:** deterministic calendar; generated fixtures; advance day → fixture → match → result → table → save; refresh-safe persistence; season-end state.
**Deferred:** transfers, contracts, scouting, youth, complex training, multiple competitions, promotion/relegation, full 2.5D simulation, online accounts.

### Phase 2 — Club Management Depth
**Player value:** Between-match decisions change squad quality, finances, board confidence, and development.
**Acceptance:** transfers/wages/contracts have consequences; training changes attributes; board objectives and finances create strategy; scouting provides actionable information.
**Deferred:** licensed real-world data, huge databases, online marketplace.

### Phase 3 — Matchday & Atmosphere
**Player value:** Matchday becomes the emotional payoff for management decisions.
**Acceptance:** understandable events/tactics/momentum; substitutions/cards/injuries; commentary/crowd/visual feedback; stable mobile performance.
**Deferred:** photorealistic 3D, full physics, licensed/voice-cloned commentary.

### Phase 4 — Living Football World
**Player value:** Long careers evolve through leagues, cups, reputation, history, boards, and supporters.
**Acceptance:** multiple leagues/cups; promotion/relegation; qualification; persistent manager reputation/club history; evolving expectations.
**Deferred:** multiplayer, real-money economy, unlicensed protected assets, moderation-heavy social features.

## 2. Phase 1 Technical Sprint

### Files
- `app.js`: keep `window.gameState` as the single runtime state; expose season-loop methods.
- `season-engine.js`: calendar, fixture generation, match scheduling, season transition.
- `league-table.js`: standings calculation from normalized results.
- `matchday-engine.js`: adapt the existing match simulation to one result contract; no second state store.
- `i18n.js` / `home-i18n.js`: all calendar/fixture/table/result/season labels.
- `styles.css`: mobile-first fixture, result, table and next-match UI.
- `index.html`: only containers required by the loop.

### Additive state
```js
gameState.seasonLoop = {
  leagueId: "nexora-super-league",
  matchday: 1,
  fixtures: [],
  results: [],
  table: [],
  currentFixtureId: null,
  phase: "calendar",
  seasonComplete: false
};
```
Existing club, squad, XI, formation, money and reputation remain intact.

### Event order
`nexora:day-advance` → `nexora:fixture-ready` → `nexora:match-start` → `nexora:match-finished` → `nexora:table-updated` → `nexora:career-saved` → either `nexora:season-complete` or back to calendar.

**Rule:** one season engine owns calendar/table/result mutation; UI only renders state and dispatches intent.

## 3. Minimum Viable Season — Player Flow
1. Choose/create fictional club.
2. Create manager and enter dashboard.
3. See next fixture and league position.
4. Review squad and select XI.
5. Choose formation.
6. Press Next Match.
7. Calendar advances to matchday.
8. Match preview shows opponent/venue/form/difficulty.
9. Play or simulate the match.
10. Receive score, events, and basic stats.
11. League table updates immediately.
12. Board confidence, reputation, and finances update.
13. Career autosaves.
14. Return to next-fixture dashboard.
15. Repeat to the final league fixture.
16. Season-end screen shows position, record, goals, and board reaction.
17. Start next season using the same save.

## 4. Five Things We Will Not Copy From FM
1. Spreadsheet-first presentation — data supports decisions rather than burying the player.
2. Huge onboarding complexity — the first meaningful decision happens quickly on mobile.
3. Real-player/real-club dependency — fictional content keeps Nexora's world original.
4. Opaque simulation — outcomes expose understandable causes.
5. Feature-count competition — fewer interconnected systems beat dozens of shallow menus.

## 5. Five Feelings We Must Have
1. **Ownership** — “This club is mine.”
2. **Anticipation** — the next match creates a reason to return.
3. **Agency** — XI and tactics visibly matter.
4. **Drama** — late goals, table movement, and pressure create memories.
5. **Progression** — the club is measurably different at season end.

## 6. International Go-To-Market
1. **Language-first:** Turkish, English, German, Spanish, Portuguese across the entire career loop.
2. **Store/page positioning:** fast fictional football-management career for browser/mobile; never imply licensed content.
3. **Short-form content:** 15–30 second decision → match event → table consequence clips.
4. **Build-in-public community:** roadmap milestones, polls, transparent pre-alpha changes.
5. **Creator-friendly demo:** career start to first meaningful decision in under a minute.
6. **Retention before acquisition:** measure career starts, first-match completion, return-after-refresh, and season completion before broad paid acquisition.

## 7. Priority Backlog
1. **P1 Season state:** Saved career contains calendar, fixtures, results, table, current fixture and phase.
2. **P1 Fixture generator:** New career creates a complete minimum league schedule with one player-club fixture per round.
3. **P1 Day advance:** Next-match action reaches the next fixture without skipping required states.
4. **P1 Match contract:** Existing engine returns one normalized result consumed by the season engine.
5. **P1 League table:** Each completed fixture updates P/W/D/L/GF/GA/GD/PTS correctly.
6. **P1 Persistence:** Refresh restores the same date, fixture, results, and table.
7. **P1 Season completion:** Final fixture produces one season-end state and cannot be processed twice.
8. **P1 Mobile UI:** Fixture/result/table screens remain usable at narrow mobile widths.
9. **P2 i18n coverage:** All Phase 1 user-facing labels respect `nexoraLanguage`.
10. **P2 Smoke test:** New career → first match → result → table → refresh → continue is documented and repeatable.
