# Design

A personal site that reads like a person. The homepage is a short first-person letter; the writing and the work follow as quiet indexes. Numbers never headline: a claim stays in the sentence and its evidence (the figure, the system, the period) sits beside it in the margin as a numbered note. That is the one idea the whole site is built around.

Rejected on purpose: saturated color fields, stat rows, buttons, cards, badges, display type. An earlier bold version read as a "money site"; restraint is the brief now.

## Frame

- Reading column `--measure: 35rem`, gap `--gap: 3.5rem`, margin `--margin: 15rem`. The page is the three together, centered, so the column sits left of center with the margin on its right.
- `.page` is the frame, `.col` limits children to the measure, `.wide` (and `pre`, tables, screenshots) may run into the margin.
- Below 1100px the margin disappears: notes open under their paragraph when the number is tapped (`Note.astro`, script in `BaseLayout.astro`). Without JS they are always shown.

## Color (`src/styles/global.css`)

Gruvbox, Aurelio's own palette from the previous site and his terminal: light (`#fbf1c7` paper) or dark hard (`#1d2021`) by `prefers-color-scheme`, no toggle.

| Role | Light | Dark |
|---|---|---|
| Links (`--accent`, purple) | `#8f3f71` | `#d3869b` |
| Margin-note numbers (`--note`, orange) | `#af3a03` | `#fe8019` |
| Selection, highlights (yellow) | `#fabd2f` | `#d79921` |
| Text / secondary / meta | `#282828` / `#504945` / `#6e6259` | `#ebdbb2` / `#d5c4a1` / `#a89984` |

The other Gruvbox hues (`--gb-red` … `--gb-aqua`) are only used as topic swatches: each tag gets a stable hue from `tagHue()`. Code uses Shiki `gruvbox-light-medium` / `gruvbox-dark-hard`.

## Type

- **Literata** (variable, optical sizes) for everything: 19px body, old-style figures in prose, lining tabular figures in dates and tables, small caps for status labels.
- **JetBrains Mono** only inside code.
- Sizes: lede ~2rem, page titles ~2.6rem, section labels 1rem semibold over a hairline. No display face.

## Personality

It comes from real things in Aurelio's life and posts, never invented:

- `KingsGambit`: a board in the margin showing 1. e4 e5 2. f4, which replays on click. His chess (rated around 200, plays the King's Gambit because it looks cool) is what Prompt-chess came from.
- Writing lists carry one line from each post in its own words (`pullQuotes` in `src/data/site.ts`).
- The letter mentions Paquita, his OpenClaw agent, and signs off "Un saludo".
- The personality card from PR #74 (`PersonalityCard`): a two-sided trading card with Aurelio's portrait and a spec sheet on the back. It rests tilted in the homepage margin (`CardTrigger` variant `margin`), shows up as a P.S. on phones (variant `ps`), opens in `CardModal`, and sits inline on /about. Its plate is Gruvbox (cream on light, dark on dark) with orange accents; no grain or sliding sheen, only a soft pointer glow and a faint warm rim.
- The 404 page is a blunder.

## Components

`PersonalityCard`, `CardTrigger`, `CardModal`, `KingsGambit`, `Header` (letterhead: name and plain text nav), `Footer` (colophon: contact sentence, typefaces, agent pointer), `Note` (numbered margin note), `PostPreview` (title and date row), `Topics` (inline tag list with counts).

## Motion

Three moments, all on request: the personality card tilts toward the pointer (or the phone's gyro), flips on click, and spins when dragged; hovering or focusing a note number tints its note, and the chess board slides through its three moves when Replay is clicked (instant under reduced motion). Link underlines fade in. Nothing animates on load.

## Rules

- Evidence goes in the margin, never in a headline or a tile.
- Numbers and claims come only from `src/data/agent-profile.ts` and post frontmatter.
- First person everywhere on the page; the profile's third-person phrasing is for agents.
