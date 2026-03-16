// ============================================
// Drawing Tools System — Per-slide SVGs
// ============================================

let currentTool = null;
let isDrawing = false;
let currentPath = null;
let drawingSVG = null;   // Points to active slide's drawing SVG
let whiteoutSVG = null;  // Points to active slide's whiteout SVG
let lastEKeyTime = 0;
const DOUBLE_CLICK_THRESHOLD = 300; // milliseconds
// Note: lastMouseX and lastMouseY are declared in app.js

// Get (or create) drawing SVGs for a given slide element
function getSlideSVGs(slide) {
    if (!slide) return { drawing: null, whiteout: null };

    let drawing = slide.querySelector('.slide-drawing-svg');
    let whiteout = slide.querySelector('.slide-whiteout-svg');

    if (!drawing) {
        drawing = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        drawing.classList.add('slide-drawing-svg');
        drawing.style.pointerEvents = 'none';
        drawing.style.display = 'block';
        drawing.setAttribute('width', '100%');
        drawing.setAttribute('height', '100%');
        slide.appendChild(drawing);
    }

    if (!whiteout) {
        whiteout = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        whiteout.classList.add('slide-whiteout-svg');
        whiteout.style.pointerEvents = 'none';
        whiteout.style.display = 'block';
        whiteout.setAttribute('width', '100%');
        whiteout.setAttribute('height', '100%');
        slide.appendChild(whiteout);
    }

    return { drawing, whiteout };
}

// Get the currently active slide element
function getActiveSlide() {
    return document.querySelector('.slide.active');
}

// Point drawingSVG / whiteoutSVG to the active slide's SVGs
function initDrawingCanvas() {
    const slide = getActiveSlide();
    if (!slide) return;
    const svgs = getSlideSVGs(slide);
    drawingSVG = svgs.drawing;
    whiteoutSVG = svgs.whiteout;
}

// Clear all drawings on the active slide
function clearAllDrawings() {
    const slide = getActiveSlide();
    if (!slide) return;
    const svgs = getSlideSVGs(slide);
    svgs.drawing.innerHTML = '';
    svgs.whiteout.innerHTML = '';
}

// Save / restore no longer needed — drawings live in per-slide SVGs
function saveCurrentSlideDrawings() {}
function restoreSlideDrawings() {}

// Get tool settings
function getToolSettings(tool) {
    const settingsAPI = window.markupSettings;

    if (tool === 'pen') {
        return {
            color: settingsAPI ? settingsAPI.get('penColor', '#0085ff') : '#0085ff',
            thickness: settingsAPI ? settingsAPI.get('penThickness', 3) : 3,
            opacity: 1
        };
    } else if (tool === 'highlighter') {
        return {
            color: settingsAPI ? settingsAPI.get('highlighterColor', '#f1b03d') : '#f1b03d',
            thickness: settingsAPI ? settingsAPI.get('highlighterThickness', 20) : 20,
            opacity: 1
        };
    } else if (tool === 'whiteout') {
        return {
            color: '#f0efed',
            thickness: settingsAPI ? settingsAPI.get('whiteoutThickness', 40) : 40,
            opacity: 1
        };
    }
    return null;
}

