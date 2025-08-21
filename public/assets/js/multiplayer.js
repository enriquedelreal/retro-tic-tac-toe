// Multiplayer Module for Retro Tic Tac Toe
class MultiplayerManager {
    constructor() {
        console.log('🎮 MultiplayerManager: Initializing...');
        this.socket = null;
        this.roomId = null;
        this.playerSymbol = null;
        this.isConnected = false;
        this.gameMode = 'local'; // 'local', 'ai', 'multiplayer'
        this.availableRooms = [];
        
        this.initializeSocket();
        this.setupEventListeners();
        console.log('🎮 MultiplayerManager: Initialized successfully');
    }

    initializeSocket() {
        // Check if Socket.IO is available
        if (typeof io === 'undefined') {
            console.error('🎮 Socket.IO not loaded! Loading from CDN...');
            this.loadSocketIO();
            return;
        }
        
        try {
            // Initialize Socket.IO connection to Vercel deployment
            const serverUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:8000' 
                : `https://${window.location.hostname}`;
            console.log('🎮 Connecting to server:', serverUrl);
            this.socket = io(serverUrl);
            
            this.socket.on('connect', () => {
                console.log('🎮 Connected to server');
                this.isConnected = true;
                this.updateConnectionStatus('Connected', 'connected');
            });

        this.socket.on('disconnect', () => {
            console.log('🎮 Disconnected from server');
            this.isConnected = false;
            this.updateConnectionStatus('Disconnected', 'disconnected');
        });

        this.socket.on('roomCreated', (roomId) => {
            console.log('🎮 Room created event received:', roomId);
            this.roomId = roomId;
            this.joinRoom(roomId);
            this.updateRoomDisplay();
            this.updateStatus(`Room created: ${roomId}`);
        });

        this.socket.on('gameState', (gameState) => {
            console.log('🎮 Received game state:', gameState);
            this.handleGameStateUpdate(gameState);
        });

        this.socket.on('playersUpdate', (players) => {
            console.log('🎮 Players updated:', players);
            this.handlePlayersUpdate(players);
        });

        this.socket.on('roomsList', (rooms) => {
            console.log('🎮 Available rooms:', rooms);
            this.availableRooms = rooms;
            this.updateRoomsList();
        });
        
        } catch (error) {
            console.error('🎮 Error initializing Socket.IO:', error);
            this.updateConnectionStatus('Connection failed', 'disconnected');
        }
    }

    loadSocketIO() {
        console.log('🎮 Loading Socket.IO from CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.7.4/socket.io.min.js';
        script.onload = () => {
            console.log('🎮 Socket.IO loaded from CDN');
            this.initializeSocket();
        };
        script.onerror = () => {
            console.error('🎮 Failed to load Socket.IO from CDN');
            this.updateConnectionStatus('Socket.IO failed to load', 'disconnected');
        };
        document.head.appendChild(script);
    }

    setupEventListeners() {
        console.log('🎮 MultiplayerManager: Setting up event listeners...');
        
        // Multiplayer toggle
        const toggleMultiplayerBtn = document.getElementById('toggleMultiplayer');
        console.log('🎮 MultiplayerManager: toggleMultiplayerBtn found:', !!toggleMultiplayerBtn);
        if (toggleMultiplayerBtn) {
            toggleMultiplayerBtn.addEventListener('click', () => {
                console.log('🎮 MultiplayerManager: ONLINE button clicked!');
                this.toggleMultiplayerMode();
            });
        }

        // Lobby controls
        const createRoomBtn = document.getElementById('createRoom');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => {
                this.createRoom();
            });
        }

