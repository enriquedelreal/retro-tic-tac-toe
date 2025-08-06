// Retro Checkers - Game Logic

class RetroCheckers {
    constructor() {
        this.board = this.createBoard();
        this.currentPlayer = 'red'; // 'red' or 'black'
        this.gameActive = true;
        this.scores = { red: 0, black: 0 };
        this.gameMode = 'human'; // 'human' or 'ai'
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveCount = 0;
        this.gameHistory = [];
        
        this.initializeGame();
        this.setupEventListeners();
    }

    createBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                // Place pieces on dark squares only
                if ((row + col) % 2 === 1) {
                    if (row < 3) {
                        board[row][col] = { type: 'black', isKing: false };
                    } else if (row > 4) {
                        board[row][col] = { type: 'red', isKing: false };
                    } else {
                        board[row][col] = null;
                    }
                } else {
                    board[row][col] = null;
                }
            }
        }
        return board;
    }

    initializeGame() {
        this.renderBoard();
        this.updateDisplay();
        this.updateStatus('Red player starts!');
    }

    setupEventListeners() {
        // Checkers board click events
        document.getElementById('checkersBoard').addEventListener('click', (e) => {
            if (e.target.classList.contains('checkers-cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                this.handleCellClick(row, col);
            }
        });

        // Button events
        document.getElementById('checkersResetGame').addEventListener('click', () => {
            this.playButtonSound();
            this.resetGame();
        });

        document.getElementById('checkersResetScore').addEventListener('click', () => {
            this.playButtonSound();
            this.resetScore();
        });

        // Mode toggle
        document.getElementById('checkersToggleMode').addEventListener('click', () => {
            this.playButtonSound();
            this.toggleGameMode();
        });

        // Difficulty selector
        document.getElementById('checkersAiDifficulty').addEventListener('change', (e) => {
            this.aiDifficulty = e.target.value;
            this.updateStatus(`AI difficulty set to ${this.aiDifficulty}`);
        });

        // Keyboard controls for fullscreen
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('checkers-game').classList.contains('active')) {
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

    handleCellClick(row, col) {
        if (!this.gameActive) return;

        const piece = this.board[row][col];
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        // If clicking on a piece of current player
        if (piece && piece.type === this.currentPlayer) {
            this.selectPiece(row, col);
        }
        // If clicking on a valid move destination
        else if (this.selectedPiece && this.isValidMove(row, col)) {
            this.makeMove(row, col);
        }
        // If clicking on empty cell, deselect
        else if (!piece) {
            this.deselectPiece();
        }
    }

    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        this.validMoves = this.getValidMoves(row, col);
        
        // Update visual selection
        document.querySelectorAll('.checkers-cell').forEach(cell => {
            cell.classList.remove('selected', 'valid-move');
        });
        
        const selectedCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        selectedCell.classList.add('selected');
        
        // Highlight valid moves
        this.validMoves.forEach(move => {
            const moveCell = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            moveCell.classList.add('valid-move');
        });
        
        this.playSelectSound();
    }

    deselectPiece() {
        this.selectedPiece = null;
        this.validMoves = [];
        
        document.querySelectorAll('.checkers-cell').forEach(cell => {
            cell.classList.remove('selected', 'valid-move');
        });
    }

    isValidMove(row, col) {
        return this.validMoves.some(move => move.row === row && move.col === col);
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.type !== this.currentPlayer) {
            console.log(`No valid moves for piece at ${row},${col}: piece=${piece}, currentPlayer=${this.currentPlayer}`);
            return [];
        }

        const moves = [];
        const directions = piece.isKing ? [-1, 1] : (piece.type === 'red' ? [-1] : [1]);

        // Check regular moves
        for (const rowDir of directions) {
            for (const colDir of [-1, 1]) {
                const newRow = row + rowDir;
                const newCol = col + colDir;
                
                if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === null) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                }
            }
        }

        // Check jumps
        for (const rowDir of directions) {
            for (const colDir of [-1, 1]) {
                const jumpRow = row + rowDir * 2;
                const jumpCol = col + colDir * 2;
                const middleRow = row + rowDir;
                const middleCol = col + colDir;
                
                if (this.isValidPosition(jumpRow, jumpCol) && 
                    this.board[jumpRow][jumpCol] === null &&
                    this.board[middleRow][middleCol] &&
                    this.board[middleRow][middleCol].type !== piece.type) {
                    moves.push({ row: jumpRow, col: jumpCol, type: 'jump', captured: { row: middleRow, col: middleCol } });
                }
            }
        }

        console.log(`Valid moves for piece at ${row},${col}:`, moves);
        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    makeMove(row, col) {
        if (!this.selectedPiece || !this.isValidMove(row, col)) return;

        const move = this.validMoves.find(m => m.row === row && m.col === col);
        const piece = this.board[this.selectedPiece.row][this.selectedPiece.col];
        
        // Move piece
        this.board[row][col] = { ...piece };
        this.board[this.selectedPiece.row][this.selectedPiece.col] = null;
        
        // Handle capture
        if (move.type === 'jump') {
            this.board[move.captured.row][move.captured.col] = null;
            this.playCaptureSound();
        } else {
            this.playMoveSound();
        }
        
        // Check for king promotion
        if ((piece.type === 'red' && row === 0) || (piece.type === 'black' && row === 7)) {
            this.board[row][col].isKing = true;
            this.playKingSound();
        }
        
        this.moveCount++;
        this.gameHistory.push({
            player: this.currentPlayer,
            from: { row: this.selectedPiece.row, col: this.selectedPiece.col },
            to: { row, col },
            moveNumber: this.moveCount,
            type: move.type
        });
        
        this.deselectPiece();
        this.renderBoard();
        this.updateMoveCounter();
        
        // Check for win
        if (this.checkWin()) {
            this.handleWin();
        } else {
            this.switchPlayer();
            
            // AI move if in AI mode and it's AI's turn
            if (this.gameMode === 'ai' && this.currentPlayer === 'black') {
                console.log('Triggering AI move...');
                setTimeout(() => {
                    this.makeAIMove();
                }, 500);
            }
        }
    }

    checkWin() {
        const redPieces = this.countPieces('red');
        const blackPieces = this.countPieces('black');
        
        if (redPieces === 0) {
            return 'black';
        } else if (blackPieces === 0) {
            return 'red';
        }
        
        // Check if current player has no valid moves
        const currentPlayerPieces = this.getAllPieces(this.currentPlayer);
        const hasValidMoves = currentPlayerPieces.some(({ row, col }) => 
            this.getValidMoves(row, col).length > 0
        );
        
        if (!hasValidMoves) {
            return this.currentPlayer === 'red' ? 'black' : 'red';
        }
        
        return null;
    }

    countPieces(player) {
        let count = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.board[row][col].type === player) {
                    count++;
                }
            }
        }
        return count;
    }

    getAllPieces(player) {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.board[row][col].type === player) {
                    pieces.push({ row, col });
                }
            }
        }
        return pieces;
    }

    handleWin() {
        this.gameActive = false;
        const winner = this.checkWin();
        this.scores[winner]++;
        this.updateScores();
        
        this.playWinSound();
        this.updateStatus(`${winner.toUpperCase()} player wins! 🎉`);
    }

    makeAIMove() {
        if (!this.gameActive) return;

        console.log('AI making move...');
        console.log('Current player:', this.currentPlayer);
        console.log('Game mode:', this.gameMode);

        // Force AI to be black player
        const originalPlayer = this.currentPlayer;
        this.currentPlayer = 'black';

        let move;
        switch (this.aiDifficulty) {
            case 'easy':
                move = this.getRandomAIMove();
                break;
            case 'medium':
                move = Math.random() < 0.7 ? this.getBestAIMove() : this.getRandomAIMove();
                break;
            case 'hard':
                move = this.getBestAIMove();
                break;
            default:
                move = this.getBestAIMove();
        }

        console.log('AI move found:', move);

        if (move) {
            this.selectedPiece = { row: move.from.row, col: move.from.col };
            this.makeMove(move.to.row, move.to.col);
        } else {
            console.log('No valid AI move found! Trying fallback...');
            
            // Fallback: try to move any black piece forward
            const pieces = this.getAllPieces('black');
            for (const { row, col } of pieces) {
                // Try to move forward and left or right
                const directions = [[1, -1], [1, 1]]; // Down-left, Down-right
                for (const [rowDir, colDir] of directions) {
                    const newRow = row + rowDir;
                    const newCol = col + colDir;
                    if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === null) {
                        console.log('Fallback move found:', { from: { row, col }, to: { row: newRow, col: newCol } });
                        this.selectedPiece = { row, col };
                        this.makeMove(newRow, newCol);
                        return;
                    }
                }
            }
            
            console.log('No fallback moves either!');
            // If no move found, switch back to player
            this.currentPlayer = originalPlayer;
            this.switchPlayer();
        }
    }

    getRandomAIMove() {
        const pieces = this.getAllPieces('black');
        console.log('AI pieces:', pieces);
        const validMoves = [];
        
        pieces.forEach(({ row, col }) => {
            const moves = this.getValidMoves(row, col);
            console.log(`Moves for piece at ${row},${col}:`, moves);
            moves.forEach(move => {
                validMoves.push({
                    from: { row, col },
                    to: { row: move.row, col: move.col },
                    type: move.type
                });
            });
        });
        
        console.log('All valid AI moves:', validMoves);
        
        if (validMoves.length === 0) {
            console.log('No valid moves found for AI!');
            // Handle no valid moves - game over for black
            this.handleWin('red');
            return null;
        }
        
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        console.log('Selected random move:', randomMove);
        return randomMove;
    }

    getBestAIMove() {
        const pieces = this.getAllPieces('black');
        console.log('Best AI - pieces:', pieces);
        let bestMove = null;
        let bestScore = -Infinity;
        
        pieces.forEach(({ row, col }) => {
            const moves = this.getValidMoves(row, col);
            console.log(`Best AI - moves for piece at ${row},${col}:`, moves);
            moves.forEach(move => {
                // Prioritize captures
                const score = move.type === 'jump' ? 10 : 1;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = {
                        from: { row, col },
                        to: { row: move.row, col: move.col },
                        type: move.type
                    };
                }
            });
        });
        
        console.log('Best AI move:', bestMove);
        if (bestMove) {
            return bestMove;
        } else {
            // If no best move found, try random move
            const randomMove = this.getRandomAIMove();
            if (randomMove === null) {
                // No valid moves at all - game over
                this.handleWin('red');
                return null;
            }
            return randomMove;
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('checkersBoard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'checkers-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Set cell color
                if ((row + col) % 2 === 0) {
                    cell.classList.add('light');
                } else {
                    cell.classList.add('dark');
                }
                
                // Add piece if present
                const piece = this.board[row][col];
                if (piece) {
                    if (piece.isKing) {
                        cell.classList.add(`${piece.type}-king`);
                        cell.textContent = '👑';
                    } else {
                        cell.classList.add(`${piece.type}-piece`);
                        cell.textContent = piece.type === 'red' ? '🔴' : '⚫';
                    }
                }
                
                boardElement.appendChild(cell);
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.updateDisplay();
        this.updateStatus(`${this.currentPlayer.toUpperCase()} player's turn`);
    }

    toggleGameMode() {
        this.gameMode = this.gameMode === 'human' ? 'ai' : 'human';
        this.updateModeDisplay();
        this.resetGame();
        this.updateStatus(this.gameMode === 'ai' ? 'Playing against AI!' : 'Playing against human!');
    }

    updateModeDisplay() {
        const modeButton = document.getElementById('checkersToggleMode');
        const aiControls = document.getElementById('checkersAiControls');
        
        if (this.gameMode === 'ai') {
            modeButton.textContent = 'VS HUMAN';
            aiControls.style.display = 'flex';
        } else {
            modeButton.textContent = 'VS AI';
            aiControls.style.display = 'none';
        }
    }

    resetGame() {
        this.board = this.createBoard();
        this.currentPlayer = 'red';
        this.gameActive = true;
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveCount = 0;
        this.gameHistory = [];
        
        this.renderBoard();
        this.updateDisplay();
        this.updateStatus('New game! Red player starts!');
    }

    resetScore() {
        this.scores = { red: 0, black: 0 };
        this.updateScores();
        this.resetGame();
        this.updateStatus('Scores reset! New game!');
    }

    updateDisplay() {
        document.getElementById('checkersCurrentPlayer').textContent = 
            this.currentPlayer === 'red' ? '🔴' : '⚫';
    }

    updateScores() {
        document.getElementById('scoreRed').textContent = this.countPieces('red');
        document.getElementById('scoreBlack').textContent = this.countPieces('black');
    }

    updateStatus(message) {
        const statusElement = document.getElementById('checkersGameStatus');
        statusElement.textContent = message;
    }

    updateMoveCounter() {
        const moveCounter = document.getElementById('checkersMoveCounter');
        if (moveCounter) {
            moveCounter.textContent = this.moveCount;
        }
    }

    // Retro Sound Effects
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
        
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playCaptureSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Capture sound (descending tone)
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playSelectSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(700, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    playKingSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // King promotion fanfare
        const frequencies = [523, 659, 784, 1047];
        const timeStep = 0.1;
        
        frequencies.forEach((freq, index) => {
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * timeStep);
        });
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + frequencies.length * timeStep);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + frequencies.length * timeStep);
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
window.RetroCheckers = RetroCheckers;  