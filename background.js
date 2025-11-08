// Background service worker - coordinates LLM calls and content script communication

// Import scripts (Chrome extensions don't support ES6 imports in service workers)
importScripts('lib/quota.js', 'lib/providerAdapter.js');

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FIND_POLARISING_POINTS') {
    handleFindPolarisingPoints(sender.tab.id, request.articleText)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function handleFindPolarisingPoints(tabId, articleText) {
  // Check quota first
  const quotaStatus = await self.checkQuota();
  if (!quotaStatus.allowed) {
    throw new Error(`Quota exceeded. ${quotaStatus.remaining} remaining today.`);
  }

  try {
    // Call LLM to extract polarising points
    const response = await self.callLLM(articleText);
    
    // Increment quota on success
    await self.incrementQuota();
    
    // Send results to content script for highlighting
    chrome.tabs.sendMessage(tabId, {
      type: 'ANNOTATE',
      items: response
    });
    
    return response;
  } catch (error) {
    console.error('Error finding polarising points:', error);
    throw error;
  }
}

// Listen for tab updates to reset highlights if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Optionally reset state when page loads
  }
});

