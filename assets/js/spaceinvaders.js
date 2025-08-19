// Retro Space Invaders Game

class RetroSpaceInvaders {
    constructor() {
        // Game properties
        this.canvas = null;
        this.ctx = null;
        this.gameWidth = 800;
        this.gameHeight = 600;
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('spaceInvadersBestScore')) || 0;
        this.level = 1;
        this.highestLevel = parseInt(localStorage.getItem('spaceInvadersHighestLevel')) || 1;
        this.lives = 3;
        this.gameLoop = null;
        this.lastUpdate = 0;
        this.gameSpeed = 16; // ~60 FPS
        
        // Player properties (will be updated in setupCanvas)
        this.player = {
            x: 400,
            y: 550,
            width: 40,
            height: 20,
            speed: 8,
            bullet: null,
            movingLeft: false,
            movingRight: false,
            lastShot: 0
        };
        
        // Aliens properties
        this.aliens = [];
        this.alienRows = 5;
        this.alienCols = 11;
        this.alienSpeed = 1;
        this.alienDirection = 1;
        this.alienDropDistance = 20;
        this.alienBullets = [];
        this.lastAlienShot = 0;
        this.alienShotInterval = 2000;
        
        // Game state
        this.gamePhase = 'playing'; // 'playing', 'gameOver', 'levelComplete'
        this.explosions = [];
        this.stars = [];
        this.resizeTimeout = null;
        
        // DOM elements
        this.canvasElement = null;
        this.scoreElement = null;
        this.levelElement = null;
        this.livesElement = null;
        this.bestScoreElement = null;
        this.highestLevelElement = null;
        this.statusElement = null;
        
