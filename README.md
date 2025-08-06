# 🎮 Retro Tic Tac Toe

A locally hosted 2-player Tic Tac Toe game with a retro pixel art visual style, mimicking the charm of a Nintendo 3DS game while feeling like a "high-tech" product from the past.

## ✨ Features

### 🎯 Game Mechanics
- **3x3 Grid Tic Tac Toe**: Classic gameplay with modern retro aesthetics
- **Turn-Based Play**: Player 1 (X) vs Player 2 (O) with visual turn indicators
- **Win Detection**: Detects horizontal, vertical, and diagonal wins
- **Draw Detection**: Automatically detects when the game ends in a draw

### 🎨 Visual Design
- **Retro Pixel Art Style**: 8-bit/16-bit inspired graphics
- **Nintendo 3DS Aesthetic**: Chiseled buttons, pixel-perfect grid, and retro color palette
- **CRT Screen Effect**: Subtle scan lines for authentic retro feel
- **Smooth Animations**: Place symbols, winning highlights, and button interactions

### 🎵 Audio Experience
- **Retro Sound Effects**: 
  - Move placement sounds
  - Victory fanfare for wins
  - Draw game sounds
  - Button click feedback
- **Web Audio API**: No external audio files required

### 📊 Game Features
- **Score Tracking**: Persistent win counts for both players
- **Reset Functionality**: 
  - Reset Game: Clears board, keeps scores
  - Reset Score: Clears both board and scores
- **Game Status Messages**: Real-time feedback and instructions

### ⌨️ Accessibility
- **Keyboard Support**: 
  - Numbers 1-9 to place moves
  - 'R' key to reset game
  - 'S' key to reset score
- **Mobile Responsive**: Works on desktop and mobile devices

## 🚀 How to Run

### Option 1: Simple HTML File (Recommended)
1. Download or clone this repository
2. Navigate to the project directory
3. Open `index.html` in your web browser
4. Start playing!

### Option 2: Local Server (For Development)
If you prefer to run it on a local server:

```bash
# Using Python 3
python -m http.server 3000

# Using Python 2
python -m SimpleHTTPServer 3000

# Using Node.js (if you have http-server installed)
npx http-server -p 3000
```

Then open `http://localhost:3000` in your browser.

## 🎮 How to Play

1. **Starting**: Player X always goes first
2. **Taking Turns**: Click on any empty cell to place your symbol
3. **Winning**: Get three of your symbols in a row (horizontal, vertical, or diagonal)
4. **Scoring**: Wins are automatically tracked for both players
5. **Resetting**: Use the buttons to reset the game or scores

### Keyboard Shortcuts
- **1-9**: Place move in corresponding cell (1 = top-left, 9 = bottom-right)
- **R**: Reset game (keeps scores)
- **S**: Reset score (clears everything)

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Advanced styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Modern game logic with classes and Web Audio API
- **Google Fonts**: Press Start 2P for authentic pixel font

### Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

### Audio Requirements
- Modern browsers with Web Audio API support
- User interaction required for audio to work (browser security policy)

## 📁 Project Structure

```
retro-tic-tac-toe/
├── index.html              # Main game file
├── assets/
│   ├── css/
│   │   └── style.css       # Retro styling and animations
│   └── js/
│       └── game.js         # Game logic and audio
└── README.md               # This file
```

## 🎨 Design Philosophy

The game combines the nostalgic appeal of retro gaming with modern web technologies:

- **Pixel-Perfect Design**: Every element is carefully crafted to look like it belongs in a classic game
- **Responsive Layout**: Works seamlessly across different screen sizes
- **Accessibility First**: Keyboard navigation and clear visual feedback
- **Performance Optimized**: Smooth animations and efficient code

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- Add more sound effects
- Implement different themes
- Add AI opponent
- Create tournament mode
- Add particle effects

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy your retro gaming experience! 🕹️** 