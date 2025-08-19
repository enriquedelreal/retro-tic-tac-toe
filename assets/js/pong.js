// Retro Pong Game

class RetroPong {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('pongBestScore')) || 0;
        this.level = 1;
        this.highestLevel = parseInt(localStorage.getItem('pongHighestLevel')) || 1;
        
        // Game objects
        this.paddle1 = { x: 50, y: 300, width: 15, height: 100, speed: 0, score: 0 };
        this.paddle2 = { x: 735, y: 300, width: 15, height: 100, speed: 0, score: 0 };
        this.ball = { x: 400, y: 300, radius: 8, dx: 8, dy: 8 };
        
        // Game settings
        this.paddleSpeed = 16;
        this.ballSpeed = 8;
        this.aiDifficulty = 0.8;
        
        this.scoreElement = document.getElementById('pongScore');
        this.bestScoreElement = document.getElementById('pongBestScore');
        this.levelElement = document.getElementById('pongLevel');
        this.highestLevelElement = document.getElementById('pongHighestLevel');
        this.statusElement = document.getElementById('pongGameStatus');
        
        // Initialize after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.initializeGame();
            this.setupEventListeners();
            this.updateDisplay();
        }, 100);
    }

    initializeGame() {
        this.canvas = document.getElementById('pongCanvas');
        if (!this.canvas) {
            console.error('Pong canvas not found!');
            return;
        }
        console.log('Pong canvas found:', this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context for Pong canvas');
            return;
        }
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        console.log('Pong canvas initialized with size:', this.canvas.width, 'x', this.canvas.height);
        
        this.resetGame();
    }

    resetGame() {
        this.paddle1.y = 250;
        this.paddle2.y = 250;
        this.ball.x = 400;
        this.ball.y = 300;
        this.ball.dx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.paddle1.score = 0;
        this.paddle2.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.updateDisplay();
        console.log('Pong game reset');
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'w':
                case 'W':
                case 'ArrowUp':
                    this.paddle1.speed = -this.paddleSpeed;
                    break;
                case 's':
                case 'S':
                case 'ArrowDown':
                    this.paddle1.speed = this.paddleSpeed;
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || 
                e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                this.paddle1.speed = 0;
            }
        });

        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameRunning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            this.paddle1.y = mouseY - this.paddle1.height / 2;
        });

        // Touch controls
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.gameRunning) return;
            e.preventDefault();
            
            const rect = this.canvas.getBoundingClientRect();
            const touchY = e.touches[0].clientY - rect.top;
            this.paddle1.y = touchY - this.paddle1.height / 2;
        });

        // Game control buttons
        const resetBtn = document.getElementById('pongResetGame');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        const startBtn = document.getElementById('pongStartGame');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        const pauseBtn = document.getElementById('pongPause');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        // Speed controls
        const speedBtns = document.querySelectorAll('[data-pong-speed]');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setSpeed(btn.dataset.pongSpeed);
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
                this.paddleSpeed = 12;
                this.ballSpeed = 6;
                break;
            case 'medium':
                this.paddleSpeed = 16;
                this.ballSpeed = 8;
                break;
            case 'fast':
                this.paddleSpeed = 20;
                this.ballSpeed = 10;
                break;
        }
        this.ball.dx = this.ballSpeed * (this.ball.dx > 0 ? 1 : -1);
        this.ball.dy = this.ballSpeed * (this.ball.dy > 0 ? 1 : -1);
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Update paddle positions
        this.paddle1.y += this.paddle1.speed;
        this.paddle2.y += this.paddle2.speed;

        // Paddle boundaries
        this.paddle1.y = Math.max(0, Math.min(this.canvas.height - this.paddle1.height, this.paddle1.y));
        this.paddle2.y = Math.max(0, Math.min(this.canvas.height - this.paddle2.height, this.paddle2.y));

        // AI for paddle 2
        if (this.ball.y < this.paddle2.y + this.paddle2.height / 2 - 10) {
            this.paddle2.speed = -this.paddleSpeed * this.aiDifficulty;
        } else if (this.ball.y > this.paddle2.y + this.paddle2.height / 2 + 10) {
            this.paddle2.speed = this.paddleSpeed * this.aiDifficulty;
        } else {
            this.paddle2.speed = 0;
        }

        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with top and bottom
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy = -this.ball.dy;
        }

        // Ball collision with paddles
        if (this.ball.x <= this.paddle1.x + this.paddle1.width && 
            this.ball.y >= this.paddle1.y && 
            this.ball.y <= this.paddle1.y + this.paddle1.height &&
            this.ball.dx < 0) {
            this.ball.dx = -this.ball.dx;
            this.ball.x = this.paddle1.x + this.paddle1.width;
        }

        if (this.ball.x >= this.paddle2.x && 
            this.ball.y >= this.paddle2.y && 
            this.ball.y <= this.paddle2.y + this.paddle2.height &&
            this.ball.dx > 0) {
            this.ball.dx = -this.ball.dx;
            this.ball.x = this.paddle2.x;
        }

        // Score points
        if (this.ball.x <= 0) {
            this.paddle2.score++;
            this.resetBall();
            this.checkLevelUp();
        } else if (this.ball.x >= this.canvas.width) {
            this.paddle1.score++;
            this.score = this.paddle1.score;
            this.resetBall();
            this.checkLevelUp();
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    }

    checkLevelUp() {
        if (this.paddle1.score > 0 && this.paddle1.score % 2 === 0) {
            this.level++;
            this.ballSpeed += 1.5;
            this.aiDifficulty = Math.min(1, this.aiDifficulty + 0.2);
            this.updateDisplay();
        }
    }

    draw() {
        if (!this.ctx || !this.canvas) {
            console.error('Cannot draw Pong - canvas or context not available');
            return;
        }
        
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.setLineDash([10, 10]);
        this.ctx.strokeStyle = '#4a4a6a';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);

        // Draw ball
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw scores
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.paddle1.score, this.canvas.width / 4, 100);
        this.ctx.fillText(this.paddle2.score, 3 * this.canvas.width / 4, 100);

        // Draw level
        this.ctx.font = '24px "Press Start 2P"';
        this.ctx.fillText(`LEVEL ${this.level}`, this.canvas.width / 2, 50);
    }

    updateDisplay() {
        if (this.scoreElement) this.scoreElement.textContent = this.score;
        if (this.bestScoreElement) this.bestScoreElement.textContent = this.bestScore;
        if (this.levelElement) this.levelElement.textContent = this.level;
        if (this.highestLevelElement) this.highestLevelElement.textContent = this.highestLevel;
        
        // Update best scores
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('pongBestScore', this.bestScore);
            if (this.bestScoreElement) this.bestScoreElement.textContent = this.bestScore;
        }
        
        if (this.level > this.highestLevel) {
            this.highestLevel = this.level;
            localStorage.setItem('pongHighestLevel', this.highestLevel);
            if (this.highestLevelElement) this.highestLevelElement.textContent = this.highestLevel;
        }
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
