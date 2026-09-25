# design.md: Rallycademy

Read this before you build or change any screen. Every rule here is testable. If a screen breaks a rule, the screen is wrong, not the rule. To change a rule, change this file in the same PR.

**The one rule: proof over decoration.** Before you add a graphic, badge, animation or football reference, ask: does it make the call feel more like evidence? If not, cut it.

Rallycademy is a free weekly U21 scouting game. You pick five young players before they break out. Your early call multiplier locks at pick time. You get a Scout Receipt as proof. It must never look or read like fantasy football.

**Primary theme: light.** Rallycademy looks like printed matchday ephemera: board stock, ticket card, black ink, one screen printed accent. Dark exists as an alternate theme (section 11). Build light first. Every screen must also pass in dark.

---

## 1. Colour (light, primary)

### The idea: four printed materials

| Material | What it is | Token |
|---|---|---|
| **Stock** | The board everything is printed on. The page. | `--bg` |
| **Ticket** | Printed card stock. Objects you can act on, and every receipt. | `--surface-1` |
| **Ink** | Turnstile Black. All type, all rules, the one inverted band. | `--ink` |
| **Flare** | Screen print ink. The one action per screen. | `--flare` |

Every screen is Stock, with Ticket objects on it, printed in Ink, with at most one Flare fill. If a screen needs a fifth material, it is wrong.

### Core six

| Token | Name | Hex | Role |
|---|---|---|---|
| `--ink` | Turnstile Black | `#0B0B0A` | All primary text. Rules. Focus ring. The Stub band. Text on Flare. |
| `--paper` | Ticket | `#F1EFE7` | Cards and receipts. Text on ink. |
| `--flare` | Flare | `#FF4D22` | Primary action fill, verification dot, breakout marks, large display accents. Never text on light. |
| `--flare-ink` | Flare Ink | `#B23415` | Flare as text or icon on Stock, Ticket, Proof and Flare Tint. Never on Terrace. |
| `--graphite` | Graphite | `#4A4944` | Secondary text. |
| `--pencil` | Pencil | `#5C5B55` | Metadata, helper text, input borders, disabled labels. |

### Light surface ramp

| Token | Name | Hex | Use |
|---|---|---|---|
| `--bg` | Stock | `#E5E2D8` | Page background in the app. Greyer and darker than Ticket, so Ticket objects read as objects. |
| `--surface-1` | Ticket | `#F1EFE7` | Cards, rows grouped in a panel, receipts |
| `--surface-2` | Proof | `#F8F7F2` | Overlays: sheets, menus, modals, input fill. Lightest surface. Never pure white. |
| `--well` | Terrace | `#D9D6CA` | Insets, selected rows, pressed states, disabled button fill, default chip fill |
| `--flare-tint` | Flare Tint | `#FFE0D4` | Accent surface: breakout card, your row in a league. Max one region per screen. |
| `--stub` | Turnstile Black | `#0B0B0A` | The Stub: the app's top band (see components). The only inverted surface in the app. |
| `--stub-pressed` | Floodlight Grey | `#252522` | Pressed and active states inside the Stub |
| `--hairline` | Hairline | `rgba(11,11,10,0.14)` | Dividers. Decorative only, never a control boundary. Composites to about `#C6C4BB` on Stock. |
| `--card-edge` | Card Edge | `rgba(11,11,10,0.12)` | Card borders |
| `--rule` | Ink Rule | `#0B0B0A` at 100% | Section rules on landing, receipt dividers, table header rule. 1px. |

Stock to Ticket is 1.13:1. That is deliberate and too low to define an edge, so every Ticket object carries `--card-edge` (cards) or a shadow plus perforation (receipts). A Ticket object with no edge fails review.

### Depth (light)

On light, shadows read. The guide's three presets, tinted with ink rather than neutral grey:

| Preset | Value | Use |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(11,11,10,0.08)` | A Pick Card while dragging or reordering only |
| `shadow-md` | `0 1px 2px rgba(11,11,10,0.06), 0 4px 12px rgba(11,11,10,0.08)` | Scout Receipt, dropdowns, menus |
| `shadow-lg` | `0 2px 4px rgba(11,11,10,0.06), 0 12px 32px rgba(11,11,10,0.12), 0 32px 64px rgba(11,11,10,0.10)` | Sheets, modals, the landing hero receipt |

One strength per state. Never mix with default Tailwind shadows (`shadow`, `shadow-xl` are banned). A shadow never replaces a border: every card keeps `--card-edge`. No hard offset shadows (`4px 4px 0 #000`), ever.

### Semantic (light)

| State | Name | Hex | On Stock / Ticket / Terrace |
|---|---|---|---|
| Breakout / up | Match Green Deep | `#17693B` | 5.19 / 5.85 / 4.62 |
| Drop / down | Offside Crimson | `#B01E3A` | 5.24 / 5.90 / 4.66 |
| Pending | Amber Deep | `#7A5200` | 5.34 / 6.01 / 4.75 |
| Info | Sky Deep | `#1A52A8` | 5.75 / 6.48 / 5.12 |

