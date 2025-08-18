# 🎮 Retro Game Arcade - Localhost Setup

Welcome to your personal retro game arcade! This guide will help you run the arcade on your local machine.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open Your Browser**
   Navigate to: `http://localhost:3000`

4. **Start Playing!**
   Your retro arcade is now running locally! 🎉

## 🎮 Available Games

- **Tic Tac Toe** - Classic 3x3 grid game with AI opponent
- **Checkers** - Traditional checkers with AI difficulty levels
- **2048** - Number sliding puzzle game
- **Snake** - Classic snake game with speed controls
- **Tetris** - Block-falling puzzle game
- **Solitaire** - Klondike solitaire card game
- **Space Invaders** - Retro space shooter
- **Battleship** - Naval strategy game

## 🛠️ Development Mode

For development with auto-restart on file changes:

```bash
# Install nodemon globally (optional)
npm install -g nodemon

# Run in development mode
npx nodemon server.js
```

## 🎯 Features

- **Retro Pixel Art Style** - Authentic 8-bit/16-bit graphics
- **Responsive Design** - Works on desktop and mobile
- **Local Storage** - Saves high scores and game progress
- **Sound Effects** - Retro audio using Web Audio API
- **Fullscreen Mode** - Immersive gaming experience
- **Keyboard Controls** - Full keyboard support for all games

## 🎨 Customization

### Disable Subscription System
The arcade runs in free mode by default. To enable the subscription system:

1. Open `auth.js`
2. Change line 6: `this.SUBSCRIPTION_ENABLED = false;` to `true`

### Add New Games
1. Create your game JavaScript file in `assets/js/`
2. Add the game container HTML to `index.html`
3. Update the sidebar navigation
4. Initialize the game in `assets/js/app.js`

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 is busy, the server will automatically try other ports, or you can specify one:

```bash
PORT=8080 npm start
```

### Games Not Loading
1. Check browser console for errors
2. Ensure all JavaScript files are loading properly
3. Try refreshing the page (Ctrl+F5)

### Audio Not Working
- Audio requires user interaction to start (browser security)
- Click on a game or press a key to enable audio

## 📱 Mobile Support

The arcade is fully responsive and works great on mobile devices:
- Touch controls for all games
- Swipe gestures where appropriate
- Optimized layouts for small screens

## 🎵 Audio Features

All games include retro sound effects generated using the Web Audio API:
- Move/action sounds
- Victory fanfares
- Game over sounds
- Button click feedback

## 🏆 High Scores

High scores and game statistics are automatically saved to your browser's local storage:
- Best scores for each game
- Longest snake length
- Highest 2048 tile
- Fastest solitaire completion

## 🎪 Game Controls

### Universal Controls
- **F**: Toggle fullscreen mode
- **Esc**: Exit fullscreen
- **Sidebar Toggle**: Show/hide game menu

### Game-Specific Controls
Each game has detailed control instructions in its help section (click the 🎮 CONTROLS button).

## 🔄 Updates

To update your arcade:
1. Download the latest files
2. Replace the old files
3. Restart the server
4. Refresh your browser

## 🎉 Enjoy Your Arcade!

You now have a fully functional retro game arcade running on your local machine. All games work offline and your progress is saved locally.

Happy gaming! 🕹️👾🎮