        const joinRoomBtn = document.getElementById('joinRoom');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => {
                this.showRoomInput();
            });
        }

        const refreshRoomsBtn = document.getElementById('refreshRooms');
        if (refreshRoomsBtn) {
            refreshRoomsBtn.addEventListener('click', () => {
                this.getAvailableRooms();
            });
        }

        const joinRoomInputBtn = document.getElementById('joinRoomBtn');
        if (joinRoomInputBtn) {
            joinRoomInputBtn.addEventListener('click', () => {
                this.joinRoomById();
            });
        }

        const copyRoomIdBtn = document.getElementById('copyRoomId');
        if (copyRoomIdBtn) {
            copyRoomIdBtn.addEventListener('click', () => {
                this.copyRoomId();
            });
        }

        // Room input enter key
        const roomIdInput = document.getElementById('roomIdInput');
        if (roomIdInput) {
            roomIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.joinRoomById();
                }
            });
        }
    }

    toggleMultiplayerMode() {
        console.log('🎮 toggleMultiplayerMode() called');
        const currentMode = this.gameMode;
        console.log('🎮 Current mode:', currentMode);
        
        if (currentMode === 'multiplayer') {
            console.log('🎮 Switching to local mode');
            this.gameMode = 'local';
            this.leaveRoom();
        } else {
            console.log('🎮 Switching to multiplayer mode');
            this.gameMode = 'multiplayer';
            this.showLobby();
        }
        
        this.updateModeDisplay();
        
        // Notify the main game about mode change
        if (window.retroArcade && window.retroArcade.games.tictactoe) {
            window.retroArcade.games.tictactoe.setGameMode(this.gameMode);
        }
    }

    createRoom() {
        console.log('🎮 createRoom() called');
        console.log('🎮 Socket exists:', !!this.socket);
        console.log('🎮 Is connected:', this.isConnected);
        
        if (this.socket && this.isConnected) {
            console.log('🎮 Emitting createRoom event');
            this.socket.emit('createRoom');
        } else {
            console.log('🎮 Not connected to server');
            this.updateStatus('Not connected to server');
        }
    }

    joinRoom(roomId) {
        console.log('🎮 joinRoom() called with roomId:', roomId);
        if (this.socket && this.isConnected) {
            console.log('🎮 Emitting joinRoom event');
            this.socket.emit('joinRoom', roomId);
            this.roomId = roomId;
        } else {
            console.log('🎮 Cannot join room - not connected');
        }
    }

    joinRoomById() {
        const roomIdInput = document.getElementById('roomIdInput');
        if (roomIdInput && roomIdInput.value.trim()) {
            this.joinRoom(roomIdInput.value.trim());
            this.hideRoomInput();
        }
    }

    leaveRoom() {
        if (this.roomId && this.socket) {
            this.socket.emit('leaveRoom', this.roomId);
            this.roomId = null;
            this.playerSymbol = null;
            this.updateRoomDisplay();
        }
    }

    getAvailableRooms() {
        if (this.socket && this.isConnected) {
            this.socket.emit('getRooms');
        }
    }

    showLobby() {
        console.log('🎮 showLobby() called');
        const lobbyControls = document.getElementById('lobbyControls');
        const multiplayerControls = document.getElementById('multiplayerControls');
        const aiControls = document.getElementById('aiControls');
        
        console.log('🎮 lobbyControls found:', !!lobbyControls);
        console.log('🎮 multiplayerControls found:', !!multiplayerControls);
        console.log('🎮 aiControls found:', !!aiControls);
        
        if (lobbyControls) {
            lobbyControls.style.display = 'block';
            console.log('🎮 Lobby controls shown');
        }
        if (multiplayerControls) multiplayerControls.style.display = 'none';
        if (aiControls) aiControls.style.display = 'none';
        
        this.getAvailableRooms();
    }

    hideLobby() {
        const lobbyControls = document.getElementById('lobbyControls');
        if (lobbyControls) lobbyControls.style.display = 'none';
    }

    showRoomInput() {
        const roomInput = document.getElementById('roomInput');
        const availableRooms = document.getElementById('availableRooms');
        
        if (roomInput) roomInput.style.display = 'flex';
        if (availableRooms) availableRooms.style.display = 'none';
    }

    hideRoomInput() {
        const roomInput = document.getElementById('roomInput');
        if (roomInput) roomInput.style.display = 'none';
    }

    makeMove(position) {
        if (this.socket && this.isConnected && this.roomId) {
            this.socket.emit('makeMove', {
                roomId: this.roomId,
                position: position
            });
        }
    }

    resetGame() {
        if (this.socket && this.isConnected && this.roomId) {
            this.socket.emit('resetGame', this.roomId);
        }
    }

    handleGameStateUpdate(gameState) {
        // Update the game board with the new state
        if (window.retroArcade && window.retroArcade.games.tictactoe) {
            const game = window.retroArcade.games.tictactoe;
            game.updateFromServer(gameState);
        }
    }

    handlePlayersUpdate(players) {
        // Find current player
        const currentPlayer = players.find(p => p.id === this.socket.id);
        if (currentPlayer) {
            this.playerSymbol = currentPlayer.symbol;
            this.updatePlayerDisplay();
        }
        
        // Update room display
        this.updateRoomDisplay();
        
        // Hide lobby if game is ready
        if (players.length === 2) {
            this.hideLobby();
            this.showMultiplayerControls();
        }
    }

    updateFromServer(gameState) {
        // This method will be called by the main game to update the board
        this.handleGameStateUpdate(gameState);
    }

    updateModeDisplay() {
        const toggleMultiplayerBtn = document.getElementById('toggleMultiplayer');
        const toggleModeBtn = document.getElementById('toggleMode');
        
        if (toggleMultiplayerBtn) {
            if (this.gameMode === 'multiplayer') {
                toggleMultiplayerBtn.textContent = 'LOCAL';
                toggleMultiplayerBtn.style.background = '#ff6b6b';
            } else {
                toggleMultiplayerBtn.textContent = 'ONLINE';
                toggleMultiplayerBtn.style.background = '#4aff4a';
            }
        }
        
        if (toggleModeBtn) {
            if (this.gameMode === 'multiplayer') {
                toggleModeBtn.style.display = 'none';
            } else {
                toggleModeBtn.style.display = 'inline-block';
            }
        }
    }

    showMultiplayerControls() {
        const multiplayerControls = document.getElementById('multiplayerControls');
        if (multiplayerControls) multiplayerControls.style.display = 'block';
    }

    hideMultiplayerControls() {
        const multiplayerControls = document.getElementById('multiplayerControls');
        if (multiplayerControls) multiplayerControls.style.display = 'none';
    }

    updateConnectionStatus(status, className) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status-text ${className}`;
        }
    }

    updateRoomDisplay() {
        const roomIdElement = document.getElementById('roomId');
        if (roomIdElement) {
            roomIdElement.textContent = this.roomId || 'Not connected';
        }
    }

    updatePlayerDisplay() {
        const playerSymbolElement = document.getElementById('playerSymbol');
        if (playerSymbolElement) {
            playerSymbolElement.textContent = this.playerSymbol || '-';
        }
    }

    updateRoomsList() {
        const roomsListElement = document.getElementById('roomsList');
        const availableRoomsElement = document.getElementById('availableRooms');
        
        if (!roomsListElement || !availableRoomsElement) return;
        
        if (this.availableRooms.length === 0) {
            roomsListElement.innerHTML = '<p style="color: #b0c4de; text-align: center;">No rooms available</p>';
        } else {
            roomsListElement.innerHTML = this.availableRooms.map(room => `
                <div class="room-item" onclick="multiplayerManager.joinRoom('${room.id}')">
                    <div class="room-item-info">
                        <div class="room-item-id">${room.id}</div>
                        <div class="room-item-players">${room.players}/2 players</div>
                    </div>
                    <button class="room-item-join">JOIN</button>
                </div>
            `).join('');
        }
        
        availableRoomsElement.style.display = 'block';
    }

    updateStatus(message) {
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    copyRoomId() {
        if (this.roomId) {
            navigator.clipboard.writeText(this.roomId).then(() => {
                this.updateStatus('Room ID copied to clipboard!');
            }).catch(() => {
                this.updateStatus('Failed to copy room ID');
            });
        }
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.updateModeDisplay();
    }

    isMyTurn() {
        if (this.gameMode !== 'multiplayer' || !this.roomId) return true;
        
        // This will be updated by the game state from server
        if (window.retroArcade && window.retroArcade.games.tictactoe) {
            const game = window.retroArcade.games.tictactoe;
            return game.currentPlayer === this.playerSymbol;
        }
        
        return false;
    }
}

// Initialize multiplayer manager
let multiplayerManager;

// Initialize when DOM is ready
function initializeMultiplayer() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            multiplayerManager = new MultiplayerManager();
        });
    } else {
        // DOM is already loaded
        multiplayerManager = new MultiplayerManager();
    }
}

// Initialize immediately
initializeMultiplayer();

// Test function to verify multiplayer is working
window.testMultiplayer = function() {
    console.log('🎮 Testing multiplayer functionality...');
    const btn = document.getElementById('toggleMultiplayer');
    if (btn) {
        console.log('✅ ONLINE button found:', btn);
        console.log('✅ Button text:', btn.textContent);
        console.log('✅ Button visible:', btn.offsetParent !== null);
        console.log('✅ Button clickable:', !btn.disabled);
    } else {
        console.log('❌ ONLINE button not found!');
    }
    
    if (typeof multiplayerManager !== 'undefined') {
        console.log('✅ MultiplayerManager initialized:', multiplayerManager);
    } else {
        console.log('❌ MultiplayerManager not initialized!');
    }
};
