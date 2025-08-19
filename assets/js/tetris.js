// Retro Tetris Game - Complete Rewrite

class RetroTetris {
    constructor() {
        // Game properties
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('tetrisBestScore')) || 0;
        this.level = 1;
        this.highestLevel = parseInt(localStorage.getItem('tetrisHighestLevel')) || 1;
        this.lines = 0;
        this.pieces = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.baseSpeed = 1000;
        this.speedMultiplier = 1;
        this.gameSpeed = this.baseSpeed * this.speedMultiplier;
        this.gameLoop = null;
        this.lastUpdate = 0;
        this.renderFrame = null;
        
        // DOM elements
        this.boardElement = null;
        this.nextPieceElement = null;
        this.scoreElement = null;
        this.levelElement = null;
        this.linesElement = null;
        this.piecesElement = null;
        this.bestScoreElement = null;
        this.highestLevelElement = null;
        this.statusElement = null;
        
        // Tetromino pieces
        this.tetrominos = [
            // I piece
            {
                shape: [
                    [1, 1, 1, 1]
                ],
                color: 'I'
            },
            // O piece
            {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: 'O'
            },
            // T piece
            {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: 'T'
            },
            // S piece
            {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: 'S'
            },
            // Z piece
            {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: 'Z'
            },
            // J piece
            {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: 'J'
            },
            // L piece
            {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                color: 'L'
            }
        ];
        
