# Markup

A powerful presentation tool that transforms Notion exports into interactive slide decks with drawing capabilities.

![Markup Demo](logo.svg)

## Features

✨ **Notion Integration**
- Import Notion page exports (ZIP files)
- Automatic slide splitting by horizontal rules
- Clean, customizable typography

🎨 **Drawing Tools**
- **Pen** (Press `D`) - Draw freehand annotations
- **Highlighter** (Press `F`) - Highlight important content
- **Whiteout** (Press `W`) - Cover/hide text
- **Eraser** (Press `E`) - Remove drawings
- **Laser Pointer** (Press `V`) - Point at content during presentations

⚙️ **Live Typography Customization**
- Adjust font sizes for all heading levels
- Control line heights and letter spacing
- Choose from 8 font families
- Customize spacing between elements
- Settings persist across sessions

🎯 **Presentation Features**
- Slide-by-slide navigation (← → arrow keys)
- Progress tracking with visual indicators
- Countdown timer with editable duration
- Interactive checkboxes with confetti effects
- Sticker system for slide decoration

## Quick Start

### Option 1: Local Server (Recommended)

```bash
# Using Python 3
python3 -m http.server 8000

# Or use the launch script
./launch-markup.sh
```

Then open http://localhost:8000/index.html

### Option 2: Direct File Access

Simply open `index.html` in your browser (some features may be limited without a server).

## Usage

1. **Load Content:**
   - Click "Demo" to see a sample presentation
   - Drag & drop a Notion ZIP export
   - Click to select a file from your computer

2. **Navigate Slides:**
   - `←` / `→` - Previous/Next slide
   - Progress bar shows your position

3. **Drawing:**
   - Hold `D` and drag to draw with pen
   - Hold `F` and drag to highlight
   - Hold `W` and drag to cover text
   - Press `E` once for eraser mode
   - Press `E` twice quickly to clear all drawings
   - Hold `V` for laser pointer

4. **Customize Typography:**
   - Click the gear icon ⚙️ in the bottom toolbar
   - Adjust font sizes, spacing, and fonts
   - Changes preview live as you adjust
   - Click "Save" to persist your settings

## Project Structure

```
markup/
├── index.html          # Main HTML structure
├── styles.css          # All styling and CSS variables
├── app.js             # Core app logic, file processing, slides
├── drawing.js         # Drawing tools and SVG layers
├── settings.js        # Settings system and modal
├── shortcuts.js       # Keyboard shortcuts reference
├── demo.html          # Demo presentation
├── logo.svg           # Branding logo
├── stickers/          # Sticker images for decoration
├── launch-markup.sh   # Server launch script
└── CLAUDE.md          # Developer documentation
```

## Technical Details

- **No build process** - Pure HTML, CSS, and vanilla JavaScript
- **Client-side only** - All processing happens in the browser
- **Dependencies:** JSZip (via CDN) for ZIP file processing
- **Storage:** IndexedDB for uploaded files, localStorage for settings
- **Browser Support:** Modern browsers with ES6+ support

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate slides |
| `D` (hold) | Pen tool |
| `F` (hold) | Highlighter tool |
| `W` (hold) | Whiteout tool |
| `E` | Eraser mode |
| `E` (double-tap) | Clear all drawings |
| `V` (hold) | Laser pointer |

## Settings

Customizable settings include:
- H1, H2, H3 heading sizes
- H4-H6 grouped heading size
- Body text size
- Heading and body line heights
- Letter spacing (separate for headings and body)
- Heading and paragraph margins
- Font family selection
- Drawing tool colors and thicknesses
- Laser pointer size

## Development

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation and development guidelines.

## License

© 2026 - All Rights Reserved

## Contributing

This is a personal project, but suggestions and feedback are welcome through GitHub Issues.

---

Built with ❤️ using vanilla JavaScript
