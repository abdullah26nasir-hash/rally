# Rally real-data sourcing, 25 September 2026

The current 2026/27 preview is entirely fictional. Do not mark it live or replace its labels until a vendor, rights, competition, scoring coverage, and ingest cadence are validated. A real fixture list alone cannot run Rally: minutes, goals, assists, clean sheets, and verified debut/call-up moments need per-player, per-match data. U21 eligibility needs an age cutoff and reliable date of birth. Even with a provider, "scout ownership" is a Rally-side metric, never a vendor statistic. A no-login game also needs an identity/anti-cheat plan before public competitive standings.

## Free candidates

| Source | Free allowance, current operator claim | What it can do | Key gap |
| --- | --- | --- | --- |
| API-Football / API-Sports | $0, 100 requests/day, 10/minute; endpoints include fixtures, lineups, events and player stats; recent seasons only | Best prototype candidate for the full loop, if the chosen league-season reports coverage | Verify exact league/season coverage, per-player minutes/assists, late corrections, U21 dates and usage terms before integrating |
| football-data.org | €0, 12 competitions, 10 calls/minute; fixtures and delayed scores/schedules/tables | Fixture-only spike in major leagues | Free tier does not include lineups/subs/scorers/squads; no full Rally scoring. Visible attribution required; football data use after cancellation is restricted |
| Sportmonks | Free forever, access to Scottish Premiership + Danish Superliga; paid Starter from €29/month monthly or €24/month yearly | Full-looking fixtures/player statistics within narrow test coverage | Not a broad U21 scouting pool on free tier; verify specific endpoints and historical coverage |
| TheSportsDB | Free v1 key 123, some methods restricted; v2 and enhanced livescores $9/month supporter | Fixture and team lookup experiments | Coverage, rate limits and player-match stat completeness unclear; crowdsourced gaps possible |
| OpenFootball football.json | Public-domain JSON, no API key, fixture/results files | Reproducible fixture mock and schedule import | No individual player minutes, goals or assists; upstream updates are manual even though JSON generation is daily |

## Architecture wired in this branch

`src/data/source.ts` defines `FootballDataSource.load()`, `DataSnapshot`, fixture, appearance, capability, and validation contracts. Existing UI and scoring import a single data facade now, which still exports the fictional preview. The shared-league backend deliberately keeps the same fixed fictional preview because simply swapping displayed fixtures would make standings/receipts dishonest. A future provider adapter belongs server-side, with secrets stored in Cloudflare bindings, not `VITE_` browser variables. No live API credentials, paid plan, or ingest job were created.

Before a switch: confirm license and attribution, choose supported competitions, verify age and stat coverage from a sample real response, map vendor player/team/fixture IDs to stable internal IDs, define provider correction windows and match postponements, persist normalized snapshots and ingest timestamps, version scoring rules, and migrate or isolate existing fictional picks/leagues. Fail closed if critical fields are missing. Keep free-tier polling within operator limits and do not make account-bound rapid checks without a user-approved cadence.

Sources (operator docs):
- https://www.api-football.com/pricing
- https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide
- https://www.api-football.com/news/post/how-ratelimit-works
- https://www.football-data.org/pricing
- https://www.football-data.org/coverage
- https://www.football-data.org/client/register
- https://www.sportmonks.com/football-api/free-plan/
- https://www.sportmonks.com/football-api/plans-pricing/
- https://www.thesportsdb.com/documentation
- https://www.thesportsdb.com/api.php/
- https://github.com/openfootball/football.json/blob/master/README.md
