# design.md: Rallycademy

Read this before you build or change any screen. Every rule here is testable. If a screen breaks a rule, the screen is wrong, not the rule. To change a rule, change this file in the same PR.

**The one rule: proof over decoration.** Before you add a graphic, badge, animation or football reference, ask: does it make the call feel more like evidence? If not, cut it.

Rallycademy is a free weekly U21 scouting game. You pick five young players before they break out. Your early call multiplier locks at pick time. You get a Scout Receipt as proof. It must never look or read like fantasy football.

---

## 1. Colour

Dark by default. Ticket appears as *objects* (receipts, paper cards), never as a page background inside the app.

### Core six

| Token | Name | Hex | Role |
|---|---|---|---|
| `--ink` | Turnstile Black | `#0B0B0A` | App background. Text on Ticket. Text on Flare. |
| `--paper` | Ticket | `#F1EFE7` | Primary text on dark. Receipt surface. |
| `--flare` | Flare | `#FF4D22` | The accent. Primary CTA fill, active state, focus ring on dark, verification dot. |
| `--flare-ink` | Flare Ink | `#B23415` | Flare as text or icon **on Ticket only**. Receipt stamps and key line accents. |
| `--newsprint` | Newsprint | `#B4B2AA` | Secondary text on dark. |
| `--ash` | Ash | `#85847D` | Metadata on `--ink`, `--surface-1`, `--surface-2` only. Input borders. |

### Surface ramp (dark)

| Token | Name | Hex | Use |
|---|---|---|---|
| `--surface-1` | Stand | `#121211` | Cards |
| `--surface-2` | Concrete | `#1A1A18` | Raised: sheets, menus, modals |
| `--surface-3` | Floodlight Grey | `#252522` | Selected and hover rows |

| `--flare-wash` | Flare Wash | `#32150E` | Accent surface: breakout card, your row in a league |
| `--hairline` | Hairline | `rgba(241,239,231,0.14)` | Dividers. Decorative only, never a control boundary. |
| `--card-edge` | Card Edge | `rgba(241,239,231,0.10)` | Card borders |

Depth comes from stepping up the ramp. On near black, a shadow under a card is invisible, so the three preset system collapses to one:

| Preset | Value | Use |
|---|---|---|
| `shadow-sm` | not used | Compact cards and chips get depth from surface steps |
| `shadow-md` | not used | Default cards get depth from surface steps and `--card-edge` |
| `shadow-lg` | `0 1px 0 rgba(241,239,231,0.06) inset, 0 12px 32px rgba(0,0,0,0.45), 0 32px 64px rgba(0,0,0,0.35)` | Sheets, modals, the landing hero receipt |

One strength per state. Never mix with default Tailwind shadows (`shadow`, `shadow-xl` are banned). A shadow never replaces a border: every card keeps `--card-edge`.

### Semantic (functional only, dark surfaces only)

| State | Name | Hex |
|---|---|---|
| Breakout / up | Match Green | `#5DDB8B` |
| Drop / down | Offside Red | `#FF6868` |
| Pending | Amber | `#EAB85C` |
| Info | Sky | `#70A9FF` |

Semantic colours never appear on Ticket (all fail 3:1 there). On receipts, direction shows with a glyph and words (`▲ 184`, `UP 184 PLACES`), in `--ink`. Semantic colour always pairs with a glyph or word. Colour alone never carries meaning. Match Green is never a brand colour: no green buttons, no green headlines.

### Approved pairings (measured ratios)

| Foreground | Background | Ratio | Allowed for |
|---|---|---|---|
| Ticket | Turnstile Black | 17.10 | Everything |
| Turnstile Black | Ticket | 17.10 | Everything (receipts) |
| Newsprint | any dark surface incl. Floodlight | ≥ 7.24 | Body, secondary |

| Ash | Turnstile Black / Stand / Concrete | 5.25 / 4.99 / 4.64 | Metadata |
| Turnstile Black | Flare | 5.94 | CTA labels, Flare chips |
| Flare | Turnstile Black / Stand / Concrete | 5.94 / 5.66 / 5.26 | Large display, icons, focus ring, active marks |
| Flare | Flare Wash | 5.07 | Breakout labels |
| Flare Ink | Ticket | 5.37 | Stamps and accents on receipts |

