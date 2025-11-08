// Content script - runs in page context, handles article parsing and highlighting

let currentHighlights = [];
let tooltipElement = null;
let readabilityPromise = null;
let isReady = false;

// Signal that content script is ready
function signalReady() {
  isReady = true;
  // Also send a message to background that we're ready
  try {
    chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' }).catch(() => {
      // Ignore errors - background might not be listening
    });
  } catch (e) {
    // Ignore
  }
}

// Initialize content script
async function initialize() {
  // Preload Readability
  loadReadability().catch(() => {
    // Silently fail - will use fallback
  });
  
  // Mark as ready after a short delay to ensure everything is loaded
  setTimeout(() => {
    signalReady();
  }, 100);
}

// Initialize when script loads
initialize();

// Load Readability library with proper promise handling
function loadReadability() {
  if (readabilityPromise) return readabilityPromise;
  
  readabilityPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof Readability !== 'undefined') {
      resolve();
      return;
    }
    
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('vendor/readability.js');
      
      script.onload = () => {
        // Wait a tick for Readability to be available
        setTimeout(() => {
          if (typeof Readability !== 'undefined') {
            resolve();
          } else {
            console.warn('Readability script loaded but Readability not available');
            reject(new Error('Readability not available'));
          }
        }, 100);
      };
      
      script.onerror = () => {
        console.warn('Failed to load Readability script');
        reject(new Error('Failed to load Readability'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.warn('Error loading Readability:', error);
      reject(error);
    }
  });
  
  return readabilityPromise;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANNOTATE') {
    annotateArticle(request.items);
    sendResponse({ success: true });
  } else if (request.type === 'EXTRACT_ARTICLE') {
    extractArticleText().then(article => {
      sendResponse({ success: true, article });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async
  } else if (request.type === 'PING') {
    // Health check - respond immediately
    sendResponse({ success: true, ready: isReady });
    return false; // Synchronous response
  }
  return false;
});

// Extract article text using Readability with improved fallback
async function extractArticleText() {
  // Try Readability first
  try {
    await loadReadability();
    
    if (typeof Readability !== 'undefined') {
      try {
        // Clone document for Readability (it modifies the DOM)
        const documentClone = document.cloneNode(true);
        const reader = new Readability(documentClone, {
          debug: false,
          maxElemsToParse: 1000,
          nbTopCandidates: 5
        });
        
        const article = reader.parse();
        
        if (article && article.textContent && article.textContent.trim().length > 100) {
          return {
            title: article.title || document.title,
            textContent: article.textContent,
            length: article.length || article.textContent.length,
            byline: article.byline || null
          };
        }
      } catch (readabilityError) {
        console.warn('Readability parse failed, using fallback:', readabilityError);
        // Fall through to fallback
      }
    }
  } catch (loadError) {
    console.warn('Readability not available, using fallback:', loadError);
    // Fall through to fallback
  }
  
  // Improved fallback extraction
  return extractArticleFallback();
}

// Improved fallback article extraction
function extractArticleFallback() {
  // Strategy 1: Try semantic HTML5 article tag
  let articleElement = document.querySelector('article');
  
  // Strategy 2: Try ARIA role
  if (!articleElement) {
    articleElement = document.querySelector('[role="article"]');
  }
  
  // Strategy 3: Try common article containers
  if (!articleElement) {
    const selectors = [
      'main article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '[class*="article"]',
      '[class*="content"]',
      '[id*="article"]',
      '[id*="content"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && getTextLength(element) > 200) {
        articleElement = element;
        break;
      }
    }
  }
  
  // Strategy 4: Try main element
  if (!articleElement) {
    articleElement = document.querySelector('main');
  }
  
  // Strategy 5: Find largest text block (heuristic)
  if (!articleElement) {
    articleElement = findLargestTextBlock();
  }
  
  // Strategy 6: Fallback to body but remove nav/footer/header
  if (!articleElement || getTextLength(articleElement) < 100) {
    articleElement = document.body.cloneNode(true);
    
    // Remove common non-content elements
    const removeSelectors = [
      'nav', 'header', 'footer', 'aside',
      '.nav', '.navigation', '.menu',
      '.header', '.footer',
      '.sidebar', '.ad', '.advertisement',
      'script', 'style', 'noscript'
    ];
    
    removeSelectors.forEach(selector => {
      articleElement.querySelectorAll(selector).forEach(el => el.remove());
    });
  }
  
  const textContent = articleElement.innerText || articleElement.textContent || '';
  const cleanText = textContent
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Try to get title from various sources
  let title = document.title;
  const titleElement = document.querySelector('h1') || 
                      document.querySelector('[class*="title"]') ||
                      document.querySelector('article h1');
  if (titleElement) {
    title = titleElement.textContent.trim();
  }
  
  return {
    title: title || document.title,
    textContent: cleanText,
    length: cleanText.length,
    byline: null
  };
}

