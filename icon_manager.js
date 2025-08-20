// icon_manager.js

let deasciifyIcon = null;
const iconSize = 22;

function createDeasciifyIcon(rect) {
    if (!deasciifyIcon) {
        deasciifyIcon = document.createElement('img');
        deasciifyIcon.src = chrome.runtime.getURL('icon48.png');
        deasciifyIcon.style.position = 'absolute';
        deasciifyIcon.style.zIndex = '99999';
        deasciifyIcon.style.cursor = 'pointer';
        deasciifyIcon.style.width = `${iconSize}px`;
        deasciifyIcon.style.height = `${iconSize}px`;
        deasciifyIcon.style.background = 'white';
        deasciifyIcon.style.borderRadius = '50%';
        deasciifyIcon.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        
        deasciifyIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent mousedown from hiding the icon
            deasciifySelection(); // This function will be defined in content.js
            removeDeasciifyIcon();
        });

        document.body.appendChild(deasciifyIcon);
    }
    
     // Position the icon at the top-right of the selected text
    deasciifyIcon.style.left = `${window.scrollX + rect.right - (iconSize / 2)}px`;
    deasciifyIcon.style.top = `${window.scrollY + rect.top - iconSize - 5}px`; // 5px margin above
}

function removeDeasciifyIcon() {
    if (deasciifyIcon) {
        deasciifyIcon.remove();
        deasciifyIcon = null;
    }
}

// Listen for text selection and clicks to show/hide the icon
document.addEventListener('mouseup', () => {
    setTimeout(() => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            const range = window.getSelection().getRangeAt(0);
            const rect = range.getBoundingClientRect();
            createDeasciifyIcon(rect);
        } else {
            removeDeasciifyIcon();
        }
    }, 10);
});

document.addEventListener('mousedown', (event) => {
    if (deasciifyIcon && !deasciifyIcon.contains(event.target)) {
        removeDeasciifyIcon();
    }
});