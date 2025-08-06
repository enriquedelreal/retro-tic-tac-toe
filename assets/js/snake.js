// Retro Snake Game

class RetroSnake {
    constructor() {
        this.boardSize = 10;
        this.board = [];
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('snakeBestScore')) || 0;
        this.highestLength = parseInt(localStorage.getItem('snakeHighestLength')) || 3;
        this.gameRunning = false;
        this.gamePaused = false;
        this.baseSpeed = 200;
        this.speedMultiplier = 1;
        this.gameSpeed = this.baseSpeed * this.speedMultiplier;
        this.gameLoop = null;
        this.lastUpdate = 0;
        this.updateFrame = null;
        
        // DOM elements will be set in setupElements
        this.boardElement = null;
        this.scoreElement = null;
        this.lengthElement = null;
        this.bestScoreElement = null;
        this.highestLengthElement = null;
        this.statusElement = null;
        
        // Initialize game state
        this.initializeGame();
    }

    initializeGame() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.snake = [
            {x: 5, y: 5},
            {x: 4, y: 5},
            {x: 3, y: 5}
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = this.baseSpeed * this.speedMultiplier;
        
        // Clear any existing game loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.updateSnakeOnBoard();
        this.generateFood();
    }

    setupElements() {
        try {
            console.log('Snake: Setting up elements...');
            
            // Get DOM elements
            this.boardElement = document.getElementById('snakeBoard');
            this.scoreElement = document.getElementById('snakeScore');
            this.lengthElement = document.getElementById('snakeLength');
            this.bestScoreElement = document.getElementById('snakeBestScore');
            this.highestLengthElement = document.getElementById('snakeHighestLength');
            this.statusElement = document.getElementById('snakeGameStatus');
            
            console.log('Snake: Elements found:', {
                board: !!this.boardElement,
                score: !!this.scoreElement,
                length: !!this.lengthElement,
                bestScore: !!this.bestScoreElement,
                highestLength: !!this.highestLengthElement,
                status: !!this.statusElement
            });
            
            // Check if essential elements exist
            if (!this.boardElement) {
                console.error('Snake: Board element not found');
                return false;
            }
            
            // Create board and setup
            this.createBoard();
            this.setupEventListeners();
            this.updateDisplay();
            this.updateBoardDisplay();
            
            // Don't auto-start - wait for user interaction
            if (this.statusElement) {
                this.statusElement.textContent = 'CLICK TO START';
                this.statusElement.style.color = '#4CAF50';
            }
            
            console.log('Snake: Setup complete');
            return true;
            
        } catch (error) {
            console.error('Snake: Error in setupElements:', error);
            return false;
        }
    }

    updateSnakeOnBoard() {
        // Clear board
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                this.board[y][x] = 0;
            }
        }
        
        // Place snake
        this.snake.forEach((segment, index) => {
            if (segment.x >= 0 && segment.x < this.boardSize && segment.y >= 0 && segment.y < this.boardSize) {
                this.board[segment.y][segment.x] = index === 0 ? 'head' : 'body';
            }
        });
        
        // Place food
        if (this.food) {
            this.board[this.food.y][this.food.x] = 'food';
        }
    }

    generateFood() {
        const emptyCells = [];
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] === 0) {
                    emptyCells.push({x, y});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            this.food = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.display = 'grid';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
        
        // Create all cells once
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'snake-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.boardElement.appendChild(cell);
            }
        }
        
        this.updateBoardDisplay();
    }

    updateBoardDisplay() {
        // Use requestAnimationFrame for smoother updates
        if (this.updateFrame) {
            cancelAnimationFrame(this.updateFrame);
        }
        
        this.updateFrame = requestAnimationFrame(() => {
            // Batch DOM updates for better performance
            const updates = [];
            
            for (let y = 0; y < this.boardSize; y++) {
                for (let x = 0; x < this.boardSize; x++) {
                    const cellType = this.board[y][x];
                    const cell = this.boardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                    
                    if (cell) {
                        const currentClasses = cell.className;
                        let newClasses = 'snake-cell';
                        
                        if (cellType === 'head') {
                            newClasses += ' snake-head';
                        } else if (cellType === 'body') {
                            newClasses += ' snake-body';
                        } else if (cellType === 'food') {
                            newClasses += ' food';
                        }
                        
                        if (currentClasses !== newClasses) {
                            updates.push(() => {
                                cell.className = newClasses;
                            });
                        }
                    }
                }
            }
            
            // Apply all updates at once
            updates.forEach(update => update());
        });
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            if (this.statusElement) {
                this.statusElement.textContent = '';
                this.statusElement.style.color = '';
            }
            this.lastUpdate = Date.now();
            console.log('Snake: Game started');
            this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
            this.playStartSound();
            
            // Reset pause button text
            const pauseButton = document.getElementById('snakePause');
            if (pauseButton) {
                pauseButton.textContent = 'PAUSE';
            }
        }
    }

    pauseGame() {
        if (this.gameRunning && !this.gamePaused) {
            this.gamePaused = true;
            clearInterval(this.gameLoop);
            this.statusElement.textContent = 'PAUSED';
            this.statusElement.style.color = '#ffd700';
            // Update pause button text
            const pauseButton = document.getElementById('snakePause');
            if (pauseButton) {
                pauseButton.textContent = 'RESUME';
            }
            this.playButtonSound();
        } else if (this.gameRunning && this.gamePaused) {
            this.gamePaused = false;
            this.statusElement.textContent = '';
            this.statusElement.style.color = '';
            this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
            // Update pause button text
            const pauseButton = document.getElementById('snakePause');
            if (pauseButton) {
                pauseButton.textContent = 'PAUSE';
            }
            this.playButtonSound();
        }
    }

    gameStep() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.direction = this.nextDirection;
        const head = {...this.snake[0]};
        
        // Move head based on direction
        switch (this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // Check collision with walls
        if (head.x < 0 || head.x >= this.boardSize || head.y < 0 || head.y >= this.boardSize) {
            this.gameOver();
            return;
        }
        
        // Check collision with self (excluding the tail that will be removed)
        const bodySegments = this.snake.slice(0, -1); // Exclude the tail
        if (bodySegments.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.highestLength = Math.max(this.highestLength, this.snake.length);
            this.generateFood();
            this.playEatSound();
            
            // Increase speed slightly (but not too much)
            if (this.gameSpeed > 100) {
                this.gameSpeed -= 1;
                // Restart the interval with new speed
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
            }
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
        
        this.updateSnakeOnBoard();
        this.updateBoardDisplay();
        this.updateDisplay();
    }

    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        if (this.updateFrame) {
            cancelAnimationFrame(this.updateFrame);
            this.updateFrame = null;
        }
        
        // Flash snake red
        this.snake.forEach(segment => {
            const cell = this.boardElement.querySelector(`[data-x="${segment.x}"][data-y="${segment.y}"]`);
            if (cell) {
                cell.classList.add('game-over');
            }
        });
        
        this.statusElement.textContent = 'GAME OVER!';
        this.statusElement.style.color = '#ff6b6b';
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('snakeBestScore', this.bestScore);
            this.bestScoreElement.textContent = this.bestScore;
        }
        
        if (this.snake.length > this.highestLength) {
            this.highestLength = this.snake.length;
            localStorage.setItem('snakeHighestLength', this.highestLength);
            this.highestLengthElement.textContent = this.highestLength;
        }
        
        this.playGameOverSound();
    }

    resetGame() {
        clearInterval(this.gameLoop);
        this.initializeGame();
        this.updateDisplay();
        this.updateBoardDisplay();
        this.statusElement.textContent = '';
        this.statusElement.style.color = '';
        // Reset pause button text
        const pauseButton = document.getElementById('snakePause');
        if (pauseButton) {
            pauseButton.textContent = 'PAUSE';
        }
        this.playButtonSound();
    }

    resetScore() {
        this.bestScore = 0;
        this.highestLength = 3;
        localStorage.removeItem('snakeBestScore');
        localStorage.removeItem('snakeHighestLength');
        this.bestScoreElement.textContent = '0';
        this.highestLengthElement.textContent = '3';
        this.playButtonSound();
    }

    setSpeed(speed) {
        switch(speed) {
            case 'slow':
                this.speedMultiplier = 1.5;
                break;
            case 'medium':
                this.speedMultiplier = 1;
                break;
            case 'fast':
                this.speedMultiplier = 0.5;
                break;
        }
        
        this.gameSpeed = this.baseSpeed * this.speedMultiplier;
        
        // Update button styling - specifically for snake
        document.querySelectorAll('#snake-game .speed-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`#snake-game [data-speed="${speed}"]`).classList.add('active');
        
        // Restart interval with new speed if game is running
        if (this.gameRunning && !this.gamePaused) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
        }
        
        this.playButtonSound();
    }

    updateDisplay() {
        if (this.scoreElement) this.scoreElement.textContent = this.score;
        if (this.lengthElement) this.lengthElement.textContent = this.snake.length;
        if (this.bestScoreElement) this.bestScoreElement.textContent = this.bestScore;
        if (this.highestLengthElement) this.highestLengthElement.textContent = this.highestLength;
    }

    setupEventListeners() {
        // Button controls
        const resetGameBtn = document.getElementById('snakeResetGame');
        const resetScoreBtn = document.getElementById('snakeResetScore');
        const pauseBtn = document.getElementById('snakePause');
        
        if (resetGameBtn) resetGameBtn.addEventListener('click', () => this.resetGame());
        if (resetScoreBtn) resetScoreBtn.addEventListener('click', () => this.resetScore());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseGame());
        
        // Speed controls
        const speedSlowBtn = document.getElementById('snakeSpeedSlow');
        const speedMediumBtn = document.getElementById('snakeSpeedMedium');
        const speedFastBtn = document.getElementById('snakeSpeedFast');
        
        if (speedSlowBtn) speedSlowBtn.addEventListener('click', () => this.setSpeed('slow'));
        if (speedMediumBtn) speedMediumBtn.addEventListener('click', () => this.setSpeed('medium'));
        if (speedFastBtn) speedFastBtn.addEventListener('click', () => this.setSpeed('fast'));
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('snake-game').classList.contains('active')) {
                switch (e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        e.preventDefault();
                        if (this.direction !== 'down') {
                            this.nextDirection = 'up';
                        }
                        if (!this.gameRunning) this.startGame();
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        e.preventDefault();
                        if (this.direction !== 'up') {
                            this.nextDirection = 'down';
                        }
                        if (!this.gameRunning) this.startGame();
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        e.preventDefault();
                        if (this.direction !== 'right') {
                            this.nextDirection = 'left';
                        }
                        if (!this.gameRunning) this.startGame();
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        e.preventDefault();
                        if (this.direction !== 'left') {
                            this.nextDirection = 'right';
                        }
                        if (!this.gameRunning) this.startGame();
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
            }
        });
        
        // Click to start
        if (this.boardElement) {
            this.boardElement.addEventListener('click', () => {
                if (!this.gameRunning && !this.gamePaused) {
                    this.startGame();
                }
            });
        }
    }

    // Retro Sound Effects
    createAudioContext() {
        if (!this.audioContext) {
            this.audioContext = window.sharedAudioContext || new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playStartSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playEatSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playButtonSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    playGameOverSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
}

// Initialize the game when the page loads
window.RetroSnake = RetroSnake; 