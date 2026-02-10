// ============================================
// Settings System for Drawdecks
// ============================================

const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const settingsModalClose = document.getElementById('settingsModalClose');
const settingsSave = document.getElementById('settingsSave');
const settingsCancel = document.getElementById('settingsCancel');
const settingsModalBody = document.getElementById('settingsModalBody');

// Settings structure - add your settings here
const settingsConfig = {
    'laserPointerSize': {
        type: 'range',
        label: 'Laser Pointer Size',
        description: 'Adjust the size of your laser pointer',
        defaultValue: 40,
        min: 10,
        max: 60,
        step: 2,
        showPreview: true
    },
    'penColor': {
        type: 'color',
        label: 'Pen Color',
        defaultValue: '#0085ff',
        description: 'Color for the pen tool (press D to draw)'
    },
    'penThickness': {
        type: 'range',
        label: 'Pen Thickness',
        defaultValue: 10,
        min: 1,
        max: 20,
        step: 1
    },
    'highlighterColor': {
        type: 'color',
        label: 'Highlighter Color',
        defaultValue: '#f1b03d',
        description: 'Color for the highlighter tool (press F to draw)'
    },
    'highlighterThickness': {
        type: 'range',
        label: 'Highlighter Thickness',
        defaultValue: 40,
        min: 5,
        max: 50,
        step: 5
    },
    'whiteoutThickness': {
        type: 'range',
        label: 'Whiteout Thickness',
        defaultValue: 40,
        min: 5,
        max: 50,
        step: 5,
        description: 'Thickness for the whiteout tool (press W to cover text)'
    },
    // Typography Settings (11 new settings)
    'fontFamily': {
        type: 'select',
        label: 'Font Family',
        description: 'Font for all text elements',
        defaultValue: 'Poppins',
        options: [
            { value: 'Poppins', label: 'Poppins (Default)' },
            { value: 'Inter', label: 'Inter' },
            { value: 'Roboto', label: 'Roboto' },
            { value: 'Open Sans', label: 'Open Sans' },
            { value: 'Lato', label: 'Lato' },
            { value: 'Montserrat', label: 'Montserrat' },
            { value: 'Georgia', label: 'Georgia (Serif)' },
            { value: 'system-ui', label: 'System Default' }
        ]
    },
    'h1Size': {
        type: 'number',
        label: 'H1 Heading Size',
        description: 'Main title size (px)',
        defaultValue: 32,
        min: 24,
        max: 72,
        step: 1
    },
    'h2Size': {
        type: 'number',
        label: 'H2 Heading Size',
        description: 'Section heading size (px)',
        defaultValue: 64,
        min: 20,
        max: 72,
        step: 1
    },
    'h3Size': {
        type: 'number',
        label: 'H3 Heading Size',
        description: 'Sub-section heading size (px)',
        defaultValue: 50,
        min: 18,
        max: 72,
        step: 1
    },
    'h4h6Size': {
        type: 'number',
        label: 'H4-H6 Heading Size',
        description: 'Minor heading size (px)',
        defaultValue: 20,
        min: 16,
        max: 32,
        step: 1
    },
    'bodySize': {
        type: 'number',
        label: 'Body Text Size',
        description: 'Paragraph and list text size (px)',
        defaultValue: 46,
        min: 12,
        max: 72,
        step: 1
    },
    'headingLineHeight': {
        type: 'number',
        label: 'Heading Line Height',
        description: 'Space between lines in headings',
        defaultValue: 1.0,
        min: 1.0,
        max: 2.0,
        step: 0.1
    },
    'bodyLineHeight': {
        type: 'number',
        label: 'Body Line Height',
        description: 'Space between lines in body text',
        defaultValue: 1.2,
        min: 1.2,
        max: 2.5,
        step: 0.1
    },
    'letterSpacing': {
        type: 'number',
        label: 'Body Letter Spacing',
        description: 'Space between characters in body text (px)',
        defaultValue: -1,
        min: -2,
        max: 4,
        step: 0.5
    },
    'headingLetterSpacing': {
        type: 'number',
        label: 'Heading Letter Spacing',
        description: 'Space between characters in headings (px)',
        defaultValue: -2,
        min: -2,
        max: 4,
        step: 0.5
    },
    'headingSpacing': {
        type: 'number',
        label: 'Heading Spacing',
        description: 'Top and bottom margins for headings (px)',
        defaultValue: 16,
        min: 8,
        max: 48,
        step: 1
    },
    'paragraphSpacing': {
        type: 'number',
        label: 'Paragraph Spacing',
        description: 'Bottom margin for paragraphs (px)',
        defaultValue: 12,
        min: 4,
        max: 32,
        step: 1
    }
};

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('markupSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);

            // Migration: Update old whiteout thickness default (15) to new default (40)
            if (settings.whiteoutThickness === 15) {
                settings.whiteoutThickness = 40;
                saveSettings(settings);
            }

            return settings;
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
    return {};
}