Offside Crimson is a blue red, far from Flare Ink's orange red, so a drop never reads as the brand accent. Semantic colour always pairs with a glyph or word (`▲ 12`, `▼ 3`, `UP 184 PLACES`). Colour alone never carries meaning. Match Green is never a brand colour. On receipts, semantic colour is not used at all: direction is words in ink.

### Approved pairings, light (measured)

AA floor: 4.5:1 for text, 3:1 for large text, controls and focus.

| Foreground | Background | Ratio | Allowed for |
|---|---|---|---|
| Ink | Stock / Ticket / Proof / Terrace / Flare Tint | 15.19 / 17.10 / 18.36 / 13.52 / 15.81 | Everything |
| Graphite | Stock / Ticket / Proof / Terrace / Flare Tint | 6.96 / 7.84 / 8.41 / 6.20 / 7.25 | Secondary text |
| Pencil | Stock / Ticket / Proof / Terrace / Flare Tint | 5.26 / 5.92 / 6.35 / 4.68 / 5.47 | Metadata, helper text, input borders |
| Flare Ink | Stock / Ticket / Proof / Flare Tint | 4.77 / 5.37 / 5.77 / 4.97 | Accent text, breakout labels, receipt key line |
| Ink | Flare | 5.94 | Primary button label |
| Ticket | Ink (Stub) | 17.10 | Stub text, inverted chips |
| Flare | Ink (Stub) / Floodlight Grey | 5.94 / 4.64 | Active tab mark in the Stub, focus ring in the Stub |
| Ink border | Stock | 15.19 | Primary and secondary button boundary |

### Banned pairings, light (these fail, do not relitigate)

| Foreground | Background | Ratio | Why banned |
|---|---|---|---|
| Flare (text, icon, border, focus) | Stock / Ticket / Proof / Terrace | 2.56 / 2.88 / 3.09 / 2.28 | Fails 4.5 for text and 3:1 for controls (Proof passes 3:1 by 0.09, too thin to rely on). Use Flare Ink for text, ink for boundaries. |
| Flare Ink | Terrace | 4.25 | Accent text inside a selected or inset area switches to ink. |
| Ticket or white | Flare | 2.88 / 3.31 | Flare fills carry ink text, always. |
| Newsprint, Ash (dark theme greys) | any light surface | ≤ 3.26 | Dark theme tokens never leak into light. |
| Any text at reduced opacity (`opacity: 0.5`, `text-ink/60`) | anything | unaudited | Every text colour is a named token. Swapped out and disabled states use Pencil, never opacity. |

### The action treatment on light (decided)

**Primary action: Flare fill, ink label, 1px ink border.**

Why this and not an ink fill with Ticket text:

1. Flare is the brand's action colour. An ink button makes Flare decoration, and the brand says Flare marks the one thing to do.
2. The label passes on its own (ink on Flare, 5.94:1).
3. Flare against Stock is 2.56:1, so the fill alone does not define the control for low vision and colour blind users. The 1px ink border does (15.19:1). With the border, a user who cannot see orange still sees a bordered, labelled control.
4. The border also reads as print registration: ink line, colour fill. That is the ticket look, and it keeps the button from floating like a SaaS pill.

Ink fill with Ticket text is the **Inverse** button, used only inside the Stub, on landing's single inverted band, and for confirming a destructive action (where Flare would read as celebration).

---

## 2. Type

Three voices. One makes statements. One runs the product. One records evidence.

| Role | Face | Weights | Use |
|---|---|---|---|
| Display | Archivo Black | 400 | Wordmark, hero, big ranks and multipliers, moment screens, sequence numerals |
| UI | Inter | 400, 500, 600, 700 | Everything you read or tap |
| Evidence | IBM Plex Mono | 400, 500, 600 | Timestamps, receipt fields, ranks, deltas, IDs, fixtures, multipliers |

Load with `font-display: swap`. Self host the woff2 files. Mono uses `font-variant-numeric: tabular-nums` everywhere, so ranks and deltas never jitter.

On light, heavy type is the identity. Archivo Black in ink on Stock is the loudest thing on most screens. Let it be.

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
8. Display type is ink. Flare display type is allowed only at `hero` or `h1` size, on landing, and never for a whole headline: at most one line of a hero (large text on Stock at 2.56:1 fails even 3:1, so a Flare display line needs an ink duplicate for meaning, or it is decoration and must be `aria-hidden`). Default: don't.

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

Layout comes from rules first, cards second. A list of players or league rows is rows split by `--hairline` inside one Ticket panel, not a stack of boxes. Use a separate card only when the thing is a discrete object you can act on (a pick, a receipt, a league invite).

