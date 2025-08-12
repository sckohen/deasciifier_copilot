chrome.action.onClicked.addListener((tab) => {
  // Inject deasciifier.js and patterns first, then content.js
  chrome.scripting.executeScript({
    target: {tabId: tab.id, allFrames: true},
    files: ["deasciifier.js", "deasciifier.patterns.min.js", "content.js"]
  });
});
