# Homepage hero photographs

Generated with the built-in imagegen tool. The homepage now alternates the coast,
family and mountain photographs. Assets are served from `public/images/home/` as
800 x 1200 WebP files, quality 88. Configure sources and alt text in
`src/components/home/home-posters.ts`.

## Final prompt

Use case: photorealistic-natural. Asset type: one full-bleed portrait photographic poster for Albumo photo-book website, 2:3 portrait orientation. Primary request: A lone young adult traveller seen from behind on a sunlit Mediterranean coastal overlook, pale stone, deep teal sea, warm ivory linen shirt, breeze, tiny distant sailboat. Refined travel editorial, unposed and peaceful. Style: premium photographic print campaign, sophisticated film colour, subtle grain, realistic detail, natural lighting, beautifully composed. Full photograph edge to edge, no borders, no typography, no letters, no logos, no watermarks, no UI. Keep primary subject inside central 70% width with breathing room for responsive cropping and a small HTML caption along bottom. Warm natural colour grading consistent across the series, true skin tones, soft contrast, deep but readable shadows. One single scene only, no collage.

## Additional generated scenes

The same portrait photography styling and no-text constraints were used for:

- Family: An Indian mother and her young child laughing together on a picnic blanket in a sunlit green garden, candid and warm, faces clearly visible in the middle upper part, sage and cream clothes, natural proportions.
- Mountains: Two friends seen from behind hiking a winding path in the Himalayas with layered green hills and hazy mountain peaks, warm afternoon sunlight, cinematic depth, one muted terracotta backpack, spacious beautiful landscape.

## Interaction

The homepage row drifts at 22 pixels per second and loops in either direction using
three identical groups. Native touch/trackpad scrolling, keyboard navigation and mouse
dragging remain available. Drift continues during and immediately after manual input, including keyboard focus. Scrollbars and pointer focus outlines are hidden. Reduced motion disables
autoplay and curvature, and the animation sleeps offscreen or in background tabs.
Photographs are counter-scaled to preserve their proportions. Page entrance animations
still run once per route visit.
