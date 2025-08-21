// Retro Minesweeper Game

class RetroMinesweeper {
    constructor() {
        this.gameRunning = false;
        this.gameWon = false;
        this.gameLost = false;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('minesweeperBestScore')) || 0;
        this.time = 0;
        this.bestTime = parseInt(localStorage.getItem('minesweeperBestTime')) || 999;
        this.timer = null;
        
        // Game settings
        this.width = 16;
        this.height = 16;
        this.mines = 40;
        this.difficulty = 'medium';
        
        // Game state
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.firstClick = true;
        
        this.boardElement = document.getElementById('minesweeperBoard');
        this.scoreElement = document.getElementById('minesweeperScore');
        this.bestScoreElement = document.getElementById('minesweeperBestScore');
        this.timeElement = document.getElementById('minesweeperTime');
        this.bestTimeElement = document.getElementById('minesweeperBestTime');
        this.minesLeftElement = document.getElementById('minesweeperMinesLeft');
        this.statusElement = document.getElementById('minesweeperGameStatus');
        
        // Initialize after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeGame();
            this.setupEventListeners();
            this.updateDisplay();
        }, 100);
    }

    initializeGame() {
        this.createBoard();
        this.updateDisplay();
    }

    createBoard() {
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.firstClick = true;
        this.gameRunning = false;
        this.gameWon = false;
        this.gameLost = false;
        this.time = 0;
        
        // Initialize arrays
        for (let y = 0; y < this.height; y++) {
            this.board[y] = [];
            this.revealed[y] = [];
            this.flagged[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.board[y][x] = 0;
                this.revealed[y][x] = false;
                this.flagged[y][x] = false;
            }
        }
        
        this.renderBoard();
    }

    placeMines(firstX, firstY) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            
            // Don't place mine on first click or if already placed
            if ((x !== firstX || y !== firstY) && this.board[y][x] !== -1) {
                this.board[y][x] = -1;
                minesPlaced++;
            }
        }
        
        // Calculate numbers
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.board[y][x] !== -1) {
                    this.board[y][x] = this.countAdjacentMines(x, y);
                }
            }
        }
    }

    countAdjacentMines(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const newY = y + dy;
                const newX = x + dx;
                if (newY >= 0 && newY < this.height && newX >= 0 && newX < this.width) {
                    if (this.board[newY][newX] === -1) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    setupEventListeners() {
        // Game control buttons
        const resetBtn = document.getElementById('minesweeperResetGame');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        const startBtn = document.getElementById('minesweeperStartGame');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // Difficulty controls
        const difficultyBtns = document.querySelectorAll('[data-minesweeper-difficulty]');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setDifficulty(btn.dataset.minesweeperDifficulty);
            });
        });
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        switch(difficulty) {
            case 'easy':
                this.width = 9;
                this.height = 9;
                this.mines = 10;
                break;
            case 'medium':
                this.width = 16;
                this.height = 16;
                this.mines = 40;
                break;
            case 'hard':
                this.width = 30;
                this.height = 16;
                this.mines = 99;
                break;
        }
        this.resetGame();
    }

    startGame() {
        this.gameRunning = true;
        this.startTimer();
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.gameRunning && !this.gameWon && !this.gameLost) {
                this.time++;
                this.updateDisplay();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetGame() {
        this.stopTimer();
        this.createBoard();
        this.updateDisplay();
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.display = 'grid';
        this.boardElement.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.height}, 1fr)`;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'minesweeper-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Add event listeners
                cell.addEventListener('click', (e) => this.handleLeftClick(x, y));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(x, y);
                });
                
                this.boardElement.appendChild(cell);
            }
        }
    }

    handleLeftClick(x, y) {
        if (!this.gameRunning || this.gameWon || this.gameLost || this.flagged[y][x]) {
            return;
        }

        if (this.firstClick) {
            this.placeMines(x, y);
            this.firstClick = false;
            this.startGame();
        }

        if (this.board[y][x] === -1) {
            // Hit a mine
            this.gameLost = true;
            this.revealAll();
            this.stopTimer();
            this.updateDisplay();
            if (this.statusElement) {
                this.statusElement.textContent = 'GAME OVER! Click NEW GAME to restart';
            }
        } else {
            this.revealCell(x, y);
            this.checkWin();
        }
        
        this.updateBoard();
    }

    handleRightClick(x, y) {
        if (!this.gameRunning || this.gameWon || this.gameLost || this.revealed[y][x]) {
            return;
        }

        this.flagged[y][x] = !this.flagged[y][x];
        this.updateBoard();
        this.updateDisplay();
    }

    revealCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || 
            this.revealed[y][x] || this.flagged[y][x]) {
            return;
        }

        this.revealed[y][x] = true;

        if (this.board[y][x] === 0) {
            // Reveal adjacent cells for empty cells
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    this.revealCell(x + dx, y + dy);
                }
            }
        }
    }

    revealAll() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.revealed[y][x] = true;
            }
        }
    }

    checkWin() {
        let revealedCount = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.revealed[y][x] && this.board[y][x] !== -1) {
                    revealedCount++;
                }
            }
        }

        if (revealedCount === this.width * this.height - this.mines) {
            this.gameWon = true;
            this.stopTimer();
            this.calculateScore();
            this.updateDisplay();
            if (this.statusElement) {
                this.statusElement.textContent = 'YOU WIN! Click NEW GAME to play again';
            }
        }
    }

    calculateScore() {
        // Score based on time and difficulty
        let timeBonus = Math.max(0, 1000 - this.time * 10);
        let difficultyBonus = 0;
        
        switch(this.difficulty) {
            case 'easy':
                difficultyBonus = 100;
                break;
            case 'medium':
                difficultyBonus = 500;
                break;
            case 'hard':
                difficultyBonus = 1000;
                break;
        }
        
        this.score = timeBonus + difficultyBonus;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('minesweeperBestScore', this.bestScore);
        }
        
        if (this.time < this.bestTime) {
            this.bestTime = this.time;
            localStorage.setItem('minesweeperBestTime', this.bestTime);
        }
    }

    updateBoard() {
        const cells = this.boardElement.querySelectorAll('.minesweeper-cell');
        cells.forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            
            cell.className = 'minesweeper-cell';
            
            if (this.flagged[y][x]) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            } else if (this.revealed[y][x]) {
                cell.classList.add('revealed');
                const value = this.board[y][x];
                
                if (value === -1) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else if (value === 0) {
                    cell.textContent = '';
                } else {
                    cell.classList.add(`number-${value}`);
                    cell.textContent = value;
                }
            } else {
                cell.textContent = '';
            }
        });
    }

    getMinesLeft() {
        let flaggedCount = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.flagged[y][x]) {
                    flaggedCount++;
                }
            }
        }
        return this.mines - flaggedCount;
    }

    updateDisplay() {
        if (this.scoreElement) this.scoreElement.textContent = this.score;
        if (this.bestScoreElement) this.bestScoreElement.textContent = this.bestScore;
        if (this.timeElement) this.timeElement.textContent = this.time;
        if (this.bestTimeElement) this.bestTimeElement.textContent = this.bestTime;
        if (this.minesLeftElement) this.minesLeftElement.textContent = this.getMinesLeft();
    }

    destroy() {
        this.stopTimer();
        this.gameRunning = false;
        // Remove event listeners if needed
    }
}
