# Classic pet game pixel artwork

The 24 images in `public/playground/pet/v2` are original raster artwork generated with `image_gen.imagegen` for Pawpong. No game screenshots, commercial characters, or third-party sprite sheets are shipped. Generated masters stay in the image tool's original output directory; only the final logical-pixel exports are served.

The room uses 320×224 logical pixels: a 320×128 wall, a 32×32 floor tile repeated across the bottom 96 pixels, and 64×64 transparent prop textures. All exports use nearest-neighbor sampling, at most 48 palette colors, and alpha 0 or 255. Actual exports contain at most 16 colors and total 34,950 bytes, excluding the JSON manifest. The manifest records dimensions, display sizes and bottom-center anchors. Runtime scaling must remain pixelated with texture filtering disabled.

Positions after visual inspection: bed (250,168), toy (190,184), plant (40,142), decoration (280,70). The decoration sits to the right of the painted clock; the previous (245,58) overlapped it. These are client room coordinates, never arbitrary purchase/equip payloads. A wall clock is part of the wallpaper and cannot be removed individually.

The private character API processes the player's explicitly connected, certified `pet-sprite-v1` generation. Ordinary photo-filter portraits are retained in records and require explicit full-body connection before games. The generation preserves the photo's species, coat colors, markings, muzzle and ear shape; a strict final-image semantic check rejects portraits, cropped anatomy and decorative backgrounds. Six 96×96 reaction frames use the same identity, a 48px logical grid enlarged 2×, hard alpha and a shared feet baseline. None of the furniture assets substitutes a stock pet. Furnishing thumbnails and room props resolve the same server catalog `assetKey` through `manifest.json`.

