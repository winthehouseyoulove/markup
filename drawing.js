// ============================================
// Drawing Tools System
// ============================================

let currentTool = null;
let isDrawing = false;
let currentPath = null;
let allPaths = []; // Kept for compatibility
let drawingsBySlide = {}; // Store drawings per slide: { slideIndex: [paths] }
let drawingSVG = null;
let whiteoutSVG = null;
let lastEKeyTime = 0;
let scrollListenerAttached = false;
const DOUBLE_CLICK_THRESHOLD = 300; // milliseconds
// Note: lastMouseX and lastMouseY are declared in app.js

// Clear all drawings
function clearAllDrawings() {
    allPaths.forEach(path => path.remove());
    allPaths = [];
    
    // Clear current slide's drawings
    if (typeof currentSlideIndex !== 'undefined') {
        drawingsBySlide[currentSlideIndex] = [];
    }
    
    if (drawingSVG) {
        drawingSVG.innerHTML = '';
    }
    if (whiteoutSVG) {
        whiteoutSVG.innerHTML = '';
    }
}

// Save current slide's drawings
function saveCurrentSlideDrawings() {
    if (typeof currentSlideIndex === 'undefined') return;
    
    const paths = [];
    
    if (drawingSVG) {
        drawingSVG.querySelectorAll('path').forEach(path => {
            paths.push({
                element: path.cloneNode(true),
                svg: 'drawing'
            });
        });
    }
    
    if (whiteoutSVG) {
        whiteoutSVG.querySelectorAll('path').forEach(path => {
            paths.push({
                element: path.cloneNode(true),
                svg: 'whiteout'
            });
        });
    }
    
    drawingsBySlide[currentSlideIndex] = paths;
}

// Restore drawings for a slide
function restoreSlideDrawings(slideIndex) {
    // Clear current drawings
    if (drawingSVG) drawingSVG.innerHTML = '';
    if (whiteoutSVG) whiteoutSVG.innerHTML = '';
    
    // Restore drawings for this slide
    const slideDrawings = drawingsBySlide[slideIndex] || [];
    
    slideDrawings.forEach(({element, svg}) => {
        const clonedPath = element.cloneNode(true);
        if (svg === 'drawing' && drawingSVG) {
            drawingSVG.appendChild(clonedPath);
        } else if (svg === 'whiteout' && whiteoutSVG) {
            whiteoutSVG.appendChild(clonedPath);
        }
    });
}

// Sync SVG positions with previewContent scroll
function syncSVGScroll() {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;
    const scrollTop = previewContent.scrollTop;
    const topOffset = previewContent.offsetTop;
    const yPos = topOffset - scrollTop;
    if (drawingSVG) {
        drawingSVG.style.top = yPos + 'px';
    }
    if (whiteoutSVG) {
        whiteoutSVG.style.top = yPos + 'px';
    }
}