        // Initialize game
        this.initializeGame();
    }

    initializeGame() {
        this.createStars();
        this.createAliens();
        this.resetPlayer();
    }

    setupElements() {
        try {
            console.log('Space Invaders: Setting up elements...');
            
            // Get DOM elements
            this.canvasElement = document.getElementById('spaceInvadersCanvas');
            this.scoreElement = document.getElementById('spaceInvadersScore');
            this.levelElement = document.getElementById('spaceInvadersLevel');
            this.livesElement = document.getElementById('spaceInvadersLives');
            this.bestScoreElement = document.getElementById('spaceInvadersBestScore');
            this.highestLevelElement = document.getElementById('spaceInvadersHighestLevel');
            this.statusElement = document.getElementById('spaceInvadersGameStatus');
            
            console.log('Space Invaders: Elements found:', {
                canvas: !!this.canvasElement,
                score: !!this.scoreElement,
                level: !!this.levelElement,
                lives: !!this.livesElement,
                bestScore: !!this.bestScoreElement,
                highestLevel: !!this.highestLevelElement,
                status: !!this.statusElement
            });
            
            // Check if essential elements exist
            if (!this.canvasElement) {
                console.error('Space Invaders: Canvas element not found');
                return false;
            }
            
            // Setup canvas
            this.setupCanvas();
            this.setupEventListeners();
            this.updateDisplay();
            this.draw();
            
            // Force resize after a short delay to ensure container is rendered
            setTimeout(() => {
                this.resizeCanvas();
                // Force container size
                const container = document.querySelector('.space-invaders-container');
                if (container) {
                    container.style.minHeight = '100px';
                    console.log('Set Space Invaders container min-height to 100px');
                }
            }, 200);
            
            console.log('Space Invaders: Setup complete');
            return true;
            
        } catch (error) {
            console.error('Space Invaders: Error in setupElements:', error);
            return false;
        }
    }

    setupCanvas() {
        this.canvas = this.canvasElement;
        this.ctx = this.canvas.getContext('2d');
        
        // Use a small delay to ensure container is rendered
        setTimeout(() => {
            this.resizeCanvas();
        }, 100);
    }

    resizeCanvas() {
        if (!this.canvas || !this.canvas.parentElement) return;
        
        console.log('Resizing Space Invaders canvas...');
        
        // Get container dimensions
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        console.log('Container dimensions:', containerRect.width, 'x', containerRect.height);
        
        // Set canvas size with 25% width increase and double height
        const baseWidth = containerRect.width - 40; // Account for padding
        const baseHeight = containerRect.height - 40; // Account for padding
        
        const newWidth = Math.floor(baseWidth * 1.25); // 25% width increase
        const newHeight = baseHeight * 2; // Double height
        
        console.log('New canvas dimensions:', newWidth, 'x', newHeight);
        
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        
        // Update game dimensions to match canvas
        this.gameWidth = this.canvas.width;
        this.gameHeight = this.canvas.height;
        
        // Set canvas style
        this.canvas.style.backgroundColor = '#000';
        
        // Update player dimensions and position
        this.updatePlayerDimensions();
        
        // Recreate game elements for new size
        this.createStars();
        this.createAliens();
        this.resetPlayer();
        
        // Redraw if game is running
        if (this.gameRunning) {
            this.draw();
        }
        
        console.log('Canvas resize complete!');
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.gameWidth,
                y: Math.random() * this.gameHeight,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 0.5
            });
        }
    }

    createAliens() {
        this.aliens = [];
        const alienWidth = Math.max(20, this.gameWidth / 40);
        const alienHeight = Math.max(15, this.gameHeight / 50);
        const startX = this.gameWidth * 0.1;
        const startY = this.gameHeight * 0.1;
        const spacing = Math.max(30, this.gameWidth / 30);
        
        for (let row = 0; row < this.alienRows; row++) {
            for (let col = 0; col < this.alienCols; col++) {
                const alien = {
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: alienWidth,
                    height: alienHeight,
                    alive: true,
                    type: row < 2 ? 'top' : row < 4 ? 'middle' : 'bottom',
                    points: row < 2 ? 30 : row < 4 ? 20 : 10
                };
                this.aliens.push(alien);
            }
        }
    }

    updatePlayerDimensions() {
        // Scale player size based on canvas
        this.player.width = Math.max(30, this.gameWidth / 25);
        this.player.height = Math.max(15, this.gameHeight / 40);
        this.player.speed = Math.max(5, this.gameWidth / 100);
        
        // Reset player position
        this.resetPlayer();
    }

    resetPlayer() {
        this.player.x = this.gameWidth / 2 - this.player.width / 2;
        this.player.y = this.gameHeight - 50;
        this.player.bullet = null;
        this.player.movingLeft = false;
        this.player.movingRight = false;
        this.player.lastShot = 0;
    }

    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gamePhase = 'playing';
            this.lastUpdate = Date.now();
            console.log('Space Invaders: Game started');
            this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
            this.playStartSound();
            
            // Reset pause button text
            const pauseButton = document.getElementById('spaceInvadersPause');
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
            const pauseButton = document.getElementById('spaceInvadersPause');
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
            const pauseButton = document.getElementById('spaceInvadersPause');
            if (pauseButton) {
                pauseButton.textContent = 'PAUSE';
            }
            this.playButtonSound();
        }
    }

    gameStep() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
    }

    update() {
        // Update stars
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.gameHeight) {
                star.y = 0;
                star.x = Math.random() * this.gameWidth;
            }
        });
        
        // Update player movement
        if (this.player.movingLeft) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.player.movingRight) {
            this.player.x = Math.min(this.gameWidth - this.player.width, this.player.x + this.player.speed);
        }
        
        // Update player bullet
        if (this.player.bullet) {
            this.player.bullet.y -= 8;
            if (this.player.bullet.y < 0) {
                this.player.bullet = null;
            }
        }
        
        // Update alien bullets
        this.alienBullets.forEach((bullet, index) => {
            bullet.y += 4;
            if (bullet.y > this.gameHeight) {
                this.alienBullets.splice(index, 1);
            }
        });
        
        // Update explosions
        this.explosions.forEach((explosion, index) => {
            explosion.life--;
            if (explosion.life <= 0) {
                this.explosions.splice(index, 1);
            }
        });
        
        // Move aliens
        this.moveAliens();
        
        // Alien shooting
        this.alienShooting();
        
        // Check collisions
        this.checkCollisions();
        
        // Check level completion
        this.checkLevelComplete();
    }

    moveAliens() {
        let shouldDrop = false;
        let shouldChangeDirection = false;
        
        // Check if any alien hits the edge
        this.aliens.forEach(alien => {
            if (alien.alive) {
                if (this.alienDirection > 0 && alien.x + alien.width >= this.gameWidth - 20) {
                    shouldChangeDirection = true;
                } else if (this.alienDirection < 0 && alien.x <= 20) {
                    shouldChangeDirection = true;
                }
            }
        });
        
        // Move aliens
        this.aliens.forEach(alien => {
            if (alien.alive) {
                if (shouldChangeDirection) {
                    alien.y += this.alienDropDistance;
                    shouldDrop = true;
                } else {
                    alien.x += this.alienSpeed * this.alienDirection;
                }
            }
        });
        
        // Change direction if needed
        if (shouldChangeDirection) {
            this.alienDirection *= -1;
        }
        
        // Check if aliens reached the bottom
        this.aliens.forEach(alien => {
            if (alien.alive && alien.y + alien.height >= this.player.y - 50) {
                this.gameOver();
            }
        });
    }

    alienShooting() {
        const now = Date.now();
        if (now - this.lastAlienShot > this.alienShotInterval) {
            const aliveAliens = this.aliens.filter(alien => alien.alive);
            if (aliveAliens.length > 0) {
                const randomAlien = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
                this.alienBullets.push({
                    x: randomAlien.x + randomAlien.width / 2,
                    y: randomAlien.y + randomAlien.height,
                    width: 2,
                    height: 8
                });
                this.lastAlienShot = now;
            }
        }
    }

    checkCollisions() {
        // Player bullet vs aliens
        if (this.player.bullet) {
            this.aliens.forEach(alien => {
                if (alien.alive && this.checkCollision(this.player.bullet, alien)) {
                    alien.alive = false;
                    this.player.bullet = null;
                    this.score += alien.points;
                    this.explosions.push({
                        x: alien.x + alien.width / 2,
                        y: alien.y + alien.height / 2,
                        life: 10
                    });
                    this.playExplosionSound();
                }
            });
        }
        
        // Alien bullets vs player
        this.alienBullets.forEach((bullet, bulletIndex) => {
            if (this.checkCollision(bullet, this.player)) {
                this.alienBullets.splice(bulletIndex, 1);
                this.lives--;
                this.explosions.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y + this.player.height / 2,
                    life: 15
                });
                this.playPlayerHitSound();
                
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.resetPlayer();
                }
            }
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    checkLevelComplete() {
        const aliveAliens = this.aliens.filter(alien => alien.alive);
        if (aliveAliens.length === 0) {
            this.levelComplete();
        }
    }

    levelComplete() {
        this.level++;
        this.alienSpeed += 0.5;
        this.alienShotInterval = Math.max(500, this.alienShotInterval - 100);
        this.createAliens();
        this.resetPlayer();
        this.alienBullets = [];
        this.playLevelCompleteSound();
        
        if (this.level > this.highestLevel) {
            this.highestLevel = this.level;
            localStorage.setItem('spaceInvadersHighestLevel', this.highestLevel);
        }
    }

    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        clearInterval(this.gameLoop);
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('spaceInvadersBestScore', this.bestScore);
        }
        
        this.statusElement.textContent = 'GAME OVER!';
        this.statusElement.style.color = '#ff6b6b';
        this.playGameOverSound();
    }

    resetGame() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        this.gamePaused = false;
        this.gamePhase = 'playing';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.alienSpeed = 1;
        this.alienShotInterval = 2000;
        this.alienDirection = 1;
        this.alienBullets = [];
        this.explosions = [];
        
        this.initializeGame();
        this.updateDisplay();
        this.statusElement.textContent = '';
        this.statusElement.style.color = '';
        
        // Reset pause button text
        const pauseButton = document.getElementById('spaceInvadersPause');
        if (pauseButton) {
            pauseButton.textContent = 'PAUSE';
        }
        
        this.playButtonSound();
    }

    resetScore() {
        this.bestScore = 0;
        this.highestLevel = 1;
        localStorage.removeItem('spaceInvadersBestScore');
        localStorage.removeItem('spaceInvadersHighestLevel');
        this.bestScoreElement.textContent = '0';
        this.highestLevelElement.textContent = '1';
        this.playButtonSound();
    }

    updateDisplay() {
        if (this.scoreElement) this.scoreElement.textContent = this.score;
        if (this.levelElement) this.levelElement.textContent = this.level;
        if (this.livesElement) this.livesElement.textContent = this.lives;
        if (this.bestScoreElement) this.bestScoreElement.textContent = this.bestScore;
        if (this.highestLevelElement) this.highestLevelElement.textContent = this.highestLevel;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Draw stars
        this.ctx.fillStyle = '#fff';
        this.stars.forEach(star => {
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        // Draw player
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw player bullet
        if (this.player.bullet) {
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(this.player.bullet.x, this.player.bullet.y, this.player.bullet.width, this.player.bullet.height);
        }
        
        // Draw aliens
        this.aliens.forEach(alien => {
            if (alien.alive) {
                if (alien.type === 'top') {
                    this.ctx.fillStyle = '#ff6b6b';
                } else if (alien.type === 'middle') {
                    this.ctx.fillStyle = '#ffd700';
                } else {
                    this.ctx.fillStyle = '#4CAF50';
                }
                this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
            }
        });
        
        // Draw alien bullets
        this.ctx.fillStyle = '#ff6b6b';
        this.alienBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // Draw explosions
        this.explosions.forEach(explosion => {
            const alpha = explosion.life / 15;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, 10, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    setupEventListeners() {
        // Button controls
        const resetGameBtn = document.getElementById('spaceInvadersResetGame');
        const resetScoreBtn = document.getElementById('spaceInvadersResetScore');
        const pauseBtn = document.getElementById('spaceInvadersPause');
        
        if (resetGameBtn) resetGameBtn.addEventListener('click', () => this.resetGame());
        if (resetScoreBtn) resetScoreBtn.addEventListener('click', () => this.resetScore());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseGame());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('spaceInvaders-game').classList.contains('active')) {
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        e.preventDefault();
                        if (this.gameRunning && !this.gamePaused) {
                            this.player.movingLeft = true;
                        }
                        if (!this.gameRunning) this.startGame();
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        e.preventDefault();
                        if (this.gameRunning && !this.gamePaused) {
                            this.player.movingRight = true;
                        }
                        if (!this.gameRunning) this.startGame();
                        break;
                    case ' ':
                        e.preventDefault();
                        if (this.gameRunning && !this.gamePaused) {
                            // Only shoot if no bullet exists and enough time has passed
                            const now = Date.now();
                            if (!this.player.bullet && now - this.player.lastShot > 200) {
                                this.player.bullet = {
                                    x: this.player.x + this.player.width / 2 - 1,
                                    y: this.player.y,
                                    width: 2,
                                    height: 8
                                };
                                this.player.lastShot = now;
                                this.playShootSound();
                            }
                        } else if (!this.gameRunning && !this.gamePaused) {
                            this.startGame();
                        } else if (this.gameRunning && this.gamePaused) {
                            this.pauseGame(); // Resume game
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
                        this.toggleCanvasFullscreen();
                        break;
                }
            }
        });
        
        // Key up events for smooth movement
        document.addEventListener('keyup', (e) => {
            if (document.getElementById('spaceInvaders-game').classList.contains('active')) {
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        this.player.movingLeft = false;
                        break;
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                        this.player.movingRight = false;
                        break;
                }
            }
        });
        
        // Click to start
        if (this.canvasElement) {
            this.canvasElement.addEventListener('click', () => {
                if (!this.gameRunning && !this.gamePaused) {
                    this.startGame();
                }
            });
        }

        // Handle window resize for responsive canvas
        window.addEventListener('resize', () => {
            if (this.canvasElement && this.canvasElement.parentElement) {
                // Debounce resize events
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.resizeCanvas();
                }, 250);
            }
        });
    }

    // Audio methods
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
        
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    playShootSound() {
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

    playExplosionSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    playPlayerHitSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    playLevelCompleteSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
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

    toggleCanvasFullscreen() {
        if (!this.canvasElement) {
            console.log('Canvas element not found for fullscreen');
            return;
        }
        
        if (!document.fullscreenElement) {
            // Enter fullscreen with just the canvas
            if (this.canvasElement.requestFullscreen) {
                this.canvasElement.requestFullscreen();
            } else if (this.canvasElement.webkitRequestFullscreen) {
                this.canvasElement.webkitRequestFullscreen();
            } else if (this.canvasElement.msRequestFullscreen) {
                this.canvasElement.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
}

// Initialize the game when the page loads
window.RetroSpaceInvaders = RetroSpaceInvaders; 