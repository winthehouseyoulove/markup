/* ============================================
   Notion HTML Styler - Application Logic
   ============================================ */

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const loading = document.getElementById('loading');
const presentationContainer = document.getElementById('presentationContainer');
const previewContent = document.getElementById('previewContent');
const bottomBar = document.getElementById('bottomBar');
const errorMessage = document.getElementById('errorMessage');
const transitionOverlay = document.getElementById('transitionOverlay');
const recentFiles = document.getElementById('recentFiles');
const recentList = document.getElementById('recentList');
const demoButton = document.getElementById('demoButton');
const logoButton = document.getElementById('logoButton');
const dragOverlay = document.getElementById('dragOverlay');
const laserPointer = document.getElementById('laserPointer');
const shuffleButton = document.getElementById('shuffleButton');

// Custom cursor
const customCursor = document.createElement('div');
customCursor.className = 'custom-cursor';
document.body.appendChild(customCursor);

let cursorDefaultSize = 20;
let cursorDefaultColor = 'rgba(150, 150, 150, 0.3)';

// Flashlight overlay
const flashlightOverlay = document.createElement('div');
flashlightOverlay.className = 'flashlight-overlay';
document.body.appendChild(flashlightOverlay);

// Questions overlay
const questionsOverlay = document.createElement('div');
questionsOverlay.className = 'questions-overlay';
questionsOverlay.innerHTML = '<div class="questions-heading">Questions? Email me</div><div class="questions-email">kyle@winthehouseyoulove.com</div>';
document.body.appendChild(questionsOverlay);

function toggleQuestionsOverlay() {
    questionsOverlay.classList.toggle('active');
    burstEmailEmojis();
}

function burstEmailEmojis() {
    const emojis = ['\u2709\uFE0F', '\u{1F4E7}', '\u{1F4E8}', '\u{1F4E9}'];
    const count = 14;

    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'emoji-burst';
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const tx = (Math.random() - 0.5) * 200;
        const ty = (Math.random() - 0.5) * 200;

        el.style.left = startX + 'px';
        el.style.top = startY + 'px';
        el.style.opacity = '1';
        el.style.transform = 'scale(0)';

        document.body.appendChild(el);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.transform = `scale(1) translate(${tx}px, ${ty}px)`;
                el.style.opacity = '0';
            });
        });

        setTimeout(() => el.remove(), 1200);
    }
}

let flashlightActive = false;
let flashlightX = 0;
let flashlightY = 0;

document.addEventListener('mousemove', (e) => {
    customCursor.style.left = e.clientX + 'px';
    customCursor.style.top = e.clientY + 'px';

    // Update flashlight position
    flashlightX = e.clientX;
    flashlightY = e.clientY;

    if (flashlightActive) {
        updateFlashlight();
    }
});

// Hide cursor when leaving window
window.addEventListener('mouseout', (e) => {
    // Check if mouse is actually leaving the window (not just entering a child element)
    if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
        customCursor.style.display = 'none';
    }
});

window.addEventListener('mouseover', () => {
    customCursor.style.display = 'block';
});

// Flashlight functions
function updateFlashlight() {
    const spotlightSize = 200; // Size of the illuminated circle
    const fadeStart = 0.5; // Start fading at 50% of radius (very soft edge)
    flashlightOverlay.style.background = `radial-gradient(circle ${spotlightSize}px at ${flashlightX}px ${flashlightY}px,
        transparent 0%,
        transparent ${fadeStart * 100}%,
        rgba(0, 0, 0, 0.9) 100%)`;
}

function activateFlashlight() {
    if (!flashlightActive && presentationContainer.style.display !== 'none') {
        flashlightActive = true;
        flashlightOverlay.classList.add('active');
        customCursor.style.opacity = '0'; // Hide cursor during flashlight
        updateFlashlight();
    }
}

function deactivateFlashlight() {
    if (flashlightActive) {
        flashlightActive = false;
        flashlightOverlay.classList.remove('active');
        customCursor.style.opacity = '1'; // Show cursor again
    }
}

// Update cursor based on drawing tool
function updateCursorForTool(tool) {
    const settingsAPI = window.markupSettings;

    if (tool === 'pen') {
        const thickness = settingsAPI ? settingsAPI.get('penThickness', 10) : 10;
        const color = settingsAPI ? settingsAPI.get('penColor', '#0085ff') : '#0085ff';
        customCursor.style.width = thickness + 'px';
        customCursor.style.height = thickness + 'px';
        customCursor.style.backgroundColor = color;
        customCursor.style.boxShadow = `0 0 0 2px ${darkenColor(color)}`;
    } else if (tool === 'highlighter') {
        const thickness = settingsAPI ? settingsAPI.get('highlighterThickness', 40) : 40;
        const color = settingsAPI ? settingsAPI.get('highlighterColor', '#f1b03d') : '#f1b03d';
        customCursor.style.width = thickness + 'px';
        customCursor.style.height = thickness + 'px';
        // Make highlighter semi-transparent
        const rgb = hexToRgb(color);
        customCursor.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
        customCursor.style.boxShadow = `0 0 0 2px ${darkenColor(color)}`;
    } else if (tool === 'whiteout') {
        const thickness = settingsAPI ? settingsAPI.get('whiteoutThickness', 40) : 40;
        customCursor.style.width = thickness + 'px';
        customCursor.style.height = thickness + 'px';
        customCursor.style.backgroundColor = '#ffffff';
        customCursor.style.boxShadow = '0 0 0 2px rgba(150, 150, 150, 0.8)';
    } else if (tool === 'eraser') {
        customCursor.style.width = '30px';
        customCursor.style.height = '30px';
        customCursor.style.backgroundColor = 'rgba(255, 100, 100, 0.4)';
        customCursor.style.boxShadow = 'none';
    } else {
        // Reset to default
        customCursor.style.width = cursorDefaultSize + 'px';
        customCursor.style.height = cursorDefaultSize + 'px';
        customCursor.style.backgroundColor = cursorDefaultColor;
        customCursor.style.boxShadow = 'none';
    }
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Helper function to darken a color
function darkenColor(hex, amount = 0.3) {
    const rgb = hexToRgb(hex);
    return `rgba(${Math.floor(rgb.r * (1 - amount))}, ${Math.floor(rgb.g * (1 - amount))}, ${Math.floor(rgb.b * (1 - amount))}, 0.8)`;
}

// Listen for drawing tool activation
document.addEventListener('keydown', (e) => {
    if (presentationContainer.style.display === 'none') return;

    const key = e.key.toLowerCase();
    if (key === 'd') {
        updateCursorForTool('pen');
    } else if (key === 'f') {
        updateCursorForTool('highlighter');
    } else if (key === 'w') {
        updateCursorForTool('whiteout');
    } else if (key === 'e') {
        updateCursorForTool('eraser');
    } else if (e.key === 'a' || e.key === 'A') {
        activateFlashlight();
    }
});

// Reset cursor when keys are released
document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'd' || key === 'f' || key === 'w' || key === 'e') {
        updateCursorForTool(null);
    } else if (e.key === 'a' || e.key === 'A') {
        deactivateFlashlight();
    }
});

let laserActive = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Slide navigation
let slides = [];
let currentSlideIndex = 0;
let totalSlides = 0;

// ============================================
// IndexedDB Setup
// ============================================

let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('MarkupDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                const objectStore = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

async function saveFile(fileName, fileData, displayName = null) {
    // First, delete any existing file with the same name
    await deleteFileByName(fileName);
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');
        
        const file = {
            name: fileName,
            displayName: displayName || fileName,
            data: fileData,
            timestamp: Date.now()
        };
        
        const request = objectStore.add(file);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteFileByName(fileName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');
        const request = objectStore.openCursor();
        
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.name === fileName) {
                    cursor.delete();
                    resolve();
                } else {
                    cursor.continue();
                }
            } else {
                resolve(); // No file found with that name
            }
        };
        
        request.onerror = () => reject(request.error);
    });
}

async function getRecentFiles() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readonly');
        const objectStore = transaction.objectStore('files');
        const index = objectStore.index('timestamp');
        
        const request = index.openCursor(null, 'prev');
        const files = [];
        
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor && files.length < 5) {
                files.push({
                    id: cursor.value.id,
                    name: cursor.value.name,
                    displayName: cursor.value.displayName,
                    timestamp: cursor.value.timestamp
                });
                cursor.continue();
            } else {
                resolve(files);
            }
        };
        
        request.onerror = () => reject(request.error);
    });
}

async function getFileData(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readonly');
        const objectStore = transaction.objectStore('files');
        const request = objectStore.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteFile(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['files'], 'readwrite');
        const objectStore = transaction.objectStore('files');
        const request = objectStore.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}


// Initialize DB on page load
initDB().then(() => {
    // loadRecentFiles(); // Disabled
});

// ============================================
// Recent Files Management
// ============================================

async function loadRecentFiles() {
    try {
        const files = await getRecentFiles();
        if (files.length > 0) {
            recentFiles.style.display = 'block';
            recentList.innerHTML = '';
            
            files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'recent-item';
                
                const info = document.createElement('div');
                info.className = 'recent-item-info';
                
                const name = document.createElement('div');
                name.className = 'recent-item-name';
                name.textContent = file.displayName || file.name;
                
                const date = document.createElement('div');
                date.className = 'recent-item-date';
                date.textContent = formatDate(file.timestamp);
                
                info.appendChild(name);
                info.appendChild(date);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'recent-item-delete';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = async (e) => {
                    e.stopPropagation();
                    await deleteFile(file.id);
                    loadRecentFiles();
                };
                
                item.appendChild(info);
                item.appendChild(deleteBtn);
                
                item.onclick = () => loadFileFromStorage(file.id);
                
                recentList.appendChild(item);
            });
        } else {
            recentList.innerHTML = '';
            recentFiles.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading recent files:', error);
        recentList.innerHTML = '';
        recentFiles.style.display = 'none';
    }
}

async function loadFileFromStorage(id) {
    try {
        const fileData = await getFileData(id);
        if (fileData) {
            // Convert ArrayBuffer back to File-like object
            const blob = new Blob([fileData.data], { type: 'application/zip' });
            const file = new File([blob], fileData.name, { type: 'application/zip' });
            await handleFile(file, true); // Pass true to skip saving again
        }
    } catch (error) {
        console.error('Error loading file:', error);
        showError('Error loading file: ' + error.message);
    }
}

function formatDate(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}

// ============================================
// Drop Zone Event Listeners
// ============================================

dropZone.addEventListener('click', (e) => {
    if (e.target.closest('.drop-area') || e.target.closest('.drop-icon') || e.target.closest('.drop-text') || e.target.closest('.drop-subtext')) {
        fileInput.click();
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    if (e.target === dropZone) {
        dropZone.classList.remove('drag-over');
    }
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Enable drag-drop on entire document to replace content
let dragCounter = 0;

document.body.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (presentationContainer.style.display !== 'none') {
        dragOverlay.style.display = 'flex';
    }
});

document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.body.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter === 0 && presentationContainer.style.display !== 'none') {
        dragOverlay.style.display = 'none';
    }
});

document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    dragOverlay.style.display = 'none';
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && presentationContainer.style.display !== 'none') {
        handleFile(files[0]);
    }
});

demoButton.addEventListener('click', loadDemo);
logoButton.addEventListener('click', goHome);

// ============================================
// Laser Pointer
// ============================================

// Function to update laser pointer color from settings
function updateLaserPointerColor() {
    if (window.markupSettings && laserPointer) {
        const color = window.markupSettings.get('laserPointerColor', '#ff0000');
        const size = window.markupSettings.get('laserPointerSize', 20);
        console.log('Updating laser pointer - color:', color, 'size:', size);
        
        // Convert hex to RGB for radial gradient
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        // Set a simple radial gradient with smooth fade
        laserPointer.style.background = `radial-gradient(circle, rgba(${r}, ${g}, ${b}, 1) 0%, rgba(${r}, ${g}, ${b}, 0.8) 25%, rgba(${r}, ${g}, ${b}, 0) 100%)`;
        laserPointer.style.boxShadow = `0 0 ${size}px rgba(${r}, ${g}, ${b}, 0.8)`;
        laserPointer.style.width = `${size}px`;
        laserPointer.style.height = `${size}px`;
    }
}

// Initialize laser pointer color when settings system is ready
setTimeout(updateLaserPointerColor, 200);

// Update laser pointer color when settings change
window.addEventListener('settingsChanged', (e) => {
    console.log('Settings changed event received:', e.detail);
    updateLaserPointerColor();
    applyTypographySettings();
});

// Track mouse position for laser pointer
document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    
    if (laserActive) {
        laserPointer.style.left = e.clientX + 'px';
        laserPointer.style.top = e.clientY + 'px';
    }
});

// Show laser pointer when V key is held down
document.addEventListener('keydown', (e) => {
    if (e.key === 's' || e.key === 'S') {
        if (!laserActive && presentationContainer.style.display !== 'none') {
            laserActive = true;
            document.body.classList.add('laser-active');
            laserPointer.style.display = 'block';
            laserPointer.style.left = lastMouseX + 'px';
            laserPointer.style.top = lastMouseY + 'px';
            // Trigger reflow so transition plays from scale(0)
            laserPointer.offsetHeight;
            laserPointer.classList.add('active');
            updateLaserPointerColor();
        }
    }
});

// Hide laser pointer when V key is released
document.addEventListener('keyup', (e) => {
    if (e.key === 's' || e.key === 'S') {
        laserActive = false;
        document.body.classList.remove('laser-active');
        laserPointer.classList.remove('active');
        // Hide after transition completes
        setTimeout(() => {
            if (!laserActive) laserPointer.style.display = 'none';
        }, 80);
    }
});

// ============================================
// Typography Settings Application
// ============================================

function applyTypographySettings() {
    const root = document.documentElement;

    // Font family with fallbacks
    const fontFamily = window.markupSettings.get('fontFamily', 'Poppins');
    const fontStacks = {
        'Poppins': "'Poppins', sans-serif",
        'Inter': "'Inter', sans-serif",
        'Roboto': "'Roboto', sans-serif",
        'Open Sans': "'Open Sans', sans-serif",
        'Lato': "'Lato', sans-serif",
        'Montserrat': "'Montserrat', sans-serif",
        'Georgia': "'Georgia', serif",
        'system-ui': "system-ui, -apple-system, sans-serif"
    };

    // Get all settings with defaults
    const h1Size = window.markupSettings.get('h1Size', 32);
    const h2Size = window.markupSettings.get('h2Size', 64);
    const h3Size = window.markupSettings.get('h3Size', 50);
    const h4h6Size = window.markupSettings.get('h4h6Size', 20);
    const bodySize = window.markupSettings.get('bodySize', 46);
    const headingLineHeight = window.markupSettings.get('headingLineHeight', 1.0);
    const bodyLineHeight = window.markupSettings.get('bodyLineHeight', 1.2);
    const letterSpacing = window.markupSettings.get('letterSpacing', -1);
    const headingLetterSpacing = window.markupSettings.get('headingLetterSpacing', -2);
    const headingSpacing = window.markupSettings.get('headingSpacing', 16);
    const paragraphSpacing = window.markupSettings.get('paragraphSpacing', 12);

    // Update CSS variables
    root.style.setProperty('--font-family-custom', fontStacks[fontFamily] || fontStacks['Poppins']);
    root.style.setProperty('--font-size-h1', `${h1Size / 16}rem`);
    root.style.setProperty('--font-size-h2', `${h2Size / 16}rem`);
    root.style.setProperty('--font-size-h3', `${h3Size / 16}rem`);
    root.style.setProperty('--font-size-h4h6', `${h4h6Size / 16}rem`);
    root.style.setProperty('--font-size-body', `${bodySize / 16}rem`);
    root.style.setProperty('--line-height-heading-custom', headingLineHeight);
    root.style.setProperty('--line-height-body-custom', bodyLineHeight);
    root.style.setProperty('--letter-spacing-custom', `${letterSpacing}px`);
    root.style.setProperty('--heading-letter-spacing-custom', `${headingLetterSpacing}px`);
    root.style.setProperty('--heading-spacing-top', `${headingSpacing}px`);
    root.style.setProperty('--heading-spacing-bottom', `${headingSpacing}px`);
    root.style.setProperty('--paragraph-spacing', `${paragraphSpacing}px`);
}

// Live preview for typography (instant updates while dragging sliders)
window.addEventListener('typographyPreview', (e) => {
    const { key, value } = e.detail;
    const root = document.documentElement;

    const varMap = {
        'h1Size': '--font-size-h1',
        'h2Size': '--font-size-h2',
        'h3Size': '--font-size-h3',
        'h4h6Size': '--font-size-h4h6',
        'bodySize': '--font-size-body',
        'headingLineHeight': '--line-height-heading-custom',
        'bodyLineHeight': '--line-height-body-custom',
        'letterSpacing': '--letter-spacing-custom',
        'headingLetterSpacing': '--heading-letter-spacing-custom',
        'headingSpacing': '--heading-spacing-top',
        'paragraphSpacing': '--paragraph-spacing'
    };

    if (key === 'fontFamily') {
        const fontStacks = {
            'Poppins': "'Poppins', sans-serif",
            'Inter': "'Inter', sans-serif",
            'Roboto': "'Roboto', sans-serif",
            'Open Sans': "'Open Sans', sans-serif",
            'Lato': "'Lato', sans-serif",
            'Montserrat': "'Montserrat', sans-serif",
            'Georgia': "'Georgia', serif",
            'system-ui': "system-ui, -apple-system, sans-serif"
        };
        root.style.setProperty('--font-family-custom', fontStacks[value] || fontStacks['Poppins']);
    } else if (varMap[key]) {
        let cssValue = value;

        if (key.includes('Size') || key === 'bodySize') {
            cssValue = `${parseFloat(value) / 16}rem`;
        } else if (key === 'letterSpacing' || key.includes('Spacing')) {
            cssValue = `${value}px`;
            if (key === 'headingSpacing') {
                root.style.setProperty('--heading-spacing-bottom', cssValue);
            }
        }

        root.style.setProperty(varMap[key], cssValue);
    }
});

// Apply typography settings on page load
setTimeout(applyTypographySettings, 300);

// ============================================

function goHome() {
    showPreview(false);
}

// ============================================
// Demo File Loader
// ============================================

async function loadDemo() {
    hideError();
    showTransition();
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        // Add cache-busting parameter to ensure fresh content
        const response = await fetch('demo.html?t=' + Date.now());
        if (!response.ok) {
            throw new Error('Demo file not found. Please add a demo.html file to the folder.');
        }

        const htmlContent = await response.text();

        // Process and display the HTML (no assets to extract for demo)
        await processAndDisplayHTML(htmlContent, {}, 'demo.html');

        showLoading(false);
        showPreview(true);
        updateScrollProgress(); // Ensure progress bar shows on first load
        hideTransition();
    } catch (error) {
        console.error('Error loading demo:', error);
        showError('Error loading demo: ' + error.message);
        showLoading(false);
        hideTransition();
    }
}

// ============================================
// File Processing
// ============================================

async function handleFile(file, skipSave = false) {
    // Validate file is ZIP
    if (!file.name.endsWith('.zip')) {
        showError('Please upload a ZIP file from Notion');
        return;
    }

    hideError();
    
    // Always show transition animation
    showTransition();
    // Wait for transition to fade in (150ms)
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        const zip = new JSZip();
        let zipContent;
        let arrayBuffer;
        
        // Read the file
        if (!skipSave) {
            arrayBuffer = await file.arrayBuffer();
            zipContent = await zip.loadAsync(arrayBuffer);
        } else {
            // Load from file directly if from storage
            zipContent = await zip.loadAsync(file);
        }
        
        // Check if the ZIP contains nested ZIP files (common with Notion exports)
        const nestedZips = Object.entries(zipContent.files)
            .filter(([name, obj]) => name.endsWith('.zip') && !name.includes('__MACOSX') && !obj.dir);
        
        if (nestedZips.length > 0) {
            console.log('Found nested ZIP, extracting:', nestedZips[0][0]);
            const nestedZipData = await nestedZips[0][1].async('arraybuffer');
            zipContent = await JSZip.loadAsync(nestedZipData);
        }
        
        // Find the main HTML file (usually index.html or first .html file)
        let htmlFile = null;
        let htmlFileName = null;
        let htmlFiles = [];
        
        // Debug: Log all files in the ZIP
        console.log('Files in ZIP:', Object.keys(zipContent.files));
        
        // Collect all HTML files (case-insensitive)
        for (const [fileName, fileObj] of Object.entries(zipContent.files)) {
            const lowerName = fileName.toLowerCase();
            if (lowerName.endsWith('.html') && !fileName.includes('__MACOSX') && !fileObj.dir) {
                htmlFiles.push({ name: fileName, obj: fileObj });
                console.log('Found HTML file:', fileName);
            }
        }

        if (htmlFiles.length === 0) {
            const fileList = Object.keys(zipContent.files)
                .filter(f => !f.includes('__MACOSX'))
                .slice(0, 10)
                .join(', ');
            throw new Error(`No HTML file found in the ZIP. Found these files: ${fileList}...`);
        }

        // Prioritize index.html, otherwise take the first HTML file
        const indexFile = htmlFiles.find(f => f.name.endsWith('index.html'));
        if (indexFile) {
            htmlFile = indexFile.obj;
            htmlFileName = indexFile.name;
        } else {
            htmlFile = htmlFiles[0].obj;
            htmlFileName = htmlFiles[0].name;
        }

        // Read the HTML content
        const htmlContent = await htmlFile.async('string');
        
        // Extract title from HTML and decode HTML entities
        const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
        let htmlTitle = titleMatch ? titleMatch[1].trim() : file.name;
        
        // Decode HTML entities
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlTitle;
        htmlTitle = tempDiv.textContent || tempDiv.innerText || htmlTitle;
        
        // Save to IndexedDB if it's a new upload (now with the HTML title)
        if (!skipSave && arrayBuffer) {
            await saveFile(file.name, arrayBuffer, htmlTitle);
            loadRecentFiles(); // Refresh recent files list
        }
        
        // Extract all files from ZIP for asset access
        const extractedFiles = {};
        for (const [fileName, fileObj] of Object.entries(zipContent.files)) {
            if (!fileObj.dir && !fileName.includes('__MACOSX')) {
                extractedFiles[fileName] = fileObj;
            }
        }

        // Process and display the HTML
        await processAndDisplayHTML(htmlContent, extractedFiles, htmlFileName);
        
        showLoading(false);
        showPreview(true);
        updateScrollProgress(); // Ensure progress bar shows on first load

        // Hide transition overlay after content is ready
        hideTransition();
    } catch (error) {
        console.error('Error processing ZIP:', error);
        showError('Error processing ZIP file: ' + error.message);
        showLoading(false);
        hideTransition();
    }
}

