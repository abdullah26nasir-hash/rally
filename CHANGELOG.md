# Rallycademy - Changelog

## v6.3 (25 Sep 2026)
UI error-fix pass after owner review, audited against design.md v2 via the Opus design pipeline (v2.1 rules).
- Stub rebuilt to spec: Receipt R + current screen title + WK/PREVIEW label (wordmark and stray flare dash removed from the band; wordmark bare everywhere).
- Flare swipe highlights removed everywhere (key line is Flare Ink mono text; points are ink data-lg).
- Consent: floating "Analytics settings" chip removed (it overlapped CTAs on every screen); settings now a row on the How screen; choice buttons equal-weight secondary, no Flare.
- Stamp book tiles on palette (Ticket + ink border + Flare Ink number ring; locked = Stock dashed Pencil); rows scroll sideways with snap inside their card.
- Scout position chips fit at 320px (24px pill inside a 44px control, wrap, never scroll); sort tab active underline ink.
- Flare Tint callouts use card-edge borders; your-row "YOU" label ink; league form errors use Offside.
- Player swap panel is Ticket not Flare Tint; multiplier ink data-lg; "No early bonus" Pencil.
- Receipt toggle is an ink switch; destructive "Clear and start over" uses the ink Inverse variant.
- Copy fix: "receipts, flares and leagues" -> "receipts, stamps and leagues" (rename casualty).
- Suites on this build: buttons 117/117, a11y 141/143 (only the 2 known pre-existing 4px 320px residuals on player + swap sheet; the 5px start residual was fixed by the consent chip removal).

## v6.2 (25 Sep 2026)
Light brand application per design.md v2 ("printed matchday ephemera").
- Full component sweep onto the v2 light tokens: Stub top band (inverted ink header, Ticket wordmark, Terrace tab pills), Ticket cards with card-edge borders and 8px radius, Terrace wells, Proof inputs (surface-2 bg, Pencil border, ink focus), Flare Tint for your-row highlight and callout panels, one-Flare-fill rule per screen, semantic deltas recolored (match/offside).
- Buttons rebuilt to spec: primary flare fill with ink border (print-plate look), secondary ink border, ghost, ink variant; 6px radius, h-12 (44pt).
- Receipt rule enforced: metadata on receipt paper renders in ink, never flare (axe color-contrast).
- 320px rule: inputs/selects/textareas get min-width: 0 (new body font made default input min-content exceed small screens; was causing 2px sideways scroll on /leagues).
- Verified: buttons 117/117, a11y 140/143 (3 known pre-existing 4-5px 320px residuals on start/player/swap-sheet), visuals on mobile/tablet/desktop, suites re-run against the deployed preview before production.

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

## v6.1 - 25 Sep 2026 - Receipt save hardening + RC- on light
- Receipt IDs now issue RC- prefix (owner decision 25 Sep 2026); previously issued receipts keep their stored numbers
- Receipt image save fixed/hardened for mobile: render retries step down pixelRatio 3->2->1.5 (iOS Safari canvas failures), Save uses the native share sheet where <a download> is unreliable, blank renders detected, and receipt_render_failed / receipt_save_failed events now report real device errors to PostHog
- Back on the light base (v5.7) per owner direction; stronger light brand application follows as a separate design pass