Left align everything. Centre alignment only on single line moment screens (win moment, empty state).

### Radius

| Thing | Radius |
|---|---|
| Card, panel, sheet, modal | 8px |
| Button, input | 6px |
| Chip | 999px |
| Scout Receipt | 2px, plus perforated top and bottom edges |
| Avatar (league) | 50% |
| The Stub | 0 |

No 12px, 16px or 24px radius anywhere.

---

## 4. Core components

Each state below is required. A component missing a state fails review. Values are light theme; dark values are in section 11.

### The Stub

The app's top band, like the black printed strip on a match ticket. It is the only inverted surface in the app and it carries the brand on every screen, so nothing else needs to.

| Property | Value |
|---|---|
| Height | 56px plus safe area inset |
| Fill | Turnstile Black |
| Left | Receipt R, 24px, Ticket (teeth show at 24px) |
| Centre or left of centre | Current screen title, Inter 600 16px, Ticket |
| Right | Game week in `data`, Ticket: `WK 07 · LOCKS FRI 19:00` (shortens to `WK 07` under 360px) |
| Bottom edge | None. Ink meets Stock directly. |
| Pressed item | Floodlight Grey fill |
| Focus | 2px Flare outline, 2px offset (5.94:1 on ink) |

The Stub does not scroll away and does not animate. It never holds a Flare filled button.

### Button

| Variant | Default | Hover (desktop) | Pressed | Focus | Disabled | Loading |
|---|---|---|---|---|---|---|
| **Primary** | Flare fill, 1px ink border, ink Inter 600 16px | fill `#FF6340` | `scale(0.97)`, 160ms ease out | 2px ink outline, 2px offset | Terrace fill, 1px `--card-edge` border, Pencil text, `aria-disabled` | Five Mark loader in ink, label kept for width |
| **Secondary** | Transparent, 1px ink border, ink text | fill `rgba(11,11,10,0.06)` | Terrace fill | 2px ink outline, 2px offset | `--card-edge` border, Pencil text | same |
| **Ghost** | Graphite text, no border | ink text | ink text, underline | 2px ink outline | Pencil text | none |
| **Inverse** | Ink fill, Ticket text | Floodlight Grey fill | `scale(0.97)`, 160ms | 2px ink outline, 2px offset (on Stock); 2px Flare (in Stub) | Terrace fill, Pencil text | same |

Height 48px minimum (44px is the floor, 48px is the house size). Horizontal padding 20px. Full width on mobile for the one primary action per screen. **One primary button per screen.** No arrows appended to labels. No pill buttons. Borders are 1px; focus is 2px; nothing is thicker.

Label copy says what happens: `Back your five`, `Lock pick`, `Use swap`, `Start a league`, `Share receipt`.

### Pick Card

The player as a pickable object. Ticket surface on Stock, 8px radius, `--card-edge` border, 16px padding.

Content: name (Inter 600 17px, ink), club and position (Inter 400 14px, Graphite), one chip max (position or eligibility), current multiplier (`data-lg`, ink), form line (`data`, Pencil).

| State | Treatment |
|---|---|
| Available | As above |
| Hover (desktop) | Border to `rgba(11,11,10,0.32)`, 140ms `ease`. No lift in the app (see Motion). |
| Selected (not yet locked) | Border 1px ink, check glyph top right in ink, `aria-pressed="true"` |
| Locked | Ticket surface, Flare verification dot with 1px ink ring top right, multiplier in ink with `LOCKED ×2.4` in `data`. Multiplier text never changes after lock. |
| Breakout | Flare Tint surface, 1px Flare Ink border, `BREAKOUT` label in Flare Ink, one pulse on arrival (see Motion) |
| Swapped out | Stock surface (the card sinks into the page), dashed `--card-edge` border, name and metadata in Pencil, `SWAPPED OUT · WK 07` in `data`. Not tappable. Receipt still reachable. No opacity. |
| Ineligible | Name in Pencil, reason in words (`Turned 21 on 02 Sep`), not tappable |
| Dragging | `shadow-sm` |
| Focus | 2px ink outline, 2px offset |

No shirt icons. No player cutout photos on pitches. No price.

### Swap Control

One swap a week. The constraint is the design.

| State | Treatment |
|---|---|
| Available | Secondary button `Use swap`, helper in `data`, Pencil: `1 SWAP LEFT · RESETS MON 00:00` |
| Confirming | Sheet on Proof, `shadow-lg`: outgoing pick, incoming pick, new multiplier in `data-lg`, warning line in Inter 400: `The old receipt stays. The new one starts now.` Action: Inverse button `Lock swap` (a swap is destructive, so no Flare) |
| Used | Button replaced by `data`, Pencil: `SWAP USED · NEXT MON 00:00` |

### League Row

Row, not card. Rows sit inside one Ticket panel. 56px min height. Hairline between rows. A 1px ink rule under the column header.

