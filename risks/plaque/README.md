# HeartFirst Risk Atlas — Plaque v1

This is a focused prototype for the first module of a broader HeartFirst Risk Atlas.

## What this version is

- A **single-purpose educational module** focused on plaque
- A **3D-style artery explorer**, not a whole-heart model
- A prototype designed to show whether the modular atlas approach is more successful than the overloaded all-in-one heart explorer

## Why plaque first

Plaque is the foundation module for later modules such as inflammation, rupture, clot, heart attack pathway, and the combined cascade.

## Included interactions

- progression slider from healthy to advanced plaque
- play / pause
- labels on / off
- exploded view toggle
- reset
- stage explanation panel
- product bridge CTAs

## What it does not do

- no backend
- no saved user state beyond the current page session
- no medical interpretation
- no patient-specific risk prediction
- no diagnosis or treatment logic

## Next recommended build order

1. inflammation
2. rupture
3. clot
4. cascade overview
5. heart attack pathway
6. stroke pathway
7. valve calcification
8. aortic stenosis

## Notes

This prototype uses SVG, gradients, and DOM animation rather than WebGL. That is deliberate. A focused artery segment is easier to make visually legible and educationally useful than a poor full-heart 3D render.


## v2 updates

- fixed SVG opacity and transform mutations by using SVG attributes instead of CSS style properties
- added a standard "What this does not show" section
- improved cross-section visibility and labelled it explicitly
- improved leader lines with endpoint dots
- reduced the prominence of flow particles
- aligned the visual shell more closely with HeartFirst brand cues
- replaced inline “coming soon” text with intentional badges
- added a more structured footer with HeartFirst and Legal links


## v3 updates

- restored the existing HeartFirst SVG logo in the top nav
- replaced the previous requestAnimationFrame playback loop with a simpler interval-based playback controller
- Play now resets to 0 if the slider is already at 100 and then advances in visible 1-point steps
- manual slider interaction now stops playback cleanly before updating the visual state
- fixed invalid nested span markup in the Risk Atlas nav badges


## v4 updates

- added light and dark mode support
- defaults to the visitor’s system preference when no saved preference exists
- saves the selected theme in localStorage
- keeps the existing HeartFirst SVG logo
- preserves the working slider and Play behaviour from v3

Light mode is intended for reading comfort and accessibility choice; the visual itself retains enough contrast for the artery module to remain legible.


## v5 updates

- restored the theme toggle pattern used on the working Heart Risk Navigator page
- removed the visible “Theme:” prefix so the button now shows only `Light` or `Dark`
- uses the shared `hf-theme` localStorage key for consistency across HeartFirst pages
- defaults to system preference when no saved preference exists
- keeps the existing HeartFirst SVG logo and the working plaque slider/play controls


## v6 updates

- breadcrumb updated to HeartFirst › Risk › Plaque
- hero kicker and introduction updated to reader-facing Risk Atlas wording
- “What this atlas does” block refined
- left nav order and copy updated to the agreed sequence
- static “What plaque is made of” block now appears only in the early part of the journey and hides after later-stage progression
