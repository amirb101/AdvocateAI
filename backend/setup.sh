#!/bin/bash
# Quick setup script for backend

echo "🔧 Setting up Advocate LLM Backend..."
echo ""

# Check if .env exists
if [ -f .env ]; then
  echo "⚠️  .env file already exists"
  read -p "Overwrite? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Keeping existing .env file"
    exit 0
  fi
fi

# Copy example
cp .env.example .env 2>/dev/null || {
  echo "Creating .env from template..."
  cat > .env << 'ENVEOF'
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=
DEEPSEEK_API_KEY=
ANTHROPIC_API_KEY=
DATABASE_PATH=./data/advocate.db
RATE_LIMIT_WINDOW_MS=86400000
RATE_LIMIT_MAX_REQUESTS=5
CACHE_TTL_SECONDS=3600
JWT_SECRET=change_this_to_random_string_in_production
API_KEY_SECRET=change_this_to_random_string_in_production
LOG_LEVEL=info
ENVEOF
}

echo "✅ Created .env file"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env and add your DeepSeek API key:"
echo "   DEEPSEEK_API_KEY=your_key_here"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start the server:"
echo "   npm start"
echo ""

