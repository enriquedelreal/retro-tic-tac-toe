// Retro 2048 Game

class Retro2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048BestScore')) || 0;
        this.moves = 0;
        this.highestTile = 2;
        this.gameOver = false;
        this.previousBoard = null;
        this.previousScore = 0;
        this.previousMoves = 0;
        this.renderFrame = null;
        
        this.boardElement = document.getElementById('2048Board');
        this.scoreElement = document.getElementById('2048Score');
        this.movesElement = document.getElementById('2048Moves');
        this.bestScoreElement = document.getElementById('2048BestScore');
        this.highestTileElement = document.getElementById('2048HighestTile');
        this.statusElement = document.getElementById('2048GameStatus');
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeGame() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.moves = 0;
        this.highestTile = 2;
        this.gameOver = false;
        this.previousBoard = null;
        this.previousScore = 0;
        this.previousMoves = 0;
        
        this.addRandomTile();
        this.addRandomTile();
        this.createBoard();
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.style.display = 'grid';
        this.boardElement.style.gridTemplateColumns = 'repeat(4, 1fr)';
        this.boardElement.style.gridTemplateRows = 'repeat(4, 1fr)';
        
        let tileCount = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = row;
                tile.dataset.col = col;
                
                const value = this.board[row][col];
                if (value !== 0) {
                    tile.textContent = value;
                    tile.classList.add(`tile-${value}`);
                } else {
                    tile.classList.add('empty');
                }
                
                this.boardElement.appendChild(tile);
                tileCount++;
            }
        }
        console.log(`Created ${tileCount} tiles for 2048 board`);
        console.log(`Grid template: ${this.boardElement.style.gridTemplateColumns} x ${this.boardElement.style.gridTemplateRows}`);
    }

    addRandomTile() {
        const emptyCells = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({row, col});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const {row, col} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
            
            // Add animation class
            const tile = this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (tile) {
                tile.classList.add('new');
                setTimeout(() => tile.classList.remove('new'), 300);
            }
        }
    }

    savePreviousState() {
        this.previousBoard = this.board.map(row => [...row]);
        this.previousScore = this.score;
        this.previousMoves = this.moves;
    }

    canUndo() {
        return this.previousBoard !== null;
    }

    undo() {
        if (this.canUndo()) {
            this.board = this.previousBoard.map(row => [...row]);
            this.score = this.previousScore;
            this.moves = this.previousMoves;
            this.previousBoard = null;
            this.gameOver = false;
            this.createBoard();
            this.updateDisplay();
            this.playButtonSound();
        }
    }

    move(direction) {
        if (this.gameOver) return false;
        
        this.savePreviousState();
        let moved = false;
        
        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.moves++;
            this.addRandomTile();
            this.updateDisplay();
            this.checkGameOver();
            this.playMoveSound();
        }
        
        return moved;
    }

    moveLeft() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const newRow = this.mergeLine(this.board[row]);
            if (JSON.stringify(newRow) !== JSON.stringify(this.board[row])) {
                this.board[row] = newRow;
                moved = true;
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let row = 0; row < 4; row++) {
            const reversedRow = this.board[row].slice().reverse();
            const mergedRow = this.mergeLine(reversedRow);
            const newRow = mergedRow.reverse();
            if (JSON.stringify(newRow) !== JSON.stringify(this.board[row])) {
                this.board[row] = newRow;
                moved = true;
            }
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const column = [this.board[0][col], this.board[1][col], this.board[2][col], this.board[3][col]];
            const mergedColumn = this.mergeLine(column);
            for (let row = 0; row < 4; row++) {
                if (this.board[row][col] !== mergedColumn[row]) {
                    this.board[row][col] = mergedColumn[row];
                    moved = true;
                }
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let col = 0; col < 4; col++) {
            const column = [this.board[0][col], this.board[1][col], this.board[2][col], this.board[3][col]];
            const reversedColumn = column.slice().reverse();
            const mergedColumn = this.mergeLine(reversedColumn);
            const newColumn = mergedColumn.reverse();
            for (let row = 0; row < 4; row++) {
                if (this.board[row][col] !== newColumn[row]) {
                    this.board[row][col] = newColumn[row];
                    moved = true;
                }
            }
        }
        return moved;
    }

    mergeLine(line) {
        // Remove zeros
        let filtered = line.filter(val => val !== 0);
        
        // Merge adjacent equal values
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2;
                this.score += filtered[i];
                this.highestTile = Math.max(this.highestTile, filtered[i]);
                filtered.splice(i + 1, 1);
            }
        }
        
        // Pad with zeros
        while (filtered.length < 4) {
            filtered.push(0);
        }
        
        return filtered;
    }

    checkGameOver() {
        // Check if there are any empty cells
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check if any merges are possible
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const current = this.board[row][col];
                
                // Check right neighbor
                if (col < 3 && this.board[row][col + 1] === current) {
                    return false;
                }
                
                // Check bottom neighbor
                if (row < 3 && this.board[row + 1][col] === current) {
                    return false;
                }
            }
        }
        
        this.gameOver = true;
        this.showGameOver();
        return true;
    }

    showGameOver() {
        this.statusElement.textContent = 'GAME OVER!';
        this.statusElement.style.color = '#ff6b6b';
        this.playGameOverSound();
    }

    updateDisplay() {
        // Direct DOM updates for better performance
        this.scoreElement.textContent = this.score;
        this.movesElement.textContent = this.moves;
        this.bestScoreElement.textContent = this.bestScore;
        this.highestTileElement.textContent = this.highestTile;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048BestScore', this.bestScore);
            this.bestScoreElement.textContent = this.bestScore;
        }
        
        this.createBoard();
    }

    resetGame() {
        this.initializeGame();
        this.updateDisplay();
        this.statusElement.textContent = '';
        this.playButtonSound();
    }

    resetScore() {
        this.bestScore = 0;
        localStorage.removeItem('2048BestScore');
        this.bestScoreElement.textContent = '0';
        this.playButtonSound();
    }

    setupEventListeners() {
        // Button controls
        document.getElementById('2048ResetGame').addEventListener('click', () => this.resetGame());
        document.getElementById('2048ResetScore').addEventListener('click', () => this.resetScore());
        document.getElementById('2048Undo').addEventListener('click', () => this.undo());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('2048-game').classList.contains('active')) {
                switch (e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                        e.preventDefault();
                        this.move('up');
                        break;
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                        e.preventDefault();
                        this.move('down');
                        break;
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        e.preventDefault();
                        this.move('left');
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        e.preventDefault();
                        this.move('right');
                        break;
                    case 'r':
                    case 'R':
                        e.preventDefault();
                        this.resetGame();
                        break;
                    case 'z':
                    case 'Z':
                        e.preventDefault();
                        this.undo();
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
        
        // Touch/swipe controls
        let startX, startY, endX, endY;
        
        this.boardElement.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });
        
        this.boardElement.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const touch = e.changedTouches[0];
            endX = touch.clientX;
            endY = touch.clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }
            
            startX = startY = endX = endY = null;
        });
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
        
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
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
window.Retro2048 = Retro2048; 