### Banned pairings (these fail, do not relitigate)

| Foreground | Background | Ratio | Why banned |
|---|---|---|---|
| White or Ticket | Flare | 3.31 / 2.88 | Fails 4.5:1. Flare fills always carry Turnstile Black. |
| Flare | Ticket | 2.88 | Fails even 3:1. Use Flare Ink. |
| Flare Ink | any dark surface | ≤ 3.18 | Paper only. |
| Ash | Floodlight Grey / Flare Wash | 4.09 / 4.48 | Metadata on selected rows and your own row switches to Newsprint. |
| Newsprint or Ash | Ticket | 1.84 / 3.26 | Receipt text is Turnstile Black, always. |
| Any Tailwind opacity modifier on text (`text-paper/60`) | anything | unaudited | Every text colour is a named token. No alpha text. |

---

## 2. Type

Three voices. One makes statements. One runs the product. One records evidence.

| Role | Face | Weights | Use |
|---|---|---|---|
| Display | Archivo Black | 400 | Wordmark, hero, big ranks and multipliers, moment screens, sequence numerals |
| UI | Inter | 400, 500, 600, 700 | Everything you read or tap |
| Evidence | IBM Plex Mono | 400, 500, 600 | Timestamps, receipt fields, ranks, deltas, IDs, fixtures, multipliers |

Load with `font-display: swap`. Self host the woff2 files. Mono uses `font-variant-numeric: tabular-nums` everywhere, so ranks and deltas never jitter.

### Scale


| Style | Face | Size | Line height | Tracking | Case |
|---|---|---|---|---|---|
| `hero` | Archivo Black | `clamp(40px, 12vw, 144px)` | 0.88 | −0.045em | Upper |
| `h1` | Archivo Black | `clamp(36px, 9vw, 72px)` | 0.92 | −0.04em | Upper |
| `h2` | Archivo Black | `clamp(28px, 6vw, 48px)` | 0.95 | −0.03em | Upper |
| `h3` | Inter 700 | 24px | 1.2 | −0.01em | Sentence |
| `card-title` | Inter 600 | 17px (16 to 20 allowed) | 1.3 | 0 | Sentence |
| `body` | Inter 400 | 16px (15 to 17) | 1.5 | 0 | Sentence |
| `body-sm` | Inter 400 | 14px | 1.45 | 0 | Sentence |
| `label` | Inter 600 | 12px | 1.2 | 0.05em | Upper |
| `data` | Plex Mono 500 | 13px (11 to 14) | 1.35 | 0.02em | Upper |
| `data-lg` | Plex Mono 600 | 20px | 1.1 | 0 | Upper |

### Type rules

1. Archivo Black never goes below 28px. Below that, use Inter 700.
2. **The rename broke the old hero sizes.** RALLYCADEMY is eleven heavy capitals. At 64px it runs past 320px. The wordmark and any display line are sized by their longest word, not by a fixed px. Rule: the longest word in a display line must fit `100vw − 32px` at 320px. The wordmark uses `font-size: min(11vw, 120px)`. Test at 320px before merge.
3. Never let a display word break mid word or clip. No `overflow: hidden` on display containers (0.88 line height plus hidden overflow clips the tops of caps in some renderers).
4. Inter 700 is rare: `h3` and a player's name on a moment screen. Buttons are 600.
5. Body text never exceeds 68 characters per line (`max-width: 34em`).
6. Mono is the proof voice. It appears only on evidence: receipt fields, timestamps, ranks, deltas, multipliers, fixtures, IDs. It is never an eyebrow above a heading, never a nav label, never decoration.
7. Uppercase belongs to display, `label` and `data`. Buttons, body, headings in Inter and all product copy are sentence case.

---

## 3. Spacing and layout

