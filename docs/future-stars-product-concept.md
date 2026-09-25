# Rallycademy - product concept (private working note)
25 September 2026. Planning only; this is not a live-data claim, released feature or trained predictor.

## Naming
The feature name is **Rallycademy** (25 September 2026), chosen after the naming discussion. It replaces the earlier "Rally Future Stars" and "Rally Wonderkids" working labels without changing the 16-21 player scope. A quick public-web exact-phrase search found no obvious direct collision, but the similar "Rally Academy" has unrelated uses; no formal trademark clearance has been done. Before public use, check relevant trademark classes and markets, domains, app stores and confusingly similar names. Do not use EA's "Future Stars" promo name in the feature UI.

## Product loop
Rally starts with the solo habit: follow 16-21-year-old footballers, see what they did recently, and watch a dated forecast change as new evidence arrives. A five-player scouting list and timestamped receipts preserve the early-call identity. Friends and leagues add comparison, not a prerequisite for value. Avoid an empty-league first-run trap.

1. **Discover:** search and filter by club, position, age, playing time and recent form. Explain whether a player is eligible as of the precise cutoff date and which competitions are covered. Show the newest source update and a visible unavailable state instead of recycling stale values as current.
2. **Track:** follow a player in a solo watchlist. His page shows match-by-match appearances and core stats, the dated forecast history and what actually changed since the previous snapshot. "What changed?" attributes a movement to observed minutes/goals/assists or to a model/data revision; it must not imply causality where there is only correlation. Remind people only when a new verified update matters, with opt-in and manageable cadence.
3. **Forecast:** predict a defined future target, e.g. market-value estimate in 12 months, *only* if licensed historical valuation labels and player features exist and testing shows an honest signal. Display estimate, update date, interval/uncertainty and model version. An estimate is not a transfer fee or an offer; observations are not model claims. If display rights are narrower than modelling rights, don't show the underlying vendor value.
4. **Compete:** private leagues compare dated early calls and verified post-pick performance. Keep the existing receipt and scoring rules, but isolate each season's dataset and ruleset so a fictional preview list and a real-data league can never silently mix. A forecast movement is a separate optional league mode after validation; don't retroactively change old league scoring. Device-bound anonymous identity is fragile for a serious multi-person game; account recovery and anti-cheat are a later launch gate.

## Separate data and claims
- **Observed feed:** licensed fixtures, appearances, goals, assists, minutes, stable player IDs, DOB and corrections, with source provenance and ingestion timestamp. A team-level result feed cannot fill the player-level rows. Under-18 coverage and treatment need specific review.
- **Label feed:** licensed time-series market estimates, or actual transaction fees under a different target name. Estimate and fee are not interchangeable. Need legal scope for storage, training, derived output display, and use in a game.
- **Model:** seasonal snapshots for ages 16-21 at a named cutoff, features known then, later labels, temporal holdout, simple baseline and age/playing-time/position breakdown. Evaluate error and bias before public ranking. Do not call a synthetic exercise evidence of prediction accuracy.
- **Product events:** follows, pick timestamp, league joins, receipts and points are Rally-owned, distinct from vendor stats. A user's early-call multiplier depends on Rally participation, not an external value.

## Release sequence and acceptance gates
**0. Concept-only private wireframe:** represent unavailable forecasts explicitly; keep the fictional preview marked as such. Test that watchlist actions, explanation, dates, labels, filter empty states, league isolation, keyboard and screen reader routes work. A synthetic series may prove chart/API interactions, never model quality. No public link until security, every-button, accessibility and visual checks.

**1. Source-rights spike:** examine any websites the user sends, their current terms/robots/API plans, licensed redisplay/training scope and youth data handling. No scraper or dataset ingestion before clearance. Pick a player-stat feed and a historical value-label feed; cost approval before any paid tier. Validate one target league-season's samples, corrections and identity join at source of truth. Document field fill rates and freshness, with a fail-closed condition.

**2. Offline model trial:** version snapshots, training script and evaluation artifact without committing keys or restricted raw data. Compare a naive baseline and linear regression on out-of-time future seasons. Show MAE, interval coverage and cohort counts for 16-18 and 19-21; do not publish forecasts if labels or validation are weak.

**3. Real private beta:** server-only vendor adapters and scheduled ingestion under rate limits; version player/fixture IDs, data snapshot, model and scoring. Keep a rollback path to the labelled preview. Make watchlist useful before adding league invitations and standings. Pen-test, exercise every button and error state, and verify final pixels before sharing.

## Open owner decisions, not defaults
- The product direction is a forecast of **transfer market-value movement**, but the current Rally UI has a no-money-vocabulary rule. Resolve whether valuation is an explicitly separated, accurately labelled new mode, or whether an early beta should show only non-monetary trajectory. Do not rename an economic estimate to a generic score and quietly imply the same thing.
- Pick a specific target (future estimated value vs recorded transfer fee), future horizon, geography/competitions, and whether the app addresses only adult users. These choices depend on the rights-cleared data available.
- The reply emoji to a three-option question (synthetic private prototype / paid plan / park) does not select a numbered option. Treat the subsequent voice note and any sourced websites as new evidence; free tiers only until an explicit spend approval.

## References
Reel: https://www.instagram.com/reels/DckAmf2hdrt/ . Source and rights findings: `docs/real-data-research.md`, `docs/transfer-value-poc.md`. The existing Rally season and leagues still use fictional preview data; this note does not change them.
