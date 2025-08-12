// Use deasciifier functions from window object

function loadPatterns() {
  const url = chrome.runtime.getURL('patterns.json');
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load patterns.json: ' + response.status);
      }
      return response.json();
    })
    .then(patterns => {
      if (!window.init) {
        console.error('Deasciifier module not loaded.');
        return;
      }
      window.init(patterns);
      //console.log('Patterns loaded:', patterns);
    })
    .catch(error => {
      console.error('Error loading patterns:', error);
    });
}

function deasciifySelection() {
  loadPatterns().then(() => {
    // Wait for patterns to be loaded and window.init to complete
    // Get the current selection
    const selection = window.getSelection();
    console.log('Selection:', selection ? selection.toString() : '');
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
    try {
      const deasciifiedObj = window.deasciify(selectedText);
      const deasciified = deasciifiedObj && deasciifiedObj.text ? deasciifiedObj.text : selectedText;
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
        showPopup('Deasciification complete! \n' + deasciifiedObj.changedPositions.length, 'rgba(2, 146, 21, 0.85)', 1800);
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
      console.error('Deasciifier error:', err);
      showPopup('Deasciifier not ready. Please try again.', 'rgba(220,0,0,0.95)', 3500);
    }
  }, 0);
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
