// Retro Game Arcade - Main App Controller
console.log('App.js loaded successfully');

// Debug script loading
console.log('Checking for game classes...');
console.log('RetroTicTacToe available:', typeof RetroTicTacToe !== 'undefined');
console.log('RetroCheckers available:', typeof RetroCheckers !== 'undefined');
console.log('Retro2048 available:', typeof Retro2048 !== 'undefined');
console.log('RetroSnake available:', typeof RetroSnake !== 'undefined');
console.log('RetroTetris available:', typeof RetroTetris !== 'undefined');
console.log('RetroBattleship available:', typeof RetroBattleship !== 'undefined');
console.log('RetroSpaceInvaders available:', typeof RetroSpaceInvaders !== 'undefined');

class RetroGameArcade {
    constructor() {
        console.log('RetroGameArcade constructor called');
        this.currentGame = 'tictactoe';
        this.sidebarCollapsed = false;
        this.games = {
            tictactoe: null,
            checkers: null,
            '2048': null,
            snake: null,
            tetris: null,
            battleship: null
        };
        
        // Simple initialization
        try {
            this.setupEventListeners();
            this.initializeApp();
        } catch (error) {
            console.error('Error in constructor:', error);
        }
    }

    initializeApp() {
        // Initialize games immediately since DOM is already ready
        this.initializeGames();
    }

    initializeGames() {
        try {
            console.log('Initializing games...');
            
            // Initialize each game with error handling
            if (typeof RetroTicTacToe !== 'undefined') {
                this.games.tictactoe = new RetroTicTacToe();
                console.log('TicTacToe initialized');
            } else {
                console.error('RetroTicTacToe not found');
            }
            
            if (typeof RetroCheckers !== 'undefined') {
                this.games.checkers = new RetroCheckers();
                console.log('Checkers initialized');
            } else {
                console.error('RetroCheckers not found');
            }
            
            if (typeof Retro2048 !== 'undefined') {
                this.games['2048'] = new Retro2048();
                console.log('2048 initialized');
            } else {
                console.error('Retro2048 not found');
            }
            
            if (typeof RetroSnake !== 'undefined') {
                this.games.snake = new RetroSnake();
                console.log('Snake initialized');
            } else {
                console.error('RetroSnake not found');
            }
            
            if (typeof RetroTetris !== 'undefined') {
                this.games.tetris = new RetroTetris();
                console.log('Tetris initialized');
            } else {
                console.error('RetroTetris not found');
            }
            
            if (typeof RetroBattleship !== 'undefined') {
                this.games.battleship = new RetroBattleship();
                console.log('Battleship initialized');
            } else {
                console.error('RetroBattleship not found');
            }
            
            if (typeof RetroSpaceInvaders !== 'undefined') {
                this.games.spaceInvaders = new RetroSpaceInvaders();
                console.log('Space Invaders initialized');
            } else {
                console.error('RetroSpaceInvaders not found');
            }
            
            // Show initial game
            this.switchGame('tictactoe');
            
        } catch (error) {
            console.error('Error initializing games:', error);
        }
    }

    setupEventListeners() {
        try {
            console.log('Setting up event listeners...');
            
            // Sidebar toggle
            const sidebarToggle = document.getElementById('sidebarToggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', () => {
                    console.log('Sidebar toggle clicked');
                    this.toggleSidebar();
                });
            }

            // Fullscreen toggle
            const fullscreenToggle = document.getElementById('fullscreenToggle');
            if (fullscreenToggle) {
                fullscreenToggle.addEventListener('click', () => {
                    console.log('Fullscreen toggle clicked');
                    this.toggleFullscreen();
                });
            }

            // Game navigation - simplified
            const gameNavItems = document.querySelectorAll('.game-nav-item');
            console.log('Found game nav items:', gameNavItems.length);
            gameNavItems.forEach((item, index) => {
                item.addEventListener('click', (e) => {
                    console.log('Game nav clicked:', e.currentTarget.dataset.game);
                    const game = e.currentTarget.dataset.game;
                    if (game) {
                        this.simpleSwitchGame(game);
                    }
                });
            });

            // Fullscreen change events
            document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
            document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButton());
            document.addEventListener('msfullscreenchange', () => this.updateFullscreenButton());

