# 🚂 Deploy to Railway (Better for Multiplayer)

Railway is much better for WebSocket connections and real-time multiplayer games than Vercel's free tier.

## Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

## Step 2: Connect Your Repository
1. Click "Deploy from GitHub repo"
2. Select your retro-tic-tac-toe repository
3. Railway will automatically detect it's a Node.js app

## Step 3: Deploy
1. Railway will automatically:
   - Install dependencies (`npm install`)
   - Start the server (`npm start`)
   - Deploy your app

## Step 4: Get Your URL
Railway will give you a URL like: `https://your-app-name.railway.app`

## Why Railway is Better for Multiplayer:
- ✅ **Full WebSocket support**
- ✅ **No connection limitations**
- ✅ **Better for real-time apps**
- ✅ **Free tier available**
- ✅ **Automatic HTTPS**

## Alternative: Render.com
If Railway doesn't work, try [render.com](https://render.com):
1. Sign up
2. Create new Web Service
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`

## Testing Your Deployment
1. Visit your Railway/Render URL
2. Click "ONLINE" button
3. Create a room
4. Share the URL with a friend
5. Start playing!

Railway and Render are much better for multiplayer games than Vercel's free tier.