Design reference decisions: [Tamagotchi's official care guide](https://tamagotchi-official.com/us/series/paradise/howto/) informed the care-to-play loop, [Kairosoft's official Forest Camp Story trailer](https://www.youtube.com/watch?v=gGWPu6wr7ys) informed compact room silhouettes and restrained warm outlines, and [Aseprite's sprite-sheet documentation](https://www.aseprite.org/docs/sprite-sheet/) informed separate texture/frame sizing. These references are inspiration only, not copied assets.

Generation mode: one transparent prop sheet and one cream wallpaper were generated from text; forest, starry and cloud wallpapers used that cream wallpaper as the image-edit reference to preserve geometry; the four floor textures were generated as a strip. Technical export and sprite slicing used Sharp 0.34.5, not an illustration replacement or a browser screenshot. The supervisor's export script, original PNG metadata/SHA-256, output palette/alpha/byte checks and inspection boards are retained in `/Users/kscold/orca/task-artifacts/pawpong-pet-classic-20261005/art`.

## Exact generation prompts

### pet-props-prompt

```text
Use case: stylized-concept.
Asset type: production sprite atlas for an original Korean pixel pet game, Pawpong.
Create an EXACT four columns by four rows spritesheet on a genuinely transparent background, square canvas. Sixteen separate original 16-bit pixel art furniture sprites, one sprite perfectly centered in each equal grid cell, all with consistent orthographic front-facing slightly top-down view and common warm cozy game art direction. All cells have plenty of transparent margin. No grid lines, no dividers, no labels, no letters, no characters, no pets, no full scene.

Order is essential:
Row 1, left to right: small golden cream floor pet cushion with stitched paw; honey-brown woven oval pet basket with soft cream blanket; midnight indigo crescent-moon pet bed with gold tiny stars; mint little triangular indoor pet tent.
Row 2: yellow-orange striped rubber ball; creamy dog bone toy with brown outline; small pastel yellow rubber duck; tiny mint and apricot wooden toy train.
Row 3: terracotta pot with two rounded green sprout leaves; little pot of pink daisies; short green cactus in peach ceramic pot; small leafy indoor tree in a honey-colored pot.
Row 4: hanging square gold-framed paw-print picture; short shelf with three colorful books; warm yellow bedside lantern with brown wood stand; shiny little gold star trophy on a cream-and-brown base.

Art direction: refined cozy Kairosoft-like classic pixel simulation assets, carefully constructed square pixel clusters, hard stepped silhouette, 1-2 pixel dark warm brown outline, 3-tone shading, bright buttery yellow #fff76b, cream #fff5d8, chestnut #70451e, honey #b56822, mint #8fbe8a, rose #ef9b95, twilight blue #4e5d8f. Rich enough to feel like a polished game, simple enough to read at a small game size. Shared light direction from upper left. Tiny contact shadows rendered in pixels within each sprite, no blurred shadows. Identical visual scale. Clean hard edges, no antialiasing, no realistic textures, no 3D render, no gradients, no white background. Each sprite is distinct and readable, precise regular 4x4 arrangement. This atlas will be divided into individual frames in a real playable game.
```

### pet-wall-cream-prompt

```text
Use case: stylized-concept. Asset type: background wall tile for an original cozy 16-bit pixel pet game.
Generate one wide horizontal image, aspect ratio exactly 5:2. It is the entire BACK WALL of a small inviting pet bedroom, seen straight on like a classic 2D Kairosoft or Stardew pixel game interior. This is a game background, not a UI mockup.
Full bleed wall from left edge to right edge, flat orthographic camera. Lower edge is a continuous horizontal brown oak skirting board. No floor at all. No ceiling visible. No foreground objects, furniture, pets, text, icons, buttons or empty picture frames.
Warm cream plaster wall with very subtle tiny paw-like stitch pattern, honey oak vertical beams at far left and far right and a wooden top beam. At x=24 percent, y=43 percent of canvas, a small wooden four-pane window showing cheerful blue sky, a distant soft green hill and tiny white pixel clouds; muted yellow curtains tied back. Window occupies about 19 percent of the width and 58 percent of height. At x=72 percent, y=30 percent a small simple wall-mounted wooden clock with clear pixel hands, no numbers; much smaller than window. Leave the central and right lower wall clear for dynamic pet and furniture sprites. Tiny coherent pixel details: wood grain, stepped curtains, a patch of sun below the window.
Palette warm original Pawpong colors chestnut brown #70451e, honey #b56822, buttery yellow #fff76b, cream #fff5d8, mint #8fbe8a, peach and blue. Expert handcrafted 16-bit pixel art, crisp square pixel clusters, hard stepped edges, subtle three-tone shading, no antialiasing, no blur, no smooth gradients, no texture noise, no 3D. Design at an underlying 320 by 128 pixel logical game resolution, then upscale with nearest neighbor. The artwork must be a fully polished cohesive game scene wall, not a flat blank rectangle.
```

### pet-wall-forest-prompt

```text
Use case: style-transfer. Edit target: the attached cozy pixel pet game back wall.
Create the forest wallpaper variant of EXACTLY this same wall. Preserve the wide 5:2 canvas, timber frame at the exact same locations, window dimensions and position, curtain geometry, lower skirting board and clock position, the hard square pixel art rendering and overall low-resolution game structure. Change only wall theme colors and small motifs: cream wall becomes soft fresh mint sage green with sparse darker pixel leaf motifs in place of paw pattern; golden curtains become desaturated sage and pale cream; the view through the window becomes a lush sunny forest clearing with a tiny stream and blue sky. Wood stays warm honey oak, clock stays legible. Keep the center and lower right clear for game sprites. Do not add furniture, animal, plants in the room, text, floor, UI, characters. Polished original 16-bit pixel game art. Hard stepped pixel edges, no antialiasing, no blur, no gradient, no 3D. This must match the previous cream room as one coherent game art set.
```

### pet-wall-starry-prompt

```text
Use case: style-transfer. Edit target: this wide cozy pixel pet game back wall. Produce the starry evening wallpaper variant. Preserve EXACTLY the same 5:2 canvas and locations/dimensions of all architecture: oak top beam, side beams, bottom horizontal skirting board, left window, curtains, small clock on upper right. Keep all original crisp square pixel art structure. Change only theme: wall is restful indigo twilight blue with sparse small golden pixel four-point stars; curtains midnight blue and pale lavender; window view is a little blue night sky, crescent moon, tiny stars and distant quiet green hills. Wood remains honey oak, warm soft glow from the window. No foreground furniture, no animals, no floor, no UI or text, no new objects. Central and lower right wall stay clear for game sprites. Render with hard stepped 16-bit pixel edges, three-tone limited palette, no smooth lighting gradients, no antialiasing or blur. Beautiful cozy nighttime safe room.
```

### pet-wall-cloud-prompt

```text
Use case: style-transfer. Edit target: the cozy cream pixel pet game back wall. Produce a dreamy cloud wallpaper variant of this same game room. Preserve the exact wide5:2 canvas, architecture, window position/geometry, timber frame/skirting board and clock positions. Change only theme colors and motifs: wall pale muted powder blue with sparse tiny cream pixel cloud pattern; curtains soft pastel peach and cream; window view has a light cyan sunny sky and fluffy stepped white clouds above gentle rose and green hills. Timber remains honey oak and chestnut. Warm sunny cozy atmosphere, saturated yellow small highlights. No foreground furniture, animal, plants, floor, words, labels, UI or new objects. The central and lower right wall remains empty for moving pet sprites. Crisp 16-bit hand-designed square pixel clusters, limited three-tone shading, no smooth gradients or blur, no antialiasing, no 3D. Match the previous cream/forest/starry themes as one coherent game art collection.
```

### pet-floors-prompt

```text
Use case: stylized-concept. Asset type: four floor tiles for an original cozy 16-bit pixel pet game.
Generate a wide horizontal 4:1 canvas with EXACTLY four equal square panels side by side, no gaps, no frames, no dividers, no text. Each panel is an independent seamless repeating flat orthographic TOP-DOWN FLOOR texture designed at a logical 32x32 pixel size, then upscaled with nearest-neighbor. Nothing else is present. Consistent crisp square pixel art with tasteful restrained three-tone shading. Smoothly repeatable edges, no perspective, no 3D, no blurred details, no antialiasing, no gradients.
Panel1 leftmost: honey-colored oak floor boards, staggered horizontal plank seams and just a few darker hard pixel wood grain lines, cozy warm chestnut and golden tan.
Panel2: soft buttery yellow and pale cream checkerboard, four checks across and four down, subtle brown single-pixel checker edges, cheerful pet playroom.
Panel3: muted sage mint woven mat, small regular basket-weave pixel pattern in three close green tones, gentle low contrast for forest theme.
Panel4 rightmost: pastel rose and peach diagonal woven rug pattern, gentle low contrast and tiny cream dot accents, sweet cozy room.
These are production game tiles, understated so a moving pet and furniture sprites remain readable. All four should match classic cozy pixel furniture with brown outlines and cream/yellow/mint/rose color palette.
```
