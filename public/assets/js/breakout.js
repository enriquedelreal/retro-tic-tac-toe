// Retro Breakout Game

class RetroBreakout {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('breakoutBestScore')) || 0;
        this.level = 1;
        this.highestLevel = parseInt(localStorage.getItem('breakoutHighestLevel')) || 1;
        this.lives = 3;
        this.maxLives = 3;
        
        // Game objects
        this.paddle = { x: 350, y: 550, width: 100, height: 15, speed: 8, dx: 0 };
        this.ball = { x: 400, y: 530, radius: 8, dx: 4, dy: -4, speed: 4 };
        this.bricks = [];
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickWidth = 80;
        this.brickHeight = 20;
        this.brickPadding = 10;
        this.brickOffsetTop = 80;
        this.brickOffsetLeft = 100;
        
        // Power-ups
        this.powerUps = [];
        this.powerUpTypes = ['wide', 'narrow', 'slow', 'fast', 'extraLife'];
        
        this.scoreElement = document.getElementById('breakoutScore');
        this.bestScoreElement = document.getElementById('breakoutBestScore');
        this.levelElement = document.getElementById('breakoutLevel');
        this.highestLevelElement = document.getElementById('breakoutHighestLevel');
        this.livesElement = document.getElementById('breakoutLives');
        this.statusElement = document.getElementById('breakoutGameStatus');
        
        // Initialize after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeGame();
            this.setupEventListeners();
            this.updateDisplay();
        }, 100);
    }

    initializeGame() {
        this.canvas = document.getElementById('breakoutCanvas');
        if (!this.canvas) {
            console.error('Breakout canvas not found!');
            return;
        }
        console.log('Breakout canvas found:', this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context for Breakout canvas');
            return;
        }
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        console.log('Breakout canvas initialized with size:', this.canvas.width, 'x', this.canvas.height);
        
        this.resetGame();
    }

    resetGame() {
        this.paddle.x = 350;
        this.paddle.y = 550;
        this.paddle.width = 100;
        this.paddle.dx = 0;
        
        this.ball.x = 400;
        this.ball.y = 530;
        this.ball.dx = 4;
        this.ball.dy = -4;
        
        this.lives = this.maxLives;
        this.powerUps = [];
        
        this.createBricks();
        this.gameRunning = false;
        this.updateDisplay();
    }

    createBricks() {
        this.bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                this.bricks[c][r] = { 
                    x: 0, 
                    y: 0, 
                    status: 1,
                    color: this.getBrickColor(r),
                    powerUp: Math.random() < 0.1 ? this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)] : null
                };
            }
        }
    }

    getBrickColor(row) {
        const colors = ['#ff6b6b', '#ffa726', '#ffeb3b', '#4caf50', '#2196f3'];
        return colors[row % colors.length];
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.paddle.dx = -this.paddle.speed;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.paddle.dx = this.paddle.speed;
                    break;
                case ' ':
                    if (!this.ballMoving) {
                        this.startBall();
                    }
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ||
                e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.paddle.dx = 0;
            }
        });

        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameRunning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            this.paddle.x = mouseX - this.paddle.width / 2;
        });

        // Touch controls
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.gameRunning) return;
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            this.paddle.x = touchX - this.paddle.width / 2;
        });

        // Game control buttons
        const resetBtn = document.getElementById('breakoutResetGame');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        const startBtn = document.getElementById('breakoutStartGame');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        const pauseBtn = document.getElementById('breakoutPause');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        // Speed controls
        const speedBtns = document.querySelectorAll('[data-breakout-speed]');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setSpeed(btn.dataset.breakoutSpeed);
            });
        });
    }

    startGame() {
        this.gameRunning = true;
        this.ballMoving = false;
        this.gameLoop();
    }

    startBall() {
        this.ballMoving = true;
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
                this.paddle.speed = 6;
                this.ball.speed = 3;
                break;
            case 'medium':
                this.paddle.speed = 8;
                this.ball.speed = 4;
                break;
            case 'fast':
                this.paddle.speed = 10;
                this.ball.speed = 6;
                break;
        }
        this.ball.dx = this.ball.speed * (this.ball.dx > 0 ? 1 : -1);
        this.ball.dy = this.ball.speed * (this.ball.dy > 0 ? 1 : -1);
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Update paddle position
        this.paddle.x += this.paddle.dx;
        
        // Paddle boundaries
        if (this.paddle.x < 0) {
            this.paddle.x = 0;
        }
        if (this.paddle.x + this.paddle.width > this.canvas.width) {
            this.paddle.x = this.canvas.width - this.paddle.width;
        }

        // Update ball position
        if (this.ballMoving) {
            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;
        } else {
            // Ball follows paddle when not moving
            this.ball.x = this.paddle.x + this.paddle.width / 2;
            this.ball.y = this.paddle.y - this.ball.radius;
        }

        // Ball collision with walls
        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }

        // Ball collision with paddle
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width &&
            this.ball.dy > 0) {
            
            this.ball.dy = -this.ball.dy;
            
            // Adjust ball angle based on where it hits the paddle
            const hitPoint = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPoint - 0.5) * Math.PI / 3; // -30 to 30 degrees
            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            this.ball.dx = Math.sin(angle) * speed;
            this.ball.dy = -Math.cos(angle) * speed;
        }

        // Ball collision with bricks
        this.collisionDetection();

        // Ball falls below paddle
        if (this.ball.y + this.ball.radius > this.canvas.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.resetBall();
            }
        }

        // Update power-ups
        this.updatePowerUps();

        // Check for level completion
        if (this.bricksRemaining() === 0) {
            this.nextLevel();
        }
    }

    collisionDetection() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const brick = this.bricks[c][r];
                if (brick.status === 1) {
                    if (this.ball.x > brick.x &&
                        this.ball.x < brick.x + this.brickWidth &&
                        this.ball.y > brick.y &&
                        this.ball.y < brick.y + this.brickHeight) {
                        
                        this.ball.dy = -this.ball.dy;
                        brick.status = 0;
                        this.score += 10;
                        
                        // Create power-up
                        if (brick.powerUp) {
                            this.powerUps.push({
                                x: brick.x + this.brickWidth / 2,
                                y: brick.y + this.brickHeight,
                                type: brick.powerUp,
                                width: 20,
                                height: 20,
                                speed: 2
                            });
                        }
                        
                        this.updateDisplay();
                    }
                }
            }
        }
    }

    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed;
            
            // Check collision with paddle
            if (powerUp.y + powerUp.height > this.paddle.y &&
                powerUp.x > this.paddle.x &&
                powerUp.x < this.paddle.x + this.paddle.width) {
                
                this.activatePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
            }
            
            // Remove if fallen off screen
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }
    }

    activatePowerUp(type) {
        switch(type) {
            case 'wide':
                this.paddle.width = Math.min(150, this.paddle.width + 25);
                break;
            case 'narrow':
                this.paddle.width = Math.max(50, this.paddle.width - 25);
                break;
            case 'slow':
                this.ball.speed = Math.max(2, this.ball.speed - 1);
                break;
            case 'fast':
                this.ball.speed = Math.min(8, this.ball.speed + 1);
                break;
            case 'extraLife':
                this.lives = Math.min(this.maxLives, this.lives + 1);
                break;
        }
        this.updateDisplay();
    }

    resetBall() {
        this.ball.x = this.paddle.x + this.paddle.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius;
        this.ball.dx = this.ball.speed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = -this.ball.speed;
        this.ballMoving = false;
    }

    nextLevel() {
        this.level++;
        this.ball.speed += 0.5;
        this.createBricks();
        this.resetBall();
        this.updateDisplay();
    }

    bricksRemaining() {
        let count = 0;
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    count++;
                }
            }
        }
        return count;
    }

    gameOver() {
        this.gameRunning = false;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('breakoutBestScore', this.bestScore);
        }
        
        if (this.level > this.highestLevel) {
            this.highestLevel = this.level;
            localStorage.setItem('breakoutHighestLevel', this.highestLevel);
        }
        
        this.updateDisplay();
        if (this.statusElement) {
            this.statusElement.textContent = 'GAME OVER! Click NEW GAME to restart';
        }
    }

    draw() {
        if (!this.ctx || !this.canvas) {
            console.error('Cannot draw Breakout - canvas or context not available');
            return;
        }
        
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw bricks
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                    const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    
                    this.ctx.fillStyle = this.bricks[c][r].color;
                    this.ctx.fillRect(brickX, brickY, this.brickWidth, this.brickHeight);
                    
                    // Draw power-up indicator
                    if (this.bricks[c][r].powerUp) {
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.font = '12px "Press Start 2P"';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText('★', brickX + this.brickWidth / 2, brickY + this.brickHeight / 2 + 4);
                    }
                }
            }
        }

        // Draw paddle
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Draw ball
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(powerUp.x - powerUp.width / 2, powerUp.y, powerUp.width, powerUp.height);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('P', powerUp.x, powerUp.y + powerUp.height / 2 + 3);
        });

        // Draw UI
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px "Press Start 2P"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`SCORE: ${this.score}`, 10, 30);
        this.ctx.fillText(`LEVEL: ${this.level}`, 10, 50);
        this.ctx.fillText(`LIVES: ${this.lives}`, 10, 70);

        if (!this.ballMoving) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PRESS SPACE TO LAUNCH', this.canvas.width / 2, this.canvas.height - 20);
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
