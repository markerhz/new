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
