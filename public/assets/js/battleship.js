// Retro Battleship Game - Complete Rewrite

class RetroBattleship {
    constructor() {
        // Game properties
        this.boardSize = 10;
        this.playerBoard = [];
        this.computerBoard = [];
        this.playerShips = [];
        this.computerShips = [];
        this.currentPlayer = 'player';
        this.gamePhase = 'setup'; // 'setup', 'playing', 'gameOver'
        this.selectedShip = null;
        this.selectedOrientation = 'horizontal';
        this.shipsToPlace = [
            { name: 'Carrier', size: 5, placed: false },
            { name: 'Battleship', size: 4, placed: false },
            { name: 'Cruiser', size: 3, placed: false },
            { name: 'Submarine', size: 3, placed: false },
            { name: 'Destroyer', size: 2, placed: false }
        ];
        this.playerHits = 0;
        this.computerHits = 0;
        this.playerShots = [];
        this.computerShots = [];
        
        // DOM elements
        this.playerBoardElement = null;
        this.computerBoardElement = null;
        this.statusElement = null;
        this.shipInfoElement = null;
        this.orientationButton = null;
        
        // Initialize immediately
        this.initializeGame();
    }

    initializeGame() {
        try {
            // Initialize boards
            this.playerBoard = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
            this.computerBoard = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
            
            // Reset game state
            this.currentPlayer = 'player';
            this.gamePhase = 'setup';
            this.selectedShip = null;
            this.selectedOrientation = 'horizontal';
            this.playerHits = 0;
            this.computerHits = 0;
            this.playerShots = [];
            this.computerShots = [];
            
            // Reset ships
            this.shipsToPlace.forEach(ship => ship.placed = false);
            this.playerShips = [];
            this.computerShips = [];
            
            // Place computer ships randomly
            this.placeComputerShips();
            
            console.log('Battleship: Game initialized');
            
        } catch (error) {
            console.error('Battleship: Error in initializeGame:', error);
        }
    }

    setupElements() {
        try {
            console.log('Battleship: Setting up elements...');
            
            // Get DOM elements
            this.playerBoardElement = document.getElementById('playerBoard');
            this.computerBoardElement = document.getElementById('computerBoard');
            this.statusElement = document.getElementById('battleshipStatus');
            this.shipInfoElement = document.getElementById('shipInfo');
            this.orientationButton = document.getElementById('orientationButton');
            
            console.log('Battleship: Elements found:', {
                playerBoard: !!this.playerBoardElement,
                computerBoard: !!this.computerBoardElement,
                status: !!this.statusElement,
                shipInfo: !!this.shipInfoElement,
                orientation: !!this.orientationButton
            });
            
            // Check if essential elements exist
            if (!this.playerBoardElement || !this.computerBoardElement) {
                console.error('Battleship: Essential elements not found');
                return false;
            }
            
            // Create boards and setup
            this.createBoards();
            this.setupEventListeners();
            this.updateDisplay();
            
            console.log('Battleship: Setup complete');
            return true;
            
        } catch (error) {
            console.error('Battleship: Error in setupElements:', error);
            return false;
        }
    }

    createBoards() {
        try {
            // Create player board
            this.playerBoardElement.innerHTML = '';
            this.playerBoardElement.style.display = 'grid';
            this.playerBoardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
            this.playerBoardElement.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
            
            for (let y = 0; y < this.boardSize; y++) {
                for (let x = 0; x < this.boardSize; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'battleship-cell';
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    cell.dataset.board = 'player';
                    this.playerBoardElement.appendChild(cell);
                }
            }
            
            // Create computer board
            this.computerBoardElement.innerHTML = '';
            this.computerBoardElement.style.display = 'grid';
            this.computerBoardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
            this.computerBoardElement.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
            
            for (let y = 0; y < this.boardSize; y++) {
                for (let x = 0; x < this.boardSize; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'battleship-cell';
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    cell.dataset.board = 'computer';
                    this.computerBoardElement.appendChild(cell);
                }
            }
            
            this.updateBoardDisplay();
            
        } catch (error) {
            console.error('Battleship: Error in createBoards:', error);
        }
    }

