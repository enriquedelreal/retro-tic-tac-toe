# 🌐 Online Multiplayer Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd /Users/Enrique/Downloads/Archive/retro-tic-tac-toe
vercel
```

### Step 3: Follow the prompts
- Login to Vercel (or create account)
- Choose to deploy to existing project or create new
- Confirm deployment settings

### Step 4: Get your online URL
After deployment, you'll get a URL like: `https://your-project.vercel.app`

## Alternative: Deploy to Railway (Also Free)

### Step 1: Create Railway account
Go to [railway.app](https://railway.app) and sign up

### Step 2: Connect your GitHub
- Push your code to GitHub
- Connect Railway to your GitHub repo

### Step 3: Deploy
Railway will automatically detect your Node.js app and deploy it

## Alternative: Deploy to Render (Free tier available)

### Step 1: Create Render account
Go to [render.com](https://render.com) and sign up

### Step 2: Create new Web Service
- Connect your GitHub repo
- Choose Node.js environment
- Set build command: `npm install`
- Set start command: `npm start`

## Testing Your Online Deployment

### Step 1: Get your deployment URL
After deployment, you'll get a URL like:
- Vercel: `https://your-project.vercel.app`
- Railway: `https://your-project.railway.app`
- Render: `https://your-project.onrender.com`

### Step 2: Test the connection
Visit: `https://your-deployment-url.com/debug-connection.html`

### Step 3: Play online!
1. Open the game on your deployment URL
2. Click "ONLINE" button
3. Create a room or join an existing one
4. Share the room code with your friend
5. Start playing!

## How to Play Online

### For the Host (Room Creator):
1. Go to your deployed URL
2. Click "ONLINE" button
3. Click "CREATE ROOM"
4. Share the room code with your friend
5. Wait for them to join

### For the Guest (Joining):
1. Go to the same deployed URL
2. Click "ONLINE" button
3. Enter the room code from your friend
4. Click "JOIN ROOM"
5. Start playing!

## Troubleshooting Online Deployment

### Issue: Socket.IO not connecting
**Solution:** Make sure your deployment platform supports WebSockets
- Vercel: ✅ Supports WebSockets
- Railway: ✅ Supports WebSockets  
- Render: ✅ Supports WebSockets

### Issue: CORS errors
**Solution:** The server is already configured with CORS for all origins

### Issue: Connection timeout
**Solution:** 
1. Check if your deployment is running
2. Try the debug page: `your-url.com/debug-connection.html`
3. Check deployment logs for errors

## Environment Variables (if needed)

If you need to set environment variables:
- Vercel: Use the Vercel dashboard
- Railway: Use the Railway dashboard
- Render: Use the Render dashboard

## Monitoring Your Deployment

### Vercel
- Dashboard: vercel.com/dashboard
- Logs: Available in the dashboard
- Analytics: Built-in

### Railway
- Dashboard: railway.app/dashboard
- Logs: Available in the dashboard
- Metrics: Built-in

### Render
- Dashboard: render.com/dashboard
- Logs: Available in the dashboard
- Health checks: Built-in

## Cost Considerations

### Vercel
- Free tier: 100GB bandwidth/month
- Perfect for small multiplayer games

### Railway
- Free tier: $5 credit/month
- Good for development and small projects

### Render
- Free tier: 750 hours/month
- Good for development and small projects

## Next Steps

1. Deploy using one of the methods above
2. Test the connection with the debug page
3. Share the URL with friends
4. Start playing online!

Your multiplayer server will be accessible from anywhere in the world! 🌍
