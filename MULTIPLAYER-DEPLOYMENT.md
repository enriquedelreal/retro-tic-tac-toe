# 🚀 Multiplayer Deployment Guide

## Deploying Your Multiplayer Tic-Tac-Toe Game

### Option 1: Deploy to Vercel (Recommended)

1. **Prepare for Deployment**
   ```bash
   # Make sure all dependencies are installed
   npm install
   
   # Test locally first
   npm start
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Configure Environment Variables**
   - Set `PORT` if needed (Vercel usually handles this automatically)

### Option 2: Deploy to Heroku

1. **Create Heroku App**
   ```bash
   # Install Heroku CLI
   # Create new app
   heroku create your-app-name
   ```

2. **Deploy**
   ```bash
   git add .
   git commit -m "Add multiplayer functionality"
   git push heroku main
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   ```

### Option 3: Deploy to DigitalOcean/Railway/Render

1. **Connect your repository**
2. **Set build command**: `npm install`
3. **Set start command**: `npm start`
4. **Set environment variables**:
   - `NODE_ENV=production`
   - `PORT=3000` (or let the platform set it)

### Option 4: Self-Hosted Server

1. **Server Requirements**
   - Node.js 14+ 
   - npm or yarn
   - Port 3000 (or configurable)

2. **Installation**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd retro-tic-tac-toe
   
   # Install dependencies
   npm install
   
   # Start server
   npm start
   ```

3. **Production Setup**
   ```bash
   # Use PM2 for process management
   npm install -g pm2
   pm2 start server.js --name "retro-tic-tac-toe"
   pm2 startup
   pm2 save
   ```

### Environment Variables

```env
NODE_ENV=production
PORT=3000
```

### Important Notes

- **WebSocket Support**: Make sure your hosting provider supports WebSocket connections
- **CORS**: The server is configured to accept connections from any origin
- **Scaling**: For multiple concurrent games, consider using Redis for session storage

### Testing Deployment

1. **Check Server Health**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Test Multiplayer**
   - Open the game in two different browsers/devices
   - Create a room in one
   - Join with the room ID in the other
   - Test the game functionality

### Troubleshooting

- **Connection Issues**: Check if WebSocket connections are allowed
- **Port Issues**: Ensure the correct port is exposed
- **CORS Errors**: Verify CORS settings in server.js
- **Memory Issues**: Monitor server resources for multiple concurrent games

### Security Considerations

- **Rate Limiting**: Consider adding rate limiting for move requests
- **Input Validation**: Server validates all game moves
- **Room Cleanup**: Empty rooms are automatically cleaned up
- **Connection Limits**: Monitor for potential DoS attacks

---

**Your multiplayer game is now ready to play online! 🎮**
