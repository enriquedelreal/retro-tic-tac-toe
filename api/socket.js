import { Server } from 'socket.io';

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('🎮 Setting up Socket.IO server...');
    const io = new Server(res.socket.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['polling', 'websocket'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    // Game state management
    const gameRooms = new Map();
    const playerSessions = new Map();

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
        io.to(roomId).emit('gameState', room.gameState);
        io.to(roomId).emit('playersUpdate', room.players);
        
        console.log(`🎮 Player ${socket.id} joined room ${roomId}`);
      });

      // Handle game move
      socket.on('makeMove', (data) => {
        const { roomId, position } = data;
        const room = gameRooms.get(roomId);
        
        if (!room) return;
        
        const player = room.players.find(p => p.id === socket.id);
        if (!player || player.symbol !== room.gameState.currentPlayer) return;
        
        // Make the move
        if (room.gameState.board[position] === '' && room.gameState.gameActive) {
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
    
    res.socket.server.io = io;
  }
  
  res.end();
};

export default ioHandler;