Base unit 4px. Use only these steps:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`


(Tailwind: `1 2 3 4 6 8 12 16 24 32`.) Anything else fails review.

| Context | Value |
|---|---|
| Page gutter | 16px under 640px, 24px to 1024px, 48px above |
| Content max width (app) | 640px. The app is a phone product that also runs on desktop. |
| Content max width (landing) | 1200px |
| Stack gap inside a card | 12px |
| Gap between cards | 8px |
| Section gap (app) | 32px |
| Section gap (landing) | 96px mobile, 128px desktop |

Layout comes from hairlines first, cards second. A list of players or league rows is rows split by `--hairline`, not a stack of boxes. Use a card only when the thing is a discrete object you can act on (a pick, a receipt, a league invite).

Left align everything. Centre alignment only on single line moment screens (win moment, empty state).

### Radius

| Thing | Radius |
|---|---|
| Card, sheet, modal | 8px |
| Button, input | 6px |
| Chip | 999px |
| Scout Receipt | 2px, plus perforated top and bottom edges |
| Avatar (league) | 50% |

No 12px, 16px or 24px radius anywhere.

---

## 4. Core components


Each state below is required. A component missing a state fails review.

### Button

| Variant | Default | Hover (desktop) | Pressed | Focus | Disabled | Loading |
|---|---|---|---|---|---|---|
| **Primary** | Flare fill, Turnstile Black Inter 600 16px | fill `#FF6340` | `scale(0.97)`, 160ms ease out | 2px Ticket outline, 2px offset | Floodlight fill, Ash text, `aria-disabled` | Five Mark loader, label kept for width |
| **Secondary** | Transparent, 1px Ticket at 18%, Ticket text | border to 40% | background Floodlight | 2px Flare outline, 2px offset | 50% opacity border, Ash text | same |
| **Ghost** | Newsprint text, no border | Ticket text | Ticket text, underline | 2px Flare outline | Ash text | none |
| **On paper** | Turnstile Black fill, Ticket text | `#252522` fill | `scale(0.97)`, 160ms | 2px Turnstile Black outline, 2px offset | 40% opacity | same |

Height 48px minimum (44px is the floor, 48px is the house size). Horizontal padding 20px. Full width on mobile for the one primary action per screen. **One primary button per screen.** No arrows appended to labels. No pill buttons. Never a Flare button on a Ticket surface (2.88:1 edge, fails 3:1): use the On paper variant.

Label copy says what happens: `Back your five`, `Lock pick`, `Use swap`, `Start a league`, `Share receipt`.

### Pick Card

The player as a pickable object. Stand surface, 8px radius, `--card-edge` border, 16px padding.

Content: name (Inter 600 17px, Ticket), club and position (Inter 400 14px, Newsprint), one chip max (position or eligibility), current multiplier (`data-lg`, Ticket), form line (`data`, Ash).

| State | Treatment |
|---|---|
| Available | As above |
| Hover (desktop) | Border to `rgba(241,239,231,0.24)`, 140ms `ease`. No lift in the app (see Motion). |
| Selected (not yet locked) | Floodlight surface, 2px Flare left rule, metadata switches to Newsprint |
| Locked | Stand surface, small Flare verification dot top right, multiplier in Ticket with `LOCKED ×2.4` in `data`. Multiplier text never changes after lock. |
| Breakout | Flare Wash surface, 1px Flare border, `BREAKOUT` label in Flare, one pulse on arrival (see Motion) |
| Swapped out | 50% opacity, `SWAPPED OUT · WK 07` in `data`, Ash, not tappable, receipt still reachable |
| Ineligible | Ash name, reason in words (`Turned 21 on 02 Sep`), not tappable |
| Focus | 2px Flare outline, 2px offset |


No shirt icons. No player cutout photos on pitches. No price.

### Swap Control

One swap a week. The constraint is the design.

| State | Treatment |
|---|---|
| Available | Secondary button `Use swap`, helper in `data`: `1 SWAP LEFT · RESETS MON 00:00` |
| Confirming | Bottom sheet: outgoing pick, incoming pick, new multiplier in `data-lg`, warning line in Inter 400: `The old receipt stays. The new one starts now.` Primary `Lock swap` |
| Used | Button replaced by `data`: `SWAP USED · NEXT MON 00:00`, Ash |

### League Row

Row, not card. 56px min height. Hairline between rows.

Columns: rank (`data-lg`, Plex Mono, three digits `018`), name (Inter 500), score (`data`, right aligned, tabular), delta (`▲ 12` Match Green or `▼ 3` Offside Red, `–` Ash for no change).

| State | Treatment |
|---|---|
| Default | Transparent |
| You | Flare Wash surface, 2px Flare left rule, metadata in Newsprint |
| Moved | Rank change animation (see Motion) |
| Pressed | Floodlight surface |

### Timestamp Block

One fixed format, everywhere, no variants.

