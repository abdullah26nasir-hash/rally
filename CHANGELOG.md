# Rallycademy - Changelog

## v5.7 (25 Sep 2026)
Renamed the app Rally -> Rallycademy.
- Wordmark, page titles, meta, consent sheet, receipt, empty states and all user-facing copy now say Rallycademy; Receipt R mark kept (the R reads for Rallycademy).
- Unchanged on purpose: rally-v1 localStorage key, X-Rally-Device header, D1 binding, Pages project name (rally-t9w3n6) and the PostHog app='rally' super-property (kept so the analytics stream stays continuous).
- Small-viewport fix: header wordmark is fluid (clamp 16-24px) so RALLYCADEMY never causes sideways scroll at 320px.
- Verified live: title + header wordmark on production; a11y + button suites re-run against production after deploy.

## v5.4 (25 Sep 2026, commit cf8f984 content)
Shared leagues live (D1-backed) + opt-in analytics consent.
- Shared leagues: Cloudflare Pages Function (functions/api) on D1 rally-leagues; create, invite-code join (100 cap), standings, score sync; membership bound to a per-browser device secret (no accounts); league codes are bearer invitations; old local leagues not migrated; fictional preview fixtures.
- Consent: opt-in analytics banner; zero PostHog calls before choice or after reject; storage cleared on revoke; EU ingestion; invite codes never in events.
- Deploy: source-root Wrangler Pages deploy with Functions bundle; D1 provisioned (free tier), migration 0001 applied, DB binding on production + preview. Deployed from a scoped API token (D1:Edit + Pages:Edit) created for this rollout.
- Verified live on production: security 24/24, edge 26/27 (the without-D1 case cannot trigger once D1 is bound), a11y 143/143, buttons 116/116, two-device create/join/standings, nonmember 403, zero pre-consent PostHog calls, noindex header intact.

## v5.3 (25 Sep 2026, commit 6800f26 content)
PostHog analytics live.
- PostHog wired (pageviews, player_scouted/swapped/released, league_created/joined/join_failed, invite_copied, slip_viewed, receipt_viewed/shared, season_started/reset, autocapture); EU host eu.i.posthog.com; key via build var only, never in repo; app='rally' super-property.
- Privacy: league codes stripped from every event (URLs, button text); no session recording; respects Do Not Track; localStorage not cookies.
- Security 20/20 + edge cases 27/27 pre-deploy; deployed to rally-t9w3n6.pages.dev (bundle index-BoH55on5.js); production security suite 24/24 live.

## v5.1 (25 Sep 2026, commit 2744a1f content)
Standards pass + preview-honesty copy.
- Accessibility: axe WCAG 2.1 AA across 20 screens/states at phone + desktop - 143/143. Skip link, focus-to-heading on navigation, live "Invite link copied" status, one h1 per screen.
- Apple HIG: 44pt touch targets, safe-area insets (header, bottom nav, sheets).
- Buttons: 116/116 across all 10 screens. Edge cases 27/27. Security 20/20 (CSP, noindex, no secrets, XSS, tampered saves).
- Game integrity: swap history preserves earned points/stamps/receipts; one-player-per-club enforced on scout + swap; swap validation.
- v5.1: always-visible "leagues are on this device only" preview copy (leagues list + league page); removed "drop it in the group chat" line. Shared leagues pending user decision (D1 proposal parked).
- Deployed to rally-t9w3n6.pages.dev, bundle index-BFd-QP1t.js.

## v4 (earlier)
Every-button crawl (11 screens, ~100 controls), two league fixes, clean-code pass.

## v6.0 - 25 Sep 2026 - Dark rebuild per design.md
- Full dark-first apply of the Rallycademy design system (design.md v1): Turnstile Black base (#0B0B0A), Ticket text, Flare accents; all light-theme tokens replaced across every screen
- New token set in styles.css (dark @theme, surfaces, hairlines, semantics), radius 8/6 per spec, unlayered AA overrides (Tailwind v4 cascade fix, codified in design.md §8)
- Receipt IDs now issue RC- prefix (owner decision 25 Sep 2026); receipts issued before keep their stored R- numbers (immutability)
- LeagueTable my-row highlight switched from alpha flare/45 to opaque Flare-Wash (axe contrast fix)
- design.md updated with RC- decision + unlayered-override rule
- Verified: a11y suite phone+desktop — only pre-existing 4-5px 320px scroll residuals remain (tracked since v5.7); buttons suite all green; visual checks Welcome/Scout/Leagues/List at mobile + desktop
