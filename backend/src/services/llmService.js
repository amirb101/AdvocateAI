import { logger } from '../utils/logger.js';

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

export async function callLLM(articleText, provider, model) {
  const apiKey = getApiKey(provider);
  
  if (!apiKey) {
    throw new Error(`API key not configured for provider: ${provider}`);
  }
  
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

function getApiKey(provider) {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'deepseek':
      return process.env.DEEPSEEK_API_KEY;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY;
    default:
      return null;
  }
}

async function callOpenAI(model, apiKey, articleText) {
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
    logger.error('JSON parse error:', { error: error.message, content: content.substring(0, 500) });
    throw new Error(`Failed to parse LLM response: ${error.message}`);
  }
}

