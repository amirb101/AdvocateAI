// Quota management - tracks daily usage (5/day free)

const checkQuota = async function checkQuota() {
  const data = await chrome.storage.local.get(['quotaDate', 'quotaCount', 'paid']);
  
  const today = new Date().toDateString();
  const quotaDate = data.quotaDate || '';
  const quotaCount = data.quotaCount || 0;
  const paid = data.paid || false;
  
  // Reset if it's a new day
  if (quotaDate !== today) {
    await chrome.storage.local.set({
      quotaDate: today,
      quotaCount: 0
    });
    return {
      allowed: true,
      remaining: paid ? Infinity : 5,
      count: 0
    };
  }
  
  // Check limit
  const limit = paid ? Infinity : 5;
  const remaining = Math.max(0, limit - quotaCount);
  
  return {
    allowed: quotaCount < limit,
    remaining: remaining,
    count: quotaCount
  };
}

const incrementQuota = async function incrementQuota() {
  const data = await chrome.storage.local.get(['quotaDate', 'quotaCount']);
  const today = new Date().toDateString();
  const quotaDate = data.quotaDate || '';
  const quotaCount = data.quotaCount || 0;
  
  if (quotaDate !== today) {
    // New day, reset
    await chrome.storage.local.set({
      quotaDate: today,
      quotaCount: 1
    });
  } else {
    // Increment
    await chrome.storage.local.set({
      quotaCount: quotaCount + 1
    });
  }
}

const getQuotaStatus = async function getQuotaStatus() {
  return await checkQuota();
};

// Export to global scope for importScripts
if (typeof self !== 'undefined') {
  self.checkQuota = checkQuota;
  self.incrementQuota = incrementQuota;
  self.getQuotaStatus = getQuotaStatus;
} else if (typeof window !== 'undefined') {
  window.checkQuota = checkQuota;
  window.incrementQuota = incrementQuota;
  window.getQuotaStatus = getQuotaStatus;
}

