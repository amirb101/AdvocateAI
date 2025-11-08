// Popup script - handles UI interactions

document.addEventListener('DOMContentLoaded', async () => {
  await loadStatus();
  setupEventListeners();
});

async function loadStatus() {
  // Load quota
  const quotaStatus = await chrome.storage.local.get(['quotaDate', 'quotaCount']);
  const remaining = calculateRemaining(quotaStatus);
  document.getElementById('quotaDisplay').textContent = remaining;
  
  // Load model
  const settings = await chrome.storage.sync.get(['provider', 'model']);
  const modelDisplay = settings.provider && settings.model 
    ? `${settings.provider}/${settings.model}` 
    : 'Not configured';
  document.getElementById('modelDisplay').textContent = modelDisplay;
}

function calculateRemaining(quotaData) {
  const today = new Date().toDateString();
  const quotaDate = quotaData.quotaDate || '';
  const quotaCount = quotaData.quotaCount || 0;
  
  if (quotaDate !== today) {
    return 5; // Reset daily
  }
  
  return Math.max(0, 5 - quotaCount);
}

function setupEventListeners() {
  const findBtn = document.getElementById('findPointsBtn');
  findBtn.addEventListener('click', handleFindPoints);
  
  const upgradeLink = document.getElementById('upgradeLink');
  upgradeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showMessage('Upgrade feature coming soon!', 'info');
  });
}

async function handleFindPoints() {
  const btn = document.getElementById('findPointsBtn');
  const statusMsg = document.getElementById('statusMessage');
  
  btn.disabled = true;
  showMessage('Extracting article text...', 'info');
  
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
      throw new Error('Please navigate to a news article first.');
    }
    
    // Ensure content script is injected and ready
    showMessage('Preparing extension...', 'info');
    await ensureContentScriptReady(tab.id);
    
    // Extract article
    showMessage('Parsing article...', 'info');
    const article = await extractArticleWithRetry(tab.id);
    
    if (!article || !article.textContent || article.textContent.length < 100) {
      throw new Error('Could not extract article text. Make sure you\'re on a news article page.');
    }
    
    showMessage('Finding polarising points...', 'info');
    
    // Send to background for LLM processing
    const result = await chrome.runtime.sendMessage({
      type: 'FIND_POLARISING_POINTS',
      articleText: article.textContent
    });
    
    if (result.success) {
      showMessage(`Found ${result.data.length} polarising points!`, 'success');
      // Reload status to update quota
      await loadStatus();
      
      // Close popup after a moment
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      throw new Error(result.error || 'Failed to find polarising points');
    }
    
  } catch (error) {
    console.error('Error:', error);
    showMessage(error.message || 'An error occurred', 'error');
    btn.disabled = false;
  }
}

// Ensure content script is injected and ready
async function ensureContentScriptReady(tabId) {
  // First, check if content script is already there
  try {
    const pingResponse = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    if (pingResponse && pingResponse.ready) {
      return; // Already ready
    }
  } catch (error) {
    // Content script not injected yet
  }
  
  // Inject content script
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['contentScript.js']
    });
  } catch (error) {
    // Might already be injected, that's okay
    console.log('Script injection note:', error.message);
  }
  
  // Wait for content script to be ready with retries
  const maxRetries = 10;
  const retryDelay = 200;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const pingResponse = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
      if (pingResponse && pingResponse.ready) {
        return; // Ready!
      }
    } catch (error) {
      // Not ready yet, wait and retry
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // If we get here, content script might not be ready, but we'll try anyway
  console.warn('Content script might not be fully ready, proceeding anyway');
}

// Extract article with retry logic
async function extractArticleWithRetry(tabId, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { 
        type: 'EXTRACT_ARTICLE' 
      });
      
      if (response && response.success && response.article) {
        return response.article;
      } else {
        throw new Error(response?.error || 'Could not extract article');
      }
    } catch (error) {
      lastError = error;
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = Math.min(300 * Math.pow(2, attempt), 1000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to extract article after retries');
}

function showMessage(text, type = 'info') {
  const statusMsg = document.getElementById('statusMessage');
  statusMsg.textContent = text;
  statusMsg.className = `status-message show ${type}`;
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      statusMsg.classList.remove('show');
    }, 3000);
  }
}