Columns: rank (`data-lg`, ink, three digits `018`), name (Inter 500, ink), score (`data`, ink, right aligned, tabular), delta (`▲ 12` Match Green Deep or `▼ 3` Offside Crimson, `–` Pencil for no change).

| State | Treatment |
|---|---|
| Default | Ticket |
| You | Flare Tint surface, 2px Flare left rule, `YOU` label in `label` style, metadata in Graphite. The word carries it; the colour supports it. |
| Moved | Rank change animation (see Motion) |
| Pressed | Terrace surface. Any Flare Ink text in the row switches to ink. |

### Timestamp Block

One fixed format, everywhere, no variants.

```
LOCKED
14 SEP 2026
19:42 BST
```

Plex Mono 500, 11px, uppercase, 0.06em tracking, 1.35 line height, ink. Inline form: `LOCKED 14 SEP 2026 · 19:42 BST`. The middle dot appears here and inside receipts only. Store UTC. Render in the viewer's zone with its real abbreviation (never hardcode `BST`, it flips to `GMT` in October).

### Chip

Radius 999px, height 24px, padding 0 10px, `label` style. Only for position, eligibility, status, league division. Max one chip per card. Default: Terrace fill, Graphite text (6.20). Active: ink fill, Ticket text (17.10). Chips never use Flare; Flare is for the one action. Filter chips get a 44px tall invisible hit area.

### Input

Height 48px, 6px radius, Proof fill, **1px Pencil border** (5.26:1 against Stock, 6.35:1 against the fill; `--card-edge` fails 3:1 for a control). Focus: 2px ink outline, 2px offset, border unchanged. Error: 1px Offside Crimson border plus message below in Inter 400 14px Offside Crimson, starting with what went wrong: `League code not found. Check the six characters.`

### Empty state

Left aligned in its section, on Stock, never an illustration.

```
No receipts yet.
Make a call before everyone agrees with you.
[ Back your five ]
```

---

## 5. Signature element: the Scout Receipt

This is the thing people screenshot. Everything else stays quiet so this can be loud. The receipt is identical in both themes: Ticket paper, ink type. It never inverts.

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
| Separation on light | Sits on Stock with `shadow-md` plus the perforated edges. Never placed on a Ticket panel (Ticket on Ticket loses the object). |
| Text | Turnstile Black, IBM Plex Mono only (the wordmark is Archivo Black, 16px, tracking −0.02em) |
| Width | 100% up to 360px. At 320px viewport it is 288px and nothing truncates: long names wrap to a second line. |
| Padding | 24px sides, 32px top and bottom |
| Field labels | Plex Mono 400 11px, 0.06em tracking, ink at full strength (no grey on the receipt) |
| Field values | Plex Mono 600 13px |
| Key line | Plex Mono 600 15px, uppercase, the only line allowed in Flare Ink |
| Dividers | 1px ink at 100%, dashed `4px 3px` |
| Edges | Perforated top and bottom: CSS mask of 6px semicircles every 12px. 2px corner radius. |
| Verification dot | 10px solid Flare circle, top right, 1px ink ring (Flare alone is 2.88:1 on paper) |
| Stamp | Optional circular stamp, Flare Ink, 64px, rotated −6°, max once per receipt, only when a breakout threshold hits |
| Receipt R | 20px at top left of shared images, flat bottom version (teeth only above 24px) |
| Texture | See Texture |

### Rules

1. **A receipt is immutable.** Once issued, its fields never change. Rank updates show on a separate "now" line or a new receipt, never by editing the old one. Proof that edits itself is not proof.
2. Existing `RL-` IDs stay valid forever. New receipts issue `RC-` IDs. Never reissue or rewrite an old ID after the rename.
3. The key line is always contextual and always true: `YOU WERE 184 PLACES EARLY.` / `12 PEOPLE IN YOUR LEAGUE MISSED HIM.` / `PICKED 43 DAYS BEFORE HIS FIRST START.` / `YOU HAD HIM BEFORE THE CALL-UP.` If there is nothing true to say yet, the line reads `CALL LOCKED. RESULT PENDING.`
4. The share image renders at 1080×1350: receipt centred on Stock with 5% grain and `shadow-md`, wordmark in ink at the bottom. No other decoration. A dark share variant (receipt on Turnstile Black) is available from the share sheet.
5. The receipt never becomes a generic card style. Nothing else in the product uses perforation, the dot or the stamp.

### Receipt R logo

Geometric R, squared bowl, leg at about 38°, three rectangular receipt teeth on the bottom edge. Teeth show only at 24px and above. Favicon: flat bottom R, Turnstile Black on Flare, no border, no texture. Assets: `favicon-16.png`, `favicon-32.png`, `icon-192.png`, `icon-512.png` (teeth restored on 192 and 512). In the app it appears in Ticket inside the Stub, and in ink on Stock elsewhere. The logo never animates.

