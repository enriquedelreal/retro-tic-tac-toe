# 🎮 Multiplayer Tic-Tac-Toe Guide

## How to Play Online

Your retro tic-tac-toe game now supports **real-time multiplayer**! You can play with friends on different devices.

### Getting Started

1. **Start the Server**
   ```bash
   npm install
   npm start
   ```

2. **Open the Game**
   - Navigate to `http://localhost:3000` in your browser
   - The game will automatically connect to the multiplayer server

### How to Play Online

#### Option 1: Create a Room
1. Click the **"ONLINE"** button to switch to multiplayer mode
2. Click **"CREATE ROOM"** to create a new game room
3. Share the **Room ID** with your friend (click "COPY" to copy it)
4. Wait for your friend to join

#### Option 2: Join a Room
1. Click the **"ONLINE"** button to switch to multiplayer mode
2. Click **"JOIN ROOM"** 
3. Enter the Room ID your friend shared with you
4. Click **"JOIN"** to enter the game

#### Option 3: Browse Available Rooms
1. Click the **"ONLINE"** button to switch to multiplayer mode
2. Click **"REFRESH"** to see available rooms
3. Click on any room to join it

### Game Features

- **Real-time Updates**: See your opponent's moves instantly
- **Turn-based Play**: Only your turn when it's your symbol (X or O)
- **Room Management**: Create, join, and manage game rooms
- **Connection Status**: See if you're connected to the server
- **Copy Room ID**: Easy sharing with friends

### Technical Details

- **WebSocket Connection**: Uses Socket.IO for real-time communication
- **Room-based System**: Each game runs in its own room
- **Automatic Matchmaking**: Players are assigned X or O automatically
- **Cross-device Compatible**: Works on any device with a web browser

### Troubleshooting

- **Connection Issues**: Check if the server is running (`npm start`)
- **Room Not Found**: Make sure the Room ID is correct
- **Game Not Starting**: Wait for both players to join the room
- **Disconnected**: Refresh the page and reconnect

### Development

The multiplayer system is built with:
- **Socket.IO**: Real-time bidirectional communication
- **Express.js**: Web server
- **Vanilla JavaScript**: No framework dependencies

### Future Enhancements

- [ ] Chat system
- [ ] Spectator mode
- [ ] Tournament brackets
- [ ] More games (Checkers, 2048, etc.)
- [ ] User accounts and statistics

---

**Enjoy playing online with your friends! 🎮**