// Initialize drawing canvas
function initDrawingCanvas() {
    const shareArea = document.querySelector('.share-area');
    const previewContent = document.getElementById('previewContent');
    if (!shareArea || !previewContent) return;

    // Wait for images to load before getting dimensions
    const images = previewContent.querySelectorAll('img');
    const imagesLoaded = Array.from(images).every(img => img.complete);

    if (!imagesLoaded) {
        Promise.all(
            Array.from(images)
                .filter(img => !img.complete)
                .map(img => new Promise(resolve => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                }))
        ).then(() => {
            setTimeout(() => initDrawingCanvas(), 50);
        });
        return;
    }

    // Get previewContent dimensions and position
    const contentHeight = previewContent.scrollHeight;
    const contentWidth = previewContent.clientWidth;
    const topOffset = previewContent.offsetTop;
    const leftOffset = previewContent.offsetLeft;

    // Create regular drawing SVG (below text)
    if (!drawingSVG) {
        drawingSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        drawingSVG.id = 'drawingSVG';
        drawingSVG.style.position = 'absolute';
        drawingSVG.style.top = topOffset + 'px';
        drawingSVG.style.left = leftOffset + 'px';
        drawingSVG.style.width = contentWidth + 'px';
        drawingSVG.style.height = contentHeight + 'px';
        drawingSVG.style.pointerEvents = 'auto';
        drawingSVG.style.zIndex = '5';
        drawingSVG.style.transition = 'opacity 0.2s ease-out';
        drawingSVG.style.opacity = '1';
        drawingSVG.style.display = 'none';
        drawingSVG.style.overflow = 'visible';
        shareArea.appendChild(drawingSVG);
    } else {
        drawingSVG.style.top = topOffset + 'px';
        drawingSVG.style.left = leftOffset + 'px';
        drawingSVG.style.width = contentWidth + 'px';
        drawingSVG.style.height = contentHeight + 'px';
    }

    // Create whiteout SVG (above text)
    if (!whiteoutSVG) {
        whiteoutSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        whiteoutSVG.id = 'whiteoutSVG';
        whiteoutSVG.style.position = 'absolute';
        whiteoutSVG.style.top = topOffset + 'px';
        whiteoutSVG.style.left = leftOffset + 'px';
        whiteoutSVG.style.width = contentWidth + 'px';
        whiteoutSVG.style.height = contentHeight + 'px';
        whiteoutSVG.style.pointerEvents = 'auto';
        whiteoutSVG.style.zIndex = '200';
        whiteoutSVG.style.display = 'none';
        whiteoutSVG.style.transition = 'opacity 0.2s ease-out';
        whiteoutSVG.style.opacity = '1';
        whiteoutSVG.style.overflow = 'visible';
        shareArea.appendChild(whiteoutSVG);
    } else {
        whiteoutSVG.style.top = topOffset + 'px';
        whiteoutSVG.style.left = leftOffset + 'px';
        whiteoutSVG.style.width = contentWidth + 'px';
        whiteoutSVG.style.height = contentHeight + 'px';
    }

    // Listen to previewContent scroll to keep SVGs aligned with content
    if (!scrollListenerAttached) {
        previewContent.addEventListener('scroll', syncSVGScroll);
        scrollListenerAttached = true;
    }

    // Sync immediately in case already scrolled
    syncSVGScroll();
}

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
            color: '#f0efed', // Background color
            thickness: settingsAPI ? settingsAPI.get('whiteoutThickness', 15) : 15,
            opacity: 1
        };
    }
    return null;
}

// Convert screen coordinates to SVG coordinates
function getSVGCoordinates(e) {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return { x: e.clientX, y: e.clientY };

    // Use previewContent's bounding rect (this is the actual scroll container)
    const rect = previewContent.getBoundingClientRect();
    const scrollTop = previewContent.scrollTop;

    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top + scrollTop
    };
}

