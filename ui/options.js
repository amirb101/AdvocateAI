// Options page script - handles settings

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  const settings = await chrome.storage.sync.get(['provider', 'model', 'apiKey', 'backendUrl']);
  
  if (settings.backendUrl) {
    document.getElementById('backendUrl').value = settings.backendUrl;
  }
  
  if (settings.provider) {
    document.getElementById('provider').value = settings.provider;
    updateModelOptions(settings.provider);
  }
  
  if (settings.model) {
    document.getElementById('model').value = settings.model;
  }
  
  if (settings.apiKey) {
    document.getElementById('apiKey').value = settings.apiKey;
  }
}

function updateModelOptions(provider) {
  const modelSelect = document.getElementById('model');
  modelSelect.innerHTML = '';
  
  const models = {
    openai: [
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
    ],
    deepseek: [
      { value: 'deepseek-chat', label: 'DeepSeek Chat' }
    ],
    anthropic: [
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' }
    ]
  };
  
  const providerModels = models[provider] || models.openai;
  providerModels.forEach(model => {
    const option = document.createElement('option');
    option.value = model.value;
    option.textContent = model.label;
    modelSelect.appendChild(option);
  });
}

function setupEventListeners() {
  const form = document.getElementById('settingsForm');
  form.addEventListener('submit', handleSave);
  
  const providerSelect = document.getElementById('provider');
  providerSelect.addEventListener('change', (e) => {
    updateModelOptions(e.target.value);
  });
  
  // Make API key optional when backend URL is provided
  const backendUrlInput = document.getElementById('backendUrl');
  const apiKeyInput = document.getElementById('apiKey');
  
  backendUrlInput.addEventListener('input', (e) => {
    if (e.target.value.trim()) {
      apiKeyInput.removeAttribute('required');
      apiKeyInput.placeholder = 'sk-... (optional when using backend)';
    } else {
      apiKeyInput.setAttribute('required', 'required');
      apiKeyInput.placeholder = 'sk-...';
    }
  });
  
  const testBtn = document.getElementById('testBtn');
  testBtn.addEventListener('click', handleTest);
}

async function handleSave(e) {
  e.preventDefault();
  
  const backendUrl = document.getElementById('backendUrl').value.trim();
  const provider = document.getElementById('provider').value;
  const model = document.getElementById('model').value;
  const apiKey = document.getElementById('apiKey').value;
  
  // If backend URL is provided, API key is optional
  // If no backend URL, API key is required
  if (!backendUrl && !apiKey.trim()) {
    showMessage('Please enter either Backend URL or API key', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({
      backendUrl: backendUrl || '',
      provider,
      model,
      apiKey: apiKey || ''
    });
    
    showMessage('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showMessage('Failed to save settings', 'error');
  }
}

async function handleTest() {
  const apiKey = document.getElementById('apiKey').value;
  const provider = document.getElementById('provider').value;
  const model = document.getElementById('model').value;
  
  if (!apiKey || !provider || !model) {
    showMessage('Please fill in all fields first', 'error');
    return;
  }
  
  showMessage('Testing connection...', 'info');
  
  try {
    // Save settings first
    await chrome.storage.sync.set({ provider, model, apiKey });
    
    // Test by sending message to background script
    // The actual test would require calling the LLM, which is complex from options page
    // For now, just verify settings are saved
    showMessage('Settings saved! Test by using the extension on an article.', 'success');
  } catch (error) {
    console.error('Test error:', error);
    showMessage(`Error: ${error.message}`, 'error');
  }
}

function showMessage(text, type = 'info') {
  const statusMsg = document.getElementById('statusMessage');
  statusMsg.textContent = text;
  statusMsg.className = `status-message show ${type}`;
  
  if (type === 'success') {
    setTimeout(() => {
      statusMsg.classList.remove('show');
    }, 3000);
  }
}