// Helper: Get text length of element
function getTextLength(element) {
  const text = element.innerText || element.textContent || '';
  return text.replace(/\s+/g, ' ').trim().length;
}

// Helper: Find largest text block (heuristic for article content)
function findLargestTextBlock() {
  const candidates = document.querySelectorAll('div, section, p');
  let largest = null;
  let largestSize = 0;
  
  candidates.forEach(el => {
    // Skip if contains common non-content elements
    if (el.querySelector('nav, header, footer, aside, .nav, .menu')) {
      return;
    }
    
    const size = getTextLength(el);
    if (size > largestSize && size > 200) {
      largestSize = size;
      largest = el;
    }
  });
  
  return largest;
}

// Annotate article with highlights and tooltips
function annotateArticle(items) {
  // Clear previous highlights
  clearHighlights();
  
  if (!items || items.length === 0) {
    console.log('No items to annotate');
    return;
  }

  // Inject CSS if not already injected
  injectStyles();
  
  // Get all text nodes in the document
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    // Skip script and style tags
    const parent = node.parentElement;
    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
      continue;
    }
    textNodes.push(node);
  }
  
  // Build full text buffer and normalized version for matching
  const fullText = textNodes.map(n => n.textContent).join('');
  const normalizedText = normalizeTextForMatching(fullText);
  
  // Find and highlight each quote
  let successCount = 0;
  items.forEach((item, index) => {
    const quote = item.quote.trim();
    if (!quote) return;
    
    if (findAndHighlightQuote(quote, item, textNodes, fullText, normalizedText)) {
      successCount++;
    }
  });
  
  console.log(`Successfully highlighted ${successCount} of ${items.length} quotes`);
  currentHighlights = items;
}

