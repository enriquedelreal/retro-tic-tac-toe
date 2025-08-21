# 🎮 Multiplayer Connection Troubleshooting Guide

## Quick Fix Steps

### 1. Make sure you're accessing the game correctly
**❌ Don't do this:** Opening `index.html` directly in your browser (file:// protocol)
**✅ Do this:** Access the game through the server at `http://localhost:8000`

### 2. Start the server
```bash
cd /Users/Enrique/Downloads/Archive/retro-tic-tac-toe
npm start
```

### 3. Access the game
Open your browser and go to: `http://localhost:8000`

### 4. Test the connection
Visit: `http://localhost:8000/debug-connection.html` to test the Socket.IO connection

## Common Issues and Solutions

### Issue 1: "Connection failed" error
**Cause:** You're accessing the game via file:// protocol instead of through the server
**Solution:** Always access via `http://localhost:8000`

### Issue 2: "Socket.IO not loaded" error
**Cause:** The Socket.IO script failed to load
**Solution:** 
1. Make sure you're accessing via `http://localhost:8000`
2. Check browser console for errors
3. Refresh the page

### Issue 3: "Connection timeout" error
**Cause:** Server is not running or blocked by firewall
**Solution:**
1. Make sure server is running: `npm start`
2. Check if port 8000 is available: `lsof -i :8000`
3. Try a different port if needed

### Issue 4: CORS errors
**Cause:** Browser blocking cross-origin requests
**Solution:** The server is already configured with CORS, but make sure you're accessing via the correct URL

## Debug Steps

### Step 1: Check if server is running
```bash
curl http://localhost:8000/api/health
```
Should return: `{"status":"OK","message":"Retro Arcade Server is running!"}`

### Step 2: Test Socket.IO connection
```bash
node test-connection.js
```
Should show: `✅ Successfully connected to server!`

### Step 3: Use the debug page
1. Go to `http://localhost:8000/debug-connection.html`
2. Click "Test Local Connection"
3. Check the log for any errors

### Step 4: Check browser console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Look for messages starting with 🎮

## Browser Console Debugging

When you open the game, you should see these messages in the console:
```
🎮 MultiplayerManager: Initializing...
🎮 Connecting to server: http://localhost:8000
🎮 Connected to server
🎮 MultiplayerManager: Initialized successfully
```

If you see errors, they will help identify the issue.

## Still Having Issues?

1. **Check the debug page:** `http://localhost:8000/debug-connection.html`
2. **Check browser console:** Look for error messages
3. **Try a different browser:** Sometimes browser extensions can interfere
4. **Check firewall:** Make sure port 8000 is not blocked
5. **Restart the server:** Stop with Ctrl+C and run `npm start` again

## Expected Behavior

When everything is working correctly:
1. Server starts without errors
2. You can access `http://localhost:8000`
3. The "ONLINE" button appears in the game
4. Clicking "ONLINE" shows the multiplayer lobby
5. You can create or join rooms
6. The connection status shows "Connected"

## Need More Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Try the debug page to isolate the connection issue
3. Make sure you're following all the steps above
4. The server logs will show connection attempts and any errors
