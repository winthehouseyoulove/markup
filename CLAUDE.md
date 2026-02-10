# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Markup is a presentation tool that transforms Notion exports into interactive slide decks with drawing capabilities. It's a client-side web application with no build process - all HTML, CSS, and vanilla JavaScript.

## Running the Application

Start a local server:
```bash
python3 -m http.server 8000
```

Or use the launch script:
```bash
./launch-markup.sh
```

Then navigate to `http://localhost:8000/index.html`

## Architecture

### Core Application Flow

1. **File Input** (`app.js`): User drops/selects a Notion ZIP export
2. **ZIP Processing** (`app.js`): JSZip extracts HTML and assets, handles nested ZIPs
3. **Content Processing** (`app.js`): HTML parsed, Notion styles removed, slide system initialized
4. **Presentation Mode** (`app.js`): Content split by `<hr>` tags into slides with navigation

### Key Systems

#### Slide System (app.js:1302-1566)
- Splits content by `<hr>` elements into individual slides
- Slide-by-slide navigation with arrow keys (← →)
- Progress tracking and "Up Next" preview
- Slide animations with fade in/out transitions
- Each slide stored as DOM nodes in `slides` array

#### Drawing System (drawing.js)
Two independent SVG layers:
- **drawingSVG** (z-index: 5): Below text for pen/highlighter
- **whiteoutSVG** (z-index: 200): Above text for covering content

Drawing tools activated by holding keys:
- **D**: Pen tool (blue, customizable)
- **F**: Highlighter (yellow, customizable)
- **W**: Whiteout (covers text)
- **E**: Eraser (press once for eraser, press twice quickly to clear all)
- **V**: Laser pointer (red dot that follows cursor)

Drawings are per-slide: `drawingsBySlide` object stores paths for each slide, restored on navigation.

#### Storage System (app.js:41-177)
IndexedDB stores:
- Uploaded ZIP files (as ArrayBuffer)
- File metadata (name, timestamp, display name from HTML title)
- Stickers per presentation (positions, rotations)

Each file gets an auto-incrementing ID used as `currentFileId` for sticker persistence.

#### Settings System (settings.js)
localStorage-based settings with modal UI:
- Pen/highlighter/whiteout colors and thickness
- Laser pointer size and color
- Settings available via `window.markupSettings.get(key, default)`
- Dispatches `settingsChanged` event when modified

#### Sticker System (app.js:429-1750)
Two contexts:
1. **Home page**: Random decorative stickers from `stickers/` folder
2. **Presentation mode**: Draggable stickers users can place on slides
   - Drag from library panel (toggle with sticker button)
   - Double-click to delete
   - Persisted to IndexedDB per presentation

#### Timer & Progress (app.js:936-1161)
- Editable countdown timer (enter minutes, press play)
- Progress bar shows slide position (not scroll position)
- Time progress line overlay shows timer vs goal duration
- Visual segments in progress bar for each slide

### Special Features

**Interactive Checkboxes** (app.js:1166-1223): Click Notion checkboxes to toggle with confetti animation

**Pixelate Effect** (app.js:1228-1246): Strikethrough text appears pixelated, click to unpixelate

**Laser Pointer** (app.js:361-423): Hold V key for red laser dot that follows mouse

## File Structure

- `index.html`: Main HTML structure with all UI elements
- `app.js`: Core application logic, ZIP processing, slides, storage
- `drawing.js`: Drawing tools, SVG layers, per-slide drawing persistence
- `settings.js`: Settings modal and localStorage management
- `shortcuts.js`: Keyboard shortcuts modal
- `styles.css`: All styles (not examined but referenced)
- `stickers/`: PNG images used for stickers (6 files: drawn house, heart, 3 houses, keys, plant)
- `demo.html`: Demo presentation loaded when clicking Demo button
- `launch-markup.sh`: Launch script to start server and open browser

## Key Variables & State

- `currentSlideIndex`: Active slide (0-indexed)
- `totalSlides`: Number of slides in presentation
- `slides`: Array of DOM node collections for each slide
- `currentFileId`: IndexedDB ID of loaded presentation (for sticker saving)
- `currentTool`: Active drawing tool ('pen', 'highlighter', 'whiteout', 'eraser', or null)
- `drawingsBySlide`: Object mapping slide index to array of path objects
- `laserActive`: Boolean for laser pointer visibility