        // Initialize immediately
        this.initializeGame();
    }

    initializeGame() {
        try {
            // Initialize board
            this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
            
            // Reset game state
            this.score = 0;
            this.level = 1;
            this.lines = 0;
            this.pieces = 0;
            this.gameRunning = false;
            this.gamePaused = false;
            this.gameSpeed = this.baseSpeed * this.speedMultiplier;
            
            // Create initial pieces
            this.currentPiece = this.getRandomPiece();
            this.nextPiece = this.getRandomPiece();
            
            // Setup will be called when game is switched to
            console.log('Tetris: Game initialized');
            
        } catch (error) {
            console.error('Tetris: Error in initializeGame:', error);
        }
    }

    setupElements() {
        try {
            console.log('Tetris: Setting up elements...');
            
            // Get DOM elements
            this.boardElement = document.getElementById('tetrisBoard');
            this.nextPieceElement = document.getElementById('tetrisNextPiece');
            this.scoreElement = document.getElementById('tetrisScore');
            this.levelElement = document.getElementById('tetrisLevel');
            this.linesElement = document.getElementById('tetrisLines');
            this.piecesElement = document.getElementById('tetrisPieces');
            this.bestScoreElement = document.getElementById('tetrisBestScore');
            this.highestLevelElement = document.getElementById('tetrisHighestLevel');
            this.statusElement = document.getElementById('tetrisGameStatus');
            
            console.log('Tetris: Elements found:', {
                board: !!this.boardElement,
                next: !!this.nextPieceElement,
                score: !!this.scoreElement,
                level: !!this.levelElement,
                lines: !!this.linesElement,
                pieces: !!this.piecesElement,
                bestScore: !!this.bestScoreElement,
                highestLevel: !!this.highestLevelElement,
                status: !!this.statusElement
            });
            
            // Check if essential elements exist
            if (!this.boardElement || !this.nextPieceElement) {
                console.error('Tetris: Essential elements not found');
                return false;
            }
            
            // Create board and setup
            this.createBoard();
            this.setupEventListeners();
            this.updateDisplay();
            this.updateNextPiece();
            
            // Auto-start the game
            setTimeout(() => {
                if (!this.gameRunning) {
                    this.startGame();
                }
            }, 500);
            
            console.log('Tetris: Setup complete');
            return true;
            
        } catch (error) {
            console.error('Tetris: Error in setupElements:', error);
            return false;
        }
    }

    getRandomPiece() {
        const piece = this.tetrominos[Math.floor(Math.random() * this.tetrominos.length)];
        return {
            shape: piece.shape,
            color: piece.color,
            x: Math.floor(this.boardWidth / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0
        };
    }

    createBoard() {
        try {
            if (!this.boardElement) return;
            
            // Clear board
            this.boardElement.innerHTML = '';
            
            // Set grid styles
            this.boardElement.style.display = 'grid';
            this.boardElement.style.gridTemplateColumns = `repeat(${this.boardWidth}, 1fr)`;
            this.boardElement.style.gridTemplateRows = `repeat(${this.boardHeight}, 1fr)`;
            
            // Create cells
            for (let y = 0; y < this.boardHeight; y++) {
                for (let x = 0; x < this.boardWidth; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'tetris-cell';
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    this.boardElement.appendChild(cell);
                }
            }
            
            this.updateBoardDisplay();
            
        } catch (error) {
            console.error('Tetris: Error in createBoard:', error);
        }
    }

    updateBoardDisplay() {
        try {
            if (!this.boardElement) return;
            
            // Use requestAnimationFrame for smoother updates
            if (this.renderFrame) {
                cancelAnimationFrame(this.renderFrame);
            }
            
            this.renderFrame = requestAnimationFrame(() => {
                const cells = this.boardElement.querySelectorAll('.tetris-cell');
                
                // Batch DOM updates for better performance
                const updates = new Map();
                
                // Clear all cells
                cells.forEach(cell => {
                    const x = parseInt(cell.dataset.x);
                    const y = parseInt(cell.dataset.y);
                    updates.set(`${x},${y}`, 'empty');
                });
                
                // Mark board pieces
                for (let y = 0; y < this.boardHeight; y++) {
                    for (let x = 0; x < this.boardWidth; x++) {
                        if (this.board[y][x]) {
                            updates.set(`${x},${y}`, this.board[y][x]);
                        }
                    }
                }
                
                // Mark current piece
                if (this.currentPiece) {
                    this.currentPiece.shape.forEach((row, y) => {
                        row.forEach((cell, x) => {
                            if (cell) {
                                const boardX = this.currentPiece.x + x;
                                const boardY = this.currentPiece.y + y;
                                if (boardX >= 0 && boardX < this.boardWidth && boardY >= 0 && boardY < this.boardHeight) {
                                    updates.set(`${boardX},${boardY}`, this.currentPiece.color + '_current');
                                }
                            }
                        });
                    });
                }
                
                // Apply updates efficiently
                cells.forEach(cell => {
                    const x = parseInt(cell.dataset.x);
                    const y = parseInt(cell.dataset.y);
                    const key = `${x},${y}`;
                    const newState = updates.get(key) || 'empty';
                    
                    // Only update if state changed
                    const currentClasses = cell.className;
                    let newClasses = 'tetris-cell';
                    
                    if (newState !== 'empty') {
                        if (newState.endsWith('_current')) {
                            newClasses += ' filled ' + newState.replace('_current', '') + ' current-piece';
                        } else {
                            newClasses += ' filled ' + newState;
                        }
                    }
                    
                    if (currentClasses !== newClasses) {
                        cell.className = newClasses;
                    }
                });
            });
            
        } catch (error) {
            console.error('Tetris: Error in updateBoardDisplay:', error);
        }
    }

    drawPiece(piece, isCurrent = false) {
        try {
            if (!this.boardElement || !piece) return;
            
            piece.shape.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell) {
                        const boardX = piece.x + x;
                        const boardY = piece.y + y;
                        
                        if (boardX >= 0 && boardX < this.boardWidth && boardY >= 0 && boardY < this.boardHeight) {
                            const cellElement = this.boardElement.querySelector(`[data-x="${boardX}"][data-y="${boardY}"]`);
                            if (cellElement) {
                                cellElement.classList.add('filled', piece.color);
                                if (isCurrent) {
                                    cellElement.classList.add('current-piece');
                                }
                            }
                        }
                    }
                });
            });
            
        } catch (error) {
            console.error('Tetris: Error in drawPiece:', error);
        }
    }

    updateNextPiece() {
        try {
            if (!this.nextPieceElement || !this.nextPiece) return;
            
            this.nextPieceElement.innerHTML = '';
            
            // Create next piece display
            const nextDisplay = document.createElement('div');
            nextDisplay.style.display = 'grid';
            nextDisplay.style.gridTemplateColumns = `repeat(${this.nextPiece.shape[0].length}, 1fr)`;
            nextDisplay.style.gridTemplateRows = `repeat(${this.nextPiece.shape.length}, 1fr)`;
            nextDisplay.style.gap = '2px';
            nextDisplay.style.width = '80px';
            nextDisplay.style.height = '60px';
            
            this.nextPiece.shape.forEach((row, y) => {
                row.forEach((cell, x) => {
                    const cellElement = document.createElement('div');
                    cellElement.className = 'tetris-cell';
                    if (cell) {
                        cellElement.classList.add('filled', this.nextPiece.color);
                    }
                    nextDisplay.appendChild(cellElement);
                });
            });
            
            this.nextPieceElement.appendChild(nextDisplay);
            
        } catch (error) {
            console.error('Tetris: Error in updateNextPiece:', error);
        }
    }

    isValidMove(piece, dx = 0, dy = 0, rotation = 0) {
        try {
            let shape = piece.shape;
            
            // Apply rotation if needed
            if (rotation !== 0) {
                shape = this.rotatePiece(shape);
            }
            
            const newX = piece.x + dx;
            const newY = piece.y + dy;
            
            // Check boundaries and collisions
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        const boardX = newX + x;
                        const boardY = newY + y;
                        
                        // Check boundaries
                        if (boardX < 0 || boardX >= this.boardWidth || boardY >= this.boardHeight) {
                            return false;
                        }
                        
                        // Check collision with placed pieces
                        if (boardY >= 0 && this.board[boardY][boardX]) {
                            return false;
                        }
                    }
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('Tetris: Error in isValidMove:', error);
            return false;
        }
    }

    rotatePiece(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                rotated[x][rows - 1 - y] = shape[y][x];
            }
        }
        
        return rotated;
    }

    placePiece() {
        try {
            if (!this.currentPiece) return;
            
            // Place piece on board
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell) {
                        const boardX = this.currentPiece.x + x;
                        const boardY = this.currentPiece.y + y;
                        
                        if (boardY >= 0 && boardY < this.boardHeight && boardX >= 0 && boardX < this.boardWidth) {
                            this.board[boardY][boardX] = this.currentPiece.color;
                        }
                    }
                });
            });
            
            // Check for completed lines
            this.checkLines();
            
            // Get next piece
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.getRandomPiece();
            this.pieces++;
            
            // Check if game over
            if (!this.isValidMove(this.currentPiece)) {
                this.gameOver();
                return;
            }
            
            this.updateNextPiece();
            
        } catch (error) {
            console.error('Tetris: Error in placePiece:', error);
        }
    }

    checkLines() {
        try {
            let linesCleared = 0;
            
            for (let y = this.boardHeight - 1; y >= 0; y--) {
                if (this.board[y].every(cell => cell !== 0)) {
                    // Remove line
                    this.board.splice(y, 1);
                    this.board.unshift(Array(this.boardWidth).fill(0));
                    linesCleared++;
                    y++; // Check same line again
                }
            }
            
            if (linesCleared > 0) {
                this.lines += linesCleared;
                this.score += linesCleared * 100 * this.level;
                
                // Level up every 10 lines
                const newLevel = Math.floor(this.lines / 10) + 1;
                if (newLevel > this.level) {
                    this.level = newLevel;
                    this.gameSpeed = Math.max(100, this.baseSpeed - (this.level - 1) * 50);
                }
                
                this.playLineClearSound();
            }
            
        } catch (error) {
            console.error('Tetris: Error in checkLines:', error);
        }
    }

    movePiece(dx, dy) {
        if (this.currentPiece && this.isValidMove(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            this.updateBoardDisplay();
            return true;
        }
        return false;
    }

    rotateCurrentPiece() {
        if (this.currentPiece) {
            const rotatedShape = this.rotatePiece(this.currentPiece.shape);
            const rotatedPiece = {
                ...this.currentPiece,
                shape: rotatedShape
            };
            
            if (this.isValidMove(rotatedPiece)) {
                this.currentPiece.shape = rotatedShape;
                this.updateBoardDisplay();
                return true;
            }
        }
        return false;
    }

    hardDrop() {
        if (!this.currentPiece) return;
        
        let dropDistance = 0;
        while (this.isValidMove(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            dropDistance++;
        }
        
        this.score += dropDistance * 2;
        this.placePiece();
        this.updateBoardDisplay();
    }

    startGame() {
        try {
            if (this.gameRunning) return;
            
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameStep();
            this.playStartSound();
            
            if (this.statusElement) {
                this.statusElement.textContent = 'GAME RUNNING';
                this.statusElement.className = 'game-status running';
            }
            
            // Reset pause button text
            const pauseButton = document.getElementById('tetrisPause');
            if (pauseButton) {
                pauseButton.textContent = 'PAUSE';
            }
            
        } catch (error) {
            console.error('Tetris: Error in startGame:', error);
        }
    }

    pauseGame() {
        try {
            if (!this.gameRunning) return;
            
            this.gamePaused = !this.gamePaused;
            
            if (this.gamePaused) {
                if (this.gameLoop) {
                    cancelAnimationFrame(this.gameLoop);
                    this.gameLoop = null;
                }
                if (this.statusElement) {
                    this.statusElement.textContent = 'PAUSED';
                    this.statusElement.className = 'game-status paused';
                }
                // Update pause button text
                const pauseButton = document.getElementById('tetrisPause');
                if (pauseButton) {
                    pauseButton.textContent = 'RESUME';
                }
            } else {
                this.gameStep();
                if (this.statusElement) {
                    this.statusElement.textContent = 'GAME RUNNING';
                    this.statusElement.className = 'game-status running';
                }
                // Update pause button text
                const pauseButton = document.getElementById('tetrisPause');
                if (pauseButton) {
                    pauseButton.textContent = 'PAUSE';
                }
            }
            
        } catch (error) {
            console.error('Tetris: Error in pauseGame:', error);
        }
    }

    gameStep() {
        try {
            if (!this.gameRunning || this.gamePaused) return;
            
            const now = Date.now();
            const deltaTime = now - this.lastUpdate;
            
            if (deltaTime >= this.gameSpeed) {
                if (this.movePiece(0, 1)) {
                    // Piece moved down successfully
                    this.lastUpdate = now;
                } else {
                    // Piece can't move down, place it
                    this.placePiece();
                    this.updateBoardDisplay();
                    this.lastUpdate = now;
                }
            }
            
            // Continue the loop
            if (this.gameRunning) {
                this.gameLoop = requestAnimationFrame(() => this.gameStep());
            }
            
        } catch (error) {
            console.error('Tetris: Error in gameStep:', error);
        }
    }

    gameOver() {
        try {
            this.gameRunning = false;
            this.gamePaused = false;
            
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
                this.gameLoop = null;
            }
            
            // Update best scores
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('tetrisBestScore', this.bestScore);
            }
            
            if (this.level > this.highestLevel) {
                this.highestLevel = this.level;
                localStorage.setItem('tetrisHighestLevel', this.highestLevel);
            }
            
            this.updateDisplay();
            this.playGameOverSound();
            
            if (this.statusElement) {
                this.statusElement.textContent = 'GAME OVER';
                this.statusElement.className = 'game-status game-over';
            }
            
        } catch (error) {
            console.error('Tetris: Error in gameOver:', error);
        }
    }

    resetGame() {
        try {
            this.gameRunning = false;
            this.gamePaused = false;
            
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
                this.gameLoop = null;
            }
            
            this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
            this.score = 0;
            this.level = 1;
            this.lines = 0;
            this.pieces = 0;
            this.gameSpeed = this.baseSpeed * this.speedMultiplier;
            
            this.currentPiece = this.getRandomPiece();
            this.nextPiece = this.getRandomPiece();
            
            this.updateBoardDisplay();
            this.updateNextPiece();
            this.updateDisplay();
            
            if (this.statusElement) {
                this.statusElement.textContent = 'READY';
                this.statusElement.className = 'game-status ready';
            }
            
            // Reset pause button text
            const pauseButton = document.getElementById('tetrisPause');
            if (pauseButton) {
                pauseButton.textContent = 'PAUSE';
            }
            
        } catch (error) {
            console.error('Tetris: Error in resetGame:', error);
        }
    }

    resetScore() {
        try {
            this.bestScore = 0;
            this.highestLevel = 1;
            localStorage.removeItem('tetrisBestScore');
            localStorage.removeItem('tetrisHighestLevel');
            this.updateDisplay();
            this.playButtonSound();
            
        } catch (error) {
            console.error('Tetris: Error in resetScore:', error);
        }
    }

    setSpeed(speed) {
        try {
            console.log('Tetris: Setting speed to:', speed);
            this.speedMultiplier = speed;
            this.gameSpeed = this.baseSpeed * this.speedMultiplier;
            console.log('Tetris: New game speed:', this.gameSpeed);
            
            // Update speed buttons - specifically for tetris
            const speedButtons = document.querySelectorAll('#tetris-game .speed-btn');
            console.log('Tetris: Updating speed buttons, found:', speedButtons.length);
            speedButtons.forEach(btn => btn.classList.remove('active'));
            
            // Map numeric speed to string for button selection
            let speedString = 'medium';
            if (speed === 1.5) speedString = 'slow';
            else if (speed === 1) speedString = 'medium';
            else if (speed === 0.5) speedString = 'fast';
            
            const activeButton = document.querySelector(`#tetris-game [data-speed="${speedString}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
                console.log('Tetris: Set active button:', activeButton.dataset.speed);
            } else {
                console.error('Tetris: Active button not found for speed:', speedString);
            }
            
            this.playButtonSound();
            
        } catch (error) {
            console.error('Tetris: Error in setSpeed:', error);
        }
    }

    updateDisplay() {
        try {
            if (this.scoreElement) this.scoreElement.textContent = this.score;
            if (this.levelElement) this.levelElement.textContent = this.level;
            if (this.linesElement) this.linesElement.textContent = this.lines;
            if (this.piecesElement) this.piecesElement.textContent = this.pieces;
            if (this.bestScoreElement) this.bestScoreElement.textContent = this.bestScore;
            if (this.highestLevelElement) this.highestLevelElement.textContent = this.highestLevel;
            
        } catch (error) {
            console.error('Tetris: Error in updateDisplay:', error);
        }
    }

    setupEventListeners() {
        try {
            // Game control buttons
            const resetButton = document.getElementById('tetrisResetGame');
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    this.resetGame();
                    setTimeout(() => this.startGame(), 100);
                });
            }
            
            const resetScoreButton = document.getElementById('tetrisResetScore');
            if (resetScoreButton) {
                resetScoreButton.addEventListener('click', () => this.resetScore());
            }
            
            const pauseButton = document.getElementById('tetrisPause');
            if (pauseButton) {
                pauseButton.addEventListener('click', () => this.pauseGame());
            }
            
            // Speed buttons - specifically for tetris
            const speedButtons = document.querySelectorAll('#tetris-game .speed-btn');
            console.log('Tetris: Found speed buttons:', speedButtons.length);
            speedButtons.forEach(button => {
                console.log('Tetris: Speed button:', button.dataset.speed);
                button.addEventListener('click', () => {
                    const speed = button.dataset.speed;
                    console.log('Tetris: Speed button clicked:', speed);
                    if (speed === 'slow') this.setSpeed(1.5);
                    else if (speed === 'medium') this.setSpeed(1);
                    else if (speed === 'fast') this.setSpeed(0.5);
                });
            });
            
            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                // Start game if not running and any game key is pressed
                if (!this.gameRunning && ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
                    this.startGame();
                }
                
                if (!this.gameRunning || this.gamePaused) return;
                
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.movePiece(-1, 0);
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.movePiece(1, 0);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.movePiece(0, 1);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.rotateCurrentPiece();
                        break;
                    case ' ':
                        e.preventDefault();
                        if (this.gameRunning) {
                            this.pauseGame();
                        } else if (!this.gamePaused) {
                            this.startGame();
                        }
                        break;
                    case 'r':
                    case 'R':
                        e.preventDefault();
                        this.resetGame();
                        this.startGame();
                        break;
                    case 'h':
                    case 'H':
                        e.preventDefault();
                        this.hardDrop();
                        break;
                    case 'p':
                    case 'P':
                        e.preventDefault();
                        this.pauseGame();
                        break;
                    case 'f':
                    case 'F':
                        e.preventDefault();
                        if (window.retroArcade && typeof window.retroArcade.toggleFullscreen === 'function') {
                            window.retroArcade.toggleFullscreen();
                        }
                        break;
                }
            });
            
            // Focus game board for keyboard input
            if (this.boardElement) {
                this.boardElement.addEventListener('click', () => {
                    this.boardElement.focus();
                    // Start game if not running
                    if (!this.gameRunning) {
                        this.startGame();
                    }
                });
                this.boardElement.tabIndex = 0;
            }
            
            console.log('Tetris: Event listeners setup complete');
            
        } catch (error) {
            console.error('Tetris: Error in setupEventListeners:', error);
        }
    }

    // Audio methods
    createAudioContext() {
        try {
            if (!this.audioContext) {
                this.audioContext = window.sharedAudioContext || new (window.AudioContext || window.webkitAudioContext)();
            }
        } catch (error) {
            console.error('Tetris: Error creating audio context:', error);
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
            console.error('Tetris: Error playing start sound:', error);
        }
    }

    playLineClearSound() {
        try {
            this.createAudioContext();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1600, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
            
        } catch (error) {
            console.error('Tetris: Error playing line clear sound:', error);
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
            console.error('Tetris: Error playing button sound:', error);
        }
    }

    playGameOverSound() {
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
            console.error('Tetris: Error playing game over sound:', error);
        }
    }
}

// Export the class
window.RetroTetris = RetroTetris; 