// ============================================
// HTML Processing
// ============================================

async function processAndDisplayHTML(htmlContent, extractedFiles, htmlFileName) {
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Remove existing stylesheets to avoid conflicting Notion styles
    doc.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
        // Keep critical styles and custom callout styles, remove Notion's default styling
        if (!el.textContent.includes('font-family') && !el.textContent.includes('Custom Callout Styles')) {
            el.remove();
        }
    });

    // Get the body content
    const bodyContent = doc.body;

    // Rewrite relative paths for images and other assets
    const htmlDir = htmlFileName.substring(0, htmlFileName.lastIndexOf('/') + 1);
    
    bodyContent.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            // Resolve relative path
            const resolvedPath = resolveRelativePath(htmlDir, src);
            if (extractedFiles[resolvedPath]) {
                // Create blob URL for the image
                extractedFiles[resolvedPath].async('blob').then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    img.src = blobUrl;
                });
            }
        }
    });

    // Reset drawing canvas before clearing content
    if (typeof drawingSVG !== 'undefined') {
        drawingSVG = null;
    }
    if (typeof whiteoutSVG !== 'undefined') {
        whiteoutSVG = null;
    }

    // Set the preview content directly
    previewContent.innerHTML = bodyContent.innerHTML;

    // Extract and remove the title from content
    const titleElement = previewContent.querySelector('h1.page-title');
    let presentationTitle = '';
    if (titleElement) {
        presentationTitle = titleElement.textContent;
        // Remove the entire header containing the title
        const header = titleElement.closest('header');
        if (header) {
            header.remove();
        } else {
            titleElement.remove();
        }
    }

    // Clean up any Notion-specific elements that might interfere
    cleanupNotionElements(previewContent);

    // Transform [imessage] code blocks into iMessage UI
    initializeIMessageBlocks();

    // Transform [email] code blocks into Apple Mail UI
    initializeEmailBlocks();

    // Transform [state] code blocks into US state map graphics
    initializeStateMapBlocks();

    // Transform [quote] code blocks into styled testimonial quotes
    initializeQuoteBlocks();

    // Transform [splash] code blocks into full-color background slides
    initializeSplashBlocks();

    // Initialize pixelate effect for strikethrough text
    initializePixelateEffect();

    // Initialize image scroll effects
    initializeImageScrollEffects();
    
    // Convert content to slides (cloneNode loses event listeners, so attach after)
    initializeSlides();

    // Initialize table features (scroll wrapper, highlights, resize) — must be after initializeSlides
    initializeTables();

    // Attach 3D tilt effect to email blocks (must be after initializeSlides)
    initializeEmailTilt();

    // Restore saved quote photo positions and attach drag-to-reposition handlers
    restoreQuotePhotoPositions();
    initializeQuotePhotoDrag();

    // Set the presentation title under the logo
    setPresentationTitle(presentationTitle);
}

// ============================================
// Helper Functions
// ============================================

function resolveRelativePath(baseDir, relativePath) {
    // Simple relative path resolution
    if (relativePath.startsWith('/')) {
        return relativePath.substring(1);
    }
    
    const parts = baseDir.split('/').filter(p => p);
    const relParts = relativePath.split('/');
    
    for (const part of relParts) {
        if (part === '..') {
            parts.pop();
        } else if (part !== '.') {
            parts.push(part);
        }
    }
    
    return parts.join('/');
}

function cleanupNotionElements(container) {
    // Remove Notion-specific navigation and UI elements
    const selectorsToRemove = [
        '[class*="notion-header"]',
        '[class*="notion-nav"]',
        '[class*="notion-sidebar"]',
        '[class*="notion-page-controls"]',
        '[class*="notion-breadcrumb"]',
        '[style*="display: none"]'
    ];

    selectorsToRemove.forEach(selector => {
        container.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Remove empty divs that might be left over (but keep checkboxes)
    container.querySelectorAll('div:empty').forEach(el => {
        if (el !== container && !el.classList.contains('checkbox')) {
            el.remove();
        }
    });
}

// ============================================
// UI State Management
// ============================================

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

function showPreview(show) {
    dropZone.style.display = show ? 'none' : 'flex';
    presentationContainer.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => hideError(), 5000); // Auto-hide after 5 seconds
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showTransition() {
    // Remove class if it exists to reset animation
    transitionOverlay.classList.remove('show');
    // Force reflow to reset animation
    void transitionOverlay.offsetWidth;
    // Add class to trigger animation
    transitionOverlay.classList.add('show');
}

function hideTransition() {
    transitionOverlay.classList.remove('show');
}

// ============================================
// Presentation Timer & Progress Tracking
// ============================================

const durationInput = document.getElementById('durationInput');
const startTimerBtn = document.getElementById('startTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const timerTime = document.getElementById('timerTime');
const timerGoal = document.getElementById('timerGoal');
const scrollProgress = document.getElementById('scrollProgress');
const timeProgress = document.getElementById('timeProgress');

let timerInterval = null;
let startTime = null;
let pausedTime = 0;
let durationMs = 0;
let isTimerRunning = false;

// Update button states based on timer
function updateButtonStates() {
    const hasValue = timerTime.textContent.trim() !== '' && timerTime.textContent !== '00:00';
    const canReset = isTimerRunning || pausedTime > 0 || durationMs > 0;
    
    // Start button: enabled when running (to pause) or when has value (to start)
    startTimerBtn.disabled = !isTimerRunning && !hasValue;
    resetTimerBtn.disabled = !canReset;
}

// Update scroll progress
function updateScrollProgress() {
    if (presentationContainer.style.display === 'none') return;

    if (totalSlides <= 0) {
        scrollProgress.style.width = '0%';
        return;
    }

    // Base percentage for current slide position
    const basePercentage = ((currentSlideIndex + 1) / totalSlides) * 100;

    // Add a small offset past the dot so the fill visually "wraps" around it
    // On the last slide (100%), don't add offset — fill the whole bar
    const dotOffset = basePercentage >= 100 ? 0 : 1.0;
    const percentage = Math.min(basePercentage + dotOffset, 100);

    scrollProgress.style.width = percentage + '%';
}

// Create visual dot markers for each slide boundary in the progress bar
function createSlideSegments() {
    const container = document.querySelector('.progress-bar-container');
    if (!container) return;

    // Remove existing dots
    container.querySelectorAll('.slide-dot').forEach(dot => dot.remove());

    if (totalSlides <= 1) return;

    // Create dots between slides
    for (let i = 1; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'slide-dot';
        dot.style.left = `${(i / totalSlides) * 100}%`;
        container.appendChild(dot);
    }
}

// Update timer display and time progress
function updateTimer() {
    const elapsed = pausedTime + (Date.now() - startTime);
    const percentage = durationMs > 0 ? Math.min((elapsed / durationMs) * 100, 100) : 0;
    
    // Update timer display
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const timeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    timerTime.textContent = timeText;
    
    // Change color to red if over duration
    if (elapsed >= durationMs) {
        timerTime.style.color = '#cc451c';
    } else {
        timerTime.style.color = '';
    }
    
    // Update time progress line position
    timeProgress.style.left = percentage + '%';
}

// Start the timer
function startTimer() {
    // Only read duration on first start (when durationMs is 0)
    if (durationMs === 0) {
        const duration = parseFloat(timerTime.textContent);
        if (!duration || duration <= 0) {
            return;
        }
        durationMs = duration * 60000;
        
        // Show goal duration (only on first start)
        timerGoal.textContent = `${duration} minute${duration !== 1 ? 's' : ''}`;
        timerGoal.style.display = 'block';
    }
    
    startTime = Date.now();
    isTimerRunning = true;
    
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    timerTime.contentEditable = 'false';
    
    // Only set to "Start" on first start
    if (pausedTime === 0) {
        timerTime.textContent = 'Start';
    }
    
    timerInterval = setInterval(updateTimer, 100);
    updateTimer();
    updateButtonStates();
}

// Stop the timer (pause)
function stopTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    // Store elapsed time when pausing
    if (startTime) {
        pausedTime += Date.now() - startTime;
    }
    
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    timerTime.contentEditable = 'false';
    updateButtonStates();
    
    // Keep goal visible when paused
}

// Reset the timer
function resetTimer() {
    stopTimer();
    startTime = null;
    pausedTime = 0;
    durationMs = 0;
    
    timeProgress.style.left = '0%';
    timerTime.textContent = '00:00';
    timerTime.style.color = '';
    timerTime.contentEditable = 'true';
    timerGoal.style.display = 'none';
    updateButtonStates();
}

// Event listeners
startTimerBtn.addEventListener('click', () => {
    if (isTimerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
});

resetTimerBtn.addEventListener('click', resetTimer);

// Cmd+Click on timer to pause and reset
timerTime.addEventListener('click', (e) => {
    if (e.metaKey && (isTimerRunning || pausedTime > 0 || durationMs > 0)) {
        e.preventDefault();
        e.stopPropagation();
        resetTimer();
    }
});

// Listen to scroll events on share area instead of presentation container
const shareArea = document.querySelector('.share-area');
if (shareArea) {
    shareArea.addEventListener('scroll', updateScrollProgress);
}

// Timer click/focus - clear to show blinking cursor
timerTime.addEventListener('focus', () => {
    if (!isTimerRunning && timerTime.textContent === '00:00') {
        timerTime.textContent = '';
    }
});

// Timer blur - restore 00:00 if empty
timerTime.addEventListener('blur', () => {
    if (!isTimerRunning && timerTime.textContent.trim() === '') {
        timerTime.textContent = '00:00';
    }
    updateButtonStates();
});

// Timer input - update button states
timerTime.addEventListener('input', () => {
    updateButtonStates();
});

// Enter key to start timer
timerTime.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (!isTimerRunning) {
            startTimer();
        }
    }
    // Only allow numbers and decimal point when editable
    if (timerTime.contentEditable === 'true') {
        if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Enter') {
            e.preventDefault();
        }
    }
});

// Initialize on load
updateScrollProgress();
updateButtonStates();

// ============================================
// Checkbox Toggle Functionality
// ============================================

function createConfetti(x, y) {
    const colors = ['#4a674c', '#01413e', '#D9D1C8', '#8B8680'];
    const confettiCount = 20;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Random spread
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const distance = Math.random() * 80 + 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance + 50;
        
        // Set initial position and state
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.opacity = '1';
        confetti.style.transform = 'translate(0, 0) rotate(0deg)';
        
        document.body.appendChild(confetti);
        
        // Trigger animation after a brief delay to ensure initial state is rendered
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                confetti.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg)`;
                confetti.style.opacity = '0';
            });
        });
        
        // Remove after animation
        setTimeout(() => confetti.remove(), 1200);
    }
}

// Add click handlers to all checkboxes using event delegation
previewContent.addEventListener('click', (e) => {
    const checkbox = e.target.closest('.checkbox');
    if (checkbox) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle state
        if (checkbox.classList.contains('checkbox-off')) {
            checkbox.classList.remove('checkbox-off');
            checkbox.classList.add('checkbox-on');
            
            // Create confetti at checkbox position
            const rect = checkbox.getBoundingClientRect();
            createConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } else if (checkbox.classList.contains('checkbox-on')) {
            checkbox.classList.remove('checkbox-on');
            checkbox.classList.add('checkbox-off');
        }
    }
});

// ============================================
// Pixelate Effect for Strike-through Text
// ============================================

function initializePixelateEffect() {
    // Find all strike-through elements
    const strikeElements = previewContent.querySelectorAll('.to-do-children-checked, [style*="text-decoration: line-through"], [style*="text-decoration:line-through"], s, del');
    
    strikeElements.forEach(element => {
        // Skip if already initialized
        if (element.classList.contains('pixelated') || element.classList.contains('unpixelated')) return;
        
        // Add pixelated class
        element.classList.add('pixelated');
        
        // Add click handler to unpixelate
        element.addEventListener('click', function() {
            element.classList.remove('pixelated');
            element.classList.add('unpixelated');
        }, { once: true });
    });
}

// Initialize pixelate effect when content is loaded (handled in processAndDisplayHTML)

// Set presentation title under logo
function setPresentationTitle(title) {
    const titleDiv = document.getElementById('presentationTitle');
    if (titleDiv) {
        titleDiv.textContent = title || '';
    }
}

// ============================================
// Image Scroll Effects
// ============================================

function initializeImageScrollEffects() {
    // No effects - images display as static elements
    
    // Open all links in new tab, disable image links
    const imageLinks = previewContent.querySelectorAll('a');
    imageLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        if (link.querySelector('img')) {
            // Remove href to prevent navigation
            link.removeAttribute('href');
            link.style.pointerEvents = 'none';
            link.style.cursor = 'default';
            
            // Prevent any click events
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, true);
        }
    });
}

// ============================================
// iMessage Emulator
// ============================================

function initializeIMessageBlocks() {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;

    const preElements = previewContent.querySelectorAll('pre');
    preElements.forEach(pre => {
        const text = pre.textContent.trim();
        if (!text.match(/^\[imessage\b/i)) return;

        const parsed = parseIMessageContent(text);
        const html = generateIMessageHTML(parsed.contactName, parsed.messages);

        const container = document.createElement('div');
        container.innerHTML = html;
        pre.replaceWith(container.firstElementChild);
    });
}

function parseIMessageContent(text) {
    const lines = text.split('\n');
    let contactName = '';
    const messages = [];
    let startIndex = 1; // skip [imessage...]

    // Check for @Name in header line: [iMessage @John Smith]
    const headerMatch = lines[0].match(/@(.+?)(?:\]|$)/);
    if (headerMatch) {
        contactName = headerMatch[1].trim();
    }

    // Legacy fallback: check if next non-empty line is a contact name
    // short (≤25 chars), no sentence-ending punctuation, not a timestamp
    if (!contactName && lines.length > 1) {
        const nextLine = lines[1]?.trim();
        const wordCount = nextLine ? nextLine.split(/\s+/).length : 0;
        if (nextLine && wordCount <= 3 && nextLine.length <= 25 && !nextLine.match(/^\[.*\]$/)) {
            contactName = nextLine;
            startIndex = 2;
        }
    }

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed === '') {
            messages.push({ type: 'spacer' });
            continue;
        }

        const timestampMatch = trimmed.match(/^\[(.+)\]$/);
        if (timestampMatch) {
            messages.push({ type: 'timestamp', text: timestampMatch[1] });
            continue;
        }

        const isMe = /^(\s{2,}|\t)/.test(line);
        messages.push({ type: 'message', text: trimmed, sender: isMe ? 'me' : 'them' });
    }

    // Mark last-in-group for tails
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].type !== 'message') continue;
        const next = messages[i + 1];
        messages[i].lastInGroup = !next || next.type !== 'message' || next.sender !== messages[i].sender;
    }

    return { contactName, messages };
}

function generateIMessageHTML(contactName, messages) {
    let html = `<div class="mock-ui-wrapper"><div class="imessage-container">`;

    // Contact bar with avatar and name
    if (contactName) {
        const parts = contactName.trim().split(/\s+/);
        const initials = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
        html += `<div class="imessage-contact-bar">`;
        html += `<div class="imessage-back-chevron">&#8249;</div>`;
        html += `<div class="imessage-contact-bar-center">`;
        html += `<div class="imessage-avatar">${initials}</div>`;
        html += `<div class="imessage-contact-name">${contactName}</div>`;
        html += `</div>`;
        html += `<div class="imessage-facetime"><svg viewBox="0 0 24 24" fill="none" stroke="#007aff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="14" height="14" rx="2"></rect><path d="M15 10l5.5-3.5v11L15 14"></path></svg></div>`;
        html += `</div>`;
    }

    // Find the last "me" tail index for "Delivered" placement
    let lastMeTailIndex = -1;
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].type === 'message' && messages[i].sender === 'me' && messages[i].lastInGroup) {
            lastMeTailIndex = i;
        }
    }

    html += `<div class="imessage-messages">`;
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.type === 'spacer') {
            html += `<div class="imessage-spacer"></div>`;
        } else if (msg.type === 'timestamp') {
            html += `<div class="imessage-timestamp">${msg.text}</div>`;
        } else {
            const tailClass = msg.lastInGroup ? ' imessage-tail' : '';
            html += `<div class="imessage-bubble imessage-${msg.sender}${tailClass}">${msg.text}</div>`;
            if (i === lastMeTailIndex) {
                html += `<div class="imessage-delivered">Delivered</div>`;
            }
        }
    }
    html += `</div>`;

    html += `</div>`;
    html += `<div class="mock-disclaimer">Illustration</div>`;
    html += `</div>`;
    return html;
}

// ============================================
// Email Block
// ============================================

function initializeEmailBlocks() {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;

    const preElements = previewContent.querySelectorAll('pre');
    preElements.forEach(pre => {
        const text = pre.textContent.trim();
        if (!text.match(/^\[email\b/i)) return;

        const parsed = parseEmailContent(text);
        const html = generateEmailHTML(parsed);

        const container = document.createElement('div');
        container.innerHTML = html;
        pre.replaceWith(container.firstElementChild);
    });
}

function parseEmailContent(text) {
    const lines = text.split('\n');
    let from = '', to = '', subject = '';
    let bodyStartIndex = -1;

    // Skip [email] header line
    for (let i = 1; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (trimmed === '---') {
            bodyStartIndex = i + 1;
            break;
        }

        const fromMatch = trimmed.match(/^from:\s*(.+)/i);
        if (fromMatch) { from = fromMatch[1].trim(); continue; }

        const toMatch = trimmed.match(/^to:\s*(.+)/i);
        if (toMatch) { to = toMatch[1].trim(); continue; }

        const subjectMatch = trimmed.match(/^subject:\s*(.+)/i);
        if (subjectMatch) { subject = subjectMatch[1].trim(); continue; }
    }

    // If no --- separator found, body starts after last header field
    if (bodyStartIndex === -1) bodyStartIndex = lines.length;

    const body = lines.slice(bodyStartIndex).join('\n').trim();

    // Extract display name from "Name <email>" format
    const nameMatch = from.match(/^(.+?)\s*<.*>$/);
    const fromName = nameMatch ? nameMatch[1].trim() : from;
    const fromEmail = from.match(/<(.+?)>/) ? from.match(/<(.+?)>/)[1] : from;

    return { from, fromName, fromEmail, to, subject, body };
}

function generateEmailHTML(data) {
    let html = `<div class="mock-ui-wrapper"><div class="email-container">`;

    // Top bar: Cancel + New Message + Send button
    html += `<div class="email-top-bar">`;
    html += `<span class="email-cancel">Cancel</span>`;
    html += `<div class="email-top-bar-right">`;
    html += `<svg class="email-send-btn" viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="16" fill="#007aff"/><path d="M16 9l0 14M10 15l6-6 6 6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="email-title">New Message</div>`;

    // To field with pill chips
    const toNames = data.to.split(',').map(n => n.trim()).filter(Boolean);
    const toPills = toNames.map(name => `<span class="email-pill">${name}</span>`).join(' ');
    html += `<div class="email-field email-field-to">`;
    html += `<span class="email-field-label">To:</span>`;
    html += `<span class="email-field-pills">${toPills}</span>`;
    html += `<svg class="email-add-btn" viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="11" fill="none" stroke="#007aff" stroke-width="1.5"/><path d="M12 7v10M7 12h10" stroke="#007aff" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    html += `</div>`;

    // Cc/Bcc, From line
    html += `<div class="email-field email-field-cc">`;
    html += `<span class="email-field-grey">Cc/Bcc, From: ${data.fromEmail}</span>`;
    html += `</div>`;

    // Subject
    html += `<div class="email-field email-field-subject">`;
    html += `<span class="email-field-label">Subject:</span> <span class="email-field-value">${data.subject}</span>`;
    html += `</div>`;

    // Body
    const bodyHtml = data.body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    html += `<div class="email-body"><p>${bodyHtml}</p></div>`;

    html += `</div>`;
    html += `<div class="mock-disclaimer">Illustration</div>`;
    html += `</div>`;
    return html;
}

function initializeEmailTilt() {
    document.querySelectorAll('.email-container').forEach(container => {
        let animFrame = null;
        container.addEventListener('mousemove', (e) => {
            if (animFrame) return;
            animFrame = requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                // Normalize to -1..1 from center
                const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                // Cap rotation at 6deg, use same max for both axes so it feels even
                const maxTilt = 3;
                const rotateY = x * maxTilt;
                const rotateX = -y * maxTilt;
                container.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.008)`;
                container.style.boxShadow = `${-rotateY * 1}px ${rotateX * 1}px 24px rgba(0,0,0,0.12)`;
                animFrame = null;
            });
        });
        container.addEventListener('mouseleave', () => {
            if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
            container.style.transform = '';
            container.style.boxShadow = '';
        });
    });
}

