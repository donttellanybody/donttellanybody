# UI asset sources

- `hero-title.svg`, `hero-reflection.svg`, `hero-copy.svg`: retained Figma reference exports (nodes `378:1135`, `378:1175`, `342:2621`). The home hero now renders selectable HTML text instead of these images.
- `icon-box.svg`: same file, My Box icon node `399:2098`.
- `icon-trash.svg`: same file, trash vector inside component `235:37` (position 153,117).

These SVGs were exported from the original Figma editor. No paths were redrawn.

## Home typography

- `ClimateCrisis-Regular.ttf`: Google Fonts `ofl/climatecrisis/ClimateCrisis[YEAR].ttf`, Regular with the default YEAR=1979 axis. License: `OFL-ClimateCrisis.txt`.
- `EncodeSansSemiCondensed-Black.ttf`: Google Fonts `ofl/encodesanssemicondensed/EncodeSansSemiCondensed-Black.ttf`, weight 900. License: `OFL-EncodeSansSemiCondensed.txt`.
- `NotoSansJP-Black-Hero.ttf`: Google Fonts Noto Sans JP 900, subset to the home hero Japanese characters and self-hosted as `Hero Japanese`. License: `OFL-NotoSansJP.txt`.
- Sources: https://github.com/google/fonts/tree/main/ofl/climatecrisis and https://github.com/google/fonts/tree/main/ofl/encodesanssemicondensed .
- Original editable Figma typography: node `167:4` (20px, 136% leading, 0% tracking); node `342:2618` (7.5px body, 9px opening, 10px emphasis, 25% tracking). The current outlined hero determines color, geometry, stroke and shadow. Japanese glyphs use Noto Sans JP 900 because Encode Sans Semi Condensed has no Japanese glyphs. Reflection is live text with vertical inversion/compression and half opacity. Browser and Figma text rasterization can differ.

`social-note.svg` uses the official note Visual Identity main/icon.svg, downloaded from https://www.help-note.com/hc/ja/article_attachments/17204878543513 . Its viewBox removes the surrounding whitespace; the path is unchanged, and its fill matches the Instagram asset (`#706d68`). SNS wrappers retain aspect ratios and use equal center-to-center spacing.
