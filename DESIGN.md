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
- At ≤600px: the recipe servings control wraps into separate label, full-width select and summary rows with an 8px gap. The select uses 12px text and never exceeds its container.
- At ≤470px: 16px side padding; recipes become single-column horizontal cards with a 120px photo column; week cards stack. Hero photograph is 125×160px. Recipe dialog content uses 22px padding.

Dialogs are at most 680px wide or viewport minus 32px, max-height 90vh, and scroll internally. Print hides the interactive page and renders a separate plain A4 plan with 16mm page margins.

## Elevation & Depth

Borders and pale tonal surfaces carry most grouping. The hero photo caption uses `0 5px 20px #173f3510`, the selected shopping-period segmented option `0 2px 4px #173f3510`, and dialogs `0 15px 80px #102d2529` over a `#173f3566` backdrop. Recipe cards change border color on hover without lifting.

Motion is limited to 0.2s card-border and toast transitions, a 0.3s progress transition, and smooth scrolling. The shared ease is `cubic-bezier(.16,1,.3,1)`. Reduced-motion CSS disables transitions/animations and CSS smooth scrolling; JavaScript view-switch scrolling explicitly requests smooth behavior.

## Shapes

Cards, the daily plan and empty states use 14px corners; dialogs use 18px. Buttons use 8px, search/segmented surfaces 9px, filter pills 24px, and icon buttons circles. Recipe photography uses cover cropping: 1.65 aspect ratio on standard cards and full-height crops on narrow horizontal cards. Icons are outlined, typically 20px with 1.7px round strokes; favorite hearts fill when selected.

## Components

- **Navigation and meal tabs:** pale active navigation with bold text; category selection adds a forest 2px underline. Buttons expose `aria-pressed`.
- **Search and filters:** white bordered search with a 2px forest focus-within outline. Filter pills switch to forest/white when active. The search row ends with a quiet “Стакан 250 мл” hint; ingredient quantities use household measures throughout cards, recipes and shopping. Every cup-based ingredient quantity explicitly repeats “стакан 250 мл”, including scaled recipe quantities, relevant cooking steps and shopping output; the shopping note and downloaded text also state the same standard. The remaining segmented control selects the shopping period, with its selected option on white and a small shadow.
- **Adult energy selector:** a compact, line-separated settings row above the meal tabs, with a bold 14px label, muted 12px explanatory copy and white native select (44px minimum height, 8px corners). It switches between approximately 1600 kcal (default) and 1300 kcal while retaining selected meals. The explanatory note identifies adult portions; the lower-energy option carries its specific caution. Ingredient measures, calories, protein, daily targets, shopping quantities and print output follow the adult scale. This does not set children’s calorie targets.
- **Recipe card:** photograph, favorite button, time/protein/calorie metadata, serif title, ingredient summary and divided action row. Selected add action becomes forest/white and changes to “В меню”. All 320 recipes (80 per meal category) have individual local generated photos; the catalog states they illustrate dishes rather than actual portions.
- **Preparation selector:** a compact bold label and white bordered native select (42px minimum height, 8px corners), with an underlined reset action when active. Its single selected method combines with search, category, filter pills, pantry and exclusions. Recipe details show method labels on pale, gently rounded tags.
- **Pantry disclosure:** a flat, line-separated expandable section above results, with a forest chevron, bold title and muted selection summary. Inside, a search field leads to grouped native checkboxes in wrapping bordered labels (40px minimum height, 8px corners); checked labels use pale fill and forest border. The product list scrolls at 300px maximum height. Toggle, strict-match checkbox and clear action wrap beneath a divider. Cards add a divided match summary with missing products; full matches still ask the user to check quantities. On narrow phones the summary moves below the title and controls wrap.
- **Product exclusions and tolerance:** a second understated disclosure reuses pantry checkbox labels for optional exclusions. Recipe detail contains a bordered disclosure with composition-specific notes and a source link. These communicate individual tolerance without promising symptom-free digestion. Disclosure summaries share the terracotta keyboard-focus outline.
- **Daily plan:** pale panel, seven-day selector, total/progress bar and four meal slots. Selected day is forest/white; days with meals have a small dot. Empty slots use dashed borders; filled slots have thumbnails and remove controls.
- **Dialogs:** native recipe, grocery and help dialogs; recipe detail has a photo hero, servings select, ingredient rows and numbered steps. The servings options are one adult, two adults, or a family batch for two adults and three children. Family ingredients combine two adult portions of the selected energy mode with 2½ ordinary portions as a cooking allowance for children. The accompanying copy explains serving children by appetite. Family guidance appears in a pale panel with 16px padding, 10px corners and 12px text. The family category filter exposes 80 additional ordinary home recipes with familiar ingredients and mild flavors. Closing restores focus. Grocery checkboxes strike through checked names.
- **Feedback and transfer:** centered forest toast appears above the bottom edge for 3200ms. Empty search/favorite states offer recovery. Import is a keyboard-focusable text button opening a hidden file input; export and print share its understated underlined style.

Global keyboard focus is a 3px terracotta outline offset 4px. Disabled buttons use opacity .6. The skip link becomes visible on focus; recipe results and toast provide live feedback.

## Do's and Don'ts

- Do reuse the forest/paper/pale grouping and local serif/sans pairing.
- Do preserve photo disclosures, explicit selection labels and visible keyboard focus.
- Do preserve the daily plan above the catalog on small screens.
- Don't add large decorative shadows or card hover movement to this mostly flat system.
- Don't treat generated photos as evidence of actual prepared serving size.

The “Проще всего” filter selects recipes tagged easy. Cereals, flakes and pasta use dry household measures (250 ml cups), before cooking. Family batch scaling changes recipe ingredients; the day/week plan, shopping list and print remain adult-portion planning outputs.
