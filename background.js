chrome.action.onClicked.addListener((tab) => {
  // Inject deasciifier.module.js, then content.js
  chrome.scripting.executeScript({
    target: {tabId: tab.id, allFrames: true},
    files: ["deasciifier.module.js", "content.js"]
  });
});

// Create the context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "deasciify-selection",
    title: "Deasciify Turkish Text",
    contexts: ["selection"] // This makes it appear only when text is selected
  });
});

// Listen for a click on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "deasciify-selection") {
    // Inject the scripts into the current tab
    chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["deasciifier.module.js", "content.js"]
    });
  }
});
