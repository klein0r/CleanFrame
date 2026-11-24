# Asset generation

The app includes all runtime JPEGs, thumbnails, registered material fields, public fonts and icons. A clone can preview the current app without the original Downloads folder or any generation step. Keep photo and icon credits and third-party licences with the assets. The private Pangram overlay is described in [development](development.md).

## Current List and Dock materials

The runtime uses fourteen images: twelve Unsplash photographs and two generated images. Each has a background, a thumbnail, a small panel backdrop and four full-stage material JPEGs. The runtime never generates blur or reads photo pixels. Generate selected materials with:

```sh
node scripts/build-materials.mjs summit,sydney,amber,alpine
```

Omit the argument to regenerate every catalogue entry. Output goes to ignored `.local/materials/builder/`. Review it, then copy `*-panel.jpg` to `app/assets/wallpapers/` and the other four JPEGs to `app/assets/materials/`.

- `field-blur`: 28px blur, saturation .92, mirrored edge padding and highlight soft clipping.
- `field-frost`: the same registered crop with 42px blur.
- `field-clear`: 2px blur and saturation 1.06, with no baked veil.
- `study-soft`: the retained name for the reviewed Dock Soft recipe, including the lower scrim, 14px blur and compressed local variation. The original eight that remain bundled preserve their calibrated tint. New photos use a bounded tint selected from the dock band.

All fields use the centred 1920 x 1080 crop. The small panel backdrop comes from that same Frost field. The newer backgrounds use baseline sRGB JPEG at quality 90 with full chroma; thumbnails use quality 85. Their originals remain unchanged.

`app/assets/wallpapers/catalog.js` stores names and surface parameters; `app/assets/adaptive-ink.js` stores offline colour choices. New photographs need a rendered review of their List, Dock, clock, controls and all three materials before their metadata is accepted. An average image colour alone does not establish readable text.

## Icon metrics

`node scripts/build-icon-metrics.mjs` measures the SVGs in an aspect-preserved 240px viewport, matching the CSS mask renderer. Output is ignored `.local/materials/metrics.js`; review before copying it into `app/assets/icons/metrics.js`. The TV reads these bounds and does not scan icon pixels.

## New or replacement photographs

Full-size original photographs are local inputs and are not required for glass regeneration: the bundled 1920px JPEGs are the rendering inputs. To recreate JPEGs/thumbnails from the original supplied filenames on a Mac:

```sh
python3 scripts/prepare-wallpapers.py /path/to/originals --ids summit,sydney,amber,alpine
```

The retained generator covers the twelve bundled Unsplash filenames and writes `.local/materials/wallpapers/`. The original eight keep their macOS `sips` recipe. The newer four require Pillow and use the reviewed centred crop and JPEG settings; Pillow is a development dependency only. Install Pillow in a local Python environment when using the four newer photos.

For another photo, add its source/credit to `SOURCES.json`, prepare its background and thumbnail, add the gallery entry in `catalog.js`, generate the four registered materials and panel backdrop, then measure and review its foreground metadata. Keep the crop identical across all assets. Run source and browser checks before packaging.

### Adding a photograph step by step

Use a short lowercase ID such as `lantern`; every file name below derives from it. Keep the untouched original outside `app/`, for example in `.local/originals/`, because the steps re-encode it.

1. **Background and thumbnail.** Write `app/assets/wallpapers/<id>.jpg` at 1920 x 1080 and `<id>-thumb.jpg` at 512 x 288, both from the same centred 16:9 crop. Use the `prepare_cover` settings in `scripts/prepare-wallpapers.py`: baseline (not progressive) JPEG, sRGB, `optimize=True`; background quality 90 with full chroma (`subsampling=0`), thumbnail quality 85 (`subsampling=2`). Many editors save progressive JPEG by default, so check the result. That script only knows the twelve bundled Unsplash IDs; for a new ID, apply the same `prepare_cover` code to the original. Start from the largest original available, because re-encoding an existing 1920px JPEG loses some quality.
2. **`SOURCES.json` entry.** Add `id`, `name`, `src`, `thumb`, `pos` (`50% 50%`), `tone`, `credit` and `source`. Do this before step 3, which rejects IDs missing here with `Unknown wallpaper`. Record a non-Unsplash source and its terms in [asset sources](asset-sources.md) too.
3. **Materials and panel.** Run `node scripts/build-materials.mjs <id>`. Copy `<id>-panel.jpg` from `.local/materials/builder/` to `app/assets/wallpapers/`, and the four `field-blur`, `field-frost`, `field-clear` and `study-soft` JPEGs to `app/assets/materials/`. Never supply a hand-made panel: it is a reduced Frost field, not a sharp thumbnail.
4. **`catalog.js` entry.** Copy the entry of a bundled photo with similar brightness as a starting point. Without an `adaptive-ink.js` entry, the runtime uses the catalogue's `ut` values, which is sufficient. Fields:
   - `ut.tr` / `ut.br`: `light`, `mist` or `dark`, for the top-right controls and the bottom-right area.
   - `frostVeil`: one of `.12`, `.20`, `.30`, `.36`, `.44`.
   - `listColumn`: `0`, `2` or `3`. It darkens the left List column.
   - `dockQuiet`: tones down the focused Dock plate over bright lower image areas.
   - `clockMist`: adds a Dock-layout clock scrim.
5. **Measure contrast.** Run `GALLERY_IDS=<id> GALLERY_OUT=<id> node scripts/check-gallery-contrast.mjs`, then `GALLERY_OUT=<id> python3 scripts/analyse-gallery-contrast.py`. The analysis needs Pillow and NumPy. Expect `belowMinimum: 0` and `targetMisses: 0`. Misses are listed in `.local/qa/production-<id>.json`, and screenshots are in `.local/qa/<id>/`. Look at the List and Dock captures, adjust the catalogue fields and measure again.
6. **Update counts and checks.** Update the wallpaper count in `README.md`, `app/assets/wallpapers/README.md`, `docs/development.md`, `docs/for-agents.md` and `docs/testing.md`. Then run `npm run check` and `CLEANFRAME_PUBLIC_FONTS=1 npm run check:browser`.

To remove a photo, delete its seven JPEGs and its `SOURCES.json` and `catalog.js` entries, then revert the counts.

### Running these steps in Docker

The Tizen image (`docker/`) is linux/amd64 and slow under emulation on Apple silicon, so run the Node/Playwright steps in the official Playwright image that matches `package.json`. Keep Linux `node_modules` in a separate volume:

```sh
docker run --rm --ipc=host -v "$PWD:/work" -w /work \
  -v cleanframe-node-modules-assets:/work/node_modules \
  mcr.microsoft.com/playwright:v1.64.1-noble \
  sh -c 'npm ci && node scripts/build-materials.mjs <id>'
```

Pass `-e GALLERY_IDS=… -e GALLERY_OUT=…` or `-e CLEANFRAME_PUBLIC_FONTS=1` for the check scripts. The Playwright image has Python 3 but no Pillow. If `apt-get` in it reports invalid signatures, install Pillow and NumPy into a `python:3.12-slim` image with `pip` instead, and run steps 1 and 5's analysis there with `python -I`.

Source pages and licence observations are recorded in [asset sources](asset-sources.md).