// ============================================
// US State Map
// ============================================

const STATE_PATHS = {
    'AK': 'm 15.8,572 h 2.4 l .7,.7 -1,1.2 -1.9,.2 -2.5,1.3 -3.7,-.1 2.2,-.9 .3,-1.1 2.5,-.3 z m 8.3,-1.7 1.3,.5 h .9 l .5,1.2 .3,-.6 .9,.2 1.1,1.5 0,.5 -4.2,1.9 -2.4,-.1 -1,-.5 -1.1,.7 -2,0 -1.1,-1.4 4.7,-.5 z m 5.4,-.1 1,.1 .7,.7 v 1 l -1.3,.1 -.9,-1.1 z m 2.5,.3 1.3,-.1 -.1,1 -1.1,.6 z m .3,2.2 3.4,-.1 .2,1.1 -1.3,.1 -.3,-.5 -.8,.6 -.4,-.6 -.9,-.2 z m 166.3,7.6 2.1,.1 -1,1.9 -1.1,-.1 -.4,-.8 .5,-1.3 m -1.1,-2.9 .6,-1.3 -.2,-2.3 2.4,-.5 4.5,4.4 1.3,3.4 1.9,1.6 .3,5.1 -1.4,0 -1.3,-2.3 -3.1,-2.4 h -.6 l 1.1,2.8 1.7,.2 .2,2.1 -.9,.1 -4.1,-4.4 -.1,-.9 1.9,-1 0,-1 -.5,-.8 -1.6,-.6 -1.7,-1.3 1.4,.1 .5,-.4 -.6,-.9 -.6,.5 z m -3.6,-9.1 1.3,.1 2.4,2.5 -.2,.8 -.8,-.1 -.1,1.8 .5,.5 0,1.5 -.8,.3 -.4,1.2 -.8,-.4 -.4,-2.2 1.1,-1.4 -2.1,-2.2 .1,-1.2 z m 1.5,-1.5 1.9,.2 2.5,.1 3.4,3.2 -.2,.5 -1.1,.6 -1.1,-.2 -.1,-.7 -1.2,-1.6 -.3,.7 1,1.3 -.2,1.2 -.8,-.1 -1.3,.2 -.1,-1.7 -2.6,-2.8 z m -12.7,-8.9 .9,-.4 h 1.6 l .7,-.5 4.1,2.2 .1,1.5 -.5,.5 h -.8 l -1.4,-.7 1.1,1.3 1.8,0 .5,2 -.9,0 -2.2,-1.5 -1.1,-.2 .6,1.3 .1,.9 .8,-.6 1.7,1.2 1.3,-.1 -.2,.8 1.9,4.3 0,3.4 .4,2.1 -.8,.3 -1.2,-2 -.5,-1.5 -1.6,-1.6 -.2,-2.7 -.6,-1.7 h -.7 l .3,1.1 0,.5 -1.4,1 .1,-3.3 -1.6,-1.6 -1.3,-2.3 -1.2,-1.2 z m 7.2,-2.3 1.1,1.8 2.4,-.1 1,2.1 -.6,.6 2,3.2 v 1.3 l -1.2,.8 v .7 l -2,1.9 -.5,-1.4 -.1,-1.3 .6,-.7 v -1.1 l -1.5,-1.9 -.5,-3.7 -.9,-1.5 z m -56.7,-18.3 -4,4.1 v 1.6 l 2.1,-.8 .8,-1.9 2.2,-2.4 z m -31.6,16.6 0,.6 1.8,1.2 .2,-1.4 .6,.9 3.5,.1 .7,-.6 .2,-1.8 -.5,-.7 -1.4,0 0,-.8 .4,-.6 v -.4 l -1.5,-.3 -3.3,3.6 z m -8.1,6.2 1.5,5.8 h 2.1 l 2.4,-2.5 .3,1.2 6.3,-4 .7,-1 -1,-1.1 v -.7 l .5,-1.3 -.9,-.1 -2,1 0,-1.2 -2.7,-.6 -2.4,.3 -.2,3.4 -.8,-2 -1.5,-.1 -1,.6 z m -2.2,8.2 .1,-.7 2.1,-1.3 .6,.3 1.3,.2 1.3,1.2 -2.2,-.2 -.4,-.6 -1,.6 z m -5.2,3.3 -1.1,.8 1.5,1.4 .8,-.7 -.1,-1.3 z m -6.3,-7.9 1.4,.1 .4,.6 -1.8,.1 z m -13.9,11.9 v .5 l .7,.1 -.1,-.6 z m -.4,-3.2 -1,1 v .5 l .7,1.1 1,-1 -.7,-.1 z m -2,-.8 -.3,1 -1.3,.1 -.4,.2 0,1.3 -.5,.9 .6,0 .7,-.9 .8,-.1 .9,-1 .2,-1.3 z m -4.4,-2 -.2,1.8 1.4,.8 1.2,-.6 0,-1 1.7,-.3 -.1,-.6 -.9,-.2 -.7,.6 -.9,-.5 z m -4.9,-.1 1,.7 -.3,1.2 -1.4,-1.1 z m -4.2,1.3 1.4,.1 -.7,.8 z m -3.5,3 1.8,1.1 -1.7,.1 z m -25.4,-31.2 1.2,.6 -.8,.6 z m -.7,-6.3 .4,1.2 .8,-1.2 z m 24.3,-19.3 1.5,-.1 .9,.4 1.1,-.5 1.3,-.1 1.6,.8 .8,1.9 -.1,.9 -1.2,2 -2.4,-.2 -2.1,-1.8 -1,-.4 -1.1,-2 z m -21.1,-14.4 .1,1.9 2,2 v .5 l -.8,-.2 -1.7,-.8 -.3,-1.1 -.3,-1.6 z m 18.3,-23.3 v 1.2 l 1.9,1.8 h 2.3 l .6,1.1 v 1.6 l 2.1,1.9 1.8,1.2 -.1,.7 -.7,1.1 -1.4,-1.2 -2.1,.1 -.8,-.8 -.9,-2.1 -1.5,-2.2 -2.6,-.1 -1,-.7 1,-2.1 z m 16.8,-4.5 1,0 .1,1.1 h -1 z m 16.2,19.7 .9,.1 0,1.2 -1.7,-.5 z m 127.8,77.7 -1.2,.4 -.1,1.1 h 1.2 z m -157.6,-4.5 -1.3,-.4 -4.1,.6 -2.8,1.4 -.1,1.9 1.9,.7 1.5,-.9 1.7,-.1 4.7,1.4 .1,-1.3 -1.6,-1.1 z m 2.1,2.3 -.4,-1.4 1.2,.2 .1,1.4 1.8,0 .4,-2.5 .3,2.4 2.5,-.1 3.2,-3.3 .8,.1 -.7,1.3 1.4,.9 4.2,-.2 2.6,-1.2 1.4,-.1 .3,1.5 .6,-.5 .4,-1.4 5.9,.2 1.9,-1.6 -1.3,-1.1 .6,-1.2 2.6,.2 -.2,-1.2 2.5,.2 .7,-1.1 1.1,.2 4.6,-1.9 .2,-1.7 5.6,-2.4 2,-1.9 1.2,-.6 1.3,.8 2.3,-.9 1.1,-1.9 .5,-1.3 1.7,-.9 1.5,-.7 .4,-1.4 -1.1,-1.7 -2.2,-.2 -.2,-1.3 .8,-1.6 1.4,-.2 1.3,-1.5 1.9,-.1 3.4,-3.2 .4,-1.4 1.5,-2.3 3.8,-4.1 2.5,-.9 1.9,-.9 2.1,.8 1.4,2.6 -1.5,0 -1.4,-1.5 -3,2 -1.7,.1 -.2,3.1 -3.1,4.9 .6,2 2.3,0 -.6,1 -1.4,.1 -2.4,1.8 0,.9 1.9,1 3.4,-.6 1.4,-1.7 1.4,.1 3,-1.7 .5,-2.3 1.6,-.1 6.3,.8 1,-1.1 1,-4.5 -1.6,1.1 .6,-2.2 -1.6,-1.4 .8,-1.5 .1,1.5 3.4,0 .7,-1 1.6,-.1 -.3,1.7 1.9,.1 -1.9,1.3 4.1,1.1 -3.5,.4 -1.3,1.2 .9,1.4 4.6,-1.7 2.3,1.7 .7,-.9 .6,1.4 4,2.3 h 2.9 l 3.9,-.5 4.3,1.1 2,1.9 4.5,.4 1.8,-1.5 .8,2.4 -1.8,.7 1.2,1.2 7.4,3.8 1.4,2.5 5.4,4.1 3.3,-2 -.6,-2.2 -3.5,-2 3.1,1.2 .5,-.7 .9,1.3 0,2.7 2.1,-.6 2.1,1.8 -2.5,-9.8 1.2,1.3 1.4,6 2.2,2.5 2.4,-.4 1.8,3.5 h .9 l .6,5.6 3.4,.5 1.6,2.2 1.8,1.1 .4,2.8 -1.8,2.6 2.9,1.6 1.2,-2.4 -.2,3.1 -.8,.9 1.4,1.7 .7,-2.4 -.2,-1.2 .8,.2 .6,2.3 -1,1.4 .6,2.6 .5,.4 .3,-1.6 .7,.6 -.3,2 1.2,.2 -.4,.9 1.7,-.1 0,-1 h -1 l .1,-1.7 -.8,-.6 1.7,-.3 .5,-.8 0,-1.6 .5,1.3 -.6,1.8 1.2,3.9 1.8,.1 2.2,-4.2 .1,-1.9 -1.3,-4 -.1,-1.2 .5,-1.2 -.7,-.7 -1.7,.1 -2.5,-2 -1.7,0 -2,-1.4 -1.5,0 -.5,-1.6 -1.4,-.3 -.2,-1.5 -1,-.5 .1,-1.7 -5.1,-7.4 -1.8,-1.5 v -1.2 l -4.3,-3.5 -.7,-1.1 -1.6,-2 -1.9,-.6 0,-2.2 -1.2,-1.3 -1.7,-.7 -2.1,1.3 -1.6,2.1 -.4,2.4 -1.5,.1 -2.5,2.7 -.8,-.3 v -2.5 l -2.4,-2.2 -2.3,-2 -.5,-2 -2.5,-1.3 .2,-2.2 -2.8,-.1 -.7,1.1 -1.2,0 -.7,-.7 -1.2,.8 -1.8,-1.2 0,-85.8 -6.9,-4.1 -1.8,-.5 -2.2,1.1 -2.2,.1 -2.3,-1.6 -4.3,-.6 -5.8,-3.6 -5.7,-.4 -2,.5 -.2,-1.8 -1.8,-.7 1.1,-1 -.2,-.9 -3.2,-1.1 h -2.4 l -.4,.4 -.9,-.6 .1,-2.6 -.8,-.9 -2.5,2.9 -.8,-.1 v -.8 l 1.7,-.8 v -.8 l -1.9,-2.4 -1.1,-.1 -4.5,3.1 h -3.9 l .4,-.9 -1.8,-.1 -5.2,3.4 -1.8,0 -.6,-.8 -2.7,1.5 -3.6,3.7 -2.8,2.7 -1.5,1.2  -2.6,.1 -2.2,-.4 -2.3,-1.3 v 0 l -2.8,3.9 -.1,2.4 2.6,2.4 2.1,4.5 .2,5.3 2.9,2 3.4,.4 .7,.8 -1.5,2.3 .7,2.7 -1.7,-2.6 v -2.4 l -1.5,-.3 .1,1.2 .7,2.1 2.9,3.7 h -1.4 l -2.2,1.1 -6.2,-2.5 -.1,-2 1.4,-1.3 0,-1.4 -2.1,-.5 -2.3,.2 -4.8,.2 1.5,2.3 -1.9,-1.8 -8.4,1.2 -.8,1.5 4.9,4.7 -.8,1.4 -.3,2 -.7,.8 -.1,1.9 4.4,3.6 4.1,.2 4.6,1.9 h 2 l .8,-.6 3.8,.1 .1,-.8 1.2,1.1 .1,2 -2.5,-.1 .1,3.3 .5,3.2 -2.9,2.7 -1.9,-.1 -2,-.8 -1,.1 -3.1,2.1 -1.7,.2 -1.4,-2.8 -3.1,0 -2.2,2 -.5,1.8 -3.3,1.8 -5.3,4.3 -.3,3.1 .7,2.2 1,1.2 1,-.4 .9,1 -.8,.6 -1.5,.9 1.1,1.5 -2.6,1.1 .8,2.2 1.7,2.3 .8,4.1 4,1.5 2.6,-.8 1.7,-1.1 .5,2.1 .3,4.4 -1.9,1.4 0,4.4 -.6,.9 h -1.7 l 1.7,1.2 2.1,-.1 .4,-1 4.6,-.6 2,2.6 1.3,-.7 1.3,5.1 1,.5 1,-.7 .1,-2.4 .9,-1 .7,1.1 .2,1.6 1.6,.4 4.7,-1.2 .2,1.2 -2,1.1 -1.6,1.7 -2.8,7 -4.3,2 -1.4,1.5 -.3,1.4 -1,-.6 -9.3,3.3 -1.8,4.1 -1.3,-.4 .5,-1.1 -1.5,-1.4 -3.5,-.2 -5.3,3.2 -2.2,1.3 -2.3,0 -.5,2.4 z',
    'AL': 'm 643,467.4 .4,-7.3 -.9,-1.2 -1.7,-.7 -2.5,-2.8 .5,-2.9 48.8,-5.1 -.7,-2.2 -1.5,-1.5 -.5,-1.4 .6,-6.3 -2.4,-5.7 .5,-2.6 .3,-3.7 2.2,-3.8 -.2,-1.1 -1.7,-1 v -3.2 l -1.8,-1.9 -2.9,-6.1 -12.9,-45.8 -45.7,4 1.3,2 -1.3,67 4.4,33.2 .9,-.5 1.3,.1 .6,.4 .8,-.1 2,-3.8 v -2.3 l 1.1,-1.1 1.4,.5 3.4,6.4 v .9 l -3.3,2.2 3.5,-.4 4.9,-1.6 z',
    'AR': 'm 584.2,367 .9,-2.2 1.2,.5 .7,-1 -.8,-.7 .3,-1.5 -1.1,-.9 .6,-1 -.1,-1.5 -1.1,-.1 .8,-.8 1.3,.8 .3,-1.4 -.4,-1.1 .1,-.7 2,.6 -.4,-1.5 1.6,-1.3 -.5,-.9 -1.1,.1 -.6,-.9 .9,-.9 1.6,-.2 .5,-.8 1.4,-.2 -.1,-.8 -.9,-.9 v -.5 h 1.5 l .4,-.7 -1.4,-1 -.1,-.6 -11.2,.8 2.8,-5.1 1.7,-1.5 v -2.2 l -1.6,-2.5 -39.8,2 -39.1,.7 4.1,24.4 -.7,39 2.6,2.3 2.8,-1.3 3.2,.8 .2,11.9 52.3,-1.3 1.2,-1.5 .5,-3 -1.5,-2.3 -.5,-2.2 .9,-.7 v -.8 l -1.7,-1.1 -.1,-.7 1.6,-.9 -1.2,-1.1 1.7,-7.1 3.4,-1.6 v -.8 l -1.1,-1.4 2.9,-5.4 h 1.9 l 1.5,-1.2 -.3,-5.2 3.1,-4.5 1.8,-.6 -.5,-3.1 z',
    'AZ': 'm 139.6,387.6 3,-2.2 .8,-2.4 -1,-1.6 -1.8,-.2 -1.1,-1.6 1.1,-6.9 1.6,-.3 2.4,-3.2 1.6,-7 2.4,-3.6 4.8,-1.7 1.3,-1.3 -.4,-1.9 -2.3,-2.5 -1.2,-5.8 -1.4,-1.8 -1.3,-3.4 .9,-2.1 1.4,-3 .5,-2.9 -.5,-4.9 1,-13.6 3.5,-.6 3.7,1.4 1.2,2.7 h 2 l 2.4,-2.9 3.4,-17.5 46.2,8.2 40,6 -17.4,124.1 -37.3,-5.4 -64.2,-37.5 .5,-2.9 2,-1.8 z',
    'CA': 'm 69.4,365.6 3.4,5.2 -1.4,.1 -1.8,-1.9 z m 1.9,-9.8 1.8,4.1 2.6,1 .7,-.6 -1.3,-2.5 -2.6,-2.4 z m -19.9,-19 v 2.4 l 2,1.2 4.4,-.2 1,-1 -3.1,-.2 z m -5.9,.1 3.3,.5 1.4,2.2 h -3.8 z m 47.9,45.5 -1,-3 .2,-3 -.4,-7.9 -1.8,-4.8 -1.2,-1.4 -.6,-1.5 -7,-8.6 -3.6,.1 -2,-1.9 1.1,-1.8 -.7,-3.7 -2.2,-1.2 -3.9,-.6 -2.8,-1.3 -1.5,-1.9 -4.5,-6.6 -2.7,-2.2 -3.7,-.5 -3.1,-2.3 -4.7,-1.5 -2.8,-.3 -2.5,-2.5 .2,-2.8 .8,-4.8 1.8,-5.1 -1.4,-1.6 -4,-9.4 -2.7,-3.7 -.4,-3 -1.6,-2.3 .2,-2.5 -2,-5 -2.9,-2.7 .6,-7.1 2.4,-.8 1.8,-3.1 -.4,-3.2 -1,-.9 h -2.5 l -2.5,-3.3 -1.5,-3.5 v -7.5 l 1.2,-4.2 .2,-2.1 2.5,.2 -.1,1.6 -.8,.7 v 2.5 l 3.7,3.2 v -4.7 l -1.4,-3.4 .5,-1.1 -1,-1.7 2.8,-1.5 -1.9,-3 -1.4,.5 -1.5,3.8 .5,1.3 -.8,1 -.9,-.1 -5.4,-6.1 .7,-5.6 -1.1,-3.9 -6.5,-12.8 .8,-10.7 2.3,-3.6 .2,-6.4 -5.5,-11.1 .3,-5.2 6.9,-7.5 1.7,-2.4 -.1,-1.4 4,-9.2 .1,-8.4 .9,-2.5 66.1,18.6 -16.4,63.1 1.1,3.5 70.4,105 -.9,2.1 1.3,3.4 1.4,1.8 1.2,5.8 2.3,2.5 .4,1.9 -1.3,1.3 -4.8,1.7 -2.4,3.6 -1.6,7 -2.4,3.2 -1.6,.3 -1.1,6.9 1.1,1.6 1.8,.2 1,1.6 -.8,2.4 -3,2.2 -2.2,-.1 z',
    'CO': 'm 374.6,323.3 -16.5,-1 -51.7,-4.8 -52.6,-6.5 11.5,-88.3 44.9,5.7 37.5,3.4 33.1,2.4 -1.4,22.1 z',
    'CT': 'm 873.5,178.9 .4,-1.1 -3.2,-12.3 -.1,-.3 -14.9,3.4 v .7 l -.9,.3 -.5,-.7 -10.5,2.4 2.8,16.3 1.8,1.5 -3.5,3.4 1.7,2.2 5.4,-4.5 1.7,-1.3 h .8 l 2.4,-3.1 1.4,.1 2.9,-1.1 h 2.1 l 5.3,-2.7 2.8,-.9 1,-1 1.5,.5 z',
    'DC': 'm 803.5,252 -2.6,-1.8 -1,1.7 .5,.4 .4,.1 .6,.5 .3,.7 -.1,.5 .2,.5 z',
    'DE': 'm 822.2,226.6 -1.6,.3 -1.5,1.1 -1.2,2.1 7.6,27.1 10.9,-2.3 -2.2,-7.6 -1.1,.5 -3.3,-2.6 -.5,-1.7 -1.8,-1 -.2,-3.7 -2.1,-2.2 -1.1,-.8 -1.2,-1.1 -.4,-3.2 .3,-2.1 1,-2.2 z',
    'FL': 'm 751.7,445.1 -4,-.7 -1.7,-.9 -2.2,1.4 v 2.5 l 1.4,2.1 -.5,4.3 -2.1,.6 -1,-1.1 -.6,-3.2 -50.1,3.3 -3.3,-6 -48.8,5.1 -.5,2.9 2.5,2.8 1.7,.7 .9,1.2 -.4,7.3 -1.1,.6 .5,.4 1,-.3 .7,-.8 10.5,-2.7 9.2,-.5 8.1,1.9 8.5,5 2.4,.8 2.2,2 -.1,2.7 h 2.4 l 1.9,-1 2.5,.1 2,-.8 2.9,-2 3.1,-2.9 1.1,-.4 .6,.5 h 1.4 l .5,-.8 -.5,-1.2 -.6,-.6 .2,-.8 2,-1.1 5,-.4 .8,1 1,.1 2.3,1 3,1.8 1.2,1.7 1.1,1.2 2.8,1.4 v 2.4 l 2.8,1.9 1,.1 1.6,1.4 .7,1.6 1,.2 .8,2.1 .7,.6 1,-1.1 2.9,.1 .5,1.4 1.1,.9 v 1.3 l 2.9,2.2 .2,9.6 -1.8,5.8 1,1.2 -.2,3.4 -.8,1.4 .7,1.2 2.3,2.3 .3,1.5 .8,1 -.4,-1.9 1.3,-.6 .8,-3.6 -3,-1.2 .1,-.6 2.6,-.4 .9,2.6 1.1,.6 .1,-2 1.1,.3 .6,.8 -.1,.7 -2.9,4.2 -.2,1.1 -1.7,1.9 v 1.1 l 3.7,3.8 5.3,7.9 1.8,2.1 v 1.8 l 2.8,4.6 2.3,.6 .7,-1.2 -2.1,.3 -3,-4.5 .2,-1.4 1.5,-.8 v -1.5 l -.6,-1.3 .9,-.9 .4,.9 .7,.5 v 4 l -1.2,-.6 -.8,.9 1.4,1.6 1,2.6 1.2,-.6 2.3,1.2 2.1,2.2 1.6,5.1 3.1,4.8 .8,-1.3 2.8,-.5 3.2,1.3 .3,1.7 3.3,3.8 .1,1.1 2.2,2.7 -.7,.5 v 2.7 l 2.7,1.4 h 1.5 l 2.7,-1.8 1.5,.3 1.1,.4 2.3,-1.7 .2,-.7 1.2,.3 2.4,-1.7 1.3,-2.3 -.7,-3.2 -.2,-1.3 1.1,-4 .6,-.2 .6,1.6 .8,-1.8 -.8,-7.2 -.4,-10.5 -1,-6.8 -.7,-1.7 -6.6,-11.1 -5.2,-9.1 -2.2,-3.3 -1.3,-3.6 -.2,-3.4 .9,-.3 v -.9 l -1.1,-2.2 -4,-4 -7.6,-9.7 -5.7,-10.4 -4.3,-10.7 -.6,-3.7 -1.2,-1 -.5,-3.8 z m 9.2,134.5 1.7,-.1 -.7,-1 z m 7.3,-1.1 v -.7 l 1.6,-.2 3.7,-3.3 1.5,-.6 2.4,-.9 .3,1.3 1.7,.8 -2.6,1.2 h -2.4 l -3.9,2.5 z m 17.2,-7.6 -3,1.4 -1,1.3 1.1,.1 z m 3.8,-2.9 -1.1,.3 -1.4,2 1.1,-.2 1.5,-1.6 z m 8.3,-15.7 -1.7,5.6 -.8,1 -1,2.6 -1.2,1.6 -.7,1.7 -1.9,2.2 v .9 l 2.7,-2.8 2.4,-3.5 .6,-2 2.1,-4.9 z',
    'GA': 'm 761.8,414.1 v 1.4 l -4.2,6.2 -1.2,.2 1.5,.5 v 2 l -.9,1.1 -.6,6 -2.3,6.2 .5,2 .7,5.1 -3.6,.3 -4,-.7 -1.7,-.9 -2.2,1.4 v 2.5 l 1.4,2.1 -.5,4.3 -2.1,.6 -1,-1.1 -.6,-3.2 -50.1,3.3 -3.3,-6 -.7,-2.2 -1.5,-1.5 -.5,-1.4 .6,-6.3 -2.4,-5.7 .5,-2.6 .3,-3.7 2.2,-3.8 -.2,-1.1 -1.7,-1 v -3.2 l -1.8,-1.9 -2.9,-6.1 -12.9,-45.8 22.9,-2.9 21.4,-3 -.1,1.9 -1.9,1 -1.4,3.2 .2,1.3 6.1,3.8 2.6,-.3 3.1,4 .4,1.7 4.2,5.1 2.6,1.7 1.4,.2 2.2,1.6 1.1,2.2 2,1.6 1.8,.5 2.7,2.7 .1,1.4 2.6,2.8 5,2.3 3.6,6.7 .3,2.7 3.9,2.1 2.5,4.8 .8,3.1 4.2,.4 z',
    'HI': 'm 317,553.7 -.2,3.2 1.7,1.9 .1,1.2 -4.8,4.5 -.1,1.2 1.9,3.2 1.7,4.2 v 2.6 l -.5,1.2 .1,3.4 4.1,2.1 1.1,1.1 1.2,-1.1 2.1,-3.6 4.5,-2.9 3.3,-.5 2.5,-1 1.7,-1.2 3.2,-3.5 -2.8,-1.1 -1.4,-1.4 .1,-1.7 -.5,-.6 h -2 l .2,-2.5 -.7,-1.2 -2.6,-2.3 -4.5,-1.9 -2.8,-.2 -3.3,-2.7 -1.2,-.6 z m -15.3,-17 -1.1,1.5 -.1,1.7 2.7,2.4 1.9,.5 .6,1 .4,3 3.6,.2 5.3,-2.6 -.1,-2.5 -1.4,-.5 -3.5,-2.6 -1.8,-.3 -2.9,1.3 -1.5,-2.7 z m -1.5,11.5 .9,-1.4 2.5,-.3 .6,1.8 z m -7,-8.7 1.7,4 3.1,-.6 .3,-2 -1.4,-1.5 z m -4.1,-6.7 -1.1,2.4 h 5 l 4.8,1.6 2.5,-1.6 .2,-1.5 -4.8,.2 z m -16,-10.6 -1.9,2.1 -2.9,.6 .8,2.2 2.2,2.8 .1,1 2.1,-.3 2.3,.1 1.7,1.2 3.5,-.8 v -.7 l -1,-.8 -.5,-2.1 -.8,-.3 -.5,1 -1.2,-1.3 .2,-1.4 -1.8,-3.3 -1.1,-.7 z m -31.8,-12.4 -4.2,2.9 .2,2.3 2.4,1.2 1.9,1.3 2.7,.4 2.6,-2.2 -.2,-1.9 .8,-1.7 v -1.4 l -1,-.9 z m -10.8,4.8 -.3,1.2 -1.9,.9 -.6,1.8 1,.8 1.1,-1.5 1.9,-.6 .4,-2.6 z',
    'IA': 'm 556.9,183 2.1,1.6 .6,1.1 -1.6,3.3 -.1,2.5 2,5.5 2.7,1.5 3.3,.7 1.3,2.8 -.5,.6 2.5,1.3 1.7,1.7 -.2,1.6 .9,1.1 h 1.2 l 2.8,3.5 .1,2.6 -1.3,3.2 -1.1,1.3 -.1,2.4 -1.7,2.2 -4.2,1.8 h -2.4 l -3,.8 -1,4 1.1,1.6 1,.3 .9,1.4 -.1,3.5 -.5,.5 -1.7,2.4 v 2.4 l -1,1.2 -.9,.3 -1.8,.6 -1,1.5 .7,.9 -.1,2.3 -.7,.7 -1.5,-.8 -1.1,-1.1 -.6,-1.6 -1.7,-1.3 -14.3,.8 -27.2,1.2 -25.9,-.1 -1.8,-4.4 .7,-2.2 -.8,-3.3 .2,-2.9 -1.3,-.7 -.4,-6.1 -2.8,-5 -.2,-3.7 -2.2,-4.3 -1.3,-3.7 v -1.4 l -.6,-1.7 v -2.3 l -.5,-.9 -.7,-1.7 -.3,-1.3 -1.3,-1.2 1,-4.3 1.7,-5.1 -.7,-2 -1.3,-.4 -.4,-1.6 1,-.5 .1,-1.1 -1.3,-1.5 .1,-1.6 2.2,.1 h 28.2 l 36.3,-.9 18.6,-.7 z',
    'ID': 'm 165.3,183.1 -24.4,-5.4 8.5,-37.3 2.9,-5.8 .4,-2.1 .8,-.9 -.9,-2 -2.9,-1.2 .2,-4.2 4,-5.8 2.5,-.8 1.6,-2.3 -.1,-1.6 1.8,-1.6 3.2,-5.5 4.2,-4.8 -.5,-3.2 -3.5,-3.1 -1.6,-3.6 1.1,-4.3 -.7,-4 12.7,-56.1 14.2,3 -4.8,22 3.7,7.4 -1.6,4.8 3.6,4.8 1.9,.7 3.9,8.3 v 2.1 l 2.3,3 h .9 l 1.4,2.1 h 3.2 v 1.6 l -7.1,17 -.5,4.1 1.4,.5 1.6,2.6 2.8,-1.4 3.6,-2.4 1.9,1.9 .5,2.5 -.5,3.2 2.5,9.7 2.6,3.5 2.3,1.4 .4,3 v 4.1 l 2.3,2.3 1.6,-2.3 6.9,1.6 2.1,-1.2 9,1.7 2.8,-3.3 1.8,-.6 1.2,1.8 1.6,4.1 .9,.1 -8.5,54.8 -47.9,-8.2 z',
    'IL': 'm 623.5,265.9 -1,5.2 v 2 l 2.4,3.5 v .7 l -.3,.9 .9,1.9 -.3,2.4 -1.6,1.8 -1.3,4.2 -3.8,5.3 -.1,7 h -1 l .9,1.9 v .9 l -2.2,2.7 .1,1.1 1.5,2.2 -.1,.9 -3.7,.6 -.6,1.2 -1.2,-.6 -1,.5 -.4,3.3 1.7,1.8 -.4,2.4 -1.5,.3 -6.9,-3 -4,3.7 .3,1.8 h -2.8 l -1.4,-1.5 -1.8,-3.8 v -1.9 l .8,-.6 .1,-1.3 -1.7,-1.9 -.9,-2.5 -2.7,-4.1 -4.8,-1.3 -7.4,-7.1 -.4,-2.4 2.8,-7.6 -.4,-1.9 1.2,-1.1 v -1.3 l -2.8,-1.5 -3,-.7 -3.4,1.2 -1.3,-2.3 .6,-1.9 -.7,-2.4 -8.6,-8.4 -2.2,-1.5 -2.5,-5.9 -1.2,-5.4 1.4,-3.7 .7,-.7 .1,-2.3 -.7,-.9 1,-1.5 1.8,-.6 .9,-.3 1,-1.2 v -2.4 l 1.7,-2.4 .5,-.5 .1,-3.5 -.9,-1.4 -1,-.3 -1.1,-1.6 1,-4 3,-.8 h 2.4 l 4.2,-1.8 1.7,-2.2 .1,-2.4 1.1,-1.3 1.3,-3.2 -.1,-2.6 -2.8,-3.5 h -1.2 l -.9,-1.1 .2,-1.6 -1.7,-1.7 -2.5,-1.3 .5,-.6 45.9,-2.8 .1,4.6 3.4,4.6 1.2,4.1 1.6,3.2 z',
    'IN': 'm 629.2,214.8 -5.1,2.3 -4.7,-1.4 4.1,50.2 -1,5.2 v 2 l 2.4,3.5 v .7 l -.3,.9 .9,1.9 -.3,2.4 -1.6,1.8 -1.3,4.2 -3.8,5.3 -.1,7 h -1 l .9,1.9 1.1,.8 .6,-1 -.7,-1.7 4.6,-.5 .2,1.2 1.1,.2 .4,-.9 -.6,-1.3 .3,-.8 1.3,.8 1.7,-.4 1.7,.6 3.4,2.1 1.8,-2.8 3.5,-2.2 3,3.3 1.6,-2.1 .3,-2.7 3.8,-2.3 .2,1.3 1.9,1.2 3,-.2 1.2,-.7 .1,-3.4 2.5,-3.7 4.6,-4.4 -.1,-1.7 1.2,-3.8 2.2,1 6.7,-4.5 -.4,-1.7 -1.5,-2.1 1,-1.9 -6.6,-57.2 -.1,-1.4 -32.4,3.4 z',
    'KS': 'm 459.1,259.5 -43.7,-1.2 -36,-2 -4.8,67 67.7,2.9 62,.1 -.5,-48.1 -3.2,-.7 -2.6,-4.7 -2.5,-2.5 .5,-2.3 2.7,-2.6 .1,-1.2 -1.5,-2.1 -.9,1 -2,-.6 -2.9,-3 z',
    'KY': 'm 692.1,322.5 -20.5,1.4 -5.2,.8 -17.4,1 -2.6,.8 -22.6,2 -.7,-.6 h -3.7 l 1.2,3.2 -.6,.9 -23.3,1.5 1,-2.7 1.4,.9 .7,-.4 1.2,-4.1 -1,-1 1,-2 .2,-.9 -1.3,-.8 -.3,-1.8 4,-3.7 6.9,3 1.5,-.3 .4,-2.4 -1.7,-1.8 .4,-3.3 1,-.5 1.2,.6 .6,-1.2 3.7,-.6 .1,-.9 -1.5,-2.2 -.1,-1.1 2.2,-2.7 0,-.9 1.1,.8 .6,-1 -.7,-1.7 4.6,-.5 .2,1.2 1.1,.2 .4,-.9 -.6,-1.3 .3,-.8 1.3,.8 1.7,-.4 1.7,.6 3.4,2.1 1.8,-2.8 3.5,-2.2 3,3.3 1.6,-2.1 .3,-2.7 3.8,-2.3 .2,1.3 1.9,1.2 3,-.2 1.2,-.7 .1,-3.4 2.5,-3.7 4.6,-4.4 -.1,-1.7 1.2,-3.8 2.2,1 6.7,-4.5 -.4,-1.7 -1.5,-2.1 1,-1.9 1.3,.5 2.2,.1 1.9,-.8 2.9,1.2 2.2,3.4 v 1 l 4.1,.7 2.3,-.2 1.9,2.1 2.2,.2 v -1 l 1.9,-.8 3,.8 1.2,.8 1.3,-.7 h .9 l .6,-1.7 3.4,-1.8 .5,.8 .8,2.9 3.5,1.4 1.2,2.1 -.1,1.1 .6,1 -.6,3.6 1.9,1.6 .8,1.1 1,.6 -.1,.9 4.4,5.6 h 1.4 l 1.5,1.8 1.2,.3 1.4,-.1 -4.9,6.6 -2.9,1 -3,3 -.4,2.2 -2.1,1.3 -.1,1.7 -1.4,1.4 -1.8,.5 -.5,1.9 -1,.4 -6.9,4.2 z m -98,11.3 -.7,-.7 .2,-1 h 1.1 l .7,.7 -.3,1 z',
    'LA': 'm 602.5,472.8 -1.2,-1.8 .3,-1.3 -4.8,-6.8 .9,-4.6 1,-1.4 .1,-1.4 -36,2 1.7,-11.9 2.4,-4.8 6,-8.4 -1.8,-2.5 h 2 v -3.3 l -2.4,-2.5 .5,-1.7 -1.2,-1 -1.6,-7.1 .6,-1.4 -52.3,1.3 .5,19.9 .7,3.4 2.6,2.8 .7,5.4 3.8,4.6 .8,4.3 h 1 l -.1,7.3 -3.3,6.4 1.3,2.3 -1.3,1.5 .7,3 -.1,4.3 -2.2,3.5 -.1,.8 -1.7,1.2 1,1.8 1.2,1.1 1.6,-1.3 5.3,-.9 6.1,-.1 9.6,3.8 8,1 1.5,-1.4 1.8,-.2 4.8,2.2 1.6,-.4 1.1,-1.5 -4.2,-1.8 -2.2,1 -1.1,-.2 -1.4,-2 3.3,-2.2 1.6,-.1 v 1.7 l 1.5,-.1 3.4,-.3 .4,2.3 1.1,.4 .6,1.9 4.8,1 1.7,1.6 v .7 h -1.2 l -1.5,1.7 1.7,1.2 5.4,1 2.7,2.8 4.4,-1 -3.7,.2 -.1,-.6 2.8,-.7 .2,-1.8 1.2,-.3 v -1.4 l 1.1,.1 v 1.6 l 2.5,.1 .8,-1.9 .9,.3 .2,2.5 1.2,.2 -1.8,2 2.6,-.9 2,-1.1 2.9,-3.3 h -.7 l -1.3,1.2 -.4,-.1 -.5,-.8 .9,-1.2 v -2.3 l 1.1,-.8 .7,.7 1,-.8 1,-.1 .6,1.3 -.6,1.9 h 2.4 l 5.1,1.7 .5,1.3 1.6,1.4 2.8,.1 1.3,.7 1.8,-1 .9,-1.7 v -1.7 h -1.4 l -1.2,-1.4 -1.1,-1.1 -3.2,-.9 -2.6,.2 -4.2,-2.4 v -2.3 l 1.3,-1 2.4,.6 -3.1,-1.6 .2,-.8 h 3.6 l 2.6,-3.5 -2.6,-1.8 .8,-1.5 -1.2,-.8 h -.8 l -2,2.1 v 2.1 l -.6,.7 -1.1,-.1 -1.6,-1.4 h -1.3 v -1.5 l .6,-.7 .8,.7 1.7,-1.6 .7,-1.6 .8,-.3 z m -10.3,-2.7 1.9,1 .8,1.1 2.5,.1 1.5,.8 .2,1.4 -.4,.6 -.9,-1.5 -1.4,1.2 -.9,1.4 -2.8,.8 -1.6,.1 -3.7,-1 .1,-1.7 2,-2 1.1,-2.4 z m -4.7,1.2 v 1.1 l -1.8,2 h -1.2 v -2.2 l 1.6,-1.5 z',
    'MA': 'm 899.9,174.2 h 3.4 l .9,-.6 .1,-1.3 -1.9,-1.8 .4,1 -1.5,1.5 h -2.3 l .1,.8 z m -9,1.8 -1.2,-.6 1,-.8 .6,-2.1 1.2,-1 .8,-.2 .6,.9 1.1,.2 .6,-.6 .5,1.9 -1.3,.3 -2.8,.7 z m -34.9,-23.4 18.4,-3.8 1,-1.5 .3,-1.7 1.9,-.6 .5,-1.1 1.7,-1.1 1.3,.3 1.7,3.3 1,.4 1.1,-1.3 .8,1.3 v 1.1 l -3,2.4 .2,.8 -.9,1 .4,.8 -1.3,.3 .9,1.2 -.8,.7 .6,1 .9,-.2 .3,-.8 1.1,.6 h 1.8 l 2.5,2.6 .2,2.6 1.8,.1 .8,1.1 .6,2 1,.7 h 1.9 l 1.9,-.1 .8,-.9 1.6,-1.2 1.1,-.3 -1.2,-2.1 -.3,.9 -1.5,-3.6 h -.8 l -.4,.9 -1.2,-1 1.3,-1.1 1.8,.4 2.3,2.1 1.3,2.7 1.2,3.3 -1,2.8 v -1.8 l -.7,-1 -3.5,2.3 -.9,-.3 -1.6,1 -.1,1.2 -2.2,1.2 -2,2.1 -2,1.9 h -1.2 l 3.3,-3.3 .5,-1.9 -.5,-.6 -.3,-1.3 -.9,-.1 -.1,1.3 -1,1.2 h -1.2 l -.3,1.1 .4,1.2 -1.2,1.1 -1.1,-.2 -.4,1 -1.4,-3 -1.3,-1.1 -2.6,-1.3 -.6,-2.2 h -.8 l -.7,-2.6 -6.5,2 -.1,-.3 -14.9,3.4 v .7 l -.9,.3 -.5,-.7 -10.5,2.4 -.7,-1 .5,-15 z',
    'MD': 'm 822.9,269.3 0,-1.7 h -.8 l 0,1.8 z m 11.8,-3.9 1.2,-2.2 .1,-2.5 -.6,-.6 -.7,.9 -.2,2.1 -.8,1.4 -.3,1.1 -4.6,1.6 -.7,.8 -1.3,.2 -.4,.9 -1.3,.6 -.3,-2.5 .4,-.7 -.8,-.5 .2,-1.5 -1.6,1 v -2 l 1.2,-.3 -1.9,-.4 -.7,-.8 .4,-1.3 -.8,-.6 -.7,1.6 .5,.8 -.7,.6 -1.1,.5 -2,-1 -.2,-1.2 -1,-1.1 -1.4,-1.7 1.5,-.8 -1,-.6 v -.9 l .6,-1 1.7,-.3 -1.4,-.6 -.1,-.7 -1.3,-.1 -.4,1.1 -.6,.3 .1,-3.4 1,-1 .8,.7 .1,-1.6 -1,-.9 -.9,1.1 -1,1.4 -.6,-1 .2,-2.4 .9,-1 .9,.9 1.2,-.7 -.4,-1.7 -1,1 -.9,-2.1 -.2,-1.7 1.1,-2.4 1.1,-1.4 1.4,-.2 -.5,-.8 .5,-.6 -.3,-.7 .2,-2.1 -1.5,.4 -.8,1.1 1,1.3 -2.6,3.6 -.9,-.4 -.7,.9 -.6,2.2 -1.8,.5 1.3,.6 1.3,1.3 -.2,.7 .9,1.2 -1.1,1 .5,.3 -.5,1.3 v 2.1 l -.5,1.3 .9,1.1 .7,3.4 1.3,1.4 1.6,1.4 .4,2.8 1.6,2 .4,1.4 v 1 h -.7 l -1.5,-1.2 -.4,.2 -1.2,-.2 -1.7,-1.4 -1.4,-.3 -1,.5 -1.2,-.3 -.4,.2 -1.7,-.8 -1,-1 -1,-1.3 -.6,-.2 -.8,.7 -1.6,1.3 -1.1,-.8 -.4,-2.3 .8,-2.1 -.3,-.5 .3,-.4 -.7,-1 1,-.1 1,-.9 .4,-1.8 1.7,-2.6 -2.6,-1.8 -1,1.7 -.6,-.6 h -1 l -.6,-.1 -.4,-.4 .1,-.5 -1.7,-.6 -.8,.3 -1.2,-.1 -.7,-.7 -.5,-.2 -.2,-.7 .6,-.8 v -.9 l -1.2,-.2 -1,-.9 -.9,.1 -1.6,-.3 -.9,-.4 .2,-1.6 -1,-.5 -.2,-.7 h -.7 l -.8,-1.2 .2,-1 -2.6,.4 -2.2,-1.6 -1.4,.3 -.9,1.4 h -1.3 l -1.7,2.9 -3.3,.4 -1.9,-1 -2.6,3.8 -2.2,-.3 -3.1,3.9 -.9,1.6 -1.8,1.6 -1.7,-11.4 60.5,-11.8 7.6,27.1 10.9,-2.3 0,5.3 -.1,3.1 -1,1.8 z m -13.4,-1.8 -1.3,.9 .8,1.8 1.7,.8 -.4,-1.6 z',
    'ME': 'm 875,128.7 .6,4 3.2,2 .8,2.2 2.3,1.4 1.4,-.3 1,-3 -.8,-2.9 1.6,-.9 .5,-2.8 -.6,-1.3 3.3,-1.9 -2.2,-2.3 .9,-2.4 1.4,-2.2 .5,3.2 1.6,-2 1.3,.9 1.2,-.8 v -1.7 l 3.2,-1.3 .3,-2.9 2.5,-.2 2.7,-3.7 v -.7 l -.9,-.5 -.1,-3.3 .6,-1.1 .2,1.6 1,-.5 -.2,-3.2 -.9,.3 -.1,1.2 -1.2,-1.4 .9,-1.4 .6,.1 1.1,-.4 .5,2.8 2,-.3 2.9,.7 v -1 l -1.1,-1.2 1.3,.1 .1,-2.3 .6,.8 .3,1.9 2.1,1.5 .2,-1 .9,-.2 -.3,-.8 .8,-.6 -.1,-1.6 -1.6,-.2 -2,.7 1.4,-1.6 .7,-.8 1.3,-.2 .4,1.3 1.7,1.6 .4,-2.1 2.3,-1.2 -.9,-1.3 .1,-1.7 1.1,.5 h .7 l 1.7,-1.4 .4,-2.3 2.2,.3 .1,-.7 .2,-1.6 .5,1.4 1.5,-1 2.3,-4.1 -.1,-2.2 -1.4,-2 -3,-3.2 h -1.9 l -.8,2.2 -2.9,-3 .3,-.8 v -1.5 l -1.6,-4.5 -.8,-.2 -.7,.4 h -4.8 l -.3,-3.6 -8.1,-26 -7.3,-3.7 -2.9,-.1 -6.7,6.6 -2.7,-1 -1,-3.9 h -2.7 l -6.9,19.5 .7,6.2 -1.7,2.4 -.4,4.6 1.3,3.7 .8,.2 v 1.6 l -1.6,4.5 -1.5,1.4 -1.3,2.2 -.4,7.8 -2.4,-1 -1.5,.4 z m 34.6,-24.7 -1,.8 v 1.3 l .7,-.8 .9,.8 .4,-.5 1.1,.2 -1,-.8 .4,-.8 z m -1.7,2.6 -1,1.1 .5,.4 -.1,1 h 1.1 v -1.8 z m -3,-1.6 .9,1.3 1,.5 .3,-1 v -1.8 l -1.3,-.7 -.4,1.2 z m -1,5 -1.7,-1.7 1.6,-2.4 .8,.3 .2,1.1 1,.8 v 1.1 l -1,1 z',
    'MI': 'm 663.3,209.8 .1,1.4 21.4,-3.5 .5,-1.2 3.9,-5.9 v -4.3 l .8,-2.1 2.2,-.8 2,-7.8 1,-.5 1,.6 -.2,.6 -1.1,.8 .3,.9 .8,.4 1.9,-1.4 .4,-9.8 -1.6,-2.3 -1.2,-3.7 v -2.5 l -2.3,-4.4 v -1.8 l -1.2,-3.3 -2.3,-3 -2.9,-1 -4.8,3 -2.5,4.6 -.2,.9 -3,3.5 -1.5,-.2 -2.9,-2.8 -.1,-3.4 1.5,-1.9 2,-.2 1.2,-1.7 .2,-4 .8,-.8 1.1,-.1 .9,-1.7 -.2,-9.6 -.3,-1.3 -1.2,-1.2 -1.7,-1 -.1,-1.8 .7,-.6 1.8,.8 -.3,-1.7 -1.9,-2.7 -.7,-1.6 -1.1,-1.1 h -2.2 l -8.1,-2.9 -1.4,-1.7 -3.1,-.3 -1.2,.3 -4.4,-2.3 h -1.4 l .5,1 -2.7,-.1 .1,.6 .6,.6 -2.5,2.1 .1,1.8 1.5,2.3 1.5,.2 v .6 l -1.5,.5 -2.1,-.1 -2.8,2.5 .1,2.5 .4,5.8 -2.2,3.4 .8,-4.5 -.8,-.6 -.9,5.3 -1,-2.3 .5,-2.3 -.5,-1 .6,-1.3 -.6,-1.1 1,-1 v -1.2 l -1.3,.6 -1.3,3.1 -.7,.7 -1.3,2.4 -1.7,-.2 -.1,1.2 h -1.6 l .2,1.5 .2,2 -3,1.2 .1,1.3 1,1.7 -.1,5.2 -1.3,4.4 -1.7,2.5 1.2,1.4 .8,3.5 -1,2.5 -.2,2.1 1.7,3.4 2.5,4.9 1.2,1.9 1.6,6.9 -.1,8.8 -.9,3.9 -2,3.2 -.9,3.7 -2,3 -1.2,1 z m -95.8,-96.8 3,3.8 17,3.8 1.4,1 4,.8 .7,.5 2.8,-.2 4.9,.8 1.4,1.5 -1,1 .8,.8 3.8,.7 1.2,1.2 .1,4.4 -1.3,2.8 2,.1 1,-.8 .9,.8 -1.1,3.1 1,1.6 1.2,.3 .8,-1.8 2.9,-4.6 1.6,-6 2.3,-2 -.5,-1.6 .5,-.9 1,1.6 -.3,2.2 2.9,-2.2 .2,-2.3 2.1,.6 .8,-1.6 .7,.6 -.7,1.5 -1,.5 -1,2 1.4,1.8 1.1,-.5 -.5,-.7 1,-1.5 1.9,-1.7 h .8 l .2,-2.6 2,-1.8 7.9,-.5 1.9,-3.1 3.8,-.3 3.8,1.2 4.2,2.7 .7,-.2 -.2,-3.5 .7,-.2 4.5,1.1 1.5,-.2 2.9,-.7 1.7,.4 1.8,.1 v -1.1 l -.7,-.9 -1.5,-.2 -1.1,-.8 .5,-1.4 -.8,-.3 -2.6,.1 -.1,-1 1.1,-.8 .6,.8 .5,-1.8 -.7,-.7 .7,-.2 -1.4,-1.3 .3,-1.3 .1,-1.9 h -1.3 l -1.5,1 -1.9,.1 -.5,1.8 -1.9,.2 -.3,-1.2 -2.2,.1 -1,1.2 -.7,-.1 -.2,-.8 -2.6,.4 -.1,-4.8 1,-2 -.7,-.1 -1.8,1.1 h -2.2 l -3.8,2.7 -6.2,.3 -4.1,.8 -1.9,1.5 -1.4,1.3 -2.5,1.7 -.3,.8 -.6,-1.7 -1.3,-.6 v .6 l .7,.7 v 1.3 l -1.5,-.6 h -.6 l -.3,1.2 -2,-1.9 -1.3,-.2 -1.3,1.5 -3.2,-.1 -.5,-1.4 -2,-1.9 -1.3,-1.6 v -.7 l -1.1,-1.4 -2.6,-1.2 -3.3,-.1 -1.1,-.9 h -1.4 l -.7,.4 -2.2,2.2 -.7,1.1 -1,-.7 .2,-1 .8,-2.1 3.2,-5 .8,-.2 1.7,-1.9 .7,-1.6 3,-.6 .8,-.6 -.1,-1 -.5,-.5 -4.5,.2 -2,.5 -2.6,1.2 -1.2,1.2 -1.7,2.2 -1.8,1 -3.3,3.4 -.4,1.6 -7.4,4.6 -4,.5 -1.8,.4 -2.3,3 -1.8,.7 -4.4,2.3 z m 100.7,3.8 3.8,.1 .6,-.5 -.2,-2 -1.7,-1.8 -1.9,.1 -.1,.5 1.1,.4 -1.6,.8 -.3,1 -.6,-.6 -.4,.8 z m -75.1,-41.9 -2.3,.2 -2.7,1.9 -7.1,5.3 .8,1 1.8,.3 2.8,-2 -1.1,-.5 2.3,-1.6 h 1 l 3,-1.9 -.1,-.9 z m 41.1,62.8 v 1 l 2.1,1.6 -.2,-2.4 z m -.7,2.8 1.1,.1 v .9 h -1 z m 21.4,-21.3 v .9 l .8,-.2 v -.5 z m 4.7,3.1 -.1,-1.1 -1.6,-.2 -.6,-.4 h -.9 l -.4,.3 .9,.4 1.1,1.1 z m -18,1.2 -.1,1.1 -.3,.7 .2,2.2 .4,.3 .7,.1 .5,-.9 .1,-1.6 -.3,-.6 -.1,-1.1 z',
    'MN': 'm 464.7,68.6 -1.1,2.8 .8,1.4 -.3,5.1 -.5,1.1 2.7,9.1 1.3,2.5 .7,14 1,2.7 -.4,5.8 2.9,7.4 .3,5.8 -.1,2.1 -.1,2.2 -.9,2 -3.1,1.9 -.3,1.2 1.7,2.5 .4,1.8 2.6,.6 1.5,1.9 -.2,39.5 h 28.2 l 36.3,-.9 18.6,-.7 -1.1,-4.5 -.2,-3 -2.2,-3 -2.8,-.7 -5.2,-3.6 -.6,-3.3 -6.3,-3.1 -.2,-1.3 h -3.3 l -2.2,-2.6 -2,-1.3 .7,-5.1 -.9,-1.6 .5,-5.4 1,-1.8 -.3,-2.7 -1.2,-1.3 -1.8,-.3 v -1.7 l 2.8,-5.8 5.9,-3.9 -.4,-13 .9,.4 .6,-.5 .1,-1.1 .9,-.6 1.4,1.2 .7,-.1 v 0 l -1.2,-2.2 4.3,-3.1 3.1,-3.7 1.6,-.8 4.7,-5.9 6.3,-5.8 3.9,-2.1 6.3,-2.7 7.6,-4.5 -.6,-.4 -3.7,.7 -2.8,.1 -1,-1.6 -1.4,-.9 -9.8,1.2 -1,-2.8 -1.6,-.1 -1.7,.8 -3.7,3.1 h -4.1 l -2.1,-1 -.3,-1.7 -3.9,-.8 -.6,-1.6 -.7,-1.3 -1,.9 -2.6,.1 -9.9,-5.5 h -2.9 l -.8,-.7 -3.1,1.3 -.8,1.3 -3.3,.8 -1.3,-.2 v -1.7 l -.7,-.9 h -5.9 l -.4,-1.4 h -2.6 l -1.1,.4 -2.4,-1.7 .3,-1.4 -.6,-2.4 -.7,-1.1 -.2,-3 -1,-3.1 -2.1,-1.6 h -2.9 l .1,8 -30.9,-.4 z',
    'MO': 'm 555.3,248.9 -1.1,-1.1 -.6,-1.6 -1.7,-1.3 -14.3,.8 -27.2,1.2 -25.9,-.1 1.3,1.3 -.3,1.4 2.1,3.7 3.9,6.3 2.9,3 2,.6 .9,-1 1.5,2.1 -.1,1.2 -2.7,2.6 -.5,2.3 2.5,2.5 2.6,4.7 3.2,.7 .5,48.1 .2,10.8 39.1,-.7 39.8,-2 1.6,2.5 v 2.2 l -1.7,1.5 -2.8,5.1 11.2,-.8 1,-2 1.2,-.5 v -.7 l -1.2,-1.1 -.6,-1 1.7,.2 .8,-.7 -1.4,-1.5 1.4,-.5 .1,-1 -.6,-1 v -1.3 l -.7,-.7 .2,-1 h 1.1 l .7,.7 -.3,1 .8,.7 .8,-1 1,-2.7 1.4,.9 .7,-.4 1.2,-4.1 -1,-1 1,-2 .2,-.9 -1.3,-.8 h -2.8 l -1.4,-1.5 -1.8,-3.8 v -1.9 l .8,-.6 .1,-1.3 -1.7,-1.9 -.9,-2.5 -2.7,-4.1 -4.8,-1.3 -7.4,-7.1 -.4,-2.4 2.8,-7.6 -.4,-1.9 1.2,-1.1 v -1.3 l -2.8,-1.5 -3,-.7 -3.4,1.2 -1.3,-2.3 .6,-1.9 -.7,-2.4 -8.6,-8.4 -2.2,-1.5 -2.5,-5.9 -1.2,-5.4 1.4,-3.7 z',
    'MS': 'm 623.8,468.6 -5,.1 -2.4,-1.5 -7.9,2.5 -.9,-.7 -.5,.2 -.1,1.6 -.6,.1 -2.6,2.7 -.7,-.1 -.6,-.7 -1.2,-1.8 .3,-1.3 -4.8,-6.8 .9,-4.6 1,-1.4 .1,-1.4 -36,2 1.7,-11.9 2.4,-4.8 6,-8.4 -1.8,-2.5 h 2 v -3.3 l -2.4,-2.5 .5,-1.7 -1.2,-1 -1.6,-7.1 .6,-1.4 1.2,-1.5 .5,-3 -1.5,-2.3 -.5,-2.2 .9,-.7 v -.8 l -1.7,-1.1 -.1,-.7 1.6,-.9 -1.2,-1.1 1.7,-7.1 3.4,-1.6 v -.8 l -1.1,-1.4 2.9,-5.4 h 1.9 l 1.5,-1.2 -.3,-5.2 3.1,-4.5 1.8,-.6 -.5,-3.1 38.3,-2.6 1.3,2 -1.3,67 4.4,33.2 z',
    'MT': 'm 247,130.5 57.3,7.9 51,5.3 2,-20.7 5.2,-66.7 -53.5,-5.6 -54.3,-7.7 -65.9,-12.5 -4.8,22 3.7,7.4 -1.6,4.8 3.6,4.8 1.9,.7 3.9,8.3 v 2.1 l 2.3,3 h .9 l 1.4,2.1 h 3.2 v 1.6 l -7.1,17 -.5,4.1 1.4,.5 1.6,2.6 2.8,-1.4 3.6,-2.4 1.9,1.9 .5,2.5 -.5,3.2 2.5,9.7 2.6,3.5 2.3,1.4 .4,3 v 4.1 l 2.3,2.3 1.6,-2.3 6.9,1.6 2.1,-1.2 9,1.7 2.8,-3.3 1.8,-.6 1.2,1.8 1.6,4.1 .9,.1 z',
    'NC': 'm 829,300.1 -29.1,6.1 -39.4,7.3 -29.4,3.5 v 5.2 l -1.5,-.1 -1.4,1.2 -2.4,5.2 -2.6,-1.1 -3.5,2.5 -.7,2.1 -1.5,1.2 -.8,-.8 -.1,-1.5 -.8,-.2 -4,3.3 -.6,3.4 -4.7,2.4 -.5,1.2 -3.2,2.6 -3.6,.5 -4.6,3 -.8,4.1 -1.3,.9 -1.5,-.1 -1.4,1.3 -.1,4.9 21.4,-3 4.4,-1.9 1.3,-.1 7.3,-4.3 23.2,-2.2 .4,.5 -.2,1.4 .7,.3 1.2,-1.5 3.3,3 .1,2.6 19.7,-2.8 24.5,17.1 4,-2.2 3,-.7 h 1.7 l 1.1,1.1 .8,-2 .6,-5 1.7,-3.9 5.4,-6.1 4.1,-3.5 5.4,-2.3 2.5,-.4 1.3,.4 .7,1.1 3.3,-6.6 3.3,-5.3 -.7,-.3 -4.4,6.8 -.5,-.8 2,-2.2 -.4,-1.5 -2,-.5 1,1.3 -1.2,.1 -1.2,-1.8 -1.2,2 -1.6,.2 1,-2.7 .7,-1.7 -.2,-2.9 -2.2,-.1 .9,-.9 1.1,.3 2.7,.1 .8,-.5 h 2.3 l 2,-1.9 .2,-3.2 1.3,-1.4 1.2,-.2 1.3,-1 -.5,-3.7 -2.2,-3.8 -2.7,-.2 -.9,1.6 -.5,-1 -2.7,.2 -1.2,.4 -1.9,1.2 -.3,-.4 h -.9 l -1.8,1.2 -2.6,.5 v -1.3 l .8,-1 1,.7 h 1 l 1.7,-2.1 3.7,-1.7 2,-2.2 h 2.4 l .8,1.3 1.7,.8 -.5,-1.5 -.3,-1.6 -2.8,-3.1 -.3,-1.4 -.4,1 -.9,-1.3 z m 7,31 2.7,-2.5 4.6,-3.3 v -3.7 l -.4,-3.1 -1.7,-4.2 1.5,1.4 1,3.2 .4,7.6 -1.7,.4 -3.1,2.4 -3.2,3.2 z m 1.9,-19.3 -.9,-.2 v 1 l 2.5,2.2 -.2,-1.4 z m 2.9,2.1 -1.4,-2.8 -2.2,-3.4 -2.4,-3 -2.2,-4.3 -.8,-.7 2.2,4.3 .3,1.3 3.4,5.5 1.8,2.1 z',
    'ND': 'm 464.7,68.6 -1.1,2.8 .8,1.4 -.3,5.1 -.5,1.1 2.7,9.1 1.3,2.5 .7,14 1,2.7 -.4,5.8 2.9,7.4 .3,5.8 -.1,2.1 -29.5,-.4 -46,-2.1 -39.2,-2.9 5.2,-66.7 44.5,3.4 55.3,1.6 z',
    'NE': 'm 402.5,191.1 38,1.6 3.4,3.2 1.7,.2 2.1,2 1.8,-.1 1.8,-2 1.5,.6 1,-.7 .7,.5 .9,-.4 .7,.4 .9,-.4 1,.5 1.4,-.6 2,.6 .6,1.1 6.1,2.2 1.2,1.3 .9,2.6 1.8,.7 1.5,-.2 .5,.9 v 2.3 l .6,1.7 v 1.4 l 1.3,3.7 2.2,4.3 .2,3.7 2.8,5 .4,6.1 1.3,.7 -.2,2.9 .8,3.3 -.7,2.2 1.8,4.4 1.3,1.3 -.3,1.4 2.1,3.7 3.9,6.3 h -32.4 l -43.7,-1.2 -36,-2 1.4,-22.1 -33.1,-2.4 3.7,-44.2 z',
    'NH': 'm 862.6,93.6 -1.3,.1 -1,-1.1 -1.9,1.4 -.5,6.1 1.2,2.3 -1.1,3.5 2.1,2.8 -.4,1.7 .1,1.3 -1.1,2.1 -1.4,.4 -.6,1.3 -2.1,1 -.7,1.5 1.4,3.4 -.5,2.5 .5,1.5 -1,1.9 .4,1.9 -1.3,1.9 .2,2.2 -.7,1.1 .7,4.5 .7,1.5 -.5,2.6 .9,1.8 -.2,2.5 -.5,1.3 -.1,1.4 2.1,2.6 18.4,-3.8 1,-1.5 .3,-1.7 1.9,-.6 .5,-1.1 1.7,-1.1 1.3,.3 .8,-4.8 -2.3,-1.4 -.8,-2.2 -3.2,-2 -.6,-4 -11.9,-36.8 z',
    'NJ': 'm 842.5,195.4 -14.6,-4.9 -1.8,2.5 .1,2.2 -3,5.4 1.5,1.8 -.7,2 -1,1 .5,3.6 2.7,.9 1,2.8 2.1,1.1 4.2,3.2 -3.3,2.6 -1.6,2.3 -1.8,3 -1.6,.6 -1.4,1.7 -1,2.2 -.3,2.1 .8,.9 .4,2.3 1.2,.6 2.4,1.5 1.8,.8 1.6,.8 .1,1.1 .8,.1 1.1,-1.2 .8,.4 2.1,.2 -.2,2.9 .2,2.5 1.8,-.7 1.5,-3.9 1.6,-4.8 2.9,-2.8 .6,-3.5 -.6,-1.2 1.7,-2.9 v -1.2 l -.7,-1.1 1.2,-2.7 -.3,-3.6 -.6,-8.2 -1.2,-1.4 v 1.4 l .5,.6 h -1.1 l -.6,-.4 -1.3,-.2 -.9,.6 -1.2,-1.6 .7,-1.7 v -1 l 1.7,-.7 .8,-2.1 z',
    'NM': 'm 357.5,332.9 h -.8 l -7.9,99.3 -31.8,-2.6 -34.4,-3.6 -.3,3 2,2.2 -30.8,-4.1 -1.4,10.2 -15.7,-2.2 17.4,-124.1 52.6,6.5 51.7,4.8 z',
    'NV': 'm 167.6,296.8 -3.4,17.5 -2.4,2.9 h -2 l -1.2,-2.7 -3.7,-1.4 -3.5,.6 -1,13.6 .5,4.9 -.5,2.9 -1.4,3 -70.4,-105 -1.1,-3.5 16.4,-63.1 47,11.2 24.4,5.4 23.3,4.7 z',
    'NY': 'm 872.9,181.6 -1.3,.1 -.5,1 z m -30.6,22.7 .7,.6 1.3,-.3 1.1,.3 .9,-1.3 h 1.9 l 2.4,-.9 5.1,-2.1 -.5,-.5 -1.9,.8 -2,.9 .2,-.8 2.6,-1.1 .8,-1 1.2,.1 4.1,-2.3 v .7 l -4.2,3 4.5,-2.8 1.7,-2.2 1.5,-.1 4.5,-3.1 3.2,-3.1 3,-2.3 1,-1.2 -1.7,-.1 -1,1.2 -.2,.7 -.9,.7 -.8,-1.1 -1.7,1 -.1,.9 -.9,-.2 .5,-.9 -1.2,-.7 -.6,.9 .9,.3 .2,.5 -.3,.5 -1.4,2.6 h -1.9 l .9,-1.8 .9,-.6 .3,-1.7 1.4,-1.6 .9,-.8 1.5,-.7 -1.2,-.2 -.7,.9 h -.7 l -1.1,.8 -.2,1 -2.2,2.1 -.4,.9 -1.4,.9 -7.7,1.9 .2,.9 -.9,.7 -2,.3 -1,-.6 -.2,1.1 -1.1,-.4 .1,1 -1.2,-.1 -1.2,.5 -.2,1.1 h -1 l .2,1 h -.7 l .2,1 -1.8,.4 -1.5,2.3 z m -.8,-.4 -1.6,.4 v 1 l -.7,1.6 .6,.7 2.4,-2.3 -.1,-.9 z m -10.1,-95.2 -.6,1.9 1.4,.9 -.4,1.5 .5,3.2 2.2,2.3 -.4,2.2 .6,2 -.4,1 -.3,3.8 3.1,6.7 -.8,1.8 .9,2.2 .9,-1.6 1.9,1.5 3,14.2 -.5,2 1.1,1 -.5,15 .7,1 2.8,16.3 1.8,1.5 -3.5,3.4 1.7,2.2 -1.3,3.3 -1.5,1.7 -1.5,2.3 -.2,-.7 .4,-5.9 -14.6,-4.9 -1.6,-1.1 -1.9,.3 -3,-2.2 -3,-5.8 h -2 l -.4,-1.5 -1.7,-1.1 -70.5,13.9 -.8,-6 4.3,-3.9 .6,-1.7 3.9,-2.5 .6,-2.4 2.3,-2 .8,-1.1 -1.7,-3.3 -1.7,-.5 -1.8,-3 -.2,-3.2 7.6,-3.9 8.2,-1.6 h 4.4 l 3.2,1.6 .9,-.1 1.8,-1.6 3.4,-.7 h 3 l 2.6,-1.3 2.5,-2.6 2.4,-3.1 1.9,-.4 1.1,-.5 .4,-3.2 -1.4,-2.7 -1.2,-.7 2,-1.3 -.1,-1.8 h -1.5 l -2.3,-1.4 -.1,-3.1 6.2,-6.1 .7,-2.4 3.7,-6.3 5.9,-6.4 2.1,-1.7 2.5,.1 20.6,-5.2 z',
    'OH': 'm 685.7,208.8 1.9,-.4 3,1.3 2.1,.6 .7,.9 h 1 l 1,-1.5 1.3,.8 h 1.5 l -.1,1 -3.1,.5 -2,1.1 1.9,.8 1.6,-1.5 2.4,-.4 2.2,1.5 1.5,-.1 2.5,-1.7 3.6,-2.1 5.2,-.3 4.9,-5.9 3.8,-3.1 9.3,-5.1 4.9,29.9 -2.2,1.2 1.4,2.1 -.1,2.2 .6,2 -1.1,3.4 -.1,5.4 -1,3.6 .5,1.1 -.4,2.2 -1.1,.5 -2,3.3 -1.8,2 h -.6 l -1.8,1.7 -1.3,-1.2 -1.5,1.8 -.3,1.2 h -1.3 l -1.3,2.2 .1,2.1 -1,.5 1.4,1.1 v 1.9 l -1,.2 -.7,.8 -1,.5 -.6,-2.1 -1.6,-.5 -1,2.3 -.3,2.2 -1.1,1.3 1.3,3.6 -1.5,.8 -.4,3.5 h -1.5 l -3.2,1.4 -1.2,-2.1 -3.5,-1.4 -.8,-2.9 -.5,-.8 -3.4,1.8 -.6,1.7 h -.9 l -1.3,.7 -1.2,-.8 -3,-.8 -1.9,.8 v 1 l -2.2,-.2 -1.9,-2.1 -2.3,.2 -4.1,-.7 v -1 l -2.2,-3.4 -2.9,-1.2 -1.9,.8 -2.2,-.1 -1.3,-.5 -6.6,-57.2 21.4,-3.5 z',
    'OK': 'm 501.5,398.6 -4.6,-3.8 -2.2,-.9 -.5,1.6 -5.1,.3 -.6,-1.5 -5,2.5 -1.6,-.7 -3.7,.3 -.6,1.7 -3.6,.9 -1.3,-1.2 -1.2,.1 -2,-1.8 -2.1,.7 -2,-.5 -1.8,-2 -2.5,4.2 -1.2,.8 -1,-1.8 .3,-2 -1.2,-.7 -2.3,2.5 -1.7,-1.2 -.1,-1.5 -1.3,.5 -2.6,-1.7 -3,2.6 -2.3,-1.1 .7,-2.1 -2.3,.1 -1.9,-3 -3.5,-1.1 -2,2.3 -2.3,-2.2 -1.4,.4 -2,.1 -3.5,-1.9 -2.3,.1 -1.2,-.7 -.5,-2.9 -2.3,-1.7 -1.1,1.5 -1.4,-1 -1.2,-.4 -1.1,1 -1.5,-.3 -2.5,-3 -2.7,-1.3 1.4,-42.7 -52.6,-3.2 .6,-10.6 16.5,1 67.7,2.9 62,.1 .2,10.8 4.1,24.4 -.7,39 z',
    'OR': 'm 93.9,166.5 47,11.2 8.5,-37.3 2.9,-5.8 .4,-2.1 .8,-.9 -.9,-2 -2.9,-1.2 .2,-4.2 4,-5.8 2.5,-.8 1.6,-2.3 -.1,-1.6 1.8,-1.6 3.2,-5.5 4.2,-4.8 -.5,-3.2 -3.5,-3.1 -1.6,-3.6 -30.3,-7.3 -2.8,1 -5.4,-.9 -1.8,-.9 -1.5,1.2 -3.3,-.4 -4.5,.5 -.9,.7 -4.2,-.4 -.8,-1.6 -1.2,-.2 -4.4,1.3 -1.6,-1.1 -2.2,.8 -.2,-1.8 -2.3,-1.2 -1.5,-.2 -1,-1.1 -3,.3 -1.2,-.8 h -1.2 l -1.2,.9 -5.5,.7 -6.6,-4.2 1.1,-5.6 -.4,-4.1 -3.2,-3.7 -3.7,.1 -.4,-1.1 .4,-1.2 -.7,-.8 -1,.1 -1.1,1.3 -1.5,-.2 -.5,-1.1 -1,-.1 -.7,.6 -2,-1.9 v 4.3 l -1.3,1.3 -1.1,3.5 -.1,2.3 -4.5,12.3 -13.2,31.3 -3.2,4.6 -1.6,-.1 .1,2.1 -5.2,7.1 -.3,3.3 1,1.3 .1,2.4 -1.2,1.1 -1.2,3 .1,5.7 1.2,2.9 z',
    'PA': 'm 826.3,189.4 -1.9,.3 -3,-2.2 -3,-5.8 h -2 l -.4,-1.5 -1.7,-1.1 -70.5,13.9 -.8,-6 -4.2,3.4 -.9,.1 -2.7,3 -3.3,1.7 4.9,29.9 3.2,19.7 17.4,-2.9 60.5,-11.8 1.2,-2.1 1.5,-1.1 1.6,-.3 1.6,.6 1.4,-1.7 1.6,-.6 1.8,-3 1.6,-2.3 3.3,-2.6 -4.2,-3.2 -2.1,-1.1 -1,-2.8 -2.7,-.9 -.5,-3.6 1,-1 .7,-2 -1.5,-1.8 3,-5.4 -.1,-2.2 1.8,-2.5 z',
    'RI': 'm 883.2,170.7 -1.3,-1.1 -2.6,-1.3 -.6,-2.2 h -.8 l -.7,-2.6 -6.5,2 3.2,12.3 -.4,1.1 .4,1.8 5.6,-3.6 .1,-3 -.8,-.8 .4,-.6 -.1,-1.3 -.9,-.7 1.2,-.4 -.9,-1.6 1.8,.7 .3,1.4 .7,1.2 -1.4,-.8 1.1,1.7 -.3,1.2 -.6,-1.1 v 2.5 l .6,-.9 .4,.9 1.3,-1.5 -.2,-2.5 1.4,3.1 1,-.9 z m -4.7,12.2 h .9 l .5,-.6 -.8,-1.3 -.7,.7 z',
    'SC': 'm 772.3,350.2 -19.7,2.8 -.1,-2.6 -3.3,-3 -1.2,1.5 -.7,-.3 .2,-1.4 -.4,-.5 -23.2,2.2 -7.3,4.3 -1.3,.1 -4.4,1.9 -.1,1.9 -1.9,1 -1.4,3.2 .2,1.3 6.1,3.8 2.6,-.3 3.1,4 .4,1.7 4.2,5.1 2.6,1.7 1.4,.2 2.2,1.6 1.1,2.2 2,1.6 1.8,.5 2.7,2.7 .1,1.4 2.6,2.8 5,2.3 3.6,6.7 .3,2.7 3.9,2.1 2.5,4.8 .8,3.1 4.2,.4 .8,-1.5 h .6 l 1.8,-1.5 .5,-2 3.2,-2.1 .3,-2.4 -1.2,-.9 .8,-.7 .8,.4 1.3,-.4 1.8,-2.1 3.8,-1.8 1.6,-2.4 .1,-.7 4.8,-4.4 -.1,-.5 -.9,-.8 1.1,-1.5 h .8 l .4,.5 .7,-.8 h 1.3 l .6,-1.5 2.3,-2.1 -.3,-5.4 .8,-2.3 3.6,-6.2 2.4,-2.2 2.2,-1.1 z',
    'SD': 'm 396.5,125.9 46,2.1 29.5,.4 -.1,2.2 -.9,2 -3.1,1.9 -.3,1.2 1.7,2.5 .4,1.8 2.6,.6 1.5,1.9 -.2,39.5 -2.2,-.1 -.1,1.6 1.3,1.5 -.1,1.1 -1,.5 .4,1.6 1.3,.4 .7,2 -1.7,5.1 -1,4.3 1.3,1.2 .3,1.3 .7,1.7 -1.5,.2 -1.8,-.7 -.9,-2.6 -1.2,-1.3 -6.1,-2.2 -.6,-1.1 -2,-.6 -1.4,.6 -1,-.5 -.9,.4 -.7,-.4 -.9,.4 -.7,-.5 -1,.7 -1.5,-.6 -1.8,2 -1.8,.1 -2.1,-2 -1.7,-.2 -3.4,-3.2 -38,-1.6 -51.1,-3.5 3.9,-43.9 2,-20.7 z',
    'TN': 'm 620.9,365.1 45.7,-4 22.9,-2.9 .1,-4.9 1.4,-1.3 1.5,.1 1.3,-.9 .8,-4.1 4.6,-3 3.6,-.5 3.2,-2.6 .5,-1.2 4.7,-2.4 .6,-3.4 4,-3.3 .8,.2 .1,1.5 .8,.8 1.5,-1.2 .7,-2.1 3.5,-2.5 2.6,1.1 2.4,-5.2 1.4,-1.2 1.5,.1 0,-5.2 .3,-.7 -4.6,.5 -.2,1 -28.9,3.3 -5.6,1.4 -20.5,1.4 -5.2,.8 -17.4,1 -2.6,.8 -22.6,2 -.7,-.6 h -3.7 l 1.2,3.2 -.6,.9 -23.3,1.5 -.8,1 -.8,-.7 h -1 v 1.3 l .6,1 -.1,1 -1.4,.5 1.4,1.5 -.8,.7 -1.7,-.2 .6,1 1.2,1.1 v .7 l -1.2,.5 -1,2 .1,.6 1.4,1 -.4,.7 h -1.5 v .5 l .9,.9 .1,.8 -1.4,.2 -.5,.8 -1.6,.2 -.9,.9 .6,.9 1.1,-.1 .5,.9 -1.6,1.3 .4,1.5 -2,-.6 -.1,.7 .4,1.1 -.3,1.4 -1.3,-.8 -.8,.8 1.1,.1 .1,1.5 -.6,1 1.1,.9 -.3,1.5 .8,.7 -.7,1 -1.2,-.5 -.9,2.2 -1.6,.7 z',
    'TX': 'm 282.3,429 .3,-3 34.4,3.6 31.8,2.6 7.9,-99.3 .8,0 52.6,3.2 -1.4,42.7 2.7,1.3 2.5,3 1.5,.3 1.1,-1 1.2,.4 1.4,1 1.1,-1.5 2.3,1.7 .5,2.9 1.2,.7 2.3,-.1 3.5,1.9 2,-.1 1.4,-.4 2.3,2.2 2,-2.3 3.5,1.1 1.9,3 2.3,-.1 -.7,2.1 2.3,1.1 3,-2.6 2.6,1.7 1.3,-.5 .1,1.5 1.7,1.2 2.3,-2.5 1.2,.7 -.3,2 1,1.8 1.2,-.8 2.5,-4.2 1.8,2 2,.5 2.1,-.7 2,1.8 1.2,-.1 1.3,1.2 3.6,-.9 .6,-1.7 3.7,-.3 1.6,.7 5,-2.5 .6,1.5 5.1,-.3 .5,-1.6 2.2,.9 4.6,3.8 6.4,1.9 2.6,2.3 2.8,-1.3 3.2,.8 .2,11.9 .5,19.9 .7,3.4 2.6,2.8 .7,5.4 3.8,4.6 .8,4.3 h 1 l -.1,7.3 -3.3,6.4 1.3,2.3 -1.3,1.5 .7,3 -.1,4.3 -2.2,3.5 -.1,.8 -1.7,1.2 1,1.8 1.2,1.1 -3.5,.3 -8.4,3.9 -3.5,1.4 -1.8,1.8 -.7,-.5 2.1,-2.3 1.8,-.7 .5,-.9 -2.9,-.1 -.7,-.8 .8,-2 -.9,-1.8 h -.6 l -2.4,1.3 -1.9,2.6 .3,1.7 3.3,3.4 1.3,.3 v .8 l -2.3,1.6 -4.9,4 -4,3.9 -3.2,1.4 -5,3 -3.7,2 -4.5,1.9 -4.1,2.5 3.2,-3 v -1.1 l .6,-.8 -.2,-1.8 -1.5,-.1 -1.1,1.5 -2.6,1.3 -1.8,-1.2 -.3,-1.7 h -1.5 l .8,2.2 1.4,.7 1.2,.9 1.8,1.6 -.7,.8 -3.9,1.7 -1.7,.1 -1.2,-1.2 -.5,2.1 .5,1.1 -2.7,2 -1.5,.2 -.8,.7 -.4,1.7 -1.8,3.3 -1.6,.7 -1.6,-.6 -1.8,1.1 .3,1.4 1.3,.8 1,.8 -1.8,3.5 -.3,2.8 -1,1.7 -1.4,1 -2.9,.4 1.8,.6 1.9,-.6 -.4,3.2 -1.1,-.1 .2,1.2 .3,1.4 -1.3,.9 v 3.1 l 1.6,1.4 .6,3.1 -.4,2.2 -1,.4 .4,1.5 1.1,.4 .8,1.7 v 2.6 l 1.1,2.1 2.2,2.6 -.1,.7 -2.2,-.2 -1.6,1.4 .2,1.4 -.9,-.3 -1.4,-.2 -3.4,-3.7 -2.3,-.6 h -7.1 l -2.8,-.8 -3.6,-3 -1.7,-1 -2.1,.1 -3.2,-2.6 -5.4,-1.6 v -1.3 l -1.4,-1.8 -.9,-4.7 -1.1,-1.7 -1.7,-1.4 v -1.6 l -1.4,-.6 .6,-2.6 -.3,-2.2 -1.3,-1.4 .7,-3 -.8,-3.2 -1.7,-1.4 h -1.1 l -4,-3.5 .1,-1.9 -.8,-1.7 -.8,-.2 -.9,-2.4 -2,-1.6 -2.9,-2.5 -.2,-2.1 -1,-.7 .2,-1.6 .5,-.7 -1.4,-1.5 .1,-.7 -2,-2.2 .1,-2.1 -2.7,-4.9 -.1,-1.7 -1.8,-3.1 -5.1,-4.8 v -1.1 l -3.3,-1.7 -.1,-1.8 -1.2,-.4 v -.7 l -.8,-.2 -2.1,-2.8 h -.8 l -.7,-.6 -1.3,1.1 h -2.2 l -2.6,-1.1 h -4.6 l -4.2,-2.1 -1.3,1.9 -2.2,-.6 -3.3,1.2 -1.7,2.8 -2,3.2 -1.1,4.4 -1.4,1.2 -1.1,.1 -.9,1.6 -1.3,.6 -.1,1.8 -2.9,.1 -1.8,-1.5 h -1 l -2,-2.9 -3.6,-.5 -1.7,-2.3 -1.3,-.2 -2.1,-.8 -3.4,-3.4 .2,-.8 -1.6,-1.2 -1,-.1 -3.4,-3.1 -.1,-2 -2.3,-4 .2,-1.6 -.7,-1.3 .8,-1.5 -.1,-2.4 -2.6,-4.1 -.6,-4.2 -1.6,-1.6 v -1 l -1.2,-.2 -.7,-1.1 -2.4,-1.7 -.9,-.1 -1.9,-1.6 v -1.1 l -2.9,-1.8 -.6,-2.1 -2.6,-2.3 -3.2,-4.4 -3,-1.3 -2.1,-1.8 .2,-1.2 -1.3,-1.4 -1.7,-3.7 -2.4,-1 z m 174.9,138.3 .8,.1 -.6,-4.8 -3.5,-12.3 -.2,-8.1 4.9,-10.5 6.1,-8.2 7.2,-5.1 v -.7 h -.8 l -2.6,1 -3.6,2.3 -.7,1.5 -8.2,11.6 -2.8,7.9 v 8.8 l 3.6,12 z',
    'UT': 'm 233.2,217.9 3.3,-21.9 -47.9,-8.2 -21,109 46.2,8.2 40,6 11.5,-88.3 z',
    'VA': 'm 834.7,265.4 -1.1,2.8 .5,1.1 .4,-1.1 .8,-3.1 z m -34.6,-7 -.7,-1 1,-.1 1,-.9 .4,-1.8 -.2,-.5 .1,-.5 -.3,-.7 -.6,-.5 -.4,-.1 -.5,-.4 -.6,-.6 h -1 l -.6,-.1 -.4,-.4 .1,-.5 -1.7,-.6 -.8,.3 -1.2,-.1 -.7,-.7 -.5,-.2 -.2,-.7 .6,-.8 v -.9 l -1.2,-.2 -1,-.9 -.9,.1 -1.6,-.3 -.4,.7 -.4,1.6 -.5,2.3 -10,-5.2 -.2,.9 .9,1.6 -.8,2.3 .1,2.9 -1.2,.8 -.5,2.1 -.9,.8 -1.4,1.8 -.9,.8 -1,2.5 -2.4,-1.1 -2.3,8.5 -1.3,1.6 -2.8,-.5 -1.3,-1.9 -2.3,-.7 -.1,4.7 -1.4,1.7 .4,1.5 -2.1,2.2 .4,1.9 -3.7,6.3 -1,3.3 1.5,1.2 -1.5,1.9 .1,1.4 -2.3,2 -.7,-1.1 -4.3,3.1 -1.5,-1 -.6,1.4 .8,.5 -.5,.9 -5.5,2.4 -3,-1.8 -.8,1.7 -1.9,1.8 -2.3,.1 -4.4,-2.3 -.1,-1.5 -1.5,-.7 .8,-1.2 -.7,-.6 -4.9,6.6 -2.9,1 -3,3 -.4,2.2 -2.1,1.3 -.1,1.7 -1.4,1.4 -1.8,.5 -.5,1.9 -1,.4 -6.9,4.2 28.9,-3.3 .2,-1 4.6,-.5 -.3,.7 29.4,-3.5 39.4,-7.3 29.1,-6.1 -.6,-1.2 .4,-.1 .9,.9 -.1,-1.4 -.3,-1.9 1.6,1.2 .9,2.1 v -1.3 l -3.4,-5.5 v -1.2 l -.7,-.8 -1.3,.7 .5,1.4 h -.8 l -.4,-1 -.6,.9 -.9,-1.1 -2.1,-.1 -.2,.7 1.5,2.1 -1.4,-.7 -.5,-1 -.4,.8 -.8,.1 -1.5,1.7 .3,-1.6 v -1.4 l -1.5,-.7 -1.8,-.5 -.2,-1.7 -.6,-1.3 -.6,1.1 -1.7,-1 -2,.3 .2,-.9 1.5,-.2 .9,.5 1.7,-.8 .9,.4 .5,1 v .7 l 1.9,.4 .3,.9 .9,.4 .9,1.2 1.4,-1.6 h .6 l -.1,-2.1 -1.3,1 -.6,-.9 1.5,-.2 -1.2,-.9 -1.2,.6 -.1,-1.7 -1.7,.2 -2.2,-1.1 -1.8,-2.2 3.6,2.2 .9,.3 1.7,-.8 -1.7,-.9 .6,-.6 -1,-.5 .8,-.2 -.3,-.9 1.1,.9 .4,-.8 .4,1.3 1.2,.8 .6,-.5 -.5,-.6 -.1,-2.5 -1.1,-.1 -1.6,-.8 .9,-1.1 -2,-.1 -.4,-.5 -1.4,.6 -1.4,-.8 -.5,-1.2 -2.1,-1.2 -2.1,-1.8 -2.2,-1.9 3,1.3 .9,1.2 2.1,.7 2.3,2.5 .2,-1.7 .6,1.3 2.3,.5 v -4 l -.8,-1.1 1.1,.4 .1,-1.6 -3.1,-1.4 -1.6,-.2 -1.3,-.2 .3,-1.2 -1.5,-.3 -.1,-.6 h -1.8 l -.2,.8 -.7,-1 h -2.7 l -1,-.4 -.2,-1 -1.2,-.6 -.4,-1.5 -.6,-.4 -.7,1.1 -.9,.2 -.9,.7 h -1.5 l -.9,-1.3 .4,-3.1 .5,-2.4 .6,.5 z m 21.9,11.6 .9,-.1 0,-.6 -.8,.1 z m 7.5,14.2 -1,2.7 1.2,-1.3 z m -1.8,-15.3 .7,.3 -.2,1.9 -.5,-.5 -1.3,1 1,.4 -1.8,4.4 .1,8.1 1.9,3.1 .5,-1.5 .4,-2.7 -.3,-2.3 .7,-.9 -.2,-1.4 1.2,-.6 -.6,-.5 .5,-.7 .8,1.1 -.2,1.1 -.4,3.9 1.1,-2.2 .4,-3.1 .1,-3 -.3,-2 .6,-2.3 1.1,-1.8 .1,-2.2 .3,-.9 -4.6,1.6 -.7,.8 z',
    'VT': 'm 859.1,102.4 -1.1,3.5 2.1,2.8 -.4,1.7 .1,1.3 -1.1,2.1 -1.4,.4 -.6,1.3 -2.1,1 -.7,1.5 1.4,3.4 -.5,2.5 .5,1.5 -1,1.9 .4,1.9 -1.3,1.9 .2,2.2 -.7,1.1 .7,4.5 .7,1.5 -.5,2.6 .9,1.8 -.2,2.5 -.5,1.3 -.1,1.4 2.1,2.6 -12.4,2.7 -1.1,-1 .5,-2 -3,-14.2 -1.9,-1.5 -.9,1.6 -.9,-2.2 .8,-1.8 -3.1,-6.7 .3,-3.8 .4,-1 -.6,-2 .4,-2.2 -2.2,-2.3 -.5,-3.2 .4,-1.5 -1.4,-.9 .6,-1.9 -.8,-1.7 27.3,-6.9 z',
    'WA': 'm 161.9,83.6 .7,4 -1.1,4.3 -30.3,-7.3 -2.8,1 -5.4,-.9 -1.8,-.9 -1.5,1.2 -3.3,-.4 -4.5,.5 -.9,.7 -4.2,-.4 -.8,-1.6 -1.2,-.2 -4.4,1.3 -1.6,-1.1 -2.2,.8 -.2,-1.8 -2.3,-1.2 -1.5,-.2 -1,-1.1 -3,.3 -1.2,-.8 h -1.2 l -1.2,.9 -5.5,.7 -6.6,-4.2 1.1,-5.6 -.4,-4.1 -3.2,-3.7 -3.7,.1 -.4,-1.1 .4,-1.2 -.7,-.8 -1,.1 -2.1,-1.5 -1.2,.4 -2,-.1 -.7,-1.5 -1.6,-.3 2.5,-7.5 -.7,6 .5,.5 v -2 l .8,-.2 1.1,2.3 -.5,-2.2 1.2,-4.2 1.8,.4 -1.1,-2 -1,.3 -1.5,-.4 .2,-4.2 .2,1.5 .9,.5 .6,-1.6 h 3.2 l -2.2,-1.2 -1.7,-1.9 -1.4,1.6 1.2,-3.1 -.3,-4.6 -.2,-3.6 .9,-6.1 -.5,-2 -1.4,-2.1 .1,-4 .4,-2.7 2,-2.3 -.7,-1.4 .2,-.6 .9,.1 7.8,7.6 4.7,1.9 5.1,2.5 3.2,-.1 .2,3 1,-1.6 h .7 l .6,2.7 .5,-2.6 1.4,-.2 .5,.7 -1.1,.6 .1,1.6 .7,-1.5 h 1.1 l -.4,2.6 -1.1,-.8 .4,1.4 -.1,1.5 -.8,.7 -2.5,2.9 1.2,-3.4 -1.6,.4 -.4,2.1 -3.8,2.8 -.4,1 -2.1,2.2 -.1,1 h 2.2 l 2.4,-.2 .5,-.9 -3.9,.5 v -.6 l 2.6,-2.8 1.8,-.8 1.9,-.2 1,-1.6 3,-2.3 v -1.4 h 1.1 l .1,4 h -1.5 l -.6,.8 -1.1,-.9 .3,1.1 v 1.7 l -.7,.7 -.3,-1.6 -.8,.8 .7,.6 -.9,1.1 h 1.3 l .7,-.5 .1,2 -1,1.9 -.9,1 -.1,1.8 -1,-.2 -.2,-1.4 .9,-1.1 -.8,-.5 -.8,.7 -.7,2.2 -.8,.9 -.1,-2 .8,-1.1 -.2,-1.1 -1.2,1.2 .1,2.2 -.6,.4 -2.1,-.4 -1.3,1.2 2.2,-.6 -.2,2.2 1,-1.8 .4,1.4 .5,-1 .7,1.8 h .7 l .7,-.8 .6,-.1 2,-1.9 .2,-1.2 .8,.6 .3,.9 .7,-.3 .1,-1.2 h 1.3 l .2,-2.9 -.1,-2.7 .9,.3 -.7,-2.1 1.4,-.8 .2,-2.4 2.3,-2.2 1,.1 .3,-1.4 -1.2,-1.4 -.1,-3.5 -.8,.9 .7,2.9 -.6,.1 -.6,-1.9 -.6,-.5 .3,-2.3 1.8,-.1 .3,.7 .3,-1.6 -1.6,-1.7 -.6,-1.6 -.2,2 .9,1.1 -.7,.4 -1,-.8 -1.8,1.3 1.5,.5 .2,2.4 -.3,1.8 .9,-1.3 1.4,2.3 -.4,1.9 h -1.5 v -1.2 l -1.5,-1.2 .5,-3 -1.9,-2.6 2.7,-3 .6,-4.1 h .9 l 1.4,3.2 v -2.6 l 1.2,.3 v -3.3 l -.9,-.8 -1.2,2.5 -1,-3 1.3,-.1 -1.5,-4.9 1.9,-.6 25.4,7.5 31.7,8 23.6,5.5 z m -78.7,-39.4 h .5 l .1,.8 -.5,.3 .1,.6 -.7,.4 -.2,-.9 .5,-.4 z m 5,-4.3 -1.2,1.9 -.1,.8 .4,.2 .5,-.6 1.1,.1 z m -.4,-21.6 .5,.6 1.3,-.3 .2,-1 1.2,-1.8 -1,-.4 -.7,1.6 -.1,-1.6 -1.1,.2 -.7,1.4 z m 3.2,-5.5 .7,1.5 -.9,.2 -.8,.4 -.2,-2.4 z m -2.7,-1.6 -1.1,-.2 .5,1.4 z m -1,2.5 .8,.4 -.4,1.1 1.7,-.5 -.2,-2.2 -.9,-.2 z m -2.7,-.4 .3,2.7 1.6,1.3 .6,-1.9 -1.1,-2.2 z m 1.9,-1.1 -1.1,-1 -.9,.1 1.8,1.5 z m 3.2,-7 h -1.2 v .8 l 1.2,.6 z m -.9,32.5 .4,-2.7 h -1.1 l -.2,1.9 z',
    'WI': 'm 611,144 -2.9,.8 .2,2.3 -2.4,3.4 -.2,3.1 .6,.7 .8,-.7 .5,-1.6 2,-1.1 1.6,-4.2 3.5,-1.1 .8,-3.3 .7,-.9 .4,-2.1 1.8,-1.1 v -1.5 l 1,-.9 1.4,.1 v 2 l -1,.1 .5,1.2 -.7,2.2 -.6,.1 -1.2,4.5 -.7,.5 -2.8,7.2 -.3,4.2 .6,2 .1,1.3 -2.4,1.9 .3,1.9 -.9,3.1 .3,1.6 .4,3.7 -1.1,4.1 -1.5,5 1,1.5 -.3,.3 .8,1.7 -.5,1.1 1.1,.9 v 2.7 l 1.3,1.5 -.4,3 .3,4 -45.9,2.8 -1.3,-2.8 -3.3,-.7 -2.7,-1.5 -2,-5.5 .1,-2.5 1.6,-3.3 -.6,-1.1 -2.1,-1.6 -.2,-2.6 -1.1,-4.5 -.2,-3 -2.2,-3 -2.8,-.7 -5.2,-3.6 -.6,-3.3 -6.3,-3.1 -.2,-1.3 h -3.3 l -2.2,-2.6 -2,-1.3 .7,-5.1 -.9,-1.6 .5,-5.4 1,-1.8 -.3,-2.7 -1.2,-1.3 -1.8,-.3 v -1.7 l 2.8,-5.8 5.9,-3.9 -.4,-13 .9,.4 .6,-.5 .1,-1.1 .9,-.6 1.4,1.2 .7,-.1 h 2.6 l 6.8,-2.6 .3,-1 h 1.2 l .7,-1.2 .4,.8 1.8,-.9 1.8,-1.7 .3,.5 1,-1 2.2,1.6 -.8,1.6 -1.2,1.4 .5,1.5 -1.4,1.6 .4,.9 2.3,-1.1 v -1.4 l 3.3,1.9 1.9,.7 1.9,.7 3,3.8 17,3.8 1.4,1 4,.8 .7,.5 2.8,-.2 4.9,.8 1.4,1.5 -1,1 .8,.8 3.8,.7 1.2,1.2 .1,4.4 -1.3,2.8 2,.1 1,-.8 .9,.8 -1.1,3.1 1,1.6 1.2,.3 z m -49.5,-37.3 -.5,.1 -1.5,1.6 .2,.5 1.5,-.6 v -.6 l .9,-.3 z m 1.6,-1.1 -1,.3 -.2,.7 .9,-.1 z m -1.3,-1.6 -.2,.9 h 1.7 l .6,-.4 .1,-1 z m 2.8,-3 -.3,1.9 1.2,-.5 .1,-1.4 z m 58.3,31.9 -2,.3 -.4,1.3 1.3,1.7 z',
    'WV': 'm 723.4,297.5 -.8,1.2 1.5,.7 .1,1.5 4.4,2.3 2.3,-.1 1.9,-1.8 .8,-1.7 3,1.8 5.5,-2.4 .5,-.9 -.8,-.5 .6,-1.4 1.5,1 4.3,-3.1 .7,1.1 2.3,-2 -.1,-1.4 1.5,-1.9 -1.5,-1.2 1,-3.3 3.7,-6.3 -.4,-1.9 2.1,-2.2 -.4,-1.5 1.4,-1.7 .1,-4.7 2.3,.7 1.3,1.9 2.8,.5 1.3,-1.6 2.3,-8.5 2.4,1.1 1,-2.5 .9,-.8 1.4,-1.8 .9,-.8 .5,-2.1 1.2,-.8 -.1,-2.9 .8,-2.3 -.9,-1.6 .2,-.9 10,5.2 .5,-2.3 .4,-1.6 .4,-.7 -.9,-.4 .2,-1.6 -1,-.5 -.2,-.7 h -.7 l -.8,-1.2 .2,-1 -2.6,.4 -2.2,-1.6 -1.4,.3 -.9,1.4 h -1.3 l -1.7,2.9 -3.3,.4 -1.9,-1 -2.6,3.8 -2.2,-.3 -3.1,3.9 -.9,1.6 -1.8,1.6 -1.7,-11.4 -17.4,2.9 -3.2,-19.7 -2.2,1.2 1.4,2.1 -.1,2.2 .6,2 -1.1,3.4 -.1,5.4 -1,3.6 .5,1.1 -.4,2.2 -1.1,.5 -2,3.3 -1.8,2 h -.6 l -1.8,1.7 -1.3,-1.2 -1.5,1.8 -.3,1.2 h -1.3 l -1.3,2.2 .1,2.1 -1,.5 1.4,1.1 v 1.9 l -1,.2 -.7,.8 -1,.5 -.6,-2.1 -1.6,-.5 -1,2.3 -.3,2.2 -1.1,1.3 1.3,3.6 -1.5,.8 -.4,3.5 h -1.5 l -3.2,1.4 -.1,1.1 .6,1 -.6,3.6 1.9,1.6 .8,1.1 1,.6 -.1,.9 4.4,5.6 h 1.4 l 1.5,1.8 1.2,.3 1.4,-.1 z',
    'WY': 'm 355.3,143.7 -51,-5.3 -57.3,-7.9 -2,10.7 -8.5,54.8 -3.3,21.9 32.1,4.8 44.9,5.7 37.5,3.4 3.7,-44.2 z',
};

