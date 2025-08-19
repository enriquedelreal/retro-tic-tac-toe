const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('.'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for subscription demo (if needed)
app.post('/api/subscription', (req, res) => {
    // Mock subscription endpoint for demo purposes
    const { plan, userId } = req.body;
    
    // Simulate successful subscription
    res.json({
        success: true,
        message: `Demo subscription activated for ${plan} plan`,
        subscriptionId: `demo_${Date.now()}`,
        plan: plan,
        userId: userId
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Retro Arcade Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Handle 404s by serving the main page (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('🎮 =======================================');
    console.log('🎮 RETRO GAME ARCADE SERVER STARTED!');
    console.log('🎮 =======================================');
    console.log(`🎮 Server running at: http://localhost:${PORT}`);
    console.log('🎮 Available games:');
    console.log('🎮   • Tic Tac Toe');
    console.log('🎮   • Checkers');
    console.log('🎮   • 2048');
    console.log('🎮   • Snake');
    console.log('🎮   • Tetris');
    console.log('🎮   • Solitaire');
    console.log('🎮   • Space Invaders');
    console.log('🎮   • Battleship');
    console.log('🎮 =======================================');
    console.log('🎮 Press Ctrl+C to stop the server');
    console.log('🎮 =======================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🎮 Shutting down Retro Arcade Server...');
    console.log('🎮 Thanks for playing! 👾');
    process.exit(0);
});