// Convert screen coordinates to SVG coordinates relative to active slide
function getSVGCoordinates(e) {
    const slide = getActiveSlide();
    if (!slide) return { x: e.clientX, y: e.clientY };

    const rect = slide.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// Create custom cursor for tool
function updateCursor(tool) {
    const body = document.body;
    const eraserCursor = document.getElementById('eraserCursor');

    if (tool === 'eraser') {
        body.style.cursor = 'none';

        if (!eraserCursor) {
            const newEraserCursor = document.createElement('div');
            newEraserCursor.id = 'eraserCursor';
            newEraserCursor.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20">
                    <line x1="4" y1="4" x2="16" y2="16" stroke="#cc451c" stroke-width="3" stroke-linecap="round"/>
                    <line x1="16" y1="4" x2="4" y2="16" stroke="#cc451c" stroke-width="3" stroke-linecap="round"/>
                </svg>
            `;
            newEraserCursor.style.position = 'fixed';
            newEraserCursor.style.pointerEvents = 'none';
            newEraserCursor.style.zIndex = '10000';
            newEraserCursor.style.display = 'block';
            newEraserCursor.style.left = (lastMouseX - 10) + 'px';
            newEraserCursor.style.top = (lastMouseY - 10) + 'px';
            document.body.appendChild(newEraserCursor);
        } else {
            eraserCursor.style.display = 'block';
            eraserCursor.style.left = (lastMouseX - 10) + 'px';
            eraserCursor.style.top = (lastMouseY - 10) + 'px';
        }
    } else if (tool === 'pen' || tool === 'highlighter' || tool === 'whiteout') {
        body.style.cursor = 'crosshair';
        if (eraserCursor) eraserCursor.style.display = 'none';
    } else {
        body.style.cursor = '';
        if (eraserCursor) eraserCursor.style.display = 'none';
    }
}

// Update eraser cursor position and track mouse for drawing
document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (currentTool === 'eraser') {
        const eraserCursor = document.getElementById('eraserCursor');
        if (eraserCursor) {
            eraserCursor.style.left = (e.clientX - 10) + 'px';
            eraserCursor.style.top = (e.clientY - 10) + 'px';
        }
        erasePath(e);
    } else if (isDrawing) {
        continueDrawing(e);
    }
});

// Start drawing
function startDrawing(e) {
    if (!currentTool || currentTool === 'eraser') return;

    e.preventDefault();
    isDrawing = true;
    const settings = getToolSettings(currentTool);

    if (!settings) {
        console.error('Failed to get settings for tool:', currentTool);
        return;
    }

    const coords = getSVGCoordinates(e);

    currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    currentPath.setAttribute('fill', 'none');
    currentPath.setAttribute('stroke', settings.color);
    currentPath.setAttribute('stroke-width', settings.thickness);
    currentPath.setAttribute('stroke-linecap', 'round');
    currentPath.setAttribute('stroke-linejoin', 'round');
    currentPath.setAttribute('opacity', settings.opacity);
    currentPath.dataset.tool = currentTool;

    const startPoint = `M ${coords.x} ${coords.y}`;
    currentPath.setAttribute('d', startPoint);

    // Append to correct SVG layer on the active slide
    const targetSVG = currentTool === 'whiteout' ? whiteoutSVG : drawingSVG;
    if (targetSVG) targetSVG.appendChild(currentPath);
}

// Continue drawing
function continueDrawing(e) {
    if (!isDrawing || !currentPath) return;

    e.preventDefault();
    const coords = getSVGCoordinates(e);
    const d = currentPath.getAttribute('d');
    const newPoint = ` L ${coords.x} ${coords.y}`;
    currentPath.setAttribute('d', d + newPoint);
}

// Stop drawing
function stopDrawing() {
    if (isDrawing && currentPath) {
        currentPath = null;
        isDrawing = false;
    }
}

// Erase path under cursor
function erasePath(e) {
    if (!drawingSVG || !whiteoutSVG) return;
    const coords = getSVGCoordinates(e);
    const x = coords.x;
    const y = coords.y;

    const drawingPaths = Array.from(drawingSVG.querySelectorAll('path'));
    const whiteoutPaths = Array.from(whiteoutSVG.querySelectorAll('path'));
    const allCurrentPaths = [...drawingPaths, ...whiteoutPaths];

    for (let i = allCurrentPaths.length - 1; i >= 0; i--) {
        const path = allCurrentPaths[i];
        const bbox = path.getBBox();
        const threshold = parseFloat(path.getAttribute('stroke-width')) / 2 + 5;

        if (x >= bbox.x - threshold && x <= bbox.x + bbox.width + threshold &&
            y >= bbox.y - threshold && y <= bbox.y + bbox.height + threshold) {

            const pathLength = path.getTotalLength();
            let minDistance = Infinity;

            for (let j = 0; j < pathLength; j += 5) {
                const point = path.getPointAtLength(j);
                const distance = Math.sqrt(
                    Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
                );
                minDistance = Math.min(minDistance, distance);

                if (minDistance < threshold) {
                    path.remove();
                    return;
                }
            }
        }
    }
}

// Handle key down
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.repeat) return;

    const presentationContainer = document.getElementById('presentationContainer');
    if (!presentationContainer || presentationContainer.style.display === 'none') return;

    if (e.key === 'f' || e.key === 'F') {
        if (currentTool !== 'highlighter') {
            currentTool = 'highlighter';
            initDrawingCanvas();
            if (drawingSVG) drawingSVG.style.pointerEvents = 'auto';
            updateCursor('highlighter');
        }
    } else if (e.key === 'd' || e.key === 'D') {
        if (currentTool !== 'pen') {
            currentTool = 'pen';
            initDrawingCanvas();
            if (drawingSVG) drawingSVG.style.pointerEvents = 'auto';
            updateCursor('pen');
        }
    } else if (e.key === 'w' || e.key === 'W') {
        if (currentTool !== 'whiteout') {
            currentTool = 'whiteout';
            initDrawingCanvas();
            if (whiteoutSVG) whiteoutSVG.style.pointerEvents = 'auto';
            updateCursor('whiteout');
        }
    } else if (e.key === 'e' || e.key === 'E') {
        const now = Date.now();
        if (now - lastEKeyTime < DOUBLE_CLICK_THRESHOLD && lastEKeyTime > 0) {
            clearAllDrawings();
            stopDrawing();
            currentTool = null;
            updateCursor(null);
            lastEKeyTime = 0;
        } else if (currentTool !== 'eraser') {
            stopDrawing();
            currentTool = 'eraser';
            initDrawingCanvas();
            if (drawingSVG) drawingSVG.style.pointerEvents = 'auto';
            if (whiteoutSVG) whiteoutSVG.style.pointerEvents = 'auto';
            updateCursor('eraser');
            lastEKeyTime = now;
        }
    }
});

// Handle key up
document.addEventListener('keyup', (e) => {
    if (e.key === 'f' || e.key === 'F' || e.key === 'd' || e.key === 'D') {
        stopDrawing();
        currentTool = null;
        if (drawingSVG) drawingSVG.style.pointerEvents = 'none';
        updateCursor(null);
    } else if (e.key === 'e' || e.key === 'E') {
        stopDrawing();
        currentTool = null;
        if (drawingSVG) drawingSVG.style.pointerEvents = 'none';
        if (whiteoutSVG) whiteoutSVG.style.pointerEvents = 'none';
        updateCursor(null);
    } else if (e.key === 'w' || e.key === 'W') {
        stopDrawing();
        currentTool = null;
        if (whiteoutSVG) whiteoutSVG.style.pointerEvents = 'none';
        updateCursor(null);
    }
});

// Drawing events on document
document.addEventListener('mousedown', (e) => {
    if (currentTool === 'eraser') {
        erasePath(e);
    } else if (currentTool) {
        startDrawing(e);
    }
});

document.addEventListener('mouseup', () => {
    stopDrawing();
});

console.log('Drawing tools loaded');