```
LOCKED
14 SEP 2026

19:42 BST
```

Plex Mono 500, 11px, uppercase, 0.06em tracking, 1.35 line height. Inline form: `LOCKED 14 SEP 2026 · 19:42 BST`. The middle dot appears here and inside receipts only. Store UTC. Render in the viewer's zone with its real abbreviation (never hardcode `BST`, it flips to `GMT` in October).

### Chip

Radius 999px, height 24px, padding 0 10px, `label` style. Only for position, eligibility, status, league division. Max one chip per card. Default: Concrete fill, Newsprint text. Active: Flare fill, Turnstile Black text. Filter chips get a 44px tall invisible hit area.

### Input

Height 48px, 6px radius, Concrete fill, **1px Ash border** (4.64:1 on Concrete; `--card-edge` fails 3:1 for a control). Focus: 2px Flare outline, border unchanged. Error: 1px Offside Red border plus message below in Inter 400 14px Offside Red, starting with what went wrong: `League code not found. Check the six characters.`

### Empty state

Left aligned in its section, never an illustration.

```
No receipts yet.
Make a call before everyone agrees with you.
[ Back your five ]
```

---

## 5. Signature element: the Scout Receipt

This is the thing people screenshot. Everything else stays quiet so this can be loud.

### Anatomy

```

RALLYCADEMY                                    ●

SCOUT RECEIPT
─────────────────────────────────────────────

PLAYER            MALIK OKAFOR
DIVISION          02
PICK              04 / 05
MULTIPLIER        ×2.4 LOCKED

LOCKED
21 AUG 2026
19:42 BST

PICKED AT         202
CURRENT RANK      018
─────────────────────────────────────────────
YOU WERE 184 PLACES EARLY.

RECEIPT ID        RC-7A42-OKA
```

### Spec

| Property | Value |
|---|---|
| Surface | Ticket `#F1EFE7` |
| Text | Turnstile Black, IBM Plex Mono only (the wordmark is Archivo Black, 16px, tracking −0.02em) |
| Width | 100% up to 360px. At 320px viewport it is 288px and nothing truncates: long names wrap to a second line. |
| Padding | 24px sides, 32px top and bottom |
| Field labels | Plex Mono 400 11px, 0.06em tracking, Turnstile Black at full strength (no grey on paper) |
| Field values | Plex Mono 600 13px |

| Key line | Plex Mono 600 15px, uppercase, the only line allowed in Flare Ink |
| Dividers | 1px Turnstile Black at 100%, dashed `4px 3px` |
| Edges | Perforated top and bottom: CSS mask of 6px semicircles every 12px. 2px corner radius. |
| Verification dot | 10px solid Flare circle, top right. It sits on Ticket, so it gets a 1px Turnstile Black ring (Flare alone is 2.88:1 on paper). |
| Stamp | Optional circular stamp, Flare Ink, 64px, rotated −6°, max once per receipt, only when a breakout threshold hits |
| Receipt R | 20px at top left of shared images, flat bottom version (teeth only above 24px) |
| Texture | See Texture |

### Rules

1. **A receipt is immutable.** Once issued, its fields never change. Rank updates show on a separate "now" line or a new receipt, never by editing the old one. Proof that edits itself is not proof.
2. Existing `RL-` IDs stay valid forever. New receipts issue `RC-` IDs. Never reissue or rewrite an old ID after the rename.
3. The key line is always contextual and always true: `YOU WERE 184 PLACES EARLY.` / `12 PEOPLE IN YOUR LEAGUE MISSED HIM.` / `PICKED 43 DAYS BEFORE HIS FIRST START.` / `YOU HAD HIM BEFORE THE CALL-UP.` If there is nothing true to say yet, the line reads `CALL LOCKED. RESULT PENDING.`
4. The share image renders at 1080×1350, receipt centred on Turnstile Black with 1% grain, wordmark at the bottom. No other decoration.
5. The receipt never becomes a generic card style. Nothing else in the product uses Ticket fill, perforation or the dot.

### Receipt R logo

Geometric R, squared bowl, leg at about 38°, three rectangular receipt teeth on the bottom edge. Teeth show only at 24px and above. Favicon: flat bottom R, Turnstile Black on Flare, no border, no texture. Assets: `favicon-16.png`, `favicon-32.png`, `icon-192.png`, `icon-512.png` (teeth restored on 192 and 512). The logo never animates.