    updateBoardDisplay() {
        try {
            // Update player board
            const playerCells = this.playerBoardElement.querySelectorAll('.battleship-cell');
            playerCells.forEach(cell => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                const value = this.playerBoard[y][x];
                
                cell.className = 'battleship-cell';
                if (value === 'ship') cell.classList.add('ship');
                else if (value === 'hit') cell.classList.add('hit');
                else if (value === 'miss') cell.classList.add('miss');
            });
            
            // Update computer board (only show hits/misses)
            const computerCells = this.computerBoardElement.querySelectorAll('.battleship-cell');
            computerCells.forEach(cell => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                const value = this.computerBoard[y][x];
                
                cell.className = 'battleship-cell';
                if (value === 'hit') cell.classList.add('hit');
                else if (value === 'miss') cell.classList.add('miss');
            });
            
        } catch (error) {
            console.error('Battleship: Error in updateBoardDisplay:', error);
        }
    }

    placeComputerShips() {
        try {
            const ships = [
                { name: 'Carrier', size: 5 },
                { name: 'Battleship', size: 4 },
                { name: 'Cruiser', size: 3 },
                { name: 'Submarine', size: 3 },
                { name: 'Destroyer', size: 2 }
            ];
            
            ships.forEach(ship => {
                let placed = false;
                while (!placed) {
                    const x = Math.floor(Math.random() * this.boardSize);
                    const y = Math.floor(Math.random() * this.boardSize);
                    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                    
                    if (this.canPlaceShip(x, y, ship.size, orientation, this.computerBoard)) {
                        this.placeShip(x, y, ship.size, orientation, this.computerBoard, ship.name);
                        this.computerShips.push({
                            name: ship.name,
                            size: ship.size,
                            hits: 0,
                            sunk: false
                        });
                        placed = true;
                    }
                }
            });
            
        } catch (error) {
            console.error('Battleship: Error in placeComputerShips:', error);
        }
    }

    canPlaceShip(x, y, size, orientation, board) {
        try {
            if (orientation === 'horizontal') {
                if (x + size > this.boardSize) return false;
                for (let i = 0; i < size; i++) {
                    if (board[y][x + i] !== 0) return false;
                }
            } else {
                if (y + size > this.boardSize) return false;
                for (let i = 0; i < size; i++) {
                    if (board[y + i][x] !== 0) return false;
                }
            }
            return true;
            
        } catch (error) {
            console.error('Battleship: Error in canPlaceShip:', error);
            return false;
        }
    }

    placeShip(x, y, size, orientation, board, shipName) {
        try {
            if (orientation === 'horizontal') {
                for (let i = 0; i < size; i++) {
                    board[y][x + i] = 'ship';
                }
            } else {
                for (let i = 0; i < size; i++) {
                    board[y + i][x] = 'ship';
                }
            }
            
        } catch (error) {
            console.error('Battleship: Error in placeShip:', error);
        }
    }

    getNextShipToPlace() {
        return this.shipsToPlace.find(ship => !ship.placed);
    }

    handlePlayerBoardClick(x, y) {
        try {
            if (this.gamePhase !== 'setup') return;
            
            const ship = this.getNextShipToPlace();
            if (!ship) return;
            
            if (this.canPlaceShip(x, y, ship.size, this.selectedOrientation, this.playerBoard)) {
                this.placeShip(x, y, ship.size, this.selectedOrientation, this.playerBoard, ship.name);
                ship.placed = true;
                
                this.playerShips.push({
                    name: ship.name,
                    size: ship.size,
                    hits: 0,
                    sunk: false
                });
                
                this.updateBoardDisplay();
                this.updateDisplay();
                
                // Check if all ships placed
                if (!this.getNextShipToPlace()) {
                    this.startGame();
                }
            }
            
        } catch (error) {
            console.error('Battleship: Error in handlePlayerBoardClick:', error);
        }
    }

    handleComputerBoardClick(x, y) {
        try {
            if (this.gamePhase !== 'playing' || this.currentPlayer !== 'player') return;
            
            // Check if already shot here
            const shotKey = `${x},${y}`;
            if (this.playerShots.includes(shotKey)) return;
            
            this.playerShots.push(shotKey);
            
            // Make shot
            if (this.computerBoard[y][x] === 'ship') {
                this.computerBoard[y][x] = 'hit';
                this.playerHits++;
                this.playHitSound();
                
                // Check if ship sunk
                this.checkShipSunk(x, y, this.computerShips);
                
                if (this.playerHits >= 17) { // Total ship cells
                    this.endGame('player');
                    return;
                }
            } else {
                this.computerBoard[y][x] = 'miss';
                this.playMissSound();
            }
            
            this.updateBoardDisplay();
            this.updateDisplay();
            
            // Switch to computer turn
            this.currentPlayer = 'computer';
            setTimeout(() => this.computerTurn(), 1000);
            
        } catch (error) {
            console.error('Battleship: Error in handleComputerBoardClick:', error);
        }
    }

    computerTurn() {
        try {
            if (this.gamePhase !== 'playing' || this.currentPlayer !== 'computer') return;
            
            let x, y;
            let attempts = 0;
            const maxAttempts = this.boardSize * this.boardSize; // Maximum possible shots
            
            // Simple AI: random shots
            do {
                x = Math.floor(Math.random() * this.boardSize);
                y = Math.floor(Math.random() * this.boardSize);
                attempts++;
            } while (this.computerShots.includes(`${x},${y}`) && attempts < maxAttempts);
            
            if (attempts >= maxAttempts) {
                console.error('Battleship: Computer couldn\'t find valid shot - all positions shot');
                // All positions have been shot - check if game should end
                if (this.computerShots.length >= this.boardSize * this.boardSize) {
                    this.endGame('player'); // Player wins if computer can't shoot
                }
                return;
            }
            
            this.computerShots.push(`${x},${y}`);
            
            // Make shot
            if (this.playerBoard[y][x] === 'ship') {
                this.playerBoard[y][x] = 'hit';
                this.computerHits++;
                this.playHitSound();
                
                // Check if ship sunk
                this.checkShipSunk(x, y, this.playerShips);
                
                if (this.computerHits >= 17) { // Total ship cells
                    this.endGame('computer');
                    return;
                }
            } else {
                this.playerBoard[y][x] = 'miss';
                this.playMissSound();
            }
            
            this.updateBoardDisplay();
            this.updateDisplay();
            
            // Switch back to player
            this.currentPlayer = 'player';
            
        } catch (error) {
            console.error('Battleship: Error in computerTurn:', error);
        }
    }

    checkShipSunk(x, y, ships) {
        try {
            // Find which ship was hit
            for (let ship of ships) {
                if (!ship.sunk) {
                    ship.hits++;
                    if (ship.hits >= ship.size) {
                        ship.sunk = true;
                        this.playSunkSound();
                    }
                }
            }
            
        } catch (error) {
            console.error('Battleship: Error in checkShipSunk:', error);
        }
    }

    startGame() {
        try {
            this.gamePhase = 'playing';
            this.currentPlayer = 'player';
            this.updateDisplay();
            this.playStartSound();
            
        } catch (error) {
            console.error('Battleship: Error in startGame:', error);
        }
    }

    endGame(winner) {
        try {
            this.gamePhase = 'gameOver';
            this.updateDisplay();
            
            if (winner === 'player') {
                this.playWinSound();
            } else {
                this.playLoseSound();
            }
            
        } catch (error) {
            console.error('Battleship: Error in endGame:', error);
        }
    }

    resetGame() {
        try {
            this.initializeGame();
            this.createBoards();
            this.updateDisplay();
            this.playButtonSound();
            
        } catch (error) {
            console.error('Battleship: Error in resetGame:', error);
        }
    }

    toggleOrientation() {
        try {
            this.selectedOrientation = this.selectedOrientation === 'horizontal' ? 'vertical' : 'horizontal';
            this.updateDisplay();
            this.playButtonSound();
            
        } catch (error) {
            console.error('Battleship: Error in toggleOrientation:', error);
        }
    }

    updateDisplay() {
        try {
            // Update status
            if (this.statusElement) {
                if (this.gamePhase === 'setup') {
                    const ship = this.getNextShipToPlace();
                    if (ship) {
                        this.statusElement.textContent = `PLACE ${ship.name.toUpperCase()} (${ship.size} cells)`;
                    } else {
                        this.statusElement.textContent = 'ALL SHIPS PLACED - CLICK START';
                    }
                } else if (this.gamePhase === 'playing') {
                    this.statusElement.textContent = this.currentPlayer === 'player' ? 'YOUR TURN' : 'COMPUTER THINKING...';
                } else if (this.gamePhase === 'gameOver') {
                    this.statusElement.textContent = this.playerHits >= 17 ? 'YOU WIN!' : 'COMPUTER WINS!';
                }
            }
            
            // Update ship info
            if (this.shipInfoElement) {
                if (this.gamePhase === 'setup') {
                    const ship = this.getNextShipToPlace();
                    if (ship) {
                        this.shipInfoElement.textContent = `Next: ${ship.name} (${ship.size} cells)`;
                    } else {
                        this.shipInfoElement.textContent = 'All ships placed!';
                    }
                } else {
                    this.shipInfoElement.textContent = `Hits: ${this.playerHits} | Computer Hits: ${this.computerHits}`;
                }
            }
            
            // Update orientation button
            if (this.orientationButton) {
                this.orientationButton.textContent = this.selectedOrientation.toUpperCase();
            }
            
        } catch (error) {
            console.error('Battleship: Error in updateDisplay:', error);
        }
    }

    setupEventListeners() {
        try {
            // Player board clicks (for ship placement)
            const playerCells = this.playerBoardElement.querySelectorAll('.battleship-cell');
            playerCells.forEach(cell => {
                cell.addEventListener('click', () => {
                    const x = parseInt(cell.dataset.x);
                    const y = parseInt(cell.dataset.y);
                    this.handlePlayerBoardClick(x, y);
                });
            });
            
            // Computer board clicks (for shooting)
            const computerCells = this.computerBoardElement.querySelectorAll('.battleship-cell');
            computerCells.forEach(cell => {
                cell.addEventListener('click', () => {
                    const x = parseInt(cell.dataset.x);
                    const y = parseInt(cell.dataset.y);
                    this.handleComputerBoardClick(x, y);
                });
            });
            
            // Orientation button
            if (this.orientationButton) {
                this.orientationButton.addEventListener('click', () => this.toggleOrientation());
            }
            
            // Reset button
            const resetButton = document.getElementById('battleshipResetGame');
            if (resetButton) {
                resetButton.addEventListener('click', () => this.resetGame());
            }
            
            // Start button
            const startButton = document.getElementById('battleshipStartGame');
            if (startButton) {
                startButton.addEventListener('click', () => {
                    if (this.gamePhase === 'setup' && !this.getNextShipToPlace()) {
                        this.startGame();
                    }
                });
            }
            
            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                if (document.getElementById('battleship-game').classList.contains('active')) {
                    switch (e.key) {
                        case 'r':
                        case 'R':
                            e.preventDefault();
                            this.toggleOrientation();
                            break;
                        case 'n':
                        case 'N':
                            e.preventDefault();
                            this.resetGame();
                            break;
                        case 'f':
                        case 'F':
                            e.preventDefault();
                            if (window.retroArcade && typeof window.retroArcade.toggleFullscreen === 'function') {
                                window.retroArcade.toggleFullscreen();
                            }
                            break;
                    }
                }
            });
            
            console.log('Battleship: Event listeners setup complete');
            
        } catch (error) {
            console.error('Battleship: Error in setupEventListeners:', error);
        }
    }

    // Audio methods
    createAudioContext() {
        try {
            if (!this.audioContext) {
                this.audioContext = window.sharedAudioContext || new (window.AudioContext || window.webkitAudioContext)();
            }
        } catch (error) {
            console.error('Battleship: Error creating audio context:', error);
        }
    }

    playStartSound() {
        try {
            this.createAudioContext();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
            
        } catch (error) {
            console.error('Battleship: Error playing start sound:', error);
        }
    }

    playHitSound() {
        try {
            this.createAudioContext();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
            
        } catch (error) {
            console.error('Battleship: Error playing hit sound:', error);
        }
    }

    playMissSound() {
        try {
            this.createAudioContext();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
            
        } catch (error) {
            console.error('Battleship: Error playing miss sound:', error);
        }
    }

    playSunkSound() {
        try {
            this.createAudioContext();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
            
        } catch (error) {
            console.error('Battleship: Error playing sunk sound:', error);
        }
    }

    playWinSound() {
        try {
            this.createAudioContext();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(1047, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.4);
            
        } catch (error) {
            console.error('Battleship: Error playing win sound:', error);
        }
    }

    playLoseSound() {
        try {
            this.createAudioContext();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime + 0.4);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.6);
            
        } catch (error) {
            console.error('Battleship: Error playing lose sound:', error);
        }
    }

    playButtonSound() {
        try {
            this.createAudioContext();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
            
        } catch (error) {
            console.error('Battleship: Error playing button sound:', error);
        }
    }
}

// Export the class
window.RetroBattleship = RetroBattleship; 