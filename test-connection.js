const io = require('socket.io-client');

console.log('🔌 Testing Socket.IO connection to localhost:8000...');

const socket = io('http://localhost:8000', {
    transports: ['websocket', 'polling'],
    timeout: 10000
});

socket.on('connect', () => {
    console.log('✅ Successfully connected to server!');
    console.log('🎮 Socket ID:', socket.id);
    console.log('🎮 Ready for multiplayer games!');
    
    // Test creating a room
    socket.emit('createRoom');
});

socket.on('roomCreated', (roomId) => {
    console.log('🎮 Room created successfully:', roomId);
    socket.disconnect();
    process.exit(0);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection failed:', error.message);
    console.error('💡 Make sure the server is running with: npm start');
    process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.error('⏰ Connection timeout');
    process.exit(1);
}, 10000);
