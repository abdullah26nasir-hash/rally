# Rallycademy - Product Requirements Document

**Owner:** Abdullah Mansuri (7 day challenge)
**Status:** Live preview (v4, supersedes v3). Function-first phase; branding pass is LAST.
**Preview:** https://rally-t9w3n6.pages.dev (unguessable, noindexed, unlisted)
**Repo:** github.com/abdullah26nasir-hash/rally, branch `v1-scouting-game` (main untouched)
**Last updated:** 24 Sep 2026

## 1. Vision

A scouting/league game played with friends. Private leagues, weekly picks, live leaderboard, group-chat energy. The design constraint is social: a league member should be able to join from a link in a WhatsApp group and be playing in under a minute - no sign-up wall, no app install, no tutorial.

Product principles:
1. Zero-friction entry - invite link to playing in under a minute.
2. Mobile-first - this is played on phones, in group chats.
3. Every button works - the quality bar that came out of v1 (see Research).

## 2. Research

**Quality bar lesson.** v1 shipped with dead buttons - caught by the owner, not by us. That failure set the standing protocol for every app in the portfolio: an every-button interaction crawl on mobile and desktop breakpoints, zero console errors, visually verified with screenshots. No build ships without it.

**Game loop.** Weekly cadence fits group-chat rhythm: a pick is a 30-second action, the leaderboard is the conversation. Scoring must be simple enough to explain in one message.

**Anonymous identity.** League members get a browser-held member_key - no accounts, no passwords, no email collection. Identity is per-league; a display name is the only personal data.

## 3. Features

### Phase 1 - Shipped (current preview, v4)
- [x] Core game loop (v4 - supersedes v3 on the same Pages project)
- [x] Landing + onboarding flow
- [x] Every-button crawl clean mobile + desktop, zero console errors
- [x] Pen test passed before preview link shipped
- [x] Security headers, noindex, unguessable preview URL

### Phase 2 - Next: leagues
- [ ] Create a league, get an invite link
- [ ] Join via link (display name only, member_key issued)
- [ ] Weekly picks flow
- [ ] Scoring engine + league leaderboard

### Phase 3 - Engagement
- [ ] Weekly reminders (pick deadline)
- [ ] Results recap per week
- [ ] Season view / history

### Phase 4 - Branding (LAST, per standing sequencing)
- [ ] Full design pass, identity, motion

## 4. Data & schemas

**Decision (24 Sep 2026): Cloudflare D1.** Relational within SQLite semantics is fine - simple queries, low write contention. Schema designed:

    leagues(id TEXT PRIMARY KEY, name TEXT NOT NULL, invite_code TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL)
    members(league_id TEXT NOT NULL, member_key TEXT NOT NULL, display_name TEXT NOT NULL,
            joined_at TEXT NOT NULL, PRIMARY KEY (league_id, member_key))
    picks(league_id TEXT NOT NULL, member_key TEXT NOT NULL, week INTEGER NOT NULL,
          pick TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (league_id, member_key, week))
    points(league_id TEXT NOT NULL, member_key TEXT NOT NULL, week INTEGER NOT NULL,
           points INTEGER NOT NULL, PRIMARY KEY (league_id, member_key, week))

- member_key: random token held in the member's browser; the only credential.
- invite_code: unguessable, per league, rotatable.
- Leaderboard = SUM(points) GROUP BY member within a league - trivially within D1's comfort zone.

## 5. Platform & database decision

Full comparison done 24 Sep 2026 (D1 vs Supabase vs Neon vs AWS, live pricing). D1 chosen: idle apps cost nothing (Supabase free pauses after 1 idle week + 2-project cap), no metering surprises (Neon pay-as-you-go after free CU-hours), no DevOps/billing risk (AWS has no hard cap on paid). D1 free tier covers this app permanently at friends-and-family scale; Workers free (100k requests/day account-wide) is the binding ceiling and is far above expected league traffic. Growth path: $5/month Workers Paid covers every app on the account.

## 6. Security & privacy

- No emails, no passwords, no personal data beyond a display name
- member_key never leaves the member's browser except over TLS to their own league
- Preview URLs unguessable + noindexed; pen test before any link ships
- Secrets scan on every push; no keys in the repo

## 7. Testing protocol (standing)

1. Every-button crawl, mobile + desktop, zero console errors
2. Visual verification with screenshots at real breakpoints
3. League-flow end-to-end: create -> invite -> join -> pick -> score
4. Pen test before link moves

## 8. Decisions log

- 24 Sep: v4 supersedes v3 (same Pages project, new deploy)
- 24 Sep: Anonymous member_key pattern adopted - no sign-up wall
- 24 Sep: D1 selected (see section 5)
- 24 Sep: Sequencing - function + full testing first, branding LAST

## 9. Open questions

- Pick deadline mechanics (lock at first match of the week vs fixed weekday)?
- Commissioner powers (edit league, remove member) - needed for v1 of leagues or later?

---

## How this app is built (agentic workflow)

Practices folded in from spec-driven development research (GitHub Spec Kit, Sept 2025; Kiro; SDD guides):

1. **Spec before code.** Every feature starts as a short written spec in this PRD: Goal, Requirements, Constraints, Acceptance criteria. Nothing gets built from a vague prompt.
2. **Living document.** This PRD is the source of truth. When intent changes, the spec changes first, then the code. The repo copy (PRD.md) is synced on every ship.
3. **Small, reviewable tasks.** Work is broken into chunks that can be tested in isolation, then reviewed against the spec's acceptance criteria - not against vibes.
4. **Verification gates.** Every build passes an every-button interaction crawl (mobile + desktop), zero-console-error check, and a pen test before any preview link ships. Preview links are unguessable, noindexed, unlisted.
5. **Sequencing.** Function and full testing first; branding deep-dive last.
6. **Free tiers only.** Anything that could bill gets flagged before use; platforms chosen for hard quota stops, not billing alerts.

## v5.4 - Shared leagues (25 Sep 2026)
Leagues are now shared across devices: one person creates a league, gets a code, mates join from their own phones and see the same standings. Runs on a Cloudflare Pages Function backed by D1 (rally-leagues). No accounts: membership is a per-browser device secret; clearing site data loses membership. League codes are bearer invitations, send only to intended mates. Existing pre-D1 leagues stay local and are not migrated. Scores come from the fixed fictional preview fixtures; no trusted identity or anti-cheat yet. Analytics are opt-in via a consent banner (PostHog stays fully off until allowed, storage cleared on revoke, EU host, codes stripped). Route stays noindex; demo code LADS26 remains local-only.