// Save settings to localStorage
function saveSettings(settings) {
    localStorage.setItem('markupSettings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
}

// Get a specific setting value
function getSetting(key, defaultValue = null) {
    const settings = loadSettings();
    return settings.hasOwnProperty(key) ? settings[key] : 
           (settingsConfig[key] ? settingsConfig[key].defaultValue : defaultValue);
}

// Set a specific setting value
function setSetting(key, value) {
    const settings = loadSettings();
    settings[key] = value;
    saveSettings(settings);
}

// Render settings in the modal
function renderSettings() {
    if (!settingsModalBody) return;

    settingsModalBody.innerHTML = '';

    if (Object.keys(settingsConfig).length === 0) {
        settingsModalBody.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 40px 20px;">No settings configured yet.</p>';
        return;
    }

    const currentSettings = loadSettings();

    // Define sections for grouping
    const sections = {
        'Drawing Tools': ['laserPointerSize', 'penColor', 'penThickness', 'highlighterColor', 'highlighterThickness', 'whiteoutThickness'],
        'Typography': ['fontFamily', 'h1Size', 'h2Size', 'h3Size', 'h4h6Size', 'bodySize'],
        'Text Spacing': ['headingLineHeight', 'bodyLineHeight', 'letterSpacing', 'headingLetterSpacing', 'headingSpacing', 'paragraphSpacing']
    };

    // Render each section with header
    Object.entries(sections).forEach(([sectionTitle, sectionKeys]) => {
        const availableKeys = sectionKeys.filter(key => settingsConfig[key]);

        if (availableKeys.length > 0) {
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'settings-section-header';
            sectionHeader.innerHTML = `<h3>${sectionTitle}</h3>`;
            settingsModalBody.appendChild(sectionHeader);

            availableKeys.forEach(key => {
                const config = settingsConfig[key];
                renderSettingItem(key, config, currentSettings);
            });
        }
    });
}

// Helper function to render a single setting item
function renderSettingItem(key, config, currentSettings) {
    const settingItem = document.createElement('div');
    settingItem.className = 'setting-item';
        
        const label = document.createElement('label');
        label.className = 'setting-label';
        label.textContent = config.label;
        label.htmlFor = `setting-${key}`;
        settingItem.appendChild(label);
        
        if (config.description) {
            const description = document.createElement('div');
            description.className = 'setting-description';
            description.textContent = config.description;
            settingItem.appendChild(description);
        }
        
        const controlWrapper = document.createElement('div');
        controlWrapper.className = 'setting-control';
        
        let input;
        const currentValue = currentSettings[key] !== undefined ? currentSettings[key] : config.defaultValue;
        
        switch (config.type) {
            case 'text':
                input = document.createElement('input');
                input.type = 'text';
                input.id = `setting-${key}`;
                input.value = currentValue || '';
                input.dataset.settingKey = key;
                controlWrapper.appendChild(input);
                break;
                
            case 'color':
                const colorWrapper = document.createElement('div');
                colorWrapper.style.display = 'flex';
                colorWrapper.style.gap = '12px';
                colorWrapper.style.alignItems = 'center';
                
                input = document.createElement('input');
                input.type = 'color';
                input.id = `setting-${key}`;
                input.value = currentValue || config.defaultValue || '#000000';
                input.dataset.settingKey = key;
                input.style.width = '60px';
                input.style.height = '60px';
                input.style.cursor = 'pointer';
                input.style.border = 'none';
                input.style.borderRadius = '8px';
                input.style.padding = '0';
                
                const colorText = document.createElement('span');
                colorText.style.fontFamily = 'monospace';
                colorText.style.fontSize = '0.95rem';
                colorText.style.color = 'var(--text-dark)';
                colorText.style.fontWeight = '500';
                colorText.textContent = input.value.toUpperCase();
                
                input.addEventListener('input', (e) => {
                    colorText.textContent = e.target.value.toUpperCase();
                });
                
                colorWrapper.appendChild(input);
                colorWrapper.appendChild(colorText);
                controlWrapper.appendChild(colorWrapper);
                break;
                
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.id = `setting-${key}`;
                input.value = currentValue !== undefined ? currentValue : (config.defaultValue || 0);
                input.dataset.settingKey = key;
                if (config.min !== undefined) input.min = config.min;
                if (config.max !== undefined) input.max = config.max;
                if (config.step !== undefined) input.step = config.step;
                controlWrapper.appendChild(input);
                break;
                
            case 'range':
                const rangeWrapper = document.createElement('div');
                rangeWrapper.style.display = 'flex';
                rangeWrapper.style.flexDirection = 'column';
                rangeWrapper.style.gap = '12px';
                
                const sliderRow = document.createElement('div');
                sliderRow.style.display = 'flex';
                sliderRow.style.alignItems = 'center';
                sliderRow.style.gap = '12px';
                
                input = document.createElement('input');
                input.type = 'range';
                input.id = `setting-${key}`;
                input.value = currentValue !== undefined ? currentValue : (config.defaultValue || 0);
                input.dataset.settingKey = key;
                if (config.min !== undefined) input.min = config.min;
                if (config.max !== undefined) input.max = config.max;
                if (config.step !== undefined) input.step = config.step;
                input.style.flex = '1';
                input.style.cursor = 'pointer';
                
                const valueDisplay = document.createElement('span');
                valueDisplay.style.fontFamily = 'monospace';
                valueDisplay.style.fontSize = '0.95rem';
                valueDisplay.style.color = 'var(--text-dark)';
                valueDisplay.style.fontWeight = '500';
                valueDisplay.style.minWidth = '45px';
                // Line height values shouldn't have 'px'
                const unit = key.includes('LineHeight') ? '' : 'px';
                valueDisplay.textContent = input.value + unit;
                
                sliderRow.appendChild(input);
                sliderRow.appendChild(valueDisplay);
                rangeWrapper.appendChild(sliderRow);
                
                // Add preview if showPreview is true
                if (config.showPreview) {
                    const previewContainer = document.createElement('div');
                    previewContainer.style.display = 'flex';
                    previewContainer.style.justifyContent = 'center';
                    previewContainer.style.alignItems = 'center';
                    previewContainer.style.padding = '20px';
                    previewContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                    previewContainer.style.borderRadius = '8px';
                    previewContainer.style.minHeight = '100px';
                    
                    const preview = document.createElement('div');
                    preview.style.borderRadius = '50%';
                    preview.style.background = 'radial-gradient(circle, rgba(255, 0, 0, 1) 0%, rgba(255, 0, 0, 0.8) 25%, rgba(255, 0, 0, 0) 100%)';
                    preview.style.boxShadow = `0 0 ${input.value}px rgba(255, 0, 0, 0.8)`;
                    preview.style.width = `${input.value}px`;
                    preview.style.height = `${input.value}px`;
                    preview.style.transition = 'all 0.1s ease';
                    
                    previewContainer.appendChild(preview);
                    rangeWrapper.appendChild(previewContainer);
                    
                    // Update preview in real-time
                    input.addEventListener('input', (e) => {
                        const size = e.target.value;
                        valueDisplay.textContent = size + 'px';
                        preview.style.width = `${size}px`;
                        preview.style.height = `${size}px`;
                        preview.style.boxShadow = `0 0 ${size}px rgba(255, 0, 0, 0.8)`;
                    });
                } else {
                    input.addEventListener('input', (e) => {
                        const unit = key.includes('LineHeight') ? '' : 'px';
                        valueDisplay.textContent = e.target.value + unit;
                    });
                }
                
                controlWrapper.appendChild(rangeWrapper);
                break;
                
            case 'checkbox':
                const checkboxLabel = document.createElement('label');
                input = document.createElement('input');
                input.type = 'checkbox';
                input.id = `setting-${key}`;
                input.checked = currentValue !== undefined ? currentValue : (config.defaultValue || false);
                input.dataset.settingKey = key;
                checkboxLabel.appendChild(input);
                checkboxLabel.appendChild(document.createTextNode(config.checkboxLabel || 'Enable'));
                controlWrapper.appendChild(checkboxLabel);
                break;
                
            case 'select':
                input = document.createElement('select');
                input.id = `setting-${key}`;
                input.dataset.settingKey = key;
                if (config.options && Array.isArray(config.options)) {
                    config.options.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option.value;
                        opt.textContent = option.label;
                        if (option.value === currentValue) opt.selected = true;
                        input.appendChild(opt);
                    });
                }
                controlWrapper.appendChild(input);
                break;
                
            case 'textarea':
                input = document.createElement('textarea');
                input.id = `setting-${key}`;
                input.value = currentValue || '';
                input.dataset.settingKey = key;
                if (config.rows) input.rows = config.rows;
                controlWrapper.appendChild(input);
                break;
        }

    settingItem.appendChild(controlWrapper);
    settingsModalBody.appendChild(settingItem);

    // Add live preview for typography settings (number inputs)
    if (input && (key.includes('Size') || key.includes('LineHeight') ||
        key === 'letterSpacing' || key.includes('Spacing'))) {
        input.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                window.dispatchEvent(new CustomEvent('typographyPreview', {
                    detail: { key: key, value: value }
                }));
            }
        });
    }

    // Add live preview for font family changes
    if (input && key === 'fontFamily') {
        input.addEventListener('change', (e) => {
            window.dispatchEvent(new CustomEvent('typographyPreview', {
                detail: { key: key, value: e.target.value }
            }));
        });
    }
}

