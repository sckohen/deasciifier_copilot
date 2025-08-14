// Use deasciifier functions from window object

function deasciifySelection() {
  loadPatterns().then(() => {
    let selectedText = window.getSelection().toString();

    if (selectedText) {
      // Standard workflow for regular pages
      processSelectedText(selectedText);
    } else {
      // Fallback for Google Docs and other complex editors
      showInputPopup("Paste text here to deasciify:", (pastedText) => {
        if (pastedText) {
          processPastedText(pastedText);
        }
      });
    }
  });
}

function processSelectedText(text) {
  try {
    const deasciifiedObj = window.deasciify(text);
    const deasciified = deasciifiedObj && deasciifiedObj.text ? deasciifiedObj.text : text;

    // Attempt to replace the text directly
    const range = window.getSelection().getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(deasciified));
    showPopup('Deasciification complete!', 'rgba(2, 146, 21, 0.85)', 1800);
    
  } catch (err) {
    // If direct replacement fails, copy to clipboard as a fallback
    const deasciifiedObj = window.deasciify(text);
    const deasciified = deasciifiedObj.text;
    navigator.clipboard.writeText(deasciified).then(() => {
      showPopup('Could not paste automatically. Text is copied, please paste it (Ctrl+V).', 'rgba(255,140,0,0.95)', 3500);
    });
  }
}

function processPastedText(text) {
  try {
    const deasciifiedObj = window.deasciify(text);
    const deasciified = deasciifiedObj.text;

    // Copy the result to the clipboard
    navigator.clipboard.writeText(deasciified).then(() => {
        showPopup("Deasciified text copied to clipboard!", "rgba(2, 146, 21, 0.85)", 2500);
    }).catch(err => {
        showPopup("Failed to copy text to clipboard.", "rgba(220,0,0,0.95)", 3500);
    });
  } catch(err) {
    handleError(err);
  }
}

function showInputPopup(message, callback) {
  // Create the popup container
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.bottom = '24px';
  popup.style.right = '24px';
  popup.style.background = '#333';
  popup.style.color = '#fff';
  popup.style.padding = '18px';
  popup.style.borderRadius = '8px';
  popup.style.zIndex = '9999';
  popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  popup.style.fontFamily = 'sans-serif';

  // Add the close button
  const closeButton = document.createElement('span');
  closeButton.textContent = '✖';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '16px';
  closeButton.onclick = () => document.body.removeChild(popup);
  popup.appendChild(closeButton);

  // Add the message
  const textLabel = document.createElement('p');
  textLabel.textContent = message;
  textLabel.style.margin = '0 0 10px 0';
  textLabel.style.fontSize = '16px';
  popup.appendChild(textLabel);
  
  // Add the text area
  const textArea = document.createElement('textarea');
  textArea.style.width = '300px';
  textArea.style.height = '100px';
  textArea.style.background = '#444';
  textArea.style.color = '#fff';
  textArea.style.border = '1px solid #555';
  textArea.style.borderRadius = '4px';
  popup.appendChild(textArea);

  // Add the submit button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Deasciify and Copy';
  submitButton.style.display = 'block';
  submitButton.style.width = '100%';
  submitButton.style.marginTop = '10px';
  submitButton.style.padding = '10px';
  submitButton.style.background = '#007bff';
  submitButton.style.color = 'white';
  submitButton.style.border = 'none';
  submitButton.style.borderRadius = '4px';
  submitButton.style.cursor = 'pointer';
  popup.appendChild(submitButton);

  // Button click event
  submitButton.onclick = () => {
    callback(textArea.value);
    document.body.removeChild(popup);
  };

  document.body.appendChild(popup);
  textArea.focus();
}

function handleError(err) {
  console.error('Deasciifier error:', err);
  showPopup('Deasciifier not ready. Please try again.', 'rgba(220,0,0,0.95)', 3500);
}

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
    })
    .catch(error => {
      console.error('Error loading patterns:', error);
    });
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

// // Remove auto-run on page load
// if (window.top === window.self) {
//   deasciifySelection();
// }
deasciifySelection();