const STATE_NAMES = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
    'district of columbia': 'DC', 'dc': 'DC'
};

function initializeStateMapBlocks() {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;

    const preElements = previewContent.querySelectorAll('pre');
    preElements.forEach(pre => {
        const text = pre.textContent.trim();
        if (!text.match(/^\[states?\b/i)) return;

        const parsed = parseStateMapContent(text);
        const html = generateStateMapHTML(parsed);

        const container = document.createElement('div');
        container.innerHTML = html;
        pre.replaceWith(container.firstElementChild);
    });
}

function parseStateMapContent(text) {
    const lines = text.split('\n');
    let allMode = false;
    let legendMode = null; // null = auto, true = on, false = off
    const states = {};

    // Parse header line for legend option: [states legend:on] or [states legend:off]
    const header = lines[0].toLowerCase();
    const legendMatch = header.match(/legend\s*:\s*(on|off)/);
    if (legendMatch) {
        legendMode = legendMatch[1] === 'on';
    }

    for (let i = 1; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed === '') continue;

        if (trimmed.toLowerCase() === 'all') {
            allMode = true;
            continue;
        }

        // Still support legacy "legend on/off" on its own line
        if (trimmed.toLowerCase() === 'legend on') {
            legendMode = true;
            continue;
        }
        if (trimmed.toLowerCase() === 'legend off') {
            legendMode = false;
            continue;
        }

        const isExclude = trimmed.startsWith('-');
        const name = (isExclude ? trimmed.slice(1) : trimmed).trim().toLowerCase();
        const abbr = STATE_NAMES[name];
        if (!abbr) continue;

        if (isExclude) {
            states[abbr] = 'exclude';
        } else {
            states[abbr] = 'teal';
        }
    }

    return { allMode, legendMode, states };
}