// Open settings modal
function openSettingsModal() {
    if (!settingsModal) return;
    renderSettings();
    settingsModal.style.display = 'flex';
}

// Close settings modal
function closeSettingsModal() {
    if (!settingsModal) return;
    settingsModal.style.display = 'none';
}

// Save settings from modal
function saveSettingsFromModal() {
    if (!settingsModalBody) return;
    
    const settings = loadSettings();
    
    settingsModalBody.querySelectorAll('[data-setting-key]').forEach(input => {
        const key = input.dataset.settingKey;
        let value;

        if (input.type === 'checkbox') {
            value = input.checked;
        } else if (input.type === 'number' || input.type === 'range') {
            value = parseFloat(input.value);
            // Skip if invalid number
            if (isNaN(value)) {
                console.warn(`Invalid number for ${key}, using default`);
                value = settingsConfig[key]?.defaultValue || 0;
            }
        } else {
            value = input.value;
        }

        settings[key] = value;
        console.log(`Saved setting ${key}:`, value);
    });
    
    saveSettings(settings);
    closeSettingsModal();
    
    // Trigger a custom event so other parts of the app can react to settings changes
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
}

// Event listeners
if (settingsButton) {
    settingsButton.addEventListener('click', openSettingsModal);
}

if (settingsModalClose) {
    settingsModalClose.addEventListener('click', closeSettingsModal);
}

if (settingsCancel) {
    settingsCancel.addEventListener('click', closeSettingsModal);
}

if (settingsSave) {
    settingsSave.addEventListener('click', saveSettingsFromModal);
}

// Reset to defaults button
const settingsReset = document.getElementById('settingsReset');
if (settingsReset) {
    settingsReset.addEventListener('click', () => {
        if (confirm('Reset all settings to default values? This will reload the page.')) {
            localStorage.removeItem('markupSettings');
            location.reload();
        }
    });
}

// Close modal when clicking outside
if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal && settingsModal.style.display === 'flex') {
        closeSettingsModal();
    }
});

// Export settings functions for use elsewhere in the app
window.markupSettings = {
    get: getSetting,
    set: setSetting,
    load: loadSettings,
    save: saveSettings,
    config: settingsConfig
};

console.log('Settings system loaded');
