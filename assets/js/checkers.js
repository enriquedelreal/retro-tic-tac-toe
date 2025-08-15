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

        // In AI mode, don't allow human to control black pieces
        if (this.gameMode === 'ai' && this.currentPlayer === 'black') {
            console.log('Checkers: AI turn - human cannot move');
            this.updateStatus('Wait for AI to move...');
            return;
        }

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
        // Kings can move in all directions, regular pieces only forward
        const directions = piece.isKing ? [-1, 1] : (piece.type === 'red' ? [-1] : [1]);

        console.log(`Calculating moves for ${piece.type} ${piece.isKing ? 'KING' : 'piece'} at (${row},${col})`);
        console.log(`Move directions: [${directions.join(', ')}]`);

        // Check regular moves first
        for (const rowDir of directions) {
            for (const colDir of [-1, 1]) {
                const newRow = row + rowDir;
                const newCol = col + colDir;
                
                if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === null) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                    console.log(`  Regular move: (${row},${col}) -> (${newRow},${newCol})`);
                }
            }
        }

        // Check jumps (captures) - PRIORITY!
        for (const rowDir of directions) {
            for (const colDir of [-1, 1]) {
                const jumpRow = row + rowDir * 2;
                const jumpCol = col + colDir * 2;
                const middleRow = row + rowDir;
                const middleCol = col + colDir;
                
                console.log(`  Checking jump: (${row},${col}) -> (${middleRow},${middleCol}) -> (${jumpRow},${jumpCol})`);
                
                if (this.isValidPosition(jumpRow, jumpCol)) {
                    const middlePiece = this.board[middleRow][middleCol];
                    const targetCell = this.board[jumpRow][jumpCol];
                    
                    console.log(`    Middle piece: ${middlePiece ? middlePiece.type : 'empty'}`);
                    console.log(`    Target cell: ${targetCell ? 'occupied' : 'empty'}`);
                    
                    if (targetCell === null && middlePiece && middlePiece.type !== piece.type) {
                        moves.push({ 
                            row: jumpRow, 
                            col: jumpCol, 
                            type: 'jump', 
                            captured: { row: middleRow, col: middleCol } 
                        });
                        console.log(`  *** JUMP FOUND! (${row},${col}) -> (${jumpRow},${jumpCol}) capturing ${middlePiece.type} at (${middleRow},${middleCol})`);
                    }
                }
            }
        }

        console.log(`Total valid moves for piece at (${row},${col}):`, moves.length);
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
            console.log('Checkers: Checking AI move conditions:');
            console.log('  - Game mode:', this.gameMode);
            console.log('  - Current player:', this.currentPlayer);
            console.log('  - Should AI move?', this.gameMode === 'ai' && this.currentPlayer === 'black');
            
            if (this.gameMode === 'ai' && this.currentPlayer === 'black') {
                console.log('Checkers: Scheduling AI move in 500ms');
                this.updateStatus('AI is thinking...');
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
        if (!this.gameActive || this.currentPlayer !== 'black') {
            console.log('AI: Cannot move - game not active or not AI turn');
            return;
        }

        console.log('AI: Making move with difficulty:', this.aiDifficulty);

        let move;
        try {
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
        } catch (error) {
            console.error('AI: Error calculating move:', error);
            move = this.getRandomAIMove();
        }

        console.log('AI: Selected move:', move);

        if (move) {
            console.log('AI: Executing move from', move.from, 'to', move.to);
            
            // Set the selected piece and make the move
            this.selectedPiece = { row: move.from.row, col: move.from.col };
            
            // Update valid moves for the selected piece
            this.validMoves = this.getValidMoves(move.from.row, move.from.col);
            console.log('AI: Valid moves for selected piece:', this.validMoves);
            
            // Check if the target move is actually valid
            const isValidTarget = this.isValidMove(move.to.row, move.to.col);
            console.log('AI: Is target move valid?', isValidTarget);
            
            if (isValidTarget) {
                this.makeMove(move.to.row, move.to.col);
                console.log('AI: Move executed successfully');
            } else {
                console.error('AI: Target move is not valid!');
                // Try a fallback random move
                this.selectedPiece = null;
                const fallbackMove = this.getRandomAIMove();
                if (fallbackMove) {
                    this.selectedPiece = { row: fallbackMove.from.row, col: fallbackMove.from.col };
                    this.validMoves = this.getValidMoves(fallbackMove.from.row, fallbackMove.from.col);
                    this.makeMove(fallbackMove.to.row, fallbackMove.to.col);
                }
            }
        } else {
            console.log('AI: No valid moves available - AI loses');
            this.handleWin();
        }
    }

    getRandomAIMove() {
        const pieces = this.getAllPieces('black');
        const validMoves = [];
        
        pieces.forEach(({ row, col }) => {
            const moves = this.getValidMoves(row, col);
            moves.forEach(move => {
                validMoves.push({
                    from: { row, col },
                    to: { row: move.row, col: move.col },
                    type: move.type
                });
            });
        });
        
        console.log('AI: Found', validMoves.length, 'valid moves');
        
        if (validMoves.length === 0) {
            console.log('AI: No valid moves available');
            return null;
        }
        
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        console.log('AI: Selected random move from', randomMove.from, 'to', randomMove.to);
        return randomMove;
    }

    getBestAIMove() {
        const pieces = this.getAllPieces('black');
        let bestMove = null;
        let bestScore = -Infinity;
        
        console.log('AI: Analyzing all black pieces for best move...');
        
        pieces.forEach(({ row, col }) => {
            const piece = this.board[row][col];
            const moves = this.getValidMoves(row, col);
            console.log(`AI: Piece at (${row},${col}) ${piece.isKing ? '(King)' : '(Regular)'} has ${moves.length} moves:`, moves);
            
            moves.forEach(move => {
                let score = 1; // Base score for any move
                
                // HIGHEST PRIORITY: Captures (jumps)
                if (move.type === 'jump') {
                    score = 100; // Much higher priority for captures
                    console.log(`AI: CAPTURE OPPORTUNITY! From (${row},${col}) to (${move.row},${move.col}) - Score: ${score}`);
                    
                    // Extra points for king captures
                    if (piece.isKing) {
                        score += 20;
                        console.log(`AI: King making capture - bonus points! Score: ${score}`);
                    }
                } else {
                    // Regular move scoring
                    // Prefer moves that advance pieces (for non-kings)
                    if (!piece.isKing && move.row > row) { // Moving forward (down the board)
                        score += 3;
                    }
                    
                    // Prefer moves toward center columns
                    const centerDistance = Math.abs(move.col - 3.5);
                    score += (4 - centerDistance);
                    
                    // Kings get slight bonus for any move
                    if (piece.isKing) {
                        score += 2;
                    }
                }
                
                console.log(`AI: Move from (${row},${col}) to (${move.row},${move.col}) - Type: ${move.type}, Score: ${score}`);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = {
                        from: { row, col },
                        to: { row: move.row, col: move.col },
                        type: move.type
                    };
                    console.log(`AI: NEW BEST MOVE! Score: ${bestScore}`, bestMove);
                }
            });
        });
        
        console.log('AI: Final best move with score', bestScore, ':', bestMove);
        
        if (bestMove) {
            return bestMove;
        } else {
            // Fallback to random move
            console.log('AI: No best move found, falling back to random');
            return this.getRandomAIMove();
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
        const oldMode = this.gameMode;
        this.gameMode = this.gameMode === 'human' ? 'ai' : 'human';
        console.log('Checkers: Mode toggled from', oldMode, 'to', this.gameMode);
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

// Global test function for checkers AI
window.testCheckersAI = function() {
    if (window.retroArcade && window.retroArcade.games && window.retroArcade.games.checkers) {
        const game = window.retroArcade.games.checkers;
        console.log('=== TESTING CHECKERS AI ===');
        console.log('Current game mode:', game.gameMode);
        console.log('Current player:', game.currentPlayer);
        console.log('Game active:', game.gameActive);
        
        // Force AI mode and black turn for testing
        game.gameMode = 'ai';
        game.currentPlayer = 'black';
        
        console.log('Forcing AI move...');
        game.makeAIMove();
    } else {
        console.log('Checkers game not found for testing');
    }
};  