// Reverse lookup: abbreviation -> full state name
const STATE_ABBR_TO_NAME = {};
for (const [name, abbr] of Object.entries(STATE_NAMES)) {
    if (name !== 'dc' && !STATE_ABBR_TO_NAME[abbr]) {
        STATE_ABBR_TO_NAME[abbr] = name.replace(/\b\w/g, c => c.toUpperCase());
    }
}

function generateStateMapHTML(parsed) {
    const { allMode, legendMode, states } = parsed;
    let paths = '';
    const tealStates = [];
    const excludedStates = [];
    const defaultStates = [];
    const totalStates = Object.keys(STATE_PATHS).length;

    for (const [abbr, d] of Object.entries(STATE_PATHS)) {
        let cssClass = 'state-map-default';
        if (states[abbr] === 'teal') {
            cssClass = 'state-map-teal';
            tealStates.push(abbr);
        } else if (states[abbr] === 'exclude') {
            cssClass = 'state-map-default';
            excludedStates.push(abbr);
        } else if (allMode) {
            cssClass = 'state-map-teal';
            tealStates.push(abbr);
        } else {
            defaultStates.push(abbr);
        }
        paths += `<path d="${d}" class="${cssClass}" />`;
    }

    // Build legend (only if legendMode is true)
    let legendHTML = '';
    if (legendMode === true) {
        const legendItems = [];
        const tealCount = tealStates.length;
        const nonTealCount = totalStates - tealCount;

        if (tealCount > 0 && nonTealCount > 0 && nonTealCount <= 8) {
            // Mostly teal — show excluded/default states with strikethrough
            for (const abbr of excludedStates) {
                const name = STATE_ABBR_TO_NAME[abbr] || abbr;
                legendItems.push(`<div class="state-map-legend-item state-map-legend-excluded">${name}</div>`);
            }
            for (const abbr of defaultStates) {
                const name = STATE_ABBR_TO_NAME[abbr] || abbr;
                legendItems.push(`<div class="state-map-legend-item state-map-legend-excluded">${name}</div>`);
            }
        } else if (tealCount > 0 && tealCount <= 15) {
            // Few teal states — list them
            for (const abbr of tealStates) {
                const name = STATE_ABBR_TO_NAME[abbr] || abbr;
                legendItems.push(`<div class="state-map-legend-item">${name}</div>`);
            }
            // Show excluded with strikethrough
            for (const abbr of excludedStates) {
                const name = STATE_ABBR_TO_NAME[abbr] || abbr;
                legendItems.push(`<div class="state-map-legend-item state-map-legend-excluded">${name}</div>`);
            }
        } else {
            // Just show excluded states with strikethrough
            for (const abbr of excludedStates) {
                const name = STATE_ABBR_TO_NAME[abbr] || abbr;
                legendItems.push(`<div class="state-map-legend-item state-map-legend-excluded">${name}</div>`);
            }
        }

        if (legendItems.length > 0) {
            legendHTML = `<div class="state-map-legend">${legendItems.join('')}</div>`;
        }
    }

    return `<div class="state-map-container"><svg viewBox="0 0 959 593" xmlns="http://www.w3.org/2000/svg">${paths}</svg>${legendHTML}</div>`;
}

