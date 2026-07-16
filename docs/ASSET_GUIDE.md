# ASSET_GUIDE.md

## Visual Source of Truth

All current and future assets must follow:

`docs/references/pixel_style_board.png`

This reference controls the complete visual language of GemVerse, including
backgrounds, board pieces, gems, special gems, UI, icons, VFX, decorations,
characters, tilesets and HUD text effects.

Style keywords:

- Cozy Purple Galaxy
- Premium handcrafted pixel art
- Cute fantasy space
- Dark indigo and purple base with warm gold, pink and cyan accents
- Crisp low-resolution silhouettes with selective soft glow
- Top-left lighting and readable forms at native size

Do not mix in realistic painting, smooth vector art, generic flat UI, harsh
neon, Hi-Res outlines or inconsistent pixel densities.

## Master Palette

- Deep space: `#170B2C`, `#26184C`, `#3D2A6B`
- Purple: `#5C3FAE`, `#7C5CFF`, `#9B7CFF`, `#C7B3FF`
- Warm accents: `#FFD866`, `#FF9C42`, `#FF8EC7`
- Cool accents: `#5FE1FF`, `#EAF4FF`
- Gem colors: ruby `#FF4D6D`, sapphire `#3FA9F5`, emerald `#34D399`, amethyst `#A566FF`, topaz `#FF9C42`, citrine `#FFD866`

Palette extensions are allowed only for shading and accessibility. New colors
must remain visually compatible with the master palette.

## Naming and Structure

Use lowercase snake_case PNG filenames. Animated frames use numbered suffixes,
for example `special_nova_idle_1.png`. Keep assets in their matching folder
under `assets/gemverse_assets/`.

Sprite Sizes

Board

16x16 base grid. Export larger source art only at integer multiples.

Inventory

48x48

Collection

64x64

Promotion

256+

Outline

1-2 px

Use selective dark-purple outlines, not a uniform heavy outline around every
pixel. Preserve silhouette readability without making assets look sticker-like.

Glow

Idle

Very subtle.

Selection

Medium.

Match

Bright.

Destroy

Particle burst.

Animation

Idle

6-8 frames

Match

8-12 frames

Destroy

10-16 frames

Export

PNG

Transparent

Pixel Perfect

Nearest Neighbor

No smoothing, resampling blur, white fringe or background pixels. Transparent
PNG is required for isolated sprites. Sprite sheets use a consistent grid with
at least 1 px padding between frames.

## Production UI Rule

Final UI visuals use PNG assets for backgrounds, logos, panels, buttons, icons
and animated sprite sheets. HTML/CSS/Canvas-drawn art is limited to mockups;
production code handles layout, responsive sizing, live text, interaction and
animation state only.

## Current Title Assets

- Background: `assets/gemverse_assets/01_backgrounds/title_observatory_playable_pixel.png`
- Logo and button states: `assets/gemverse_assets/05_ui/title/`
- Approved explorer concepts: `assets/gemverse_assets/09_characters/concepts/explorer_bc_selection_approved.png`
- Title explorer: `assets/gemverse_assets/09_characters/explorer_navigator_title_float_v1.png`
- Keep the full-size background static. Ambient motion belongs on small or
  transparent overlay assets so portrait mobile devices remain smooth.

## Planet Route Map Assets (TASK-047)

- Luma map background: `assets/gemverse_assets/01_backgrounds/maps/planet_luma_level_map.png`
- Mira map background: `assets/gemverse_assets/01_backgrounds/maps/planet_mira_level_map.png`
- Luma planet icon: `assets/gemverse_assets/05_ui/maps/planet_luma_icon.png`
- Mira planet icon: `assets/gemverse_assets/05_ui/maps/planet_mira_icon.png`
- Map backgrounds are static, full-height portrait PNG assets. Do not animate or
  continuously transform the full-size images.
- Level numbers, star totals and Locked/Current/Complete states remain live DOM
  content over the PNG art. Do not bake gameplay text or progress state into the
  background assets.
- Final placement is verified on 320×568, 360×640, 390×844, 430×932 and
  560×900. Keep node coordinates inside the tested safe area when editing maps.
