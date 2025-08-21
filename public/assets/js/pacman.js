// Retro Pac-Man Game

class RetroPacman {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('pacmanBestScore')) || 0;
        this.level = 1;
        this.highestLevel = parseInt(localStorage.getItem('pacmanHighestLevel')) || 1;
        this.lives = 3;
        this.maxLives = 3;
        
        // Game objects
        this.pacman = { x: 400, y: 300, radius: 15, direction: 0, speed: 3, mouthAngle: 0.2 };
        this.ghosts = [];
        this.dots = [];
        this.powerPellets = [];
        this.maze = [];
        
        // Game settings
        this.mazeWidth = 28;
        this.mazeHeight = 31;
        this.cellSize = 20;
        this.ghostSpeed = 2;
        this.frightenedMode = false;
        this.frightenedTimer = 0;
        
        this.scoreElement = document.getElementById('pacmanScore');
        this.bestScoreElement = document.getElementById('pacmanBestScore');
        this.levelElement = document.getElementById('pacmanLevel');
        this.highestLevelElement = document.getElementById('pacmanHighestLevel');
        this.livesElement = document.getElementById('pacmanLives');
        this.statusElement = document.getElementById('pacmanGameStatus');
        
        // Initialize after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeGame();
            this.setupEventListeners();
            this.updateDisplay();
        }, 100);
    }

    initializeGame() {
        this.canvas = document.getElementById('pacmanCanvas');
        if (!this.canvas) {
            console.error('Pacman canvas not found!');
            return;
        }
        console.log('Pacman canvas found:', this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context for Pacman canvas');
            return;
        }
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        console.log('Pacman canvas initialized with size:', this.canvas.width, 'x', this.canvas.height);
        
        this.createMaze();
        this.createDots();
        this.createGhosts();
        this.resetGame();
    }

    createMaze() {
        // Simplified Pac-Man maze layout
        this.maze = [
            "############################",
            "#............##............#",
            "#.####.#####.##.#####.####.#",
            "#.####.#####.##.#####.####.#",
            "#.####.#####.##.#####.####.#",
            "#..........................#",
            "#.####.##.########.##.####.#",
            "#.####.##.########.##.####.#",
            "#......##....##....##......#",
            "######.##### ## #####.######",
            "     #.##### ## #####.#     ",
            "     #.##          ##.#     ",
            "     #.## ##--## ## ##.#     ",
            "######.## ######## ##.######",
            "          #      #          ",
            "######.## ######## ##.######",
            "     #.##          ##.#     ",
            "     #.## ######## ##.#     ",
            "     #.##          ##.#     ",
            "######.## ######## ##.######",
            "#............##............#",
            "#.####.#####.##.#####.####.#",
            "#.####.#####.##.#####.####.#",
            "#...##................##...#",
            "###.##.##.########.##.##.###",
            "###.##.##.########.##.##.###",
            "#......##....##....##......#",
            "#.##########.##.##########.#",
            "#.##########.##.##########.#",
            "#..........................#",
            "############################"
        ];
    }

    createDots() {
        this.dots = [];
        this.powerPellets = [];
        
        for (let y = 0; y < this.mazeHeight; y++) {
            for (let x = 0; x < this.mazeWidth; x++) {
                const cellX = x * this.cellSize + this.cellSize / 2;
                const cellY = y * this.cellSize + this.cellSize / 2;
                
                if (this.maze[y][x] === '.') {
                    this.dots.push({ x: cellX, y: cellY, radius: 2 });
                } else if (this.maze[y][x] === 'o') {
                    this.powerPellets.push({ x: cellX, y: cellY, radius: 6 });
                }
            }
        }
    }

    createGhosts() {
        this.ghosts = [
            { x: 400, y: 300, color: '#ff0000', direction: 0, speed: this.ghostSpeed, mode: 'chase' },
            { x: 400, y: 300, color: '#ffb8ff', direction: 0, speed: this.ghostSpeed, mode: 'chase' },
            { x: 400, y: 300, color: '#00ffff', direction: 0, speed: this.ghostSpeed, mode: 'chase' },
            { x: 400, y: 300, color: '#ffb852', direction: 0, speed: this.ghostSpeed, mode: 'chase' }
        ];
    }

    resetGame() {
        this.pacman.x = 400;
        this.pacman.y = 300;
        this.pacman.direction = 0;
        
        this.createDots();
        this.createGhosts();
        
        this.lives = this.maxLives;
        this.frightenedMode = false;
        this.frightenedTimer = 0;
        this.gameRunning = false;
        this.updateDisplay();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.pacman.direction = -Math.PI / 2;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.pacman.direction = Math.PI / 2;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.pacman.direction = Math.PI;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.pacman.direction = 0;
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
            }
        });

        // Game control buttons
        const resetBtn = document.getElementById('pacmanResetGame');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        const startBtn = document.getElementById('pacmanStartGame');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        const pauseBtn = document.getElementById('pacmanPause');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        // Speed controls
        const speedBtns = document.querySelectorAll('[data-pacman-speed]');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setSpeed(btn.dataset.pacmanSpeed);
            });
        });
    }

    startGame() {
        this.gameRunning = true;
        this.gameLoop();
    }

    togglePause() {
        this.gameRunning = !this.gameRunning;
        if (this.gameRunning) {
            this.gameLoop();
        }
    }

    setSpeed(speed) {
        switch(speed) {
            case 'slow':
                this.pacman.speed = 2;
                this.ghostSpeed = 1.5;
                break;
            case 'medium':
                this.pacman.speed = 3;
                this.ghostSpeed = 2;
                break;
            case 'fast':
                this.pacman.speed = 4;
                this.ghostSpeed = 2.5;
                break;
        }
        this.ghosts.forEach(ghost => ghost.speed = this.ghostSpeed);
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.updatePacman();
        this.updateGhosts();
        this.checkCollisions();
        this.updateFrightenedMode();
        this.checkLevelComplete();
    }

    updatePacman() {
        const newX = this.pacman.x + Math.cos(this.pacman.direction) * this.pacman.speed;
        const newY = this.pacman.y + Math.sin(this.pacman.direction) * this.pacman.speed;
        
        if (this.canMoveTo(newX, newY)) {
            this.pacman.x = newX;
            this.pacman.y = newY;
        }
        
        // Wrap around edges
        if (this.pacman.x < 0) this.pacman.x = this.canvas.width;
        if (this.pacman.x > this.canvas.width) this.pacman.x = 0;
        
        // Animate mouth
        this.pacman.mouthAngle = Math.sin(Date.now() * 0.01) * 0.3 + 0.2;
    }

    updateGhosts() {
        this.ghosts.forEach(ghost => {
            // Simple AI - move towards Pac-Man
            const dx = this.pacman.x - ghost.x;
            const dy = this.pacman.y - ghost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                const targetDirection = Math.atan2(dy, dx);
                
                // Add some randomness to ghost movement
                const randomAngle = (Math.random() - 0.5) * 0.5;
                ghost.direction = targetDirection + randomAngle;
                
                // Move ghost
                const newX = ghost.x + Math.cos(ghost.direction) * ghost.speed;
                const newY = ghost.y + Math.sin(ghost.direction) * ghost.speed;
                
                if (this.canMoveTo(newX, newY)) {
                    ghost.x = newX;
                    ghost.y = newY;
                }
            }
            
            // Wrap around edges
            if (ghost.x < 0) ghost.x = this.canvas.width;
            if (ghost.x > this.canvas.width) ghost.x = 0;
        });
    }

    canMoveTo(x, y) {
        const mazeX = Math.floor(x / this.cellSize);
        const mazeY = Math.floor(y / this.cellSize);
        
        if (mazeY < 0 || mazeY >= this.mazeHeight || mazeX < 0 || mazeX >= this.mazeWidth) {
            return true; // Allow movement outside maze bounds
        }
        
        return this.maze[mazeY][mazeX] !== '#';
    }

    checkCollisions() {
        // Check dot collisions
        for (let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            const distance = Math.sqrt(
                Math.pow(this.pacman.x - dot.x, 2) + 
                Math.pow(this.pacman.y - dot.y, 2)
            );
            
            if (distance < this.pacman.radius + dot.radius) {
                this.dots.splice(i, 1);
                this.score += 10;
                this.updateDisplay();
            }
        }
        
        // Check power pellet collisions
        for (let i = this.powerPellets.length - 1; i >= 0; i--) {
            const pellet = this.powerPellets[i];
            const distance = Math.sqrt(
                Math.pow(this.pacman.x - pellet.x, 2) + 
                Math.pow(this.pacman.y - pellet.y, 2)
            );
            
            if (distance < this.pacman.radius + pellet.radius) {
                this.powerPellets.splice(i, 1);
                this.score += 50;
                this.frightenedMode = true;
                this.frightenedTimer = 300; // 5 seconds at 60fps
                this.updateDisplay();
            }
        }
        
        // Check ghost collisions
        this.ghosts.forEach(ghost => {
            const distance = Math.sqrt(
                Math.pow(this.pacman.x - ghost.x, 2) + 
                Math.pow(this.pacman.y - ghost.y, 2)
            );
            
            if (distance < this.pacman.radius + 15) {
                if (this.frightenedMode) {
                    // Eat ghost
                    ghost.x = 400;
                    ghost.y = 300;
                    this.score += 200;
                    this.updateDisplay();
                } else {
                    // Lose life
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetPositions();
                    }
                }
            }
        });
    }

    updateFrightenedMode() {
        if (this.frightenedMode) {
            this.frightenedTimer--;
            if (this.frightenedTimer <= 0) {
                this.frightenedMode = false;
            }
        }
    }

    resetPositions() {
        this.pacman.x = 400;
        this.pacman.y = 300;
        this.ghosts.forEach(ghost => {
            ghost.x = 400;
            ghost.y = 300;
        });
    }

    checkLevelComplete() {
        if (this.dots.length === 0 && this.powerPellets.length === 0) {
            this.level++;
            this.ghostSpeed += 0.5;
            this.createDots();
            this.createGhosts();
            this.resetPositions();
            this.updateDisplay();
        }
    }

    gameOver() {
        this.gameRunning = false;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('pacmanBestScore', this.bestScore);
        }
        
        if (this.level > this.highestLevel) {
            this.highestLevel = this.level;
            localStorage.setItem('pacmanHighestLevel', this.highestLevel);
        }
        
        this.updateDisplay();
        if (this.statusElement) {
            this.statusElement.textContent = 'GAME OVER! Click NEW GAME to restart';
        }
    }

    draw() {
        if (!this.ctx || !this.canvas) {
            console.error('Cannot draw Pacman - canvas or context not available');
            return;
        }
        
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze
        this.drawMaze();
        
        // Draw dots
        this.drawDots();
        
        // Draw power pellets
        this.drawPowerPellets();
        
        // Draw Pac-Man
        this.drawPacman();
        
        // Draw ghosts
        this.drawGhosts();
        
        // Draw UI
        this.drawUI();
    }

    drawMaze() {
        // Draw maze with gradient and glow effect
        for (let y = 0; y < this.mazeHeight; y++) {
            for (let x = 0; x < this.mazeWidth; x++) {
                if (this.maze[y][x] === '#') {
                    const cellX = x * this.cellSize;
                    const cellY = y * this.cellSize;
                    
                    // Create gradient for maze walls
                    const gradient = this.ctx.createLinearGradient(cellX, cellY, cellX + this.cellSize, cellY + this.cellSize);
                    gradient.addColorStop(0, '#1a1a8a');
                    gradient.addColorStop(0.5, '#0000ff');
                    gradient.addColorStop(1, '#1a1a8a');
                    
                    // Draw wall with gradient
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    
                    // Add highlight effect
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(cellX, cellY, this.cellSize, 2);
                    this.ctx.fillRect(cellX, cellY, 2, this.cellSize);
                    
                    // Add shadow effect
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    this.ctx.fillRect(cellX + this.cellSize - 2, cellY, 2, this.cellSize);
                    this.ctx.fillRect(cellX, cellY + this.cellSize - 2, this.cellSize, 2);
                }
            }
        }
    }

    drawDots() {
        this.dots.forEach(dot => {
            // Create glowing effect for dots
            const gradient = this.ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dot.radius * 2);
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.7, '#ffdd00');
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, dot.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw the actual dot
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(dot.x - 1, dot.y - 1, dot.radius * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawPowerPellets() {
        this.powerPellets.forEach(pellet => {
            // Create pulsing effect for power pellets
            const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
            const pulseRadius = pellet.radius * pulseScale;
            
            // Draw outer glow
            const outerGradient = this.ctx.createRadialGradient(pellet.x, pellet.y, 0, pellet.x, pellet.y, pulseRadius * 3);
            outerGradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
            outerGradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.3)');
            outerGradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            
            this.ctx.fillStyle = outerGradient;
            this.ctx.beginPath();
            this.ctx.arc(pellet.x, pellet.y, pulseRadius * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw inner glow
            const innerGradient = this.ctx.createRadialGradient(pellet.x, pellet.y, 0, pellet.x, pellet.y, pulseRadius);
            innerGradient.addColorStop(0, '#ffff00');
            innerGradient.addColorStop(0.7, '#ffdd00');
            innerGradient.addColorStop(1, '#ffaa00');
            
            this.ctx.fillStyle = innerGradient;
            this.ctx.beginPath();
            this.ctx.arc(pellet.x, pellet.y, pulseRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(pellet.x - 2, pellet.y - 2, pulseRadius * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawPacman() {
        // Create gradient for Pac-Man
        const gradient = this.ctx.createRadialGradient(
            this.pacman.x - 3, this.pacman.y - 3, 0,
            this.pacman.x, this.pacman.y, this.pacman.radius
        );
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.7, '#ffdd00');
        gradient.addColorStop(1, '#ffaa00');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(
            this.pacman.x, 
            this.pacman.y, 
            this.pacman.radius,
            this.pacman.direction + this.pacman.mouthAngle,
            this.pacman.direction - this.pacman.mouthAngle + Math.PI * 2
        );
        this.ctx.lineTo(this.pacman.x, this.pacman.y);
        this.ctx.fill();
        
        // Add outline
        this.ctx.strokeStyle = '#ff8800';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw eyes with better positioning
        const eyeOffset = 3;
        const eyeSize = 2;
        
        // Calculate eye positions based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        if (this.pacman.direction === 0) { // Right
            leftEyeX = this.pacman.x + eyeOffset;
            leftEyeY = this.pacman.y - eyeOffset;
            rightEyeX = this.pacman.x + eyeOffset;
            rightEyeY = this.pacman.y + eyeOffset;
        } else if (this.pacman.direction === Math.PI) { // Left
            leftEyeX = this.pacman.x - eyeOffset;
            leftEyeY = this.pacman.y - eyeOffset;
            rightEyeX = this.pacman.x - eyeOffset;
            rightEyeY = this.pacman.y + eyeOffset;
        } else if (this.pacman.direction === -Math.PI / 2) { // Up
            leftEyeX = this.pacman.x - eyeOffset;
            leftEyeY = this.pacman.y - eyeOffset;
            rightEyeX = this.pacman.x + eyeOffset;
            rightEyeY = this.pacman.y - eyeOffset;
        } else { // Down
            leftEyeX = this.pacman.x - eyeOffset;
            leftEyeY = this.pacman.y + eyeOffset;
            rightEyeX = this.pacman.x + eyeOffset;
            rightEyeY = this.pacman.y + eyeOffset;
        }
        
        // Draw eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add eye highlights
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX - 0.5, leftEyeY - 0.5, 0.5, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX - 0.5, rightEyeY - 0.5, 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawGhosts() {
        this.ghosts.forEach(ghost => {
            const baseColor = this.frightenedMode ? '#0000ff' : ghost.color;
            
            // Create gradient for ghost body
            const gradient = this.ctx.createRadialGradient(
                ghost.x, ghost.y - 5, 0,
                ghost.x, ghost.y, 20
            );
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.7, this.adjustBrightness(baseColor, -20));
            gradient.addColorStop(1, this.adjustBrightness(baseColor, -40));
            
            this.ctx.fillStyle = gradient;
            
            // Draw ghost body with better shape
            this.ctx.beginPath();
            this.ctx.arc(ghost.x, ghost.y - 5, 15, Math.PI, 0);
            this.ctx.rect(ghost.x - 15, ghost.y - 5, 30, 20);
            this.ctx.fill();
            
            // Add outline
            this.ctx.strokeStyle = this.adjustBrightness(baseColor, -60);
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw ghost eyes with better positioning
            const eyeSize = 3;
            const pupilSize = 1.5;
            
            // White part of eyes
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(ghost.x - 5, ghost.y - 8, eyeSize, 0, Math.PI * 2);
            this.ctx.arc(ghost.x + 5, ghost.y - 8, eyeSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Pupils
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(ghost.x - 5, ghost.y - 8, pupilSize, 0, Math.PI * 2);
            this.ctx.arc(ghost.x + 5, ghost.y - 8, pupilSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eye highlights
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(ghost.x - 6, ghost.y - 9, 1, 0, Math.PI * 2);
            this.ctx.arc(ghost.x + 4, ghost.y - 9, 1, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add frightened mode effect
            if (this.frightenedMode) {
                // Draw frightened mouth
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(ghost.x, ghost.y + 2, 8, 0, Math.PI);
                this.ctx.fill();
                
                // Add frightened eyes
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(ghost.x - 5, ghost.y - 8, 2, 0, Math.PI * 2);
                this.ctx.arc(ghost.x + 5, ghost.y - 8, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    // Helper function to adjust color brightness
    adjustBrightness(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    drawUI() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px "Press Start 2P"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 10, 30);
        this.ctx.fillText(`LEVEL: ${this.level}`, 10, 50);
        this.ctx.fillText(`LIVES: ${this.lives}`, 10, 70);
        
        if (this.frightenedMode) {
            this.ctx.fillStyle = '#0000ff';
            this.ctx.fillText('FRIGHTENED!', 10, 90);
        }
    }

    updateDisplay() {
        if (this.scoreElement) this.scoreElement.textContent = this.score;
        if (this.bestScoreElement) this.bestScoreElement.textContent = this.bestScore;
        if (this.levelElement) this.levelElement.textContent = this.level;
        if (this.highestLevelElement) this.highestLevelElement.textContent = this.highestLevel;
        if (this.livesElement) this.livesElement.textContent = this.lives;
    }

    destroy() {
        this.gameRunning = false;
        // Remove event listeners if needed
    }
    
    // Method to reinitialize when game becomes visible
    reinitialize() {
        if (!this.canvas || !this.ctx) {
            this.initializeGame();
            this.setupEventListeners();
            this.updateDisplay();
        }
        this.draw();
    }
}