---

## 6. Motion

Motion shows consequence. Something moves because a pick locked, a rank moved or a result arrived. Nothing moves to entertain.

### Step 1: should it animate at all?

Decide by how often a person sees it. This decides before any curve or duration does.

| How often it's seen | Rule | Rallycademy examples |
|---|---|---|

| 100+ times a day | **Never animate** | Tab switches, list scroll, nav, chip filters, typing in search |
| Tens of times a day | **Cut hard.** Colour or border change only. | Pick Card hover, League Row press, player list |
| Occasional | Standard motion | Swap sheet, dropdowns, toasts, tooltips |
| Rare | Delight allowed (still no confetti) | Receipt creation, breakout, rank change on first view after results, onboarding |

**Keyboard actions never animate.** If a pick locks by Enter or Space, the receipt appears instantly, as in reduced motion. Detect with the `pointerType` of the last event; keyboard and programmatic triggers take the instant path.

### Tokens

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);   /* anything entering */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* anything moving on screen */
--ease-hover:  ease;                              /* hover only */
/* ease-in is banned for UI. Nothing in this repo uses it. */

--dur-press:    160ms;  /* 100 to 160 */
--dur-hover:    140ms;
--dur-tooltip:  150ms;  /* 125 to 200 */
--dur-dropdown: 200ms;  /* 150 to 250 */
--dur-sheet:    280ms;  /* modals and sheets, 200 to 500; exits use 200ms */
--dur-rank:     280ms;
--dur-moment:   400ms;  /* rare moments only, see below */
```

Standard UI stays under 300ms. Only the three rare moments may go past it, and none past 400ms.

### Hard rules

1. **Transform and opacity only.** Never width, height, top, left, margin, colour fills on large areas, filters or box shadow. Border colour changes are allowed as instant or 140ms state changes, not as animation.
2. **Interruptible, always.** Never block input during a transition. The data change commits first; motion only presents it. A second tap mid animation retargets from the current value, it never waits or restarts. Use CSS transitions (which retarget) or a library that animates from current value. Never chain `setTimeout`s that ignore new input.
3. **Gestures use springs.** The swap sheet's drag to dismiss follows the finger, then settles on a critically damped spring with no bounce. Every drag has a tap alternative (a close button), per WCAG 2.2 dragging rule.
4. **Nothing scales from 0.** Entering elements start at `scale(0.95)` and `opacity: 0` at most. The receipt stamp starts at 0.95.

5. **Buttons press** at `scale(0.97)` on `:active`, 160ms, `--ease-out`. That is the only press motion.
6. **Reduced motion, always.** Every animation ships with its reduced version in the same PR. No exceptions, no "later".

### The rare moments (the only choreographed motion)

| Moment | Sequence | Total | Why it may pass 300ms |
|---|---|---|---|
| **Receipt creation** | Card compresses to `scale(0.985)`, 100ms `--ease-out`, and returns → receipt enters from `translateY(20px) scale(0.95)`, opacity 0 to 1, 240ms `--ease-out` → timestamp fades in at +60ms → verification dot appears (opacity only, one step) | 400ms | Happens five times a week plus one swap. Finality is the reward. |
| **Breakout** | One pulse on the Pick Card: 1 → 1.015 → 1, `--ease-in-out`. Border switches to Flare at the start. Plays once on first view, never loops. | 360ms | A handful of times a season. |
| **Rank change** | Old rank fades out 80ms → row moves vertically 200ms `--ease-in-out` → new rank fades in. Only on the first view after results land; later visits show the final order instantly. Max three rows animate; the rest swap instantly. | 280ms | Weekly. Stays under 300ms anyway. |

The page stays usable throughout each moment. A user can scroll, tap Share or pick again while the receipt is still arriving.

### Standard motion

| Thing | Enter | Exit |
|---|---|---|
| Swap sheet, modal | `translateY(100%)` to 0, 280ms `--ease-out` | 200ms `--ease-out` |
| Dropdown, menu | opacity 0 and `scale(0.95)` from its trigger, 200ms `--ease-out` | 150ms |
| Tooltip | opacity only, 150ms | instant |
| Toast | `translateY(8px)` and opacity, 200ms `--ease-out` | 150ms |
| Hover (desktop, `@media (hover: hover)`) | App: border brightens, 140ms `ease`. Landing only: add `translateY(-2px)`. | same |

The lift on Pick Card hover is gone from the app. The pick list is a tens of times a day surface, so it gets a border change, not movement.

### Never animated

Grain. Logo. Wordmark. Display headlines. Hairlines. Navigation. Background photos. Tab changes. Values without a real underlying change. No count up numbers. No scroll triggered fade up on sections. No confetti, particles or glow. No hand rolled effect libraries: if an effect is ever needed, take a tuned one from the reference repos and strip it to transform and opacity.

### Reduced motion (`prefers-reduced-motion: reduce`) and keyboard triggers

| Normal | Reduced |

|---|---|
| Receipt creation | Receipt appears instantly. Timestamp and dot present from the first frame. |
| Card compression, button press | None |
| Rank change | Final order shown instantly. Rank text crossfades 120ms (opacity is allowed). |
| Breakout pulse | Border turns Flare, no scale |
| Sheet | Opacity fade, 150ms, no travel |
| Hover | Border only |

No information may depend on animation. The locked state, rank and breakout all read correctly on a static screenshot.

---

## 7. Texture

Texture says "printed". It never says "distressed".

| Surface | Texture | Opacity |
|---|---|---|
| Landing and campaign surfaces | Monochrome fine noise | 5% (4 to 7) |
| Scout Receipt | Fine grain 4% plus paper fibre 2% | total under 9% |
| Large Flare graphics (landing only) | Uneven print density | 4% (3 to 6) |
| App UI (lists, cards, forms, any body text) | **None** | 0% |

Implementation: a prerendered 256×256 PNG tile as a `background-image` with `mix-blend-mode: multiply` on paper and `screen` on dark. Never a live SVG `feTurbulence` filter (it repaints on scroll and kills low end Android). Never animated. Removed entirely under `prefers-contrast: more`. After adding texture, recheck contrast against the darkest pixel of the tile on paper and the lightest on dark: pairs must still pass.

Banned: scratches, grunge brushes, torn paper, coffee rings, curled edges, dirty stadium overlays, film burn.

---

## 8. Accessibility floor (WCAG 2.2 AA, blocking)

| Check | Pass condition |

|---|---|
| Body text contrast | ≥ 4.5:1. Use only the approved pairings table. |
| Large text (≥ 24px, or ≥ 18.66px bold) | ≥ 3:1 |
| UI boundaries, icons, focus rings | ≥ 3:1 against the adjacent colour |
| Focus | Visible on every interactive element. 2px Flare outline with 2px offset on dark. 2px Turnstile Black on paper. Never `outline: none` without a replacement. Use `:focus-visible`. |
| Keyboard | Everything reachable and operable by keyboard, in visual order. Sheets trap focus while open and return it to the trigger on close. Focused elements are never hidden under the sticky nav or an open sheet. |
| Touch targets | 44×44pt minimum (WCAG 2.2 asks for 24px; we hold 44). House buttons are 48px. Small chips and icons get invisible padding to 44. |
| 320px reflow | Nothing clipped, nothing scrolling sideways, at 320px width and at 200% text zoom. Display type sized by longest word (see Type rule 2). |
| Colour independence | Every semantic colour pairs with a glyph or word. |
| Motion | Reduced motion table honoured in full. Keyboard triggered actions never animate. |
| Dragging | Every drag (sheet dismiss) has a single tap alternative. |
| Destructive actions | Confirmation required: using the weekly swap, leaving a league, deleting a league, removing a member. The confirm button names the action (`Lock swap`, `Leave league`), never `OK`. |
| Screen readers | Receipt renders as real text, not an image, with `aria-label` summary: "Scout receipt. Malik Okafor, pick 4 of 5, locked 21 August 2026 at 19:42 BST, you were 184 places early." Rank changes announce via a polite live region, once per update, not per row. |
| Language | `lang="en-GB"` |

### Tailwind v4 note

Tailwind v4 puts utilities in native cascade layers. **Unlayered CSS beats every layer regardless of specificity.** So the AA overrides live in `src/styles/aa.css`, imported after Tailwind, outside any `@layer`:

```css
/* src/styles/aa.css: unlayered on purpose. Do not wrap in @layer. */
.bg-flare, .bg-flare * { color: #0B0B0A; }
.surface-paper .text-flare { color: #B23415; }
.surface-3 .text-ash, .bg-flare-wash .text-ash { color: #B4B2AA; }
:where(.surface-paper) :focus-visible { outline: 2px solid #0B0B0A; outline-offset: 2px; }

## 9. Rallycademy anti-patterns

The owner's guide names three AI default looks to avoid: cream `#F4F1EA` with a serif and terracotta; near black with one acid accent; broadsheet hairlines with zero radius and dense columns. The brand brief pins us next door to the last two. That is fine, because the brand chose them for a reason. But it means every screen must prove it is ours. Four things separate Rallycademy from those defaults:

1. **Flare is warm terrace orange, not acid.** Never pair it with a second bright accent, and never swap it for lime, cyan or neon.
2. **Radius is 8 and 6, not zero.** Only the receipt is near square, because it is paper.
3. **Space is wide, columns are single.** No dense newspaper columns. One column in the app, generous sections on landing.
4. **Two owned objects carry the identity:** the Scout Receipt and edge of the game photography. A screen with neither must be quiet enough that it cannot be mistaken for a style.

### It must not look like fantasy football

| Don't | Do |
|---|---|
| Green pitch with players in a formation | A vertical list of five picks |
| Shirt icons, kit renders, player cutouts | Names in type. Photos only on landing, from the edge of the game. |
| Captain armbands, "C" badges, chips called "wildcard" | One swap a week, stated plainly |
| Prices (£7.5m), budgets, ownership % | Multiplier and rank in mono |
| Words: squad, manager, transfer, ownership, portfolio, asset, investment | Words: pick, five, receipt, call, breakout, league |
| Premier League purple, fantasy green | Flare, and nothing else |

### It must not look like betting

No odds chips, no casino green, no gold, no coins, no money imagery, no countdown urgency banners, no "boost" language. The multiplier is a record of timing, never a payout.

### It must not look like the generic dark template

| Generic default | Rallycademy rule |
|---|---|
| Mono eyebrow label above every heading | Mono only on evidence. Headings stand alone. |
| Middle dots joining meta strings everywhere | Middle dot only inside timestamps and receipts |
| 01 / 02 / 03 numerals on any list | Numerals only on true sequences: pick numbers, programme sections on landing, the three step flow |
| Arrow appended to buttons and links | No arrows in labels |

| Paper coloured page backgrounds | Ticket is an object you hold (the receipt), never a page |
| Flare sprinkled on single words in headlines | Flare fills one thing per screen: the CTA or the active state |
| Identical rounded cards in a grid | Hairline rows. Cards only for actionable objects. |
| Gradients, glass blur, glow halos | Flat surfaces stepped by the ramp |
| Emoji and sparkle icons | 1.5px stroke line icons, square caps, 20px, from one set (Lucide), used sparingly |

---

## 10. Landing page

The landing page has one job: get someone to lock their first pick. It leads straight into the app. `Back your five` opens the pick flow with no email wall before the first pick. Account creation happens at lock, because the receipt needs an owner.

### What the page must have (the six patterns strong sites share)

| Pattern | How Rallycademy does it |
|---|---|
| One dominant visual idea | The Scout Receipt over one football photograph. Everything else supports it. |
| Specific things, not broad promises | Named players, real dates, real ranks: `Picked 43 days before his first start.` Never "discover the next big thing". |
| Clear, labelled actions where they belong | `Back your five` in the hero and the close. `Start a league` beside the league section. Nowhere else. |
| Information next to the image | Every receipt or screen has its one line caption beside it, not in a separate block. |
| Big and small on purpose | Archivo Black at hero size against 11px mono timestamps. No middle sizes on landing. |
| Real product evidence | Live components or production screenshots only (see below). |

### Structure (a match programme, not a SaaS page)

| Section | Content |
|---|---|
| **Hero** | One photograph from the edge of the game (tunnel, academy pitch under floodlights, boots on wet turf). Headline in `hero` style fills 30 to 50% of the first viewport. One line of Inter 400 below. Primary `Back your five`, secondary `Start a league`. One real Scout Receipt, flat, cropped by the right viewport edge. |
| **01** | Headline: `Pick five players under 21.` Beside it, a live Pick Card list with real current players. |
| **02** | Headline: `Your multiplier locks the second you pick.` The receipt creation plays once as the section enters view. Reduced motion shows the finished receipt. |
| **03** | Headline: `Last season, 12 people called Okafor before his debut.` (real stat only). A stack of real receipts, each different, each with its true key line. |
| **04** | Headline: `A table for you and your mates. One swap a week.` A real league table, live component or production screenshot. |

| **Close** | Wordmark at `min(11vw, 120px)`. `Make a call before everyone agrees with you.` Primary CTA. |

Sections separated by hairlines and 96 to 128px of space. Numerals only because this is a true sequence (pick, lock, prove, compete). Numerals in Archivo Black at `h1` size, cropped by the left edge.

Headlines in the example copy vary on purpose: a command, a statement, a stat, a description. Replace the words, keep the variety.

### Product evidence rule

Every product image is a live component or a production screenshot at native resolution. No drawn mockups. No invented numbers. If the real data does not exist yet, the section waits.

### Audit: the six AI premium tells

A draft with any of these is rejected, not polished.

| Tell | What it looks like here | Rule |
|---|---|---|
| **1. Random decoration posing as editorial** | Tilted phone with the app on it. Sparkles by the headline. A floating ball. Flare scribbles. A rotated receipt for "energy". | Receipts sit flat. The only rotated thing is the stamp, and only on a breakout receipt. No phones, no sparkles, no footballs. |
| **2. One headline formula repeated every section** | `The call.` `The lock.` `The proof.` `The league.` Or every heading as "Verb your noun." | No two section headlines share a grammar pattern. Read them in a column before merge. |
| **3. Copy that sounds like the category but says nothing** | "Spot tomorrow's stars today." "The ultimate scouting experience." "Where football knowledge pays off." | Every line must contain a fact a fantasy app could not say: a name, a date, a number, a rule of the game. Delete any line that survives swapping "Rallycademy" for a rival. |
| **4. The same generated image reused** | The hero photo cropped again for section 04. The same receipt in the hero and the proof stack. | One photo, used once. Every receipt on the page is a different real receipt. No AI generated photography at all. |
| **5. Illegible product previews** | A league table shrunk to 40% so the text is a grey smear. | Previews render at 75% of native size or larger. Smallest rendered text on any preview is 11px. Timestamps must be readable on a 375px phone. |
| **6. Invented proof** | Fake testimonials, stock avatars, "10,000+ scouts", receipts for players nobody picked. | **Deleted, not shipped.** Proof is real receipts with consent (or first initial only) and real counts pulled from the database. No count up animations on any number. |

### Copy

Sharp, dry, assured. Short sentences. The receipt carries the punchline.

- CTA: `Back your five`
- Secondary: `Start a league`
- Win: `You called it. M. Okafor is up 184 places this week.`
- Never: "unleash", "level up", "the ultimate", "game changer", "next big thing", exclamation marks, commentator voice.


---

## 11. Review checklist

Run before merging any UI PR. Any "no" blocks the merge.

- [ ] Every colour is a token from section 1. No raw hex, no alpha text.
- [ ] Every text pairing is in the approved table.
- [ ] Flare fills carry Turnstile Black text. No Flare on Ticket.
- [ ] One primary button on the screen.
- [ ] Archivo Black ≥ 28px. Mono only on evidence.
- [ ] Spacing uses the scale. Radius is 8, 6, 999 or receipt 2.
- [ ] Every component shows all its states.
- [ ] Works at 320px and 200% zoom with nothing clipped.
- [ ] Targets ≥ 44pt. Focus visible on dark and on paper.
- [ ] Motion passed the frequency test first. Only transform and opacity. No `ease-in`. Standard UI under 300ms; only the three rare moments go past it.
- [ ] Input never blocked mid transition. Keyboard actions do not animate. Reduced motion version shipped in the same PR.
- [ ] Destructive actions confirm. Every drag has a tap alternative.
- [ ] Landing: none of the six AI premium tells. No invented proof anywhere.
- [ ] No texture on app UI.
- [ ] No banned words: squad, manager, transfer, ownership, portfolio, asset, investment.
- [ ] Nothing on screen that a fantasy football or betting app would also show.
- [ ] Would this screenshot still feel like evidence? If not, remove something.