// Create custom cursor for tool
function updateCursor(tool) {
    const body = document.body;
    
    // Remove existing eraser cursor update handler
    const eraserCursor = document.getElementById('eraserCursor');
    
    if (tool === 'eraser') {
        body.style.cursor = 'none';
        
        // Create eraser cursor indicator if it doesn't exist
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
    
    e.preventDefault(); // Prevent text selection
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
    
    // Append to correct SVG layer
    const targetSVG = currentTool === 'whiteout' ? whiteoutSVG : drawingSVG;
    targetSVG.appendChild(currentPath);
}

// Continue drawing
function continueDrawing(e) {
    if (!isDrawing || !currentPath) return;
    
    e.preventDefault(); // Prevent text selection
    const coords = getSVGCoordinates(e);
    const d = currentPath.getAttribute('d');
    const newPoint = ` L ${coords.x} ${coords.y}`;
    currentPath.setAttribute('d', d + newPoint);
}

// Stop drawing
function stopDrawing() {
    if (isDrawing && currentPath) {
        allPaths.push(currentPath);
        currentPath = null;
        isDrawing = false;
    }
}

// Erase path under cursor
function erasePath(e) {
    const coords = getSVGCoordinates(e);
    const x = coords.x;
    const y = coords.y;
    
    // Get all paths from both SVGs
    const drawingPaths = Array.from(drawingSVG.querySelectorAll('path'));
    const whiteoutPaths = Array.from(whiteoutSVG.querySelectorAll('path'));
    const allCurrentPaths = [...drawingPaths, ...whiteoutPaths];
    
    // Check paths in reverse order (top to bottom)
    for (let i = allCurrentPaths.length - 1; i >= 0; i--) {
        const path = allCurrentPaths[i];
        const bbox = path.getBBox();
        const threshold = parseFloat(path.getAttribute('stroke-width')) / 2 + 5;
        
        // Simple bounding box check
        if (x >= bbox.x - threshold && x <= bbox.x + bbox.width + threshold &&
            y >= bbox.y - threshold && y <= bbox.y + bbox.height + threshold) {
            
            // More precise check using path data
            const pathLength = path.getTotalLength();
            let minDistance = Infinity;
            
            for (let j = 0; j < pathLength; j += 5) {
                const point = path.getPointAtLength(j);
                const distance = Math.sqrt(
                    Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
                );
                minDistance = Math.min(minDistance, distance);
                
                if (minDistance < threshold) {
                    // Erase this path
                    path.remove();
                    return;
                }
            }
        }
    }
}

// Handle key down
document.addEventListener('keydown', (e) => {
    // Don't activate if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    // Ignore key repeat events
    if (e.repeat) return;
    
    const presentationContainer = document.getElementById('presentationContainer');
    if (!presentationContainer || presentationContainer.style.display === 'none') {
        console.log('Drawing tools: presentationContainer not available', presentationContainer ? presentationContainer.style.display : 'not found');
        return;
    }
    
    console.log('Key pressed:', e.key);
    
    if (e.key === 'f' || e.key === 'F') {
        if (currentTool !== 'highlighter') {
            currentTool = 'highlighter';
            initDrawingCanvas();
            drawingSVG.style.display = 'block';
            drawingSVG.style.opacity = '0';
            drawingSVG.style.zIndex = '5';
            drawingSVG.style.pointerEvents = 'auto';
            setTimeout(() => { drawingSVG.style.opacity = '1'; }, 10);
            updateCursor('highlighter');
        }
    } else if (e.key === 'd' || e.key === 'D') {
        if (currentTool !== 'pen') {
            currentTool = 'pen';
            initDrawingCanvas();
            drawingSVG.style.display = 'block';
            drawingSVG.style.opacity = '0';
            drawingSVG.style.zIndex = '5';
            drawingSVG.style.pointerEvents = 'auto';
            setTimeout(() => { drawingSVG.style.opacity = '1'; }, 10);
            updateCursor('pen');
        }
    } else if (e.key === 'w' || e.key === 'W') {
        if (currentTool !== 'whiteout') {
            currentTool = 'whiteout';
            initDrawingCanvas();
            whiteoutSVG.style.display = 'block';
            whiteoutSVG.style.opacity = '0';
            whiteoutSVG.style.pointerEvents = 'auto';
            setTimeout(() => { whiteoutSVG.style.opacity = '1'; }, 10);
            updateCursor('whiteout');
        }
    } else if (e.key === 'e' || e.key === 'E') {
        const now = Date.now();
        if (now - lastEKeyTime < DOUBLE_CLICK_THRESHOLD && lastEKeyTime > 0) {
            // Double-click detected - clear all drawings
            clearAllDrawings();
            stopDrawing();
            currentTool = null;
            updateCursor(null);
            lastEKeyTime = 0; // Reset
        } else if (currentTool !== 'eraser') {
            // Single click - activate eraser
            stopDrawing(); // Stop any active drawing
            currentTool = 'eraser';
            initDrawingCanvas();
            drawingSVG.style.display = 'block';
            drawingSVG.style.pointerEvents = 'auto';
            whiteoutSVG.style.display = 'block';
            whiteoutSVG.style.pointerEvents = 'auto';
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
        
        // Disable pointer events on regular drawing layer
        if (drawingSVG) {
            drawingSVG.style.pointerEvents = 'none';
        }
        
        updateCursor(null);
    } else if (e.key === 'e' || e.key === 'E') {
        stopDrawing();
        currentTool = null;
        
        // Disable pointer events on both layers for eraser
        if (drawingSVG) {
            drawingSVG.style.pointerEvents = 'none';
        }
        if (whiteoutSVG) {
            whiteoutSVG.style.pointerEvents = 'none';
        }
        
        updateCursor(null);
    } else if (e.key === 'w' || e.key === 'W') {
        stopDrawing();
        currentTool = null;
        
        // Disable pointer events on whiteout layer
        if (whiteoutSVG) {
            whiteoutSVG.style.pointerEvents = 'none';
        }
        
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

// Clear all drawings when changing presentations
window.addEventListener('beforeunload', () => {
    allPaths = [];
    if (drawingSVG) {
        drawingSVG.innerHTML = '';
    }
});

console.log('Drawing tools loaded');