---

## 6. Motion

Motion shows consequence. Something moves because a pick locked, a rank moved or a result arrived. Nothing moves to entertain. Motion is identical in both themes.

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
| **Breakout** | One pulse on the Pick Card: 1 → 1.015 → 1, `--ease-in-out`. Border switches to Flare Ink (light) or Flare (dark) at the start. Plays once on first view, never loops. | 360ms | A handful of times a season. |
| **Rank change** | Old rank fades out 80ms → row moves vertically 200ms `--ease-in-out` → new rank fades in. Only on the first view after results land; later visits show the final order instantly. Max three rows animate; the rest swap instantly. | 280ms | Weekly. Stays under 300ms anyway. |

The page stays usable throughout each moment. A user can scroll, tap Share or pick again while the receipt is still arriving.

### Standard motion

| Thing | Enter | Exit |
|---|---|---|
| Swap sheet, modal | `translateY(100%)` to 0, 280ms `--ease-out` | 200ms `--ease-out` |
| Dropdown, menu | opacity 0 and `scale(0.95)` from its trigger, 200ms `--ease-out` | 150ms |
| Tooltip | opacity only, 150ms | instant |
| Toast | `translateY(8px)` and opacity, 200ms `--ease-out` | 150ms |
| Hover (desktop, `@media (hover: hover)`) | App: border darkens, 140ms `ease`. Landing only: add `translateY(-2px)`. | same |

The pick list is a tens of times a day surface, so hover gets a border change, not movement.

### Never animated

Grain. Logo. Wordmark. The Stub. Display headlines. Rules and hairlines. Navigation. Background photos. Tab changes. Values without a real underlying change. No count up numbers. No scroll triggered fade up on sections. No confetti, particles or glow. No hand rolled effect libraries: if an effect is ever needed, take a tuned one from the reference repos and strip it to transform and opacity.

### Reduced motion (`prefers-reduced-motion: reduce`) and keyboard triggers

| Normal | Reduced |
|---|---|
| Receipt creation | Receipt appears instantly. Timestamp and dot present from the first frame. |
| Card compression, button press | None |
| Rank change | Final order shown instantly. Rank text crossfades 120ms (opacity is allowed). |
| Breakout pulse | Border changes colour, no scale |
| Sheet | Opacity fade, 150ms, no travel |
| Hover | Border only |

No information may depend on animation. The locked state, rank and breakout all read correctly on a static screenshot.

---

## 7. Texture

Texture says "printed". It never says "distressed". On light, grain is what separates board stock from a flat web background, so it matters more here than in dark. It still never touches app UI.

| Surface | Texture | Opacity |
|---|---|---|
| Landing and campaign Stock | Monochrome fine noise, `multiply` | 5% (4 to 7) |
| Scout Receipt (both themes) | Fine grain 4% plus paper fibre 2% | total under 9% |
| Share image Stock | Fine noise | 5% |
| Large Flare graphics (landing only) | Uneven print density | 4% (3 to 6) |
| App UI (Stock page, panels, cards, forms, any body text) | **None** | 0% |

Implementation: a prerendered 256×256 PNG tile as a `background-image`, `mix-blend-mode: multiply` on light and `screen` on dark. Never a live SVG `feTurbulence` filter (it repaints on scroll and kills low end Android). Never animated. Removed entirely under `prefers-contrast: more`. After adding texture, recheck every pairing against the darkest pixel of the tile on light surfaces: pairs must still pass. Pencil on grained Stock is the tightest pair; if it drops under 4.5, Pencil text moves to Graphite on that surface.

Banned: scratches, grunge brushes, torn paper, coffee rings, curled edges, dirty stadium overlays, film burn, halftone dots over type.

---

## 8. Accessibility floor (WCAG 2.2 AA, blocking)

| Check | Pass condition |
|---|---|
| Body text contrast | ≥ 4.5:1. Use only the approved pairings tables. |
| Large text (≥ 24px, or ≥ 18.66px bold) | ≥ 3:1 |
| UI boundaries, icons, focus rings | ≥ 3:1 against the adjacent colour |
| Focus | Visible on every interactive element. Light: 2px ink outline, 2px offset. Inside the Stub and in dark theme: 2px Flare outline. Never Flare on light surfaces. Never `outline: none` without a replacement. Use `:focus-visible`. |
| Keyboard | Everything reachable and operable by keyboard, in visual order. Sheets trap focus while open and return it to the trigger on close. Focused elements are never hidden under the Stub or an open sheet (`scroll-padding-top` equals Stub height). |
| Touch targets | 44×44pt minimum (WCAG 2.2 asks for 24px; we hold 44). House buttons are 48px. Small chips and icons get invisible padding to 44. |
| 320px reflow | Nothing clipped, nothing scrolling sideways, at 320px width and at 200% text zoom. Display type sized by longest word (see Type rule 2). The Stub's week label shortens under 360px. |
| Colour independence | Every semantic colour pairs with a glyph or word. The "You" row carries the word `YOU`. Selected picks carry a check glyph. |
| No opacity on text | Disabled and swapped out states use Pencil, never reduced opacity. |
| Motion | Reduced motion table honoured in full. Keyboard triggered actions never animate. |
| Dragging | Every drag (sheet dismiss) has a single tap alternative. |
| Destructive actions | Confirmation required: using the weekly swap, leaving a league, deleting a league, removing a member. The confirm button names the action (`Lock swap`, `Leave league`), never `OK`, and uses the Inverse variant. |
| Screen readers | Receipt renders as real text, not an image, with `aria-label` summary: "Scout receipt. Malik Okafor, pick 4 of 5, locked 21 August 2026 at 19:42 BST, you were 184 places early." Rank changes announce via a polite live region, once per update, not per row. |
| Language | `lang="en-GB"` |

