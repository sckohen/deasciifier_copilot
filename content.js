import { init, deasciify, asciify } from './deasciifier.module.js';

function loadPatterns() {
  return fetch('patterns.json')
    .then(response => response.json())
    .then(patterns => {
      init(patterns);
      console.log('Patterns loaded:', patterns);
    })
    .catch(error => {
      console.error('Error loading patterns:', error);
    });
  }

function deasciifySelection() {
  // Load patterns.json
  loadPatterns().then(() => {
    console.log('Patterns loaded successfully.');
  });

  // Get the current selection
  const selection = window.getSelection();
  console.log('Selection:', selection.toString());
  if (!selection || selection.rangeCount === 0) {
    console.log('No selection or range count is zero.');
    showPopup('No text selected. Please select some text first.', 'rgba(220, 125, 0, 0.95)', 3000);
    return;
  }
  const range = selection.getRangeAt(0);
  const selectedText = selection.toString();
  if (!selectedText) {
    console.log('Selected text is empty.');
    showPopup('No text selected. Please select some text first.', 'rgba(220, 125, 0, 0.95)', 3000);
    return;
  }

  // Ensure patterns are loaded and Deasciifier is initialized
  if (typeof TurkishDeasciifierLib !== 'undefined' && TurkishDeasciifierLib.PATTERNS && TurkishDeasciifierLib.Deasciifier) {
    if (!TurkishDeasciifierLib.Deasciifier.initialized) {
      try {
        TurkishDeasciifierLib.Deasciifier.init(TurkishDeasciifierLib.PATTERNS);
      } catch (e) {
        console.error('Failed to initialize Deasciifier:', e);
        showPopup('Failed to initialize Deasciifier.', 'rgba(220,0,0,0.95)', 3500);
        return;
      }
    }
    try {
      const deasciified = TurkishDeasciifierLib.Deasciifier.deasciify(selectedText);
      let replaced = false;
      try {
        range.deleteContents();
        range.insertNode(document.createTextNode(deasciified));
        replaced = true;
      } catch (e) {
        console.error('Failed to replace text in the document:', e);
        replaced = false;
      }
      if (replaced) {
        showPopup('Deasciification complete!', 'rgba(2, 146, 21, 0.85)', 1800);
      } else {
        navigator.clipboard.writeText(deasciified).then(() => {
          console.log('Deasciified text copied to clipboard.');
          showPopup('Could not replace text directly. Deasciified text copied to clipboard! Paste it manually.', 'rgba(255,140,0,0.95)', 3500);
        }, () => {
          console.error('Failed to copy deasciified text to clipboard.');
          showPopup('Could not replace text or copy to clipboard.', 'rgba(220,0,0,0.95)', 3500);
        });
      }
    } catch (err) {
      console.error('Deasciifier failed to run:', err);
      showPopup('Deasciifier failed to run. See console for details.', 'rgba(220,0,0,0.95)', 3500);
    }
  } else {
    console.error('Deasciifier library or patterns not loaded.');
    showPopup('Deasciifier library or patterns not loaded.', 'rgba(220,0,0,0.95)', 3500);
  }
}
function showPopup(message, background, duration) {
  const popup = document.createElement('div');
  popup.textContent = message;
  popup.style.position = 'fixed';
  popup.style.bottom = '24px';
  popup.style.right = '24px';
  popup.style.background = background;
  popup.style.color = '#fff';
  popup.style.padding = '10px 18px';
  popup.style.borderRadius = '8px';
  popup.style.zIndex = '9999';
  popup.style.fontSize = '16px';
  popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), duration);
}

// Remove auto-run on page load
if (window.top === window.self) {
  deasciifySelection();
}