// Normalize text for matching: lowercase, remove punctuation, normalize whitespace
function normalizeTextForMatching(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Find quote using multiple matching strategies
function findAndHighlightQuote(quote, item, textNodes, fullText, normalizedText) {
  const normalizedQuote = normalizeTextForMatching(quote);
  
  // Strategy 1: Exact match (original text)
  let match = findExactMatch(quote, fullText, textNodes);
  if (match) {
    return highlightMatch(match, item, textNodes);
  }
  
  // Strategy 2: Normalized exact match (ignore punctuation/case)
  match = findNormalizedMatch(normalizedQuote, normalizedText, fullText, textNodes);
  if (match) {
    return highlightMatch(match, item, textNodes);
  }
  
  // Strategy 3: Word-based match (match by words, flexible order)
  match = findWordBasedMatch(quote, fullText, textNodes);
  if (match) {
    return highlightMatch(match, item, textNodes);
  }
  
  // Strategy 4: Fuzzy substring match (find best partial match)
  match = findFuzzyMatch(quote, fullText, textNodes);
  if (match) {
    return highlightMatch(match, item, textNodes);
  }
  
  console.warn('Could not find quote:', quote.substring(0, 60));
  return false;
}

// Strategy 1: Exact text match
function findExactMatch(quote, fullText, textNodes) {
  const startIndex = fullText.indexOf(quote);
  if (startIndex === -1) return null;
  
  return findTextNodeRange(startIndex, startIndex + quote.length, textNodes);
}

// Strategy 2: Normalized match (case-insensitive, punctuation-agnostic)
function findNormalizedMatch(normalizedQuote, normalizedText, fullText, textNodes) {
  const startIndex = normalizedText.indexOf(normalizedQuote);
  if (startIndex === -1) return null;
  
  // Map normalized position back to original text
  // This is approximate but works well for most cases
  const originalStart = mapNormalizedToOriginal(startIndex, normalizedText, fullText);
  const originalEnd = mapNormalizedToOriginal(startIndex + normalizedQuote.length, normalizedText, fullText);
  
  if (originalStart === -1 || originalEnd === -1) return null;
  
  return findTextNodeRange(originalStart, originalEnd, textNodes);
}

// Strategy 3: Word-based match (match by words, handle punctuation differences)
function findWordBasedMatch(quote, fullText, textNodes) {
  const quoteWords = quote.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (quoteWords.length < 3) return null; // Need at least 3 words
  
  // Try matching first few words, then expand
  const searchWords = quoteWords.slice(0, Math.min(8, quoteWords.length));
  const searchPattern = searchWords.join('\\s+[^\\s]*');
  const regex = new RegExp(searchPattern, 'i');
  const match = regex.exec(fullText);
  
  if (match) {
    const startIndex = match.index;
    // Try to find end by matching more words
    let endIndex = startIndex;
    let matchedWords = 0;
    
    for (let i = 0; i < quoteWords.length && endIndex < fullText.length; i++) {
      const wordPattern = new RegExp(quoteWords[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const wordMatch = wordPattern.exec(fullText.substring(endIndex));
      if (wordMatch) {
        endIndex = endIndex + wordMatch.index + wordMatch[0].length;
        matchedWords++;
      } else {
        break;
      }
    }
    
    if (matchedWords >= Math.min(3, quoteWords.length)) {
      return findTextNodeRange(startIndex, endIndex, textNodes);
    }
  }
  
  return null;
}

// Strategy 4: Fuzzy match - find best substring match
function findFuzzyMatch(quote, fullText, textNodes) {
  const quoteWords = quote.split(/\s+/).filter(w => w.length > 2);
  if (quoteWords.length < 3) return null;
  
  // Try matching first 5-10 words
  const searchLength = Math.min(10, quoteWords.length);
  const searchText = quoteWords.slice(0, searchLength).join(' ');
  
  // Try exact match of search text
  let startIndex = fullText.toLowerCase().indexOf(searchText.toLowerCase());
  if (startIndex === -1) {
    // Try without first/last word
    if (quoteWords.length > 4) {
      const middleWords = quoteWords.slice(1, -1).join(' ');
      startIndex = fullText.toLowerCase().indexOf(middleWords.toLowerCase());
    }
  }
  
  if (startIndex === -1) return null;
  
  // Estimate end position (approximate quote length)
  const estimatedEnd = startIndex + Math.min(quote.length * 1.2, fullText.length - startIndex);
  
  return findTextNodeRange(startIndex, estimatedEnd, textNodes);
}

// Map normalized text position back to original text position
function mapNormalizedToOriginal(normalizedPos, normalizedText, originalText) {
  // Count characters in normalized text up to position
  let normalizedCount = 0;
  let originalCount = 0;
  
  while (normalizedCount < normalizedPos && originalCount < originalText.length) {
    const origChar = originalText[originalCount].toLowerCase();
    if (/[\w\s]/.test(origChar)) {
      if (/\s/.test(origChar)) {
        // Skip multiple spaces in normalized
        while (normalizedCount < normalizedText.length && normalizedText[normalizedCount] === ' ') {
          normalizedCount++;
        }
      } else {
        normalizedCount++;
      }
    }
    originalCount++;
  }
  
  return originalCount < originalText.length ? originalCount : -1;
}

// Find the text node range that contains the given character range
function findTextNodeRange(startIndex, endIndex, textNodes) {
  let currentPos = 0;
  let startNode = null;
  let endNode = null;
  let startNodePos = 0;
  let endNodePos = 0;
  
  for (const node of textNodes) {
    const nodeLength = node.textContent.length;
    const nodeEnd = currentPos + nodeLength;
    
    if (!startNode && currentPos <= startIndex && startIndex < nodeEnd) {
      startNode = node;
      startNodePos = currentPos;
    }
    
    if (!endNode && currentPos <= endIndex && endIndex <= nodeEnd) {
      endNode = node;
      endNodePos = currentPos;
      break; // Found both, can exit
    }
    
    currentPos = nodeEnd;
  }
  
  if (!startNode) return null;
  
  // If quote spans multiple nodes, we need to handle that
  if (startNode === endNode) {
    // Simple case: quote is in single node
    return {
      startNode,
      endNode,
      startOffset: startIndex - startNodePos,
      endOffset: endIndex - startNodePos
    };
  } else {
    // Multi-node case: use start node and approximate end
    return {
      startNode,
      endNode: startNode, // Highlight within first node for now
      startOffset: startIndex - startNodePos,
      endOffset: Math.min(startNode.textContent.length, startIndex - startNodePos + (endIndex - startIndex))
    };
  }
}

// Highlight a matched quote in the DOM
function highlightMatch(match, item, textNodes) {
  const { startNode, startOffset, endOffset } = match;
  
  if (!startNode || startOffset < 0 || endOffset <= startOffset) {
    return false;
  }
  
  const nodeText = startNode.textContent;
  const beforeText = nodeText.substring(0, startOffset);
  const highlightText = nodeText.substring(startOffset, endOffset);
  const afterText = nodeText.substring(endOffset);
  
  // Create highlight element
  const mark = document.createElement('mark');
  mark.className = 'na-mark';
  mark.setAttribute('data-index', currentHighlights.length);
  mark.textContent = highlightText;
  
  // Store item data
  mark.dataset.stance = item.stance || '';
  mark.dataset.whyPolarising = item.why_polarising || '';
  mark.dataset.counterpoint = item.counterpoint || '';
  mark.dataset.citations = JSON.stringify(item.citations || []);
  
  // Replace node with highlighted version
  const parent = startNode.parentNode;
  if (!parent) return false;
  
  if (beforeText) {
    parent.insertBefore(document.createTextNode(beforeText), startNode);
  }
  parent.insertBefore(mark, startNode);
  if (afterText) {
    parent.insertBefore(document.createTextNode(afterText), startNode);
  }
  parent.removeChild(startNode);
  
  // Add hover listeners
  mark.addEventListener('mouseenter', (e) => showTooltip(e.target, item));
  mark.addEventListener('mouseleave', hideTooltip);
  
  return true;
}

function showTooltip(markElement, item) {
  hideTooltip(); // Remove any existing tooltip
  
  tooltipElement = document.createElement('div');
  tooltipElement.className = 'na-tooltip';
  tooltipElement.setAttribute('role', 'tooltip');
  
  const counterpoint = item.counterpoint || markElement.dataset.counterpoint;
  const whyPolarising = item.why_polarising || markElement.dataset.whyPolarising;
  const citations = item.citations || JSON.parse(markElement.dataset.citations || '[]');
  
  let html = '';
  if (counterpoint) {
    html += `<div class="na-tooltip-title">Counterpoint:</div>`;
    html += `<div class="na-tooltip-content">${escapeHtml(counterpoint)}</div>`;
  }
  if (whyPolarising) {
    html += `<div class="na-tooltip-title">Why polarising:</div>`;
    html += `<div class="na-tooltip-content">${escapeHtml(whyPolarising)}</div>`;
  }
  if (citations && citations.length > 0) {
    html += `<div class="na-tooltip-title">Sources:</div>`;
    html += `<div class="na-tooltip-citations">`;
    citations.forEach(url => {
      html += `<a href="${url}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`;
    });
    html += `</div>`;
  }
  
  tooltipElement.innerHTML = html;
  document.body.appendChild(tooltipElement);
  
  // Position tooltip
  positionTooltip(markElement, tooltipElement);
  
  // Close on Esc key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      hideTooltip();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function positionTooltip(markElement, tooltip) {
  const rect = markElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  let top = rect.bottom + 8;
  let left = rect.left;
  
  // Adjust if too close to right edge
  if (left + tooltipRect.width > window.innerWidth - 20) {
    left = window.innerWidth - tooltipRect.width - 20;
  }
  
  // Adjust if too close to bottom edge
  if (top + tooltipRect.height > window.innerHeight - 20) {
    top = rect.top - tooltipRect.height - 8;
  }
  
  // Ensure it's not off-screen left
  if (left < 20) {
    left = 20;
  }
  
  tooltip.style.top = `${top + window.scrollY}px`;
  tooltip.style.left = `${left + window.scrollX}px`;
}

function hideTooltip() {
  if (tooltipElement) {
    tooltipElement.remove();
    tooltipElement = null;
  }
}

function clearHighlights() {
  document.querySelectorAll('.na-mark').forEach(mark => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
  currentHighlights = [];
  hideTooltip();
}

function injectStyles() {
  if (document.getElementById('na-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'na-styles';
  style.textContent = `
    .na-mark {
      background-color: rgba(255, 230, 150, 0.7);
      border-radius: 3px;
      padding: 2px 4px;
      cursor: help;
      transition: background-color 0.2s;
    }
    .na-mark:hover {
      background-color: rgba(255, 220, 130, 0.9);
    }
    .na-tooltip {
      position: absolute;
      background-color: #0f172a;
      color: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      animation: na-fadeIn 0.2s ease-out;
    }
    @keyframes na-fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .na-tooltip-title {
      font-weight: 600;
      margin-top: 12px;
      margin-bottom: 6px;
      color: #cbd5e1;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .na-tooltip-title:first-child {
      margin-top: 0;
    }
    .na-tooltip-content {
      color: #f1f5f9;
      margin-bottom: 8px;
    }
    .na-tooltip-citations {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .na-tooltip-citations a {
      color: #60a5fa;
      text-decoration: none;
      font-size: 12px;
      word-break: break-all;
    }
    .na-tooltip-citations a:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  clearHighlights();
});

