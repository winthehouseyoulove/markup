// ============================================
// Keyboard Shortcuts Modal
// ============================================

const shortcutsButton = document.getElementById('shortcutsButton');
const shortcutsModal = document.getElementById('shortcutsModal');

if (shortcutsButton && shortcutsModal) {
    // Toggle shortcuts modal
    shortcutsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = shortcutsModal.style.display === 'block';
        shortcutsModal.style.display = isVisible ? 'none' : 'block';
    });

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (shortcutsModal.style.display === 'block' && 
            !shortcutsModal.contains(e.target) && 
            e.target !== shortcutsButton &&
            !shortcutsButton.contains(e.target)) {
            shortcutsModal.style.display = 'none';
        }
    });

    // Prevent modal clicks from closing it
    shortcutsModal.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    console.log('Keyboard shortcuts loaded');
} else {
    console.error('Shortcuts button or modal not found');
}
