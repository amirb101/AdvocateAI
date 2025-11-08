// Provider adapter - handles different LLM providers

const SYSTEM_PROMPT = `You are a neutral debate assistant.

Extract exactly 5 genuinely polarising claims from this article.

Each must include a verbatim quote (≤30 words) from the article,
a summary of what the claim argues for,
a short explanation of why it's polarising,
and a concise, steelmanned counterpoint.

Return pure JSON in this format:

[
  {
    "quote": "...",
    "stance": "...",
    "why_polarising": "...",
    "counterpoint": "...",
    "citations": ["url1", "url2"]
  }
]

Quotes must be *verbatim* and distinct from each other.

Return ONLY valid JSON, no markdown formatting, no code blocks.`;

// Generate or retrieve user ID
async function getUserId() {
  const stored = await chrome.storage.local.get(['userId']);
  if (stored.userId) {
    return stored.userId;
  }
  
  // Generate new user ID
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await chrome.storage.local.set({ userId });
  return userId;
}

const callLLM = async function callLLM(articleText) {
  const settings = await chrome.storage.sync.get(['backendUrl', 'provider', 'model', 'apiKey']);
  
  // If backend URL is configured, use backend
  if (settings.backendUrl && settings.backendUrl.trim()) {
    return callBackend(articleText, settings.backendUrl.trim(), settings.provider, settings.model);
  }
  
  // Otherwise, use direct API calls (backward compatibility)
  if (!settings.provider || !settings.model || !settings.apiKey) {
    throw new Error('Please configure either Backend URL or API key in Settings.');
  }
  
  const provider = settings.provider;
  const model = settings.model;
  const apiKey = settings.apiKey;
  
  switch (provider) {
    case 'openai':
      return callOpenAI(model, apiKey, articleText);
    case 'deepseek':
      return callDeepSeek(model, apiKey, articleText);
    case 'anthropic':
      return callAnthropic(model, apiKey, articleText);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

// Call backend API
async function callBackend(articleText, backendUrl, provider, model) {
  const userId = await getUserId();
  
  const response = await fetch(`${backendUrl}/api/v1/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      articleText,
      provider,
      model,
      userId
    })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error', message: `HTTP ${response.status}` }));
    throw new Error(error.error || error.message || `Backend error: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || result.message || 'Backend request failed');
  }
  
  return result.data;
}

async function callOpenAI(model, apiKey, articleText) {
  const prompt = `${SYSTEM_PROMPT}\n\nArticle:\n${articleText}`;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Article:\n${articleText}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return parseJSONResponse(content);
}

async function callDeepSeek(model, apiKey, articleText) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Article:\n${articleText}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `DeepSeek API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  return parseJSONResponse(content);
}

async function callAnthropic(model, apiKey, articleText) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Article:\n${articleText}` }
      ]
    })
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.content[0].text;
  
  return parseJSONResponse(content);
}

function parseJSONResponse(content) {
  // Try to extract JSON from response (might be wrapped in markdown code blocks)
  let jsonStr = content.trim();
  
  // Remove markdown code blocks if present
  jsonStr = jsonStr.replace(/^```json\s*/i, '');
  jsonStr = jsonStr.replace(/^```\s*/i, '');
  jsonStr = jsonStr.replace(/\s*```$/i, '');
  
  try {
    const parsed = JSON.parse(jsonStr);
    
    // Validate structure
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    
    if (parsed.length === 0) {
      throw new Error('No polarising points found');
    }
    
    // Ensure all items have required fields
    return parsed.map(item => ({
      quote: item.quote || '',
      stance: item.stance || '',
      why_polarising: item.why_polarising || item.whyPolarising || '',
      counterpoint: item.counterpoint || '',
      citations: item.citations || []
    }));
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Content:', content);
    throw new Error(`Failed to parse LLM response: ${error.message}`);
  }
}

// Export to global scope for importScripts
if (typeof self !== 'undefined') {
  self.callLLM = callLLM;
} else if (typeof window !== 'undefined') {
  window.callLLM = callLLM;
}