            // Global keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Command+R (Mac) or Ctrl+R (Windows/Linux) to reset entire website
                if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
                    e.preventDefault();
                    console.log('Website reset triggered by keyboard shortcut');
                    window.location.reload();
                }
            });

        } catch (error) {
            console.error('Error in setupEventListeners:', error);
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.getElementById('sidebarToggle');
        
        this.sidebarCollapsed = !this.sidebarCollapsed;
        
        if (this.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            toggle.textContent = '▶';
        } else {
            sidebar.classList.remove('collapsed');
            toggle.textContent = '◀';
        }
    }

    toggleFullscreen() {
        const fullscreenToggle = document.getElementById('fullscreenToggle');
        
        if (!document.fullscreenElement) {
            // Find the currently active game container
            const activeGame = document.querySelector('.game-container.active');
            if (!activeGame) {
                console.log('No active game found for fullscreen');
                return;
            }
            
            // Enter fullscreen with the active game
            if (activeGame.requestFullscreen) {
                activeGame.requestFullscreen();
            } else if (activeGame.webkitRequestFullscreen) {
                activeGame.webkitRequestFullscreen();
            } else if (activeGame.msRequestFullscreen) {
                activeGame.msRequestFullscreen();
            }
            fullscreenToggle.textContent = '⛶';
            fullscreenToggle.classList.add('fullscreen');
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            fullscreenToggle.textContent = '⛶';
            fullscreenToggle.classList.remove('fullscreen');
        }
    }

    updateFullscreenButton() {
        const fullscreenToggle = document.getElementById('fullscreenToggle');
        if (fullscreenToggle) {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                fullscreenToggle.textContent = '⛶';
                fullscreenToggle.classList.add('fullscreen');
            } else {
                fullscreenToggle.textContent = '⛶';
                fullscreenToggle.classList.remove('fullscreen');
            }
        }
    }

    switchGame(gameName) {
        console.log('Switching to game:', gameName);
        
        // Hide all games
        const allContainers = document.querySelectorAll('.game-container');
        console.log('Found containers:', allContainers.length);
        allContainers.forEach(container => {
            container.classList.remove('active');
            console.log('Removed active from:', container.id);
        });

        // Remove active class from all nav items
        const allNavItems = document.querySelectorAll('.game-nav-item');
        console.log('Found nav items:', allNavItems.length);
        allNavItems.forEach(item => {
            item.classList.remove('active');
        });

        // Show selected game
        const gameElement = document.getElementById(`${gameName}-game`);
        console.log('Game element found:', gameElement);
        if (gameElement) {
            gameElement.classList.add('active');
            console.log('Added active to:', gameElement.id);
        } else {
            console.error('Game element not found for:', gameName);
        }
        
        // Activate nav item
        const navItem = document.querySelector(`[data-game="${gameName}"]`);
        console.log('Nav item found:', navItem);
        if (navItem) {
            navItem.classList.add('active');
        }
        
        this.currentGame = gameName;
        
        // Play switch sound
        this.playSwitchSound();
    }

    simpleSwitchGame(gameName) {
        try {
            console.log('Simple switching to game:', gameName);
            
            // Check if user has access to games (only if subscription system is enabled)
            if (window.authManager && window.authManager.SUBSCRIPTION_ENABLED && !window.authManager.hasActiveSubscription()) {
                console.log('User does not have active subscription, showing auth prompt');
                if (window.authUI && window.authUI.showAuth) {
                    window.authUI.showAuth();
                }
                return;
            }
            
            // Hide all games using both display and active class
            const allContainers = document.querySelectorAll('.game-container');
            allContainers.forEach(container => {
                container.style.display = 'none';
                container.classList.remove('active');
            });

            // Remove active class from all nav items
            const allNavItems = document.querySelectorAll('.game-nav-item');
            allNavItems.forEach(item => {
                item.classList.remove('active');
            });

            // Show selected game using both display and active class
            const gameElement = document.getElementById(`${gameName}-game`);
            if (gameElement) {
                gameElement.style.display = 'block';
                gameElement.classList.add('active');
                console.log('Switched to ' + gameName);
                
                                            // Initialize the game if it hasn't been initialized yet
                            if (this.games[gameName] && typeof this.games[gameName].setupElements === 'function') {
                                console.log('Setting up game elements for:', gameName);
                                this.games[gameName].setupElements();
                            }
            } else {
                console.error('Game not found: ' + gameName);
            }
            
            // Activate the correct nav item
            const navItem = document.querySelector(`[data-game="${gameName}"]`);
            if (navItem) {
                navItem.classList.add('active');
                console.log('Activated nav item for: ' + gameName);
            }
            
            this.currentGame = gameName;
            
        } catch (error) {
            console.error('Error in simpleSwitchGame:', error);
        }
    }

    // Retro Sound Effects
    createAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Share audio context with all games
        window.sharedAudioContext = this.audioContext;
    }

    playSwitchSound() {
        try {
            this.createAudioContext();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Switch sound (ascending tone)
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (error) {
            console.error('Error playing switch sound:', error);
        }
    }
}

// Safe initialization with retry logic
let initAttempts = 0;
const maxAttempts = 10;

function initializeApp() {
    initAttempts++;
    console.log(`Initialization attempt ${initAttempts}`);
    
    // Check if all required classes are available
    const requiredClasses = [
        'RetroTicTacToe', 'RetroCheckers', 'Retro2048', 
        'RetroSnake', 'RetroTetris', 'RetroBattleship', 'RetroSpaceInvaders'
    ];
    
    const missingClasses = requiredClasses.filter(className => typeof window[className] === 'undefined');
    
    if (missingClasses.length > 0) {
        console.warn('Missing classes:', missingClasses);
        if (initAttempts < maxAttempts) {
            console.log('Retrying in 200ms...');
            setTimeout(initializeApp, 200);
            return;
        } else {
            console.error('Max initialization attempts reached. Some games may not work.');
        }
    }
    
    try {
        console.log('Initializing RetroGameArcade...');
        window.retroArcade = new RetroGameArcade();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        if (initAttempts < maxAttempts) {
            console.log('Retrying initialization...');
            setTimeout(initializeApp, 500);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
} 