// ============================================
// Quote Block
// ============================================

function initializeQuoteBlocks() {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;

    const preElements = previewContent.querySelectorAll('pre');
    preElements.forEach(pre => {
        const text = pre.textContent.trim();
        if (!text.match(/^\[quote\]/i)) return;

        const parsed = parseQuoteContent(text);
        const html = generateQuoteHTML(parsed.imgUrl, parsed.name, parsed.quoteText);

        const container = document.createElement('div');
        container.innerHTML = html;
        pre.replaceWith(container.firstElementChild);
    });

}

function parseQuoteContent(text) {
    const lines = text.split('\n');
    let imgUrl = '';
    let name = '';
    const quoteLines = [];

    for (let i = 1; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed === '') continue;

        if (trimmed.toLowerCase().startsWith('img:')) {
            imgUrl = trimmed.substring(4).trim();
        } else if (trimmed.startsWith('@')) {
            name = trimmed.substring(1).trim();
        } else {
            // Strip surrounding quotes if present
            const unquoted = trimmed.replace(/^[""\u201C]|[""\u201D]$/g, '');
            quoteLines.push(unquoted);
        }
    }

    return { imgUrl, name, quoteText: quoteLines.join(' ') };
}

function generateQuoteHTML(imgUrl, name, quoteText) {
    let html = '<div class="quote-block">';

    if (imgUrl) {
        html += `<div class="quote-block-photo"><img src="${imgUrl}" alt="${name || 'Quote author'}"></div>`;
    }

    if (name) {
        html += `<div class="quote-block-name">${name}</div>`;
    }

    if (quoteText) {
        html += `<div class="quote-block-text">\u201C${quoteText}\u201D</div>`;
    }

    html += '</div>';
    return html;
}

function initializeSplashBlocks() {
    const previewContent = document.getElementById('previewContent');
    if (!previewContent) return;

    const colorMap = {
        teal: '#01413e',
        green: '#447247',
        red: '#cc451c',
        purple: '#7a306c'
    };

    const preElements = previewContent.querySelectorAll('pre');
    preElements.forEach(pre => {
        const text = pre.textContent.trim();
        if (!text.match(/^\[splash\b/i)) return;

        const lines = text.split('\n');
        const headerMatch = lines[0].match(/^\[splash\s+(\w+)\]/i);
        if (!headerMatch) return;

        const colorName = headerMatch[1].toLowerCase();
        const bgColor = colorMap[colorName] || colorMap.teal;
        const emoji = lines[1] ? lines[1].trim() : '';
        const heading = lines.slice(2).map(l => l.trim()).filter(l => l).join(' ');

        const div = document.createElement('div');
        div.className = `splash-block splash-${colorName}`;
        div.style.backgroundColor = bgColor;
        div.innerHTML = `<div class="splash-emoji">${emoji}</div><div class="splash-text">${heading}</div>`;
        pre.replaceWith(div);
    });
}

function restoreQuotePhotoPositions() {
    const stored = localStorage.getItem('markup-quote-img-positions');
    if (!stored) return;
    try {
        const positions = JSON.parse(stored);
        const photos = document.querySelectorAll('.quote-block-photo img');
        photos.forEach(img => {
            const pos = positions[img.src];
            if (pos) {
                img.style.setProperty('object-position', pos, 'important');
                const parts = pos.split(/\s+/);
                img.dataset.posX = parseFloat(parts[0]) || 50;
                img.dataset.posY = parseFloat(parts[1]) || 50;
            }
        });
    } catch (e) {
        // Ignore corrupt data
    }
}

function saveQuotePhotoPosition(src, objectPosition) {
    let positions = {};
    try {
        const stored = localStorage.getItem('markup-quote-img-positions');
        if (stored) positions = JSON.parse(stored);
    } catch (e) {
        // Start fresh
    }
    positions[src] = objectPosition;
    localStorage.setItem('markup-quote-img-positions', JSON.stringify(positions));
}

function initializeQuotePhotoDrag() {
    const photos = document.querySelectorAll('.quote-block-photo');
    photos.forEach(container => {
        const img = container.querySelector('img');
        if (!img) return;

        // Initialize position tracking from current inline style or default
        if (!img.dataset.posX) img.dataset.posX = '50';
        if (!img.dataset.posY) img.dataset.posY = '50';

        // Prevent native image drag-and-drop which steals mousemove events
        img.draggable = false;
        img.addEventListener('dragstart', e => e.preventDefault());

        container.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX;
            const startY = e.clientY;
            const currentXPct = parseFloat(img.dataset.posX);
            const currentYPct = parseFloat(img.dataset.posY);

            container.classList.add('dragging');

            function onMouseMove(ev) {
                const deltaX = ev.clientX - startX;
                const deltaY = ev.clientY - startY;

                // Each pixel of mouse movement = ~1.5% shift in crop position
                let newX = currentXPct - (deltaX * 1.5);
                let newY = currentYPct - (deltaY * 1.5);

                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                img.dataset.posX = newX.toFixed(1);
                img.dataset.posY = newY.toFixed(1);
                img.style.setProperty('object-position', newX.toFixed(1) + '% ' + newY.toFixed(1) + '%', 'important');
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                container.classList.remove('dragging');
                saveQuotePhotoPosition(img.src, img.dataset.posX + '% ' + img.dataset.posY + '%');
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    });
}

// ============================================
// Table System
// ============================================

function initializeTables() {
    // Only target Notion's simple-table, skip properties tables
    const tables = previewContent.querySelectorAll('table.simple-table');
    tables.forEach(table => {
        // Detect if table has a header column (Notion marks with simple-table-header-color on td)
        const hasHeaderCol = !!table.querySelector('tbody .simple-table-header-color');
        if (hasHeaderCol) table.classList.add('has-header-col');

        // Wrap table in scroll wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'table-scroll-wrapper';
        const inner = document.createElement('div');
        inner.className = 'table-scroll-inner';
        const fade = document.createElement('div');
        fade.className = 'table-scroll-fade';

        table.parentNode.insertBefore(wrapper, table);
        inner.appendChild(table);
        wrapper.appendChild(inner);
        wrapper.appendChild(fade);

        // Scroll fade indicator
        let wasScrollable = false;
        const checkFade = () => {
            const scrollable = inner.scrollWidth > inner.clientWidth;
            const atEnd = inner.scrollLeft + inner.clientWidth >= inner.scrollWidth - 2;
            if (scrollable) wasScrollable = true;
            // Once we know the table is scrollable, keep the fade unless user scrolled to end
            fade.classList.toggle('visible', wasScrollable && !atEnd);
        };
        checkFade();
        inner.addEventListener('scroll', checkFade);
        new ResizeObserver(checkFade).observe(inner);

        // Column highlighting on header hover
        const ths = table.querySelectorAll('thead th');
        ths.forEach((th, colIdx) => {
            // Skip first column if it's a header column (top-left cell)
            if (hasHeaderCol && colIdx === 0) return;
            th.addEventListener('mouseenter', () => {
                table.querySelectorAll('tbody tr').forEach(row => {
                    const cell = row.children[colIdx];
                    if (cell) cell.classList.add('col-highlight');
                });
            });
            th.addEventListener('mouseleave', () => {
                table.querySelectorAll('.col-highlight').forEach(c => c.classList.remove('col-highlight'));
            });
        });

        // Row highlighting on header-column hover (only if header column exists)
        if (hasHeaderCol) {
            table.querySelectorAll('tbody tr').forEach(row => {
                const headerCell = row.querySelector('.simple-table-header-color');
                if (!headerCell) return;
                headerCell.addEventListener('mouseenter', () => row.classList.add('row-highlight'));
                headerCell.addEventListener('mouseleave', () => row.classList.remove('row-highlight'));
            });
        }

        // Column resizing with localStorage persistence
        const storageKey = 'markup-table-col-widths-' + (table.querySelector('thead th')?.textContent || '').trim();
        const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const resizedCols = new Set(Object.keys(saved).map(Number));

        function saveWidths() {
            const widths = {};
            resizedCols.forEach(i => { widths[i] = ths[i].offsetWidth; });
            localStorage.setItem(storageKey, JSON.stringify(widths));
        }

        ths.forEach((th, i) => {
            const handle = document.createElement('div');
            handle.className = 'col-resize-handle';
            th.appendChild(handle);

            let startX, startW;

            handle.addEventListener('dblclick', e => {
                e.preventDefault();
                e.stopPropagation();
                const cells = [th, ...table.querySelectorAll(`tbody tr :nth-child(${i + 1})`)];
                let maxW = 0;
                cells.forEach(cell => {
                    cell.style.width = 'auto';
                    cell.style.whiteSpace = 'nowrap';
                    cell.style.overflow = 'visible';
                });
                table.style.tableLayout = 'auto';
                cells.forEach(cell => {
                    maxW = Math.max(maxW, cell.scrollWidth);
                });
                table.style.tableLayout = 'fixed';
                cells.forEach(cell => {
                    cell.style.width = '';
                    cell.style.whiteSpace = '';
                    cell.style.overflow = '';
                });
                th.style.width = (maxW + 20) + 'px';
                resizedCols.add(i);
                saveWidths();
            });

            handle.addEventListener('mousedown', e => {
                e.preventDefault();
                e.stopPropagation();
                startX = e.pageX;
                startW = th.offsetWidth;
                handle.classList.add('active');

                if (table.style.tableLayout !== 'fixed') {
                    ths.forEach((t, idx) => {
                        const w = saved[idx] || t.offsetWidth;
                        t.style.width = w + 'px';
                    });
                    table.style.tableLayout = 'fixed';
                }

                const onMove = e => {
                    const diff = e.pageX - startX;
                    const newW = Math.max(60, startW + diff);
                    th.style.width = newW + 'px';
                };

                const onUp = () => {
                    handle.classList.remove('active');
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                    resizedCols.add(i);
                    saveWidths();
                };

                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        });
    });
}

// ============================================
// Slide System
// ============================================

function initializeSlides() {
    // Split content by <hr> elements
    const content = previewContent.innerHTML;
    
    // Split the HTML by HR tags
    const hrRegex = /<hr[^>]*>/gi;
    const contentParts = content.split(hrRegex);
    
    console.log('Content parts after split:', contentParts.length);
    
    slides = [];
    
    contentParts.forEach((part, index) => {
        // Skip empty parts
        const trimmedPart = part.trim();
        if (trimmedPart.length > 0) {
            // Create a temporary div to parse this part
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = trimmedPart;
            
            // Only add if there's actual content (not just whitespace)
            if (tempDiv.textContent.trim().length > 0 || tempDiv.querySelector('img')) {
                slides.push(tempDiv.childNodes);
                console.log(`Part ${index} has content:`, tempDiv.textContent.substring(0, 50));
            }
        }
    });
    
    // If no slides were created, treat all content as one slide
    if (slides.length === 0) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        slides.push(tempDiv.childNodes);
    }
    
    totalSlides = slides.length;
    
    console.log('Total slides created:', totalSlides);
    
    // Clear preview content and create slide containers
    previewContent.innerHTML = '';
    
    slides.forEach((slideNodes, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        slideDiv.dataset.slideIndex = index;
        
        console.log(`Slide ${index} has ${slideNodes.length} nodes`);
        
        // Add all nodes to this slide
        slideNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
                const clonedNode = node.cloneNode(true);
                slideDiv.appendChild(clonedNode);
            }
        });
        
        previewContent.appendChild(slideDiv);
    });
    
    // Show first slide
    showSlide(0);
    
    // Add slide indicator
    createSlideIndicator();
    
    // Update slide alignment
    updateSlideAlignment();
    
    // Create slide segments in progress bar
    createSlideSegments();
    
    // Update progress
    updateScrollProgress();

    // Create click navigation zones on edges
    createNavZones();
}

