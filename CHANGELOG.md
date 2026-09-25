# Rally - Changelog

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
