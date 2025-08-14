chrome.action.onClicked.addListener((tab) => {
  // Inject deasciifier.module.js, then content.js
  chrome.scripting.executeScript({
    target: {tabId: tab.id, allFrames: true},
    files: ["deasciifier.module.js", "content.js"]
  });
});