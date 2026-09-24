# Rally - design system (v1, read before building anything)

## Subject
Rally is a free scouting game. You pick five rising U21 footballers, score from their real weekly performances, and collect timestamped proof that you called them early. Audience: UK football fans 16-35 who already play FPL with mates. The app's single job: make "I called him first" provable and fun, in under 5 minutes a week.

The world we borrow from: the scout's notebook and the match programme. Biro on paper, highlighter on the names that matter, a rubber date stamp, the till receipt you keep as proof. Not the betting shop: no green-and-yellow, no odds, no coins, no "invest".

## Colour (6 tokens, semantic names in code)
| Token | Hex | Role |
|---|---|---|
| paper | #F7F8F5 | page ground (cool off-white, deliberately not cream) |
| ink | #0F1729 | text, dark surfaces |
| biro | #2A3FE0 | primary actions, your picks, links, focus ring |
| highlighter | #E8FF59 | the signature swipe: breakouts, your row in a table. Always behind ink text, never text itself |
| stamp | #E5402B | timestamps on receipts, drops in form, destructive |
| graphite | #5B6474 | secondary text (5.9:1 on paper) |
Support: rule #E3E6EC (borders), card #FFFFFF, biro-wash #EEF0FD. Positive movement = biro + up arrow; negative = stamp + down arrow (never colour alone).

## Type (3 faces by role, self-hosted)
- Display: Big Shoulders Display 800/900 - stadium signage and kit numbers. Headings, points, ranks. Tight tracking, uppercase only for short labels.
- Body: Instrument Sans (variable) - UI and copy. 16px base on mobile.
- Mono: Spline Sans Mono - receipts, timestamps, stat tables, codes.
Scale (px): 12 / 14 / 16 / 18 / 22 / 28 / 40 / 64. Display sizes use clamp() on marketing moments only.

## Space and shape
4px base: 4, 8, 12, 16, 24, 32, 48, 64. Radius: 10 (controls), 16 (cards), 999 (pills). Receipts have zero radius and a serrated edge - that contrast is intentional.
Shadows: only the three Digest presets (sm controls, md cards, lg receipt/modal). No coloured shadows.

## Components
Button (primary biro / secondary outline / ghost; 44px min; scale .97 on press, 160ms), PlayerRow (avatar monogram in club colours, name, club, position, form sparkline, points), PlayerCard (squad slot), Sheet (bottom sheet on mobile, side panel on desktop), Tabs, Table (mono numerals, your row highlighted), Pill filters, Empty state, Skeleton, Toast.

## Signature element: the Scout Receipt
A thermal-till-style card: mono type, serrated top and bottom edge, a stamp-red date stamp with the exact time you scouted, the player's ownership when you picked vs now, and your locked Early-call multiplier. It is the share card ("I scouted him at 2.1% - here's the receipt"). Everything else stays quiet so the receipt carries the brand.

## Layout
Mobile first: single column, bottom tab bar (This week, Scout, Squad, Leagues), bottom sheets, thumb-reach actions, safe-area insets. Desktop (>=1024): left rail nav, content max 1120px, player detail as side panel, more columns in tables. Breakpoints: 640 / 1024 / 1280.

## Motion
Only where it gives feedback or orientation. Ease-out cubic-bezier(.23,1,.32,1) for entering, 150-250ms; sheets 300ms with iOS drawer curve. Receipt print-in on reveal (rare moment, delight allowed). No animation on tab switches or frequent actions. prefers-reduced-motion: fades only.

## Brand (distinct from the other apps in the family)
Rally is a scout's notebook, not a sportsbook and not a fantasy dashboard. Everything in the brand is a physical thing a scout would keep: a till receipt, a postage stamp, a biro, a highlighter, a rubber date stamp.
- Name treatment: RALLY set in Big Shoulders Display 800, tight tracking, always uppercase, followed by a short highlighter swipe. Never outlined, never in a gradient.
- Mark: a perforated postage stamp in biro blue with a paper R and a tilted highlighter stroke through its foot. Used for the favicon, app icon and share cards.
- Palette names: Biro (#2A3FE0) for action, Highlighter (#E8FF59) for the one thing that matters on a screen, Rubber-stamp red (#E5402B) only for dated proof (timestamps, "scouted" stamps, live tag), Ink and Graphite for text, Receipt paper (#F7F8F5) as the ground. Club colours belong to players and stamps only.
- Type roles: Big Shoulders for headlines and numbers, Spline Sans Mono for anything printed on a receipt (dates, stats, codes), Instrument Sans for reading.
- Voice: a knowing mate on the terraces. Short, dry, specific. Brags on your behalf with evidence ("27x more scouts have him now"). Never hype words, never exclamation marks, never money words.
- Signature moments: the receipt printing out, the rubber stamp landing, a new stamp dropping into the book, the scout level ticking up.
- Keep out: dark-mode neon, betting-slip green, trophies-and-confetti, glassy gradients, stock footballer photos.

## Copy
Plain, specific, football-literate. Controls say what they do ("Scout him", "Swap out", "Create league"). No money words anywhere: no invest, stake, return, price, buy. Picks are "scouted", your five is "your list", the multiplier is "early call".

## Accessibility floor
AA contrast, visible focus (2px biro ring + offset), 44px targets, icon buttons labelled, keyboard reachable, reduced motion respected, no colour-only meaning.

## Audit against the six AI tells
No tilted phones, sparkles or decorative coordinates. One headline style, not repeated gimmicks. Copy names real mechanics. No reused hero image. Previews are real, legible app screens. No fake testimonials or invented proof - demo data is labelled as a preview season.