### Tailwind v4 note

Tailwind v4 puts utilities in native cascade layers. **Unlayered CSS beats every layer regardless of specificity.** So the AA overrides live in `src/styles/aa.css`, imported after Tailwind, outside any `@layer`:

```css
/* src/styles/aa.css: unlayered on purpose. Do not wrap in @layer. */

/* Both themes */
.bg-flare, .bg-flare * { color: #0B0B0A; }

/* Light (default) */
:root:not([data-theme="dark"]) .text-flare { color: #B23415; }            /* Flare text never on light */
:root:not([data-theme="dark"]) .bg-well .text-flare,
:root:not([data-theme="dark"]) .bg-well .text-flare-ink { color: #0B0B0A; } /* Flare Ink fails on Terrace */
:root:not([data-theme="dark"]) :focus-visible { outline: 2px solid #0B0B0A; outline-offset: 2px; }
:root:not([data-theme="dark"]) .stub :focus-visible { outline-color: #FF4D22; }

/* Dark (alternate) */
[data-theme="dark"] .surface-3 .text-ash,
[data-theme="dark"] .bg-flare-wash .text-ash { color: #B4B2AA; }
[data-theme="dark"] :focus-visible { outline: 2px solid #FF4D22; outline-offset: 2px; }

/* The receipt never inverts */
.receipt :focus-visible { outline: 2px solid #0B0B0A; outline-offset: 2px; }
```

Tokens live in `@theme` in `src/styles/tokens.css`, with light values on `:root` and dark values on `[data-theme="dark"]`. Components use semantic token names (`bg-bg`, `bg-surface-1`, `text-ink`), never theme specific ones, so one component serves both themes. Nobody writes a raw hex in a component. Lint for `#[0-9a-fA-F]{3,6}` outside the token and AA files.

---

## 9. Rallycademy anti-patterns

### The trap light walks into

The owner's guide names three AI default looks: cream `#F4F1EA` with a serif and terracotta; near black with one acid accent; broadsheet hairlines with zero radius and dense columns. Going light moves us off the second and straight toward the first. Ticket `#F1EFE7` is almost the same cream, and Flare sits in the orange family. So every light screen must prove it is not that look:

1. **No serif, anywhere.** The grotesk plus mono is half the identity.
2. **The page is Stock, not cream.** `#E5E2D8` is greyer and darker. Ticket appears only as objects on it. A full Ticket page background fails review.
3. **Flare is saturated screen print ink, not muted clay.** Never soften it toward `#D97757`. Never use a Flare tint as a page or section background (Flare Tint is for one region per screen).
4. **Ink is heavy.** Archivo Black at size, the Stub band, ink rules, ink bordered buttons. If a screen looks soft and pale, it is off brand.
5. **Radius is 8 and 6, not zero,** and space is wide in one column. That keeps us off the broadsheet look too.

### It must not look like fantasy football

| Don't | Do |
|---|---|
| Green pitch with players in a formation | A vertical list of five picks |
| Shirt icons, kit renders, player cutouts | Names in type. Photos only on landing, from the edge of the game. |
| Captain armbands, "C" badges, chips called "wildcard" | One swap a week, stated plainly |
| Prices (£7.5m), budgets, ownership % | Multiplier and rank in mono |
| Words: squad, manager, transfer, ownership, portfolio, asset, investment | Words: pick, five, receipt, call, breakout, league |
| Premier League purple, fantasy green, white app with a coloured header | Stock, Ticket, Ink, Flare, and nothing else |

### It must not look like betting

No odds chips, no casino green, no gold, no coins, no money imagery, no countdown urgency banners, no "boost" language. The multiplier is a record of timing, never a payout.

### It must not look like a generic light app

