// Retro Tic Tac Toe - Game Logic

class RetroTicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        this.gameMode = 'human'; // 'human' or 'ai'
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.gameHistory = [];
        this.moveCount = 0;
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.updateDisplay();
        this.updateStatus('Player X starts!');
        this.updateModeDisplay();
    }

    setupEventListeners() {
        // Cell click events
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.makeMove(index);
            });
        });

        // Button events
        document.getElementById('resetGame').addEventListener('click', () => {
            this.playButtonSound();
            this.resetGame();
        });

        document.getElementById('resetScore').addEventListener('click', () => {
            this.playButtonSound();
            this.resetScore();
        });

        // Mode toggle
        document.getElementById('toggleMode').addEventListener('click', () => {
            this.playButtonSound();
            this.toggleGameMode();
        });

        // Difficulty selector
        document.getElementById('aiDifficulty').addEventListener('change', (e) => {
            this.aiDifficulty = e.target.value;
            this.updateStatus(`AI difficulty set to ${this.aiDifficulty}`);
        });

        // Keyboard controls for fullscreen
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('tictactoe-game').classList.contains('active')) {
                switch (e.key) {
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
    }

    toggleGameMode() {
        this.gameMode = this.gameMode === 'human' ? 'ai' : 'human';
        this.updateModeDisplay();
        this.resetGame();
        this.updateStatus(this.gameMode === 'ai' ? 'Playing against AI!' : 'Playing against human!');
    }

    updateModeDisplay() {
        const modeButton = document.getElementById('toggleMode');
        const aiControls = document.getElementById('aiControls');
        
        if (this.gameMode === 'ai') {
            modeButton.textContent = 'VS HUMAN';
            aiControls.style.display = 'flex';
        } else {
            modeButton.textContent = 'VS AI';
            aiControls.style.display = 'none';
        }
    }

    makeMove(index) {
        try {
            if (!this.gameActive || this.board[index] !== '') {
                return;
            }

            this.board[index] = this.currentPlayer;
            this.moveCount++;
            
            // Record move in history
            this.gameHistory.push({
                player: this.currentPlayer,
                position: index,
                moveNumber: this.moveCount
            });
            
            this.updateCell(index);
            this.playMoveSound();

            if (this.checkWin()) {
                this.handleWin();
            } else if (this.checkDraw()) {
                this.handleDraw();
            } else {
                this.switchPlayer();
                
                // AI move if in AI mode and it's AI's turn
                if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
                    setTimeout(() => {
                        this.makeAIMove();
                    }, 500);
                }
            }
        } catch (error) {
            console.error('TicTacToe: Error in makeMove:', error);
        }
    }

    makeAIMove() {
        if (!this.gameActive) return;

        let move;
        switch (this.aiDifficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.7 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
            default:
                move = this.getBestMove();
        }

        if (move !== -1) {
            this.makeMove(move);
        }
    }

    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : -1)
            .filter(index => index !== -1);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : -1;
    }

    getBestMove() {
        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Block opponent's winning move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWin()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Take center if available
        if (this.board[4] === '') {
            return 4;
        }

        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // Take any available edge
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(i => this.board[i] === '');
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }

        return -1;
    }

    updateCell(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = this.board[index];
        cell.classList.add(this.board[index].toLowerCase());
        
        // Add enhanced animation
        cell.style.animation = 'none';
        cell.offsetHeight; // Trigger reflow
        cell.style.animation = 'placeSymbol 0.4s ease-out';
        
        // Highlight last move
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('last-move'));
        cell.classList.add('last-move');
        
        // Update move counter
        this.updateMoveCounter();
    }

    checkWin() {
        return this.winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    getWinningCombination() {
        return this.winningCombinations.find(combination => {
            const [a, b, c] = combination;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }

    handleWin() {
        this.gameActive = false;
        this.scores[this.currentPlayer]++;
        this.updateScores();
        
        const winningCombo = this.getWinningCombination();
        console.log('Winning combination:', winningCombo);
        
        // Delay the highlighting slightly to ensure it happens after the last move
        setTimeout(() => {
            this.highlightWinningCells(winningCombo);
        }, 50);
        
        this.playWinSound();
        this.updateStatus(`Player ${this.currentPlayer} wins! 🎉`);
        
        // Delay disabling the board to allow highlighting to complete
        setTimeout(() => {
            this.disableBoard();
        }, 100);
    }

    handleDraw() {
        this.gameActive = false;
        this.playDrawSound();
        this.updateStatus("It's a draw! 🤝");
        this.disableBoard();
    }

    highlightWinningCells(combination) {
        console.log('Highlighting cells:', combination);
        
        // First, clear any existing winning highlights
        document.querySelectorAll('.cell.winning').forEach(cell => {
            cell.classList.remove('winning');
        });
        
        // Then add winning class to all cells in the combination
        combination.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            console.log(`Cell ${index}:`, cell);
            if (cell) {
                // Force a reflow to ensure the class is applied
                cell.offsetHeight;
                cell.classList.add('winning');
                console.log(`Added winning class to cell ${index}`);
                
                // Double-check the class was added
                setTimeout(() => {
                    console.log(`Cell ${index} classes:`, cell.className);
                }, 100);
            } else {
                console.error(`Cell ${index} not found!`);
            }
        });
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
        this.updateStatus(`Player ${this.currentPlayer}'s turn`);
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveCount = 0;
        this.gameHistory = [];
        
        // Clear all cells
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // Re-enable board
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.classList.remove('game-over');
        
        this.updateDisplay();
        this.updateStatus('New game! Player X starts!');
    }

    resetScore() {
        this.scores = { X: 0, O: 0 };
        this.updateScores();
        this.resetGame();
        this.updateStatus('Scores reset! New game!');
    }

    updateDisplay() {
        document.getElementById('currentPlayer').textContent = this.currentPlayer;
    }

    updateScores() {
        document.getElementById('scoreX').textContent = this.scores.X;
        document.getElementById('scoreO').textContent = this.scores.O;
    }

    updateStatus(message) {
        const statusElement = document.getElementById('gameStatus');
        statusElement.textContent = message;
    }

    updateMoveCounter() {
        const moveCounter = document.getElementById('moveCounter');
        if (moveCounter) {
            moveCounter.textContent = `Move: ${this.moveCount}`;
        }
    }

    disableBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.classList.add('game-over');
    }

    // Retro Sound Effects (using Web Audio API)
    createAudioContext() {
        if (!this.audioContext) {
            this.audioContext = window.sharedAudioContext || new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playMoveSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playWinSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Victory fanfare
        const frequencies = [523, 659, 784, 1047, 1319, 1568];
        const timeStep = 0.15;
        
        frequencies.forEach((freq, index) => {
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * timeStep);
        });
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + frequencies.length * timeStep);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + frequencies.length * timeStep);
    }

    playDrawSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Draw sound (lower pitch)
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    playButtonSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
}

// Export the class for use in app.js
window.RetroTicTacToe = RetroTicTacToe; 