## Dependencies

- **JSZip** (CDN): `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js`
- **KaTeX CSS** (CDN): `https://cdn.jsdelivr.net/npm/katex@0.16.25/dist/katex.min.css` — loaded globally in `index.html` for equation rendering
- No build tools, no npm, no bundler

## Important Patterns

1. **No navigation blocking**: Images wrapped in `<a>` tags have href removed and click prevented
2. **Slide transitions**: 100ms fade-out, switch content, fade-in. Drawing layers hidden during transition (120ms delay on restore)
3. **Event delegation**: Checkboxes use delegation on `previewContent` for dynamic content
4. **Debounced saves**: Sticker positions saved with 500ms debounce timeout
5. **Drawing persistence**: Always save before slide transition, restore after

## Customizing Notion Export Styles

When users want to customize how Notion elements (callouts, highlights, etc.) appear in uploaded presentations:

**DO:**
- Add custom CSS to `styles.css` (not to individual HTML files)
- Use high specificity selectors with `!important` to override Notion defaults
- Target both the element classes AND any `<mark>` or `[class*="highlight"]` elements inside them
- Remember that uploaded HTML has its `<style>` tags stripped during processing (app.js:804-810)

**Common Notion class patterns:**
- Callouts: `<figure class="callout block-color-{name}">` or `<figure class="callout block-color-{name}_background">`
  - Examples: `block-color-default`, `block-color-teal_background`, `block-color-red_background`, `block-color-purple_background`
- Highlights: `<mark class="highlight-{color}">`
  - Examples: `highlight-teal`, `highlight-red`, `highlight-default`
- Text colors: Elements may have nested `<mark>` tags that override parent text colors

**Example pattern for styling callouts:**
```css
.callout.block-color-teal_background {
    background: rgba(68, 114, 71, 0.15) !important;
    border: none !important;
    padding: 1.75rem !important;
}

.callout.block-color-teal_background h3,
.callout.block-color-teal_background p,
.callout.block-color-teal_background li,
.callout.block-color-teal_background mark,
.callout.block-color-teal_background [class*="highlight"] {
    color: #447247 !important;
    background-color: transparent !important;
}
```

**KaTeX Equation patterns:**
Notion exports equations as pre-rendered KaTeX HTML inside `<figure class="equation">` elements. No JS needed — the KaTeX CSS CDN in `index.html` handles rendering.

Key challenges and how they're solved in `styles.css`:
- **Duplicate rendering**: Each equation has a `.katex-mathml` (screen reader) and `.katex-html` (visual) section. The broad `.preview-content span { position: relative !important }` rule breaks the absolute positioning that hides `.katex-mathml`. Fix: force-hide `.katex-mathml` with high-specificity clip rules.
- **Colors overridden**: The broad `.preview-content span { color: #01413e !important }` overrides inline `style="color:red"` etc. Fix: reset `.preview-content .katex span { color: inherit !important }` then map colors via attribute selectors `[style*="color:red"]` (higher specificity).
- **Font-size blown up**: The broad `font-size: var(--font-size-body)` on all spans overrides KaTeX sizing. Fix: `font-size: inherit !important` on `.preview-content .katex span`.

Color mapping (inline KaTeX color → brand color):
- `color:red` → `#cc451c` (brand red)
- `color:green` → `#447247` (accent green)
- `color:blue` → `#01413e` (primary)
- `color:purple` → `#7a306c` (brand purple)

Other equation styles:
- `.hline` (sum/total line): thickened to `0.08em`, nudged up with `translateY(-0.3em)` for even spacing
- KaTeX fonts overridden to Poppins via `var(--font-family-custom)`
- Line-height tightened to `0.85` and letter-spacing set to `var(--letter-spacing-custom)`

**Why styles.css, not inline HTML?**
The app strips most `<style>` tags from uploaded HTML files (app.js:804-810) to avoid conflicting Notion styles. Only styles containing 'font-family' or 'Custom Callout Styles' are preserved. Therefore, to apply custom styling to ALL uploaded presentations, add CSS to the app's `styles.css` file.