| Generic default | Rallycademy rule |
|---|---|
| Pure white `#FFFFFF` background with grey cards | Stock page, Ticket objects. No `#FFF` anywhere. |
| Soft grey shadow under every card | Cards use `--card-edge`. Shadows only on receipts and overlays. |
| Neo brutalism: thick black borders, hard offset shadows, pastel fills | 1px ink borders only. No offset shadows. No pastels. |
| Mono eyebrow label above every heading | Mono only on evidence. Headings stand alone. |
| Middle dots joining meta strings everywhere | Middle dot only inside timestamps, receipts and the Stub week label |
| 01 / 02 / 03 numerals on any list | Numerals only on true sequences: pick numbers, programme sections on landing |
| Arrow appended to buttons and links | No arrows in labels |
| Flare sprinkled on single words in headlines | Flare fills one thing per screen: the primary action |
| Identical rounded cards in a grid | Rows inside one panel. Cards only for actionable objects. |
| Gradients, glass blur, glow | Flat printed surfaces |
| Emoji and sparkle icons | 1.5px stroke line icons, square caps, 20px, ink, from one set (Lucide), used sparingly |

---

## 10. Landing page

The landing page has one job: get someone to lock their first pick. It leads straight into the app. `Back your five` opens the pick flow with no email wall before the first pick. Account creation happens at lock, because the receipt needs an owner.

The landing page is light: Stock with 5% grain, ink type, one photograph, real receipts. It should feel like a matchday programme you picked up at the gate.

### What the page must have (the six patterns strong sites share)

| Pattern | How Rallycademy does it |
|---|---|
| One dominant visual idea | The Scout Receipt over one football photograph, on grained Stock. Everything else supports it. |
| Specific things, not broad promises | Named players, real dates, real ranks: `Picked 43 days before his first start.` Never "discover the next big thing". |
| Clear, labelled actions where they belong | `Back your five` in the hero and the close. `Start a league` beside the league section. Nowhere else. |
| Information next to the image | Every receipt or screen has its one line caption beside it, not in a separate block. |
| Big and small on purpose | Archivo Black at hero size against 11px mono timestamps. No middle sizes on landing. |
| Real product evidence | Live components or production screenshots only (see below). |

### Structure (a match programme, not a SaaS page)

| Section | Content |
|---|---|
| **Hero** | Grained Stock. Headline in `hero` style, ink, fills 30 to 50% of the first viewport. Headline sits on Stock, never over the photo (no scrims). One photograph from the edge of the game (tunnel, academy pitch under floodlights, boots on wet turf), printed as a hard edged rectangle, full bleed on one side. One real Scout Receipt, flat, `shadow-lg`, overlapping the photo's edge and cropped by the viewport. One line of Inter 400 below the headline. Primary `Back your five`, secondary `Start a league`. |
| **01** | Headline: `Pick five players under 21.` Beside it, a live Pick Card list with real current players, on a Ticket panel. |
| **02** | Headline: `Your multiplier locks the second you pick.` The receipt creation plays once as the section enters view. Reduced motion shows the finished receipt. |
| **03** | Headline: `Last season, 12 people called Okafor before his debut.` (real stat only). A stack of real receipts on Stock, each different, each with its true key line. |
| **04** | The one inverted band: Turnstile Black, Ticket type. Headline: `A table for you and your mates. One swap a week.` A real league table (it stays light, as a Ticket panel on the ink band, like a printed table pasted into a programme). `Start a league` as an Inverse style button in Ticket fill with ink text. |
| **Close** | Back on Stock. Wordmark in ink at `min(11vw, 120px)`. `Make a call before everyone agrees with you.` Primary CTA. |

Sections separated by 1px ink rules and 96 to 128px of space. Numerals only because this is a true sequence (pick, lock, prove, compete). Numerals in Archivo Black at `h1` size, ink, cropped by the left edge. One inverted band per page, maximum.

Headlines in the example copy vary on purpose: a command, a statement, a stat, a description. Replace the words, keep the variety.

### Product evidence rule

Every product image is a live component or a production screenshot at native resolution, in the light theme. No drawn mockups. No invented numbers. If the real data does not exist yet, the section waits.

### Audit: the six AI premium tells

A draft with any of these is rejected, not polished.

| Tell | What it looks like here | Rule |
|---|---|---|
| **1. Random decoration posing as editorial** | Tilted phone with the app on it. Sparkles by the headline. A floating ball. Flare scribbles. Tape strips on the photo. A rotated receipt for "energy". | Receipts sit flat. The only rotated thing is the stamp, and only on a breakout receipt. No phones, no sparkles, no footballs, no tape. |
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

## 11. Dark theme (alternate)

Dark is a supported alternate, switched by an explicit setting (`data-theme="dark"` on `<html>`). v1 does not follow the OS setting automatically: light is the identity, so a first visit always sees light. Every component rule above holds; only tokens swap. The receipt does not change.

### Dark tokens

