// Retro Tic Tac Toe - Game Logic

class RetroTicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        this.gameMode = 'human'; // 'human', 'ai', or 'multiplayer'
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
        console.log('TicTacToe: Initializing game in', this.gameMode, 'mode');
        
        this.updateDisplay();
        this.updateStatus('Player X starts!');
        
        // Delay mode display update to ensure DOM elements exist
        setTimeout(() => {
            this.updateModeDisplay();
        }, 100);
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
        const resetGameBtn = document.getElementById('resetGame');
        if (resetGameBtn) {
            resetGameBtn.addEventListener('click', () => {
                this.playButtonSound();
                this.resetGame();
            });
        }

        const resetScoreBtn = document.getElementById('resetScore');
        if (resetScoreBtn) {
            resetScoreBtn.addEventListener('click', () => {
                this.playButtonSound();
                this.resetScore();
            });
        }

        // Mode toggle
        const toggleModeBtn = document.getElementById('toggleMode');
        if (toggleModeBtn) {
            toggleModeBtn.addEventListener('click', () => {
                console.log('TicTacToe: Toggle mode button clicked');
                this.playButtonSound();
                this.toggleGameMode();
            });
        }

        // Difficulty selector
        const aiDifficultySelect = document.getElementById('aiDifficulty');
        if (aiDifficultySelect) {
            aiDifficultySelect.addEventListener('change', (e) => {
                this.aiDifficulty = e.target.value;
                console.log('TicTacToe: AI difficulty changed to:', this.aiDifficulty);
                this.updateStatus(`AI difficulty set to ${this.aiDifficulty}`);
            });
        }

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
        const oldMode = this.gameMode;
        this.gameMode = this.gameMode === 'human' ? 'ai' : 'human';
        console.log('TicTacToe: Mode toggled from', oldMode, 'to', this.gameMode);
        this.updateModeDisplay();
        this.resetGame();
        this.updateStatus(this.gameMode === 'ai' ? 'Playing against AI!' : 'Playing against human!');
    }

    updateModeDisplay() {
        const modeButton = document.getElementById('toggleMode');
        const aiControls = document.getElementById('aiControls');
        
        console.log('TicTacToe: Updating mode display for mode:', this.gameMode);
        
        if (modeButton) {
            if (this.gameMode === 'ai') {
                modeButton.textContent = 'VS HUMAN';
            } else {
                modeButton.textContent = 'VS AI';
            }
        } else {
            console.warn('TicTacToe: Mode button not found');
        }
        
        if (aiControls) {
            if (this.gameMode === 'ai') {
                aiControls.style.display = 'flex';
            } else {
                aiControls.style.display = 'none';
            }
        } else {
            console.warn('TicTacToe: AI controls not found');
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
                    console.log('TicTacToe: Scheduling AI move');
                    setTimeout(() => {
                        this.makeAIMove();
                    }, 500);
                    
                    // Failsafe: try again after 2 seconds if the AI hasn't moved
                    setTimeout(() => {
                        if (this.gameActive && this.currentPlayer === 'O' && this.gameMode === 'ai') {
                            console.log('TicTacToe: Failsafe AI move triggered');
                            this.makeAIMove();
                        }
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('TicTacToe: Error in makeMove:', error);
        }
    }

    makeAIMove() {
        if (!this.gameActive) {
            console.log('AI: Game not active, skipping move');
            return;
        }

        if (this.currentPlayer !== 'O') {
            console.log('AI: Not AI turn, current player is:', this.currentPlayer);
            return;
        }

        console.log('AI: Making move with difficulty:', this.aiDifficulty);
        console.log('AI: Current board state:', this.board);

        let move = -1;
        
        try {
            switch (this.aiDifficulty) {
                case 'easy':
                    move = this.getRandomMove();
                    console.log('AI: Easy mode, random move:', move);
                    break;
                case 'medium':
                    const useStrategy = Math.random() < 0.7;
                    move = useStrategy ? this.getBestMove() : this.getRandomMove();
                    console.log('AI: Medium mode, use strategy:', useStrategy, 'move:', move);
                    break;
                case 'hard':
                    move = this.getBestMove();
                    console.log('AI: Hard mode, best move:', move);
                    break;
                default:
                    move = this.getBestMove();
                    console.log('AI: Default mode, best move:', move);
            }
        } catch (error) {
            console.error('AI: Error calculating move:', error);
            move = this.getRandomMove(); // Fallback to random
        }

        console.log('AI: Selected move:', move);
        
        if (move !== -1 && move >= 0 && move <= 8 && this.board[move] === '') {
            console.log('AI: Making move at position:', move);
            this.makeMove(move);
        } else {
            console.error('AI: Invalid move selected or position occupied:', move, 'Board position:', this.board[move]);
            // Try a random fallback
            const fallbackMove = this.getRandomMove();
            if (fallbackMove !== -1) {
                console.log('AI: Using fallback move:', fallbackMove);
                this.makeMove(fallbackMove);
            }
        }
    }

    getRandomMove() {
        const availableMoves = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                availableMoves.push(i);
            }
        }
        
        if (availableMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableMoves.length);
            const move = availableMoves[randomIndex];
            console.log('AI: Random move selected:', move);
            return move;
        }
        
        return -1;
    }

    getBestMove() {
        // Check for winning move first
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWin()) {
                    this.board[i] = '';
                    console.log('AI: Found winning move at position:', i);
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
                    console.log('AI: Found blocking move at position:', i);
                    return i;
                }
                this.board[i] = '';
            }
        }

        // Take center if available
        if (this.board[4] === '') {
            console.log('AI: Taking center position');
            return 4;
        }

        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            const cornerMove = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            console.log('AI: Taking corner position:', cornerMove);
            return cornerMove;
        }

        // Take any available edge
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(i => this.board[i] === '');
        if (availableEdges.length > 0) {
            const edgeMove = availableEdges[Math.floor(Math.random() * availableEdges.length)];
            console.log('AI: Taking edge position:', edgeMove);
            return edgeMove;
        }

        console.log('AI: No moves available');
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
        this.updateStatus(`Player ${this.currentPlayer} wins! 🎉 Starting new game...`);
        
        // Delay disabling the board to allow highlighting to complete
        setTimeout(() => {
            this.disableBoard();
        }, 100);
        
        // Automatically reset the board after 2 seconds - Simple approach
        console.log('TicTacToe: Setting auto-reset timer for win');
        setTimeout(() => {
            console.log('TicTacToe: Auto-reset timer fired - clearing board now');
            
            // Simple board clear
            this.board = Array(9).fill('');
            this.currentPlayer = 'X';
            this.gameActive = true;
            this.moveCount = 0;
            this.gameHistory = [];
            
            // Clear cells directly
            for (let i = 0; i < 9; i++) {
                const cell = document.querySelector(`[data-index="${i}"]`);
                if (cell) {
                    cell.textContent = '';
                    cell.className = 'cell';
                }
            }
            
            // Re-enable board
            const gameBoard = document.getElementById('gameBoard');
            if (gameBoard) {
                gameBoard.classList.remove('game-over');
            }
            
            this.updateDisplay();
            this.updateStatus('New game! Player X starts!');
            console.log('TicTacToe: Auto-reset completed successfully');
            
        }, 2000);
    }

    handleDraw() {
        this.gameActive = false;
        this.playDrawSound();
        this.updateStatus("It's a draw! 🤝 Starting new game...");
        this.disableBoard();
        
        // Automatically reset the board after 2 seconds - Simple approach
        console.log('TicTacToe: Setting auto-reset timer for draw');
        setTimeout(() => {
            console.log('TicTacToe: Auto-reset timer fired - clearing board after draw');
            
            // Simple board clear
            this.board = Array(9).fill('');
            this.currentPlayer = 'X';
            this.gameActive = true;
            this.moveCount = 0;
            this.gameHistory = [];
            
            // Clear cells directly
            for (let i = 0; i < 9; i++) {
                const cell = document.querySelector(`[data-index="${i}"]`);
                if (cell) {
                    cell.textContent = '';
                    cell.className = 'cell';
                }
            }
            
            // Re-enable board
            const gameBoard = document.getElementById('gameBoard');
            if (gameBoard) {
                gameBoard.classList.remove('game-over');
            }
            
            this.updateDisplay();
            this.updateStatus('New game! Player X starts!');
            console.log('TicTacToe: Draw auto-reset completed successfully');
            
        }, 2000);
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
        console.log('TicTacToe: resetGame() called');
        
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveCount = 0;
        this.gameHistory = [];
        
        // Clear all cells
        for (let i = 0; i < 9; i++) {
            const cell = document.querySelector(`[data-index="${i}"]`);
            if (cell) {
                cell.textContent = '';
                cell.className = 'cell';
            }
        }
        
        // Re-enable board
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.classList.remove('game-over');
        }
        
        this.updateDisplay();
        this.updateStatus('New game! Player X starts!');
        console.log('TicTacToe: resetGame() completed');
    }

    resetScore() {
        this.scores = { X: 0, O: 0 };
        this.updateScores();
        this.resetGame();
        this.updateStatus('Scores reset! New game!');
    }

    // Test function to manually trigger auto-reset
    testAutoReset() {
        console.log('=== TESTING AUTO-RESET ===');
        console.log('TicTacToe: Auto-reset test - clearing board now');
        
        // Simple board clear
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveCount = 0;
        this.gameHistory = [];
        
        // Clear cells directly
        for (let i = 0; i < 9; i++) {
            const cell = document.querySelector(`[data-index="${i}"]`);
            if (cell) {
                cell.textContent = '';
                cell.className = 'cell';
                console.log(`TicTacToe: Test cleared cell ${i}: ${cell.textContent === '' ? 'SUCCESS' : 'FAILED'}`);
            } else {
                console.log(`TicTacToe: Test - could not find cell ${i}`);
            }
        }
        
        // Re-enable board
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.classList.remove('game-over');
            console.log('TicTacToe: Test - re-enabled game board');
        }
        
        this.updateDisplay();
        this.updateStatus('Test auto-reset completed! Player X starts!');
        console.log('TicTacToe: Test auto-reset completed successfully');
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

    // Multiplayer Integration Methods
    setGameMode(mode) {
        this.gameMode = mode;
        this.updateModeDisplay();
        this.resetGame();
    }

    updateFromServer(gameState) {
        // Update game state from server
        this.board = [...gameState.board];
        this.currentPlayer = gameState.currentPlayer;
        this.gameActive = gameState.gameActive;
        this.scores = { ...gameState.scores };
        
        // Update display
        this.updateDisplay();
        
        // Update status based on game state
        if (!this.gameActive) {
            if (this.checkWin()) {
                this.handleWin();
            } else if (this.checkDraw()) {
                this.handleDraw();
            }
        } else {
            this.updateStatus(`Player ${this.currentPlayer}'s turn`);
        }
    }

    makeMove(index) {
        try {
            if (!this.gameActive || this.board[index] !== '') {
                return;
            }

            // Check if it's the player's turn in multiplayer mode
            if (this.gameMode === 'multiplayer' && multiplayerManager) {
                if (!multiplayerManager.isMyTurn()) {
                    this.updateStatus("It's not your turn!");
                    return;
                }
                
                // Send move to server
                multiplayerManager.makeMove(index);
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
                    console.log('TicTacToe: Scheduling AI move');
                    setTimeout(() => {
                        this.makeAIMove();
                    }, 500);
                    
                    // Failsafe: try again after 2 seconds if the AI hasn't moved
                    setTimeout(() => {
                        if (this.gameActive && this.currentPlayer === 'O' && this.gameMode === 'ai') {
                            console.log('TicTacToe: Failsafe AI move triggered');
                            this.makeAIMove();
                        }
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('TicTacToe: Error in makeMove:', error);
        }
    }

    resetGame() {
        // If in multiplayer mode, send reset to server
        if (this.gameMode === 'multiplayer' && multiplayerManager) {
            multiplayerManager.resetGame();
            return;
        }

        console.log('TicTacToe: resetGame() called');
        
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
        
        // Remove game over styling
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.classList.remove('game-over');
        }
        
        this.updateDisplay();
        this.updateStatus('Player X starts!');
        
        console.log('TicTacToe: resetGame() completed');
    }
}

// Export the class for use in app.js
window.RetroTicTacToe = RetroTicTacToe;

// Global test function
window.testAutoReset = function() {
    if (window.retroArcade && window.retroArcade.games && window.retroArcade.games.tictactoe) {
        window.retroArcade.games.tictactoe.testAutoReset();
    } else {
        console.log('Game not found for testing');
    }
}; 