// ============================================
// Slide Navigation Zones (cursor arrow click areas)
// ============================================

let navCursor = null;

function createNavCursor() {
    if (navCursor) return;
    navCursor = document.createElement('div');
    navCursor.id = 'navCursor';
    navCursor.style.position = 'fixed';
    navCursor.style.pointerEvents = 'none';
    navCursor.style.zIndex = '10000';
    navCursor.style.display = 'none';
    navCursor.style.width = '36px';
    navCursor.style.height = '36px';
    navCursor.style.borderRadius = '50%';
    navCursor.style.background = 'rgba(1, 65, 62, 0.12)';
    navCursor.style.opacity = '0';
    navCursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
    navCursor.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    document.body.appendChild(navCursor);
}

function showNavCursor(direction, e) {
    if (!navCursor) createNavCursor();
    document.body.classList.add('nav-zone-active');
    if (e) {
        navCursor.style.left = e.clientX + 'px';
        navCursor.style.top = e.clientY + 'px';
    }
    const chevron = direction === 'left'
        ? '<path d="M20 7L12 18L20 29" fill="none" stroke="#01413e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="M16 7L24 18L16 29" fill="none" stroke="#01413e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    navCursor.innerHTML = `<svg width="36" height="36" viewBox="0 0 36 36">${chevron}</svg>`;
    navCursor.style.display = 'block';
    requestAnimationFrame(() => {
        navCursor.style.opacity = '1';
        navCursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
}

function hideNavCursor() {
    if (!navCursor) return;
    document.body.classList.remove('nav-zone-active');
    navCursor.style.opacity = '0';
    navCursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
    setTimeout(() => {
        if (navCursor && navCursor.style.opacity === '0') {
            navCursor.style.display = 'none';
        }
    }, 150);
}

function moveNavCursor(e) {
    if (navCursor && navCursor.style.display !== 'none') {
        navCursor.style.left = e.clientX + 'px';
        navCursor.style.top = e.clientY + 'px';
    }
}

function createNavZones() {
    // Remove existing zones if any
    presentationContainer.querySelectorAll('.nav-zone').forEach(el => el.remove());
    createNavCursor();

    const leftZone = document.createElement('div');
    leftZone.className = 'nav-zone nav-zone-left';
    leftZone.style.cursor = 'none';
    leftZone.addEventListener('mouseenter', (e) => showNavCursor('left', e));
    leftZone.addEventListener('mouseleave', hideNavCursor);
    leftZone.addEventListener('mousemove', moveNavCursor);
    leftZone.addEventListener('click', (e) => {
        spawnNavPop(e.clientX, e.clientY);
        previousSlide();
    });

    const rightZone = document.createElement('div');
    rightZone.className = 'nav-zone nav-zone-right';
    rightZone.style.cursor = 'none';
    rightZone.addEventListener('mouseenter', (e) => showNavCursor('right', e));
    rightZone.addEventListener('mouseleave', hideNavCursor);
    rightZone.addEventListener('mousemove', moveNavCursor);
    rightZone.addEventListener('click', (e) => {
        spawnNavPop(e.clientX, e.clientY);
        nextSlide();
    });

    presentationContainer.appendChild(leftZone);
    presentationContainer.appendChild(rightZone);
    updateNavZoneVisibility();
}

function updateNavZoneVisibility() {
    const left = presentationContainer.querySelector('.nav-zone-left');
    const right = presentationContainer.querySelector('.nav-zone-right');
    if (left) left.style.display = currentSlideIndex <= 0 ? 'none' : '';
    if (right) right.style.display = currentSlideIndex >= totalSlides - 1 ? 'none' : '';
}

function spawnNavPop(x, y) {
    const pop = document.createElement('div');
    pop.className = 'nav-pop';
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    document.body.appendChild(pop);
    pop.addEventListener('animationend', () => pop.remove());
}

function showSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    // Save current slide's drawings
    if (typeof saveCurrentSlideDrawings === 'function') {
        saveCurrentSlideDrawings();
    }
    
    // Get all slides
    const allSlides = previewContent.querySelectorAll('.slide');
    const currentSlide = allSlides[currentSlideIndex];
    const nextSlide = allSlides[index];
    
    // Add slide-out animation to current slide
    if (currentSlide && currentSlideIndex !== index) {
        currentSlide.classList.add('slide-out');
        
        // Hide drawings during transition
        if (drawingSVG) {
            drawingSVG.style.opacity = '0';
            drawingSVG.style.display = 'none';
        }
        if (whiteoutSVG) {
            whiteoutSVG.style.opacity = '0';
            whiteoutSVG.style.display = 'none';
        }
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            allSlides.forEach(slide => {
                slide.style.display = 'none';
                slide.classList.remove('active', 'slide-out');
            });
            
            // Show and animate in the new slide
            currentSlideIndex = index;
            nextSlide.style.display = 'block';
            nextSlide.classList.add('active');
            
            // Update UI
            updateSlideIndicator();
            updateSlideAlignment();
            
            // Restore drawings for this slide
            if (typeof restoreSlideDrawings === 'function') {
                restoreSlideDrawings(index);
            }
            
            // Show and fade in drawings after slide animation completes (balanced delay)
            setTimeout(() => {
                // Show drawing SVG if it has paths OR if a drawing tool is active
                if (drawingSVG && (drawingSVG.querySelector('path') || (typeof currentTool !== 'undefined' && (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser')))) {
                    drawingSVG.style.display = 'block';
                    drawingSVG.style.opacity = '0';
                    setTimeout(() => { drawingSVG.style.opacity = '1'; }, 10);
                }
                // Show whiteout SVG if it has paths OR if whiteout tool is active
                if (whiteoutSVG && (whiteoutSVG.querySelector('path') || (typeof currentTool !== 'undefined' && (currentTool === 'whiteout' || currentTool === 'eraser')))) {
                    whiteoutSVG.style.display = 'block';
                    whiteoutSVG.style.opacity = '0';
                    setTimeout(() => { whiteoutSVG.style.opacity = '1'; }, 10);
                }
            }, 120);
            
            // Reset scroll position
            const shareArea = document.querySelector('.share-area');
            if (shareArea) shareArea.scrollTop = 0;
            
            // Update progress bar
            updateScrollProgress();
            updateNavZoneVisibility();
        }, 100);
    } else {
        // First load, no animation
        allSlides.forEach(slide => {
            slide.style.display = 'none';
            slide.classList.remove('active', 'slide-out');
        });

        currentSlideIndex = index;
        nextSlide.style.display = 'block';
        nextSlide.classList.add('active');

        updateSlideIndicator();
        updateSlideAlignment();

        if (typeof restoreSlideDrawings === 'function') {
            restoreSlideDrawings(index);
        }

        const shareArea = document.querySelector('.share-area');
        if (shareArea) shareArea.scrollTop = 0;
        updateScrollProgress();
        updateNavZoneVisibility();
    }
}

function updateSlideAlignment() {
    const currentSlide = previewContent.querySelector(`.slide[data-slide-index="${currentSlideIndex}"]`);
    if (!currentSlide) return;
    
    // Always top align for now
    currentSlide.style.display = 'block';
    currentSlide.style.justifyContent = '';
    currentSlide.style.minHeight = '';
}

function createSlideIndicator() {
    updateSlideIndicator();
}

function updateSlideIndicator() {
    const indicator = document.getElementById('slideIndicator');
    if (indicator) {
        indicator.textContent = `${currentSlideIndex + 1}/${totalSlides}`;
    }
    updateNextSlidePreview();
}

function updateNextSlidePreview() {
    const preview = document.getElementById('bottomBarNext');
    const titleElement = document.getElementById('nextSlideTitle');

    if (!preview || !titleElement) return;

    // Check if there's a next slide
    if (currentSlideIndex < totalSlides - 1) {
        // Get next slide element
        const allSlides = previewContent.querySelectorAll('.slide');
        const nextSlide = allSlides[currentSlideIndex + 1];

        if (nextSlide) {
            // Find first heading in next slide
            const heading = nextSlide.querySelector('h1, h2, h3, h4, h5, h6');

            if (heading) {
                titleElement.textContent = heading.textContent.trim();
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        } else {
            preview.style.display = 'none';
        }
    } else {
        // No next slide (we're on the last slide)
        titleElement.textContent = 'End';
        preview.style.display = 'block';
    }
}

function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
        showSlide(currentSlideIndex + 1);
    }
}

function previousSlide() {
    if (currentSlideIndex > 0) {
        showSlide(currentSlideIndex - 1);
    }
}

// Keyboard navigation for slides
document.addEventListener('keydown', (e) => {
    // Only navigate if not in a text input and presentation is visible
    if (presentationContainer.style.display === 'none') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    
    if (e.key === 'ArrowRight' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        previousSlide();
    } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        if (isTimerRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        toggleQuestionsOverlay();
    }
});

// ============================================
// Auto-load from query param (?load=filename.zip)
// ============================================

(async function autoLoadFromQueryParam() {
    const params = new URLSearchParams(window.location.search);
    const loadFile = params.get('load');
    if (!loadFile) return;

    // Clean URL so refresh doesn't re-trigger
    history.replaceState(null, '', window.location.pathname);

    hideError();
    showTransition();
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        const response = await fetch(loadFile + '?t=' + Date.now());
        if (!response.ok) {
            throw new Error('Could not load file: ' + loadFile);
        }
        const blob = await response.blob();
        const file = new File([blob], loadFile, { type: 'application/zip' });
        await handleFile(file);
        hideTransition();
    } catch (error) {
        console.error('Error auto-loading:', error);
        showError('Error auto-loading: ' + error.message);
        showLoading(false);
        hideTransition();
    }
})();

// ============================================