| Semantic token | Light | Dark name | Dark hex |
|---|---|---|---|
| `--bg` | Stock `#E5E2D8` | Turnstile Black | `#0B0B0A` |
| `--surface-1` | Ticket `#F1EFE7` | Stand | `#121211` |
| `--surface-2` | Proof `#F8F7F2` | Concrete | `#1A1A18` |
| `--well` | Terrace `#D9D6CA` | Floodlight Grey | `#252522` |
| `--flare-tint` | Flare Tint `#FFE0D4` | Flare Wash | `#32150E` |
| `--text` | Ink `#0B0B0A` | Ticket | `#F1EFE7` |
| `--text-2` | Graphite `#4A4944` | Newsprint | `#B4B2AA` |
| `--text-3` | Pencil `#5C5B55` | Ash | `#85847D` |
| `--accent-text` | Flare Ink `#B23415` | Flare | `#FF4D22` |
| `--hairline` | `rgba(11,11,10,0.14)` | Hairline | `rgba(241,239,231,0.14)` |
| `--card-edge` | `rgba(11,11,10,0.12)` | Card Edge | `rgba(241,239,231,0.10)` |
| `--stub` | Turnstile Black | Stand, with a 1px `--hairline` bottom rule | `#121211` |
| Semantic up / down / pending / info | Deep set | Match Green / Offside Red / Amber / Sky | `#5DDB8B` / `#FF6868` / `#EAB85C` / `#70A9FF` |

Dark differences: primary button is Flare fill with ink text and no border (Flare on Turnstile Black is 5.94:1, so the fill defines the control). Secondary border is Ticket at 18%. Inputs use a 1px Ash border. Focus ring is Flare. Shadows: only `shadow-lg` on overlays (`0 1px 0 rgba(241,239,231,0.06) inset, 0 12px 32px rgba(0,0,0,0.45), 0 32px 64px rgba(0,0,0,0.35)`); `sm` and `md` are invisible on near black and unused. The receipt keeps Ticket and ink and needs no shadow.

### Approved pairings, dark (measured)

| Foreground | Background | Ratio | Allowed for |
|---|---|---|---|
| Ticket | Turnstile Black | 17.10 | Everything |
| Newsprint | any dark surface incl. Floodlight Grey | ≥ 7.24 | Body, secondary |
| Ash | Turnstile Black / Stand / Concrete | 5.25 / 4.99 / 4.64 | Metadata |
| Turnstile Black | Flare | 5.94 | CTA labels |
| Flare | Turnstile Black / Stand / Concrete / Floodlight Grey | 5.94 / 5.66 / 5.26 / 4.64 | Accent text, icons, focus ring, active marks |
| Flare | Flare Wash | 5.07 | Breakout labels |
| Semantic set | Turnstile Black | 6.97 to 11.22 | Deltas with glyphs |

### Banned pairings, dark

| Foreground | Background | Ratio | Why banned |
|---|---|---|---|
| White or Ticket | Flare | 3.31 / 2.88 | Flare fills carry ink text |
| Flare Ink | any dark surface | ≤ 3.18 | Light theme only |
| Ash | Floodlight Grey / Flare Wash | 4.09 / 4.48 | Metadata on selected rows and your own row switches to Newsprint |
| Any light theme text token | any dark surface | varies | Tokens never cross themes |

---

## 12. Review checklist

Run before merging any UI PR. Any "no" blocks the merge.

- [ ] Built light first. Also checked in dark.
- [ ] Every colour is a semantic token. No raw hex, no `#FFFFFF`, no opacity on text.
- [ ] Every text pairing is in the approved table for its theme.
- [ ] Page is Stock; Ticket appears only as objects, each with an edge.
- [ ] One Flare fill on the screen, and it is the primary action with ink text and a 1px ink border. No Flare text, border or focus ring on a light surface.
- [ ] Archivo Black ≥ 28px. Mono only on evidence. No serif.
- [ ] Spacing uses the scale. Radius is 8, 6, 999 or receipt 2.
- [ ] Every component shows all its states.
- [ ] Works at 320px and 200% zoom with nothing clipped.
- [ ] Targets ≥ 44pt. Focus visible: ink on light, Flare in the Stub and in dark.
- [ ] Motion passed the frequency test first. Only transform and opacity. No `ease-in`. Standard UI under 300ms; only the three rare moments go past it.
- [ ] Input never blocked mid transition. Keyboard actions do not animate. Reduced motion version shipped in the same PR.
- [ ] Destructive actions confirm, with the Inverse button. Every drag has a tap alternative.
- [ ] Landing: light, none of the six AI premium tells, no invented proof anywhere.
- [ ] No texture on app UI.
- [ ] No banned words: squad, manager, transfer, ownership, portfolio, asset, investment.
- [ ] Nothing on screen that a fantasy football app, a betting app or a cream and terracotta template would also show.
- [ ] Would this screenshot still feel like evidence? If not, remove something.
