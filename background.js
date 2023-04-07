// chrome.tabs.onUpdated fires when new tab is opened
// live this logic here that listens to page open
// implement further functionality here

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("work.ua/resumes")) {
    console.log('onUpdated')
    // chrome.tabs.sendMessage(tabId, {
    //   type: "NEW",
    //   resumeId: id,
    // });
  }
});
