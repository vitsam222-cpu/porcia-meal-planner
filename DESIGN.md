---
name: Порция
description: An editorial recipe library and daily meal planner.
colors:
  ink: "#173f35"
  muted: "#56665e"
  paper: "#faf9f5"
  white: "#fff"
  line: "#dce3dc"
  pale: "#edf2eb"
  accent: "#a04b2d"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(36px, 4.1vw, 60px)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "21px"
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
rounded:
  surface: "14px"
  dialog: "18px"
  button: "8px"
  input: "9px"
  filter: "24px"
spacing:
  compact: "8px"
  control: "12px"
  card: "18px"
  panel: "24px"
  workspace: "32px"
  shell: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "12px 15px"
  button-primary-hover:
    backgroundColor: "#245e4e"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "12px 15px"
  recipe-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.surface}"
---

# Design System: Порция

## Overview

The shipped operating surface extends the approved PDF menu's green, ivory and terracotta editorial look. Serif headings and individually generated food photographs give the recipe library its character; compact sans-serif controls support choosing meals and checking a day or week.

**Key Characteristics:**
- Warm paper canvas, forest green text and pale green planning surfaces.
- Photographic recipe cards with restrained borders.
- Visible selected states across filters, days and meal actions.

This records the current HTML, CSS and JavaScript implementation; it introduces no new user preferences.

## Colors

Forest `ink` is both the main text color and the selected/primary-action fill. `muted` supports descriptions and compact metadata. `paper` is the page and dialog canvas, `white` the recipe/week cards and inputs, `line` the dividers, and `pale` the daily plan and quiet selected navigation. Terracotta `accent` marks the italic hero phrase, calories, favorites, step markers, caret and focus outlines. Hovering a primary button uses #245e4e; secondary hover uses #e0e9dc.

## Typography

Local `assets/lora.ttf` and `assets/manrope.ttf` use `font-display: swap`; both are registered at normal weight 400. CSS also requests bold control/metadata states and italic hero emphasis, which the browser may synthesize.

Hero type follows the display token, becoming 39px at ≤800px and 33px at ≤470px. Section headings use the headline token. Card titles are 21px normally, 20px at ≤1100px or ≥1500px, and 19px at ≤470px; they inherit the heading's bold weight. Recipe dialog titles are 32px, falling to 28px on narrow screens. Body is 14px/1.6; descriptive and control copy ranges from 10–13px, with the smallest slot labels 9px on narrow phones. Calorie totals and amounts use tabular numerals.

## Layout

The default shell is centered, max-width 1360px including 40px side padding. The header is 94px high with a 1440px maximum and 56px side padding. A 320×225px hero photograph sits beside the introduction. The library and sticky daily plan form `minmax(0,1fr) 315px` columns with a 32px gap. Recipes use two columns with 22px gaps; the daily plan has 24px padding and `top:20px`. Week cards use four columns.

- At ≥1500px: shell maximum 1440px, three recipe columns, 330px daily plan and 40px workspace gap.
- At ≤1100px: shell/header side padding 30px, 290px plan, 22px workspace gap, 16px recipe gaps, three week columns; brand tagline and tab counts disappear.
- At ≤800px: 22px side padding; navigation wraps below the brand; daily plan moves above the library and stops sticking. Plan slots form two columns, plan actions sit side by side, recipes remain two columns, week cards become two columns, and guide content stacks.
- At ≤470px: 16px side padding; recipes become single-column horizontal cards with a 120px photo column; week cards stack. Hero photograph is 125×160px. Recipe dialog content uses 22px padding.

Dialogs are at most 680px wide or viewport minus 32px, max-height 90vh, and scroll internally. Print hides the interactive page and renders a separate plain A4 plan with 16mm page margins.

## Elevation & Depth

Borders and pale tonal surfaces carry most grouping. The hero photo caption uses `0 5px 20px #173f3510`, the selected segmented option `0 2px 4px #173f3510`, and dialogs `0 15px 80px #102d2529` over a `#173f3566` backdrop. Recipe cards change border color on hover without lifting.

Motion is limited to 0.2s card-border and toast transitions, a 0.3s progress transition, and smooth scrolling. The shared ease is `cubic-bezier(.16,1,.3,1)`. Reduced-motion CSS disables transitions/animations and CSS smooth scrolling; JavaScript view-switch scrolling explicitly requests smooth behavior.

## Shapes

Cards, the daily plan and empty states use 14px corners; dialogs use 18px. Buttons use 8px, search/segmented surfaces 9px, filter pills 24px, and icon buttons circles. Recipe photography uses cover cropping: 1.65 aspect ratio on standard cards and full-height crops on narrow horizontal cards. Icons are outlined, typically 20px with 1.7px round strokes; favorite hearts fill when selected.

## Components

- **Navigation and meal tabs:** pale active navigation with bold text; category selection adds a forest 2px underline. Buttons expose `aria-pressed`.
- **Search and filters:** white bordered search with a 2px forest focus-within outline. Filter pills switch to forest/white when active. The portions/grams segmented control places its selected option on white with a small shadow.
- **Recipe card:** photograph, favorite button, time/protein/calorie metadata, serif title, ingredient summary and divided action row. Selected add action becomes forest/white and changes to “В меню”. All 80 recipes have individual local generated photos; the catalog states they illustrate dishes rather than actual portions.
- **Daily plan:** pale panel, seven-day selector, total/progress bar and four meal slots. Selected day is forest/white; days with meals have a small dot. Empty slots use dashed borders; filled slots have thumbnails and remove controls.
- **Dialogs:** native recipe, grocery and help dialogs; recipe detail has a photo hero, servings select, ingredient rows and numbered steps. Closing restores focus. Grocery checkboxes strike through checked names.
- **Feedback and transfer:** centered forest toast appears above the bottom edge for 3200ms. Empty search/favorite states offer recovery. Import is a keyboard-focusable text button opening a hidden file input; export and print share its understated underlined style.

Global keyboard focus is a 3px terracotta outline offset 4px. Disabled buttons use opacity .6. The skip link becomes visible on focus; recipe results and toast provide live feedback.

## Do's and Don'ts

- Do reuse the forest/paper/pale grouping and local serif/sans pairing.
- Do preserve photo disclosures, explicit selection labels and visible keyboard focus.
- Do preserve the daily plan above the catalog on small screens.
- Don't add large decorative shadows or card hover movement to this mostly flat system.
- Don't treat generated photos as evidence of actual prepared serving size.

The “Проще всего” filter selects recipes tagged easy. Cereal household measures are dry-cup measures (250 ml), before cooking.

Ingredient mode switch removed in favour of household measures everywhere, including shopping; a 250 ml cup hint replaces it.
