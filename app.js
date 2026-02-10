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
            updateLaserPointerColor();
        }
    }
});

// Hide laser pointer when V key is released
document.addEventListener('keyup', (e) => {
    if (e.key === 's' || e.key === 'S') {
        laserActive = false;
        document.body.classList.remove('laser-active');
        laserPointer.style.display = 'none';
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
    
    // Initialize pixelate effect for strikethrough text
    initializePixelateEffect();

    // Initialize image scroll effects
    initializeImageScrollEffects();
    
    // Convert content to slides
    initializeSlides();
    
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
    
    // Disable all links on images
    const imageLinks = previewContent.querySelectorAll('a');
    imageLinks.forEach(link => {
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
    }
});

// ============================================