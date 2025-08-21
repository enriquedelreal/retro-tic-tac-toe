#!/bin/bash

echo "🌐 Deploying Retro Tic Tac Toe to Vercel for Online Multiplayer..."
echo "================================================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Make sure you're in the retro-tic-tac-toe directory."
    exit 1
fi

echo "🚀 Starting deployment..."
echo "📝 You'll be prompted to:"
echo "   1. Login to Vercel (or create account)"
echo "   2. Choose project settings"
echo "   3. Confirm deployment"
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "🌍 Your game is now online and accessible from anywhere!"
echo ""
echo "📱 To play online:"
echo "   1. Share the deployment URL with your friend"
echo "   2. Both players go to the same URL"
echo "   3. Click 'ONLINE' button"
echo "   4. Create or join a room"
echo "   5. Start playing!"
echo ""
echo "🔧 To test the connection, visit: your-url.com/debug-connection.html"
