const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});

const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Serve static files from the root directory (for assets, CSS, JS files)
app.use(express.static('.'));

// Game state management
const gameRooms = new Map();
const playerSessions = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🎮 Player connected: ${socket.id}`);

    // Join a game room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        
        if (!gameRooms.has(roomId)) {
            gameRooms.set(roomId, {
                id: roomId,
                players: [],
                gameState: {
                    board: Array(9).fill(''),
                    currentPlayer: 'X',
                    gameActive: true,
                    scores: { X: 0, O: 0 }
                },
                createdAt: Date.now()
            });
        }
        
        const room = gameRooms.get(roomId);
        const playerId = socket.id;
        
        // Add player to room if not already there
        if (!room.players.find(p => p.id === playerId)) {
            const playerSymbol = room.players.length === 0 ? 'X' : 'O';
            room.players.push({
                id: playerId,
                symbol: playerSymbol,
                name: `Player ${playerSymbol}`
            });
            
            playerSessions.set(playerId, { roomId, symbol: playerSymbol });
        }
        
        // Notify all players in the room
        console.log(`🎮 Server: Sending game state to room ${roomId}:`, room.gameState);
        console.log(`🎮 Server: Current player in game state: ${room.gameState.currentPlayer}`);
        io.to(roomId).emit('gameState', room.gameState);
        io.to(roomId).emit('playersUpdate', room.players);
        
        console.log(`🎮 Player ${socket.id} joined room ${roomId}`);
    });

    // Handle game move
    socket.on('makeMove', (data) => {
        console.log(`🎮 Server: makeMove received from ${socket.id}:`, data);
        const { roomId, position } = data;
        const room = gameRooms.get(roomId);
        
        if (!room) {
            console.log(`🎮 Server: Room ${roomId} not found`);
            return;
        }
        
        const player = room.players.find(p => p.id === socket.id);
        console.log(`🎮 Server: Player found:`, player);
        console.log(`🎮 Server: Current player should be: ${room.gameState.currentPlayer}`);
        
        if (!player) {
            console.log(`🎮 Server: Player not found in room`);
            return;
        }
        
        if (player.symbol !== room.gameState.currentPlayer) {
            console.log(`🎮 Server: Not player's turn. Player symbol: ${player.symbol}, Current player: ${room.gameState.currentPlayer}`);
            return;
        }
        
        // Make the move
        if (room.gameState.board[position] === '' && room.gameState.gameActive) {
            console.log(`🎮 Server: Making move at position ${position} with symbol ${player.symbol}`);
            room.gameState.board[position] = player.symbol;
            
            // Check for win
            const winningCombinations = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                [0, 4, 8], [2, 4, 6] // Diagonals
            ];
            
            let gameWon = false;
            for (let combo of winningCombinations) {
                if (room.gameState.board[combo[0]] && 
                    room.gameState.board[combo[0]] === room.gameState.board[combo[1]] && 
                    room.gameState.board[combo[0]] === room.gameState.board[combo[2]]) {
                    gameWon = true;
                    room.gameState.gameActive = false;
                    room.gameState.scores[player.symbol]++;
                    break;
                }
            }
            
            // Check for draw
            if (!gameWon && room.gameState.board.every(cell => cell !== '')) {
                room.gameState.gameActive = false;
            }
            
            // Switch player if game is still active
            if (room.gameState.gameActive) {
                room.gameState.currentPlayer = room.gameState.currentPlayer === 'X' ? 'O' : 'X';
            }
            
            // Broadcast updated game state
            console.log(`🎮 Server: Broadcasting game state to room ${roomId}:`, room.gameState);
            io.to(roomId).emit('gameState', room.gameState);
        }
    });

    // Reset game
    socket.on('resetGame', (roomId) => {
        const room = gameRooms.get(roomId);
        if (room) {
            room.gameState.board = Array(9).fill('');
            room.gameState.currentPlayer = 'X';
            room.gameState.gameActive = true;
            io.to(roomId).emit('gameState', room.gameState);
        }
    });

    // Create new room
    socket.on('createRoom', () => {
        const roomId = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit code
        socket.emit('roomCreated', roomId);
    });

    // Get available rooms
    socket.on('getRooms', () => {
        const availableRooms = Array.from(gameRooms.values())
            .filter(room => room.players.length < 2)
            .map(room => ({
                id: room.id,
                players: room.players.length,
                createdAt: room.createdAt
            }));
        socket.emit('roomsList', availableRooms);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`🎮 Player disconnected: ${socket.id}`);
        
        const session = playerSessions.get(socket.id);
        if (session) {
            const room = gameRooms.get(session.roomId);
            if (room) {
                room.players = room.players.filter(p => p.id !== socket.id);
                
                if (room.players.length === 0) {
                    gameRooms.delete(session.roomId);
                } else {
                    io.to(session.roomId).emit('playersUpdate', room.players);
                }
            }
            playerSessions.delete(socket.id);
        }
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for subscription demo (if needed)
app.post('/api/subscription', (req, res) => {
    // Mock subscription endpoint for demo purposes
    const { plan, userId } = req.body;
    
    // Simulate successful subscription
    res.json({
        success: true,
        message: `Demo subscription activated for ${plan} plan`,
        subscriptionId: `demo_${Date.now()}`,
        plan: plan,
        userId: userId
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Retro Arcade Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Handle 404s by serving the main page (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
    console.log('🎮 =======================================');
    console.log('🎮 RETRO GAME ARCADE SERVER STARTED!');
    console.log('🎮 =======================================');
    console.log(`🎮 Server running at: http://localhost:${PORT}`);
    console.log(`🎮 Multiplayer server ready on port ${PORT}`);
    console.log('🎮 Available games:');
    console.log('🎮   • Tic Tac Toe (Multiplayer Ready!)');
    console.log('🎮   • Checkers');
    console.log('🎮   • 2048');
    console.log('🎮   • Snake');
    console.log('🎮   • Tetris');
    console.log('🎮   • Solitaire');
    console.log('🎮   • Space Invaders');
    console.log('🎮   • Battleship');
    console.log('🎮 =======================================');
    console.log('🎮 Press Ctrl+C to stop the server');
    console.log('🎮 =======================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🎮 Shutting down Retro Arcade Server...');
    console.log('🎮 Thanks for playing! 👾');
    process.exit(0);
});