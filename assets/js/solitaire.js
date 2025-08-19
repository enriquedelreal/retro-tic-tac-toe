// Retro Solitaire - Klondike Solitaire Game Logic

class RetroSolitaire {
    constructor() {
        this.deck = [];
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []]; // Hearts, Diamonds, Clubs, Spades
        this.tableau = [[], [], [], [], [], [], []]; // 7 columns
        this.selectedCard = null;
        this.selectedPile = null;
        this.moves = 0;
        this.time = 0;
        this.timer = null;
        this.gameWon = false;
        this.score = 0;
        this.difficulty = 'normal'; // 'easy', 'normal', 'hard', 'very_hard'
        this.undoStack = [];
        this.maxUndos = 0;
        
        this.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.suitSymbols = {
            hearts: '♥',
            diamonds: '♦',
            clubs: '♣',
            spades: '♠'
        };
        this.suitColors = {
            hearts: 'red',
            diamonds: 'red',
            clubs: 'black',
            spades: 'black'
        };
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.setupDifficulty();
        this.renderGame();
        this.startTimer();
        console.log('Solitaire: Game initialized with difficulty:', this.difficulty);
    }

    setupDifficulty() {
        switch (this.difficulty) {
            case 'easy':
                this.maxUndos = 10;
                break;
            case 'normal':
                this.maxUndos = 5;
                break;
            case 'hard':
                this.maxUndos = 2;
                break;
            case 'very_hard':
                this.maxUndos = 0;
                break;
        }
        this.updateDifficultyDisplay();
    }

    createDeck() {
        this.deck = [];
        for (const suit of this.suits) {
            for (let i = 0; i < this.ranks.length; i++) {
                this.deck.push({
                    suit: suit,
                    rank: this.ranks[i],
                    value: i + 1, // A=1, 2=2, ..., K=13
                    faceUp: false,
                    color: this.suitColors[suit]
                });
            }
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCards() {
        // Deal to tableau
        let cardIndex = 0;
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.deck[cardIndex++];
                if (row === col) {
                    card.faceUp = true; // Top card is face up
                }
                this.tableau[col].push(card);
            }
        }
        
        // Remaining cards go to stock
        this.stock = this.deck.slice(cardIndex);
        this.waste = [];
    }

    setupEventListeners() {
        // Stock click
        document.getElementById('solitaireStock').addEventListener('click', () => {
            this.clickStock();
        });

        // Foundation pile clicks
        for (let i = 0; i < 4; i++) {
            document.getElementById(`solitaireFoundation${i}`).addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectCard(`foundation${i}`, 0);
            });
        }

        // Tableau pile clicks
        for (let i = 0; i < 7; i++) {
            document.getElementById(`solitaireTableau${i}`).addEventListener('click', (e) => {
                // If clicking on the tableau element itself (empty space), handle it
                if (e.target.id === `solitaireTableau${i}` || e.target.classList.contains('empty-pile')) {
                    this.selectCard(`tableau${i}`, 0);
                }
            });
        }

        // New game button
        document.getElementById('solitaireNewGame').addEventListener('click', () => {
            this.newGame();
        });

        // Auto-complete button
        document.getElementById('solitaireAutoComplete').addEventListener('click', () => {
            this.autoComplete();
        });

        // Hint button
        document.getElementById('solitaireHint').addEventListener('click', () => {
            this.showHint();
        });

        // Difficulty buttons
        document.getElementById('solitaireEasy').addEventListener('click', () => {
            this.setDifficulty('easy');
        });

        document.getElementById('solitaireNormal').addEventListener('click', () => {
            this.setDifficulty('normal');
        });

        document.getElementById('solitaireHard').addEventListener('click', () => {
            this.setDifficulty('hard');
        });

        document.getElementById('solitaireVeryHard').addEventListener('click', () => {
            this.setDifficulty('very_hard');
        });

        // Undo button
        document.getElementById('solitaireUndo').addEventListener('click', () => {
            this.undoMove();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('solitaire-game').classList.contains('active')) {
                switch (e.key.toLowerCase()) {
                    case 'n':
                        this.newGame();
                        break;
                    case 'h':
                        this.showHint();
                        break;
                    case 'a':
                        this.autoComplete();
                        break;
                    case 'u':
                        this.undoMove();
                        break;
                    case '1':
                        this.setDifficulty('easy');
                        break;
                    case '2':
                        this.setDifficulty('normal');
                        break;
                    case '3':
                        this.setDifficulty('hard');
                        break;
                    case '4':
                        this.setDifficulty('very_hard');
                        break;
                    case 'f':
                        if (window.retroArcade && typeof window.retroArcade.toggleFullscreen === 'function') {
                            window.retroArcade.toggleFullscreen();
                        }
                        break;
                }
            }
        });
    }

    clickStock() {
        if (this.stock.length > 0) {
            // Draw cards from stock to waste
            const card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
            this.moves++;
            this.saveMoveForUndo('stock');
        } else if (this.waste.length > 0) {
            // Reset: move all waste back to stock
            while (this.waste.length > 0) {
                const card = this.waste.pop();
                card.faceUp = false;
                this.stock.push(card);
            }
        }
        
        this.renderGame();
        this.updateStats();
    }

    selectCard(pile, cardIndex) {
        if (this.gameWon) return;

        // If clicking on selected card, deselect
        if (this.selectedCard && this.selectedPile === pile && this.selectedCard.index === cardIndex) {
            this.deselectCard();
            return;
        }

        // Try to move if we have a selection
        if (this.selectedCard) {
            console.log('Attempting move from', this.selectedPile, 'to', pile);
            if (this.tryMove(this.selectedPile, this.selectedCard.index, pile, cardIndex)) {
                this.deselectCard();
                this.moves++;
                this.saveMoveForUndo('move', this.selectedPile, this.selectedCard.index, pile, cardIndex);
                this.updateStats();
                this.checkWin();
            } else {
                console.log('Move failed');
                this.deselectCard();
            }
            return;
        }

        // Select new card
        const card = this.getCardFromPile(pile, cardIndex);
        if (card && card.faceUp && this.canSelectCard(pile, cardIndex)) {
            this.selectedCard = { pile, index: cardIndex };
            this.selectedPile = pile;
            this.renderGame();
        } else if (pile.startsWith('foundation') && this.foundations[parseInt(pile.replace('foundation', ''))].length === 0) {
            // Handle clicking on empty foundation pile - this is a valid target for moving cards
            // Don't select it, but it can be used as a target in the next click
        } else if (pile.startsWith('tableau')) {
            // Handle clicking on empty tableau space - check if it's empty
            const tableauIndex = parseInt(pile.replace('tableau', ''));
            if (this.tableau[tableauIndex].length === 0) {
                // Empty tableau space - this is a valid target for moving cards
                // Don't select it, but it can be used as a target in the next click
            }
        }
    }

    getCardFromPile(pile, index) {
        switch (pile) {
            case 'waste':
                return this.waste[this.waste.length - 1];
            case 'foundation0':
            case 'foundation1':
            case 'foundation2':
            case 'foundation3':
                const foundationIndex = parseInt(pile.replace('foundation', ''));
                return this.foundations[foundationIndex][index];
            default:
                if (pile.startsWith('tableau')) {
                    const tableauIndex = parseInt(pile.replace('tableau', ''));
                    return this.tableau[tableauIndex][index];
                }
        }
        return null;
    }

    canSelectCard(pile, cardIndex) {
        if (pile === 'waste') {
            return cardIndex === this.waste.length - 1; // Only top waste card
        }
        
        if (pile.startsWith('foundation')) {
            const foundationIndex = parseInt(pile.replace('foundation', ''));
            const foundation = this.foundations[foundationIndex];
            return cardIndex === foundation.length - 1; // Only top foundation card
        }
        
        if (pile.startsWith('tableau')) {
            const tableauIndex = parseInt(pile.replace('tableau', ''));
            const tableau = this.tableau[tableauIndex];
            return cardIndex >= 0 && cardIndex < tableau.length && tableau[cardIndex].faceUp;
        }
        
        return false;
    }

    tryMove(fromPile, fromIndex, toPile, toIndex) {
        const fromCard = this.getCardFromPile(fromPile, fromIndex);
        if (!fromCard) return false;

        // Move to foundation
        if (toPile.startsWith('foundation')) {
            return this.moveToFoundation(fromPile, fromIndex, toPile);
        }

        // Move to tableau
        if (toPile.startsWith('tableau')) {
            return this.moveToTableau(fromPile, fromIndex, toPile);
        }

        return false;
    }

    moveToFoundation(fromPile, fromIndex, toPile) {
        const foundationIndex = parseInt(toPile.replace('foundation', ''));
        const foundation = this.foundations[foundationIndex];
        const fromCard = this.getCardFromPile(fromPile, fromIndex);

        console.log('Moving to foundation:', fromCard, 'foundation length:', foundation.length);

        // Check if move is valid
        if (foundation.length === 0) {
            // Empty foundation - must be Ace
            console.log('Empty foundation, checking if card is Ace:', fromCard.rank);
            if (fromCard.rank !== 'A') return false;
        } else {
            // Must be same suit and next rank
            const topCard = foundation[foundation.length - 1];
            console.log('Foundation has cards, checking suit and rank:', fromCard.suit, topCard.suit, fromCard.value, topCard.value);
            if (fromCard.suit !== topCard.suit || fromCard.value !== topCard.value + 1) {
                return false;
            }
        }

        // Hard mode: Can only move cards from tableau to foundation (not from waste)
        if (this.difficulty === 'hard' || this.difficulty === 'very_hard') {
            if (fromPile === 'waste') {
                this.updateStatus('Hard mode: Can only move from tableau to foundation!');
                return false;
            }
        }

        // Very hard mode: Must build foundations in order (hearts, diamonds, clubs, spades)
        if (this.difficulty === 'very_hard') {
            const expectedSuit = this.suits[foundationIndex];
            if (fromCard.suit !== expectedSuit) {
                this.updateStatus('Very hard mode: Must build foundations in suit order!');
                return false;
            }
        }

        // Remove card from source
        this.removeCardFromPile(fromPile, fromIndex);
        
        // Add to foundation
        foundation.push(fromCard);
        
        // Update score based on difficulty
        let scoreBonus = 10;
        if (this.difficulty === 'easy') scoreBonus = 15;
        else if (this.difficulty === 'hard') scoreBonus = 8;
        else if (this.difficulty === 'very_hard') scoreBonus = 5;
        
        this.score += scoreBonus;
        
        this.renderGame();
        return true;
    }

    moveToTableau(fromPile, fromIndex, toPile) {
        const tableauIndex = parseInt(toPile.replace('tableau', ''));
        const tableau = this.tableau[tableauIndex];
        
        // Get cards to move (might be multiple from tableau)
        const cardsToMove = this.getCardsToMove(fromPile, fromIndex);
        if (cardsToMove.length === 0) return false;

        const bottomCard = cardsToMove[0]; // Bottom card of selection

        // Check if move is valid
        if (tableau.length === 0) {
            // Empty tableau - must be King
            if (bottomCard.rank !== 'K') return false;
        } else {
            // Must be opposite color and one rank lower
            const topCard = tableau[tableau.length - 1];
            if (bottomCard.color === topCard.color || bottomCard.value !== topCard.value - 1) {
                return false;
            }
        }

        // Remove cards from source
        this.removeCardsFromPile(fromPile, fromIndex);
        
        // Add cards to tableau
        tableau.push(...cardsToMove);
        
        this.renderGame();
        return true;
    }

    getCardsToMove(pile, index) {
        if (pile === 'waste') {
            return [this.waste[this.waste.length - 1]];
        }
        
        if (pile.startsWith('foundation')) {
            const foundationIndex = parseInt(pile.replace('foundation', ''));
            return [this.foundations[foundationIndex][index]];
        }
        
        if (pile.startsWith('tableau')) {
            const tableauIndex = parseInt(pile.replace('tableau', ''));
            return this.tableau[tableauIndex].slice(index);
        }
        
        return [];
    }

    removeCardFromPile(pile, index) {
        if (pile === 'waste') {
            this.waste.pop();
        } else if (pile.startsWith('foundation')) {
            const foundationIndex = parseInt(pile.replace('foundation', ''));
            this.foundations[foundationIndex].pop();
        } else if (pile.startsWith('tableau')) {
            const tableauIndex = parseInt(pile.replace('tableau', ''));
            this.tableau[tableauIndex].splice(index, 1);
            // Flip the next card if it exists and is face down
            const tableau = this.tableau[tableauIndex];
            if (tableau.length > 0 && !tableau[tableau.length - 1].faceUp) {
                tableau[tableau.length - 1].faceUp = true;
                this.score += 5; // Bonus for revealing card
            }
        }
    }

    removeCardsFromPile(pile, index) {
        if (pile.startsWith('tableau')) {
            const tableauIndex = parseInt(pile.replace('tableau', ''));
            this.tableau[tableauIndex].splice(index);
            // Flip the next card if it exists and is face down
            const tableau = this.tableau[tableauIndex];
            if (tableau.length > 0 && !tableau[tableau.length - 1].faceUp) {
                tableau[tableau.length - 1].faceUp = true;
                this.score += 5; // Bonus for revealing card
            }
        } else {
            this.removeCardFromPile(pile, index);
        }
    }

    deselectCard() {
        this.selectedCard = null;
        this.selectedPile = null;
        this.renderGame();
    }

    checkWin() {
        const totalFoundationCards = this.foundations.reduce((sum, foundation) => sum + foundation.length, 0);
        if (totalFoundationCards === 52) {
            this.gameWon = true;
            this.stopTimer();
            this.score += 1000; // Win bonus
            this.updateStats();
            this.showWinMessage();
        }
    }

    showWinMessage() {
        const statusElement = document.getElementById('solitaireStatus');
        statusElement.textContent = `🎉 You Win! Score: ${this.score} | Time: ${this.formatTime(this.time)} | Moves: ${this.moves}`;
        this.playWinSound();
    }

    autoComplete() {
        // Auto-move cards to foundations when possible
        let moved = false;
        
        // Check waste pile
        if (this.waste.length > 0) {
            const card = this.waste[this.waste.length - 1];
            for (let i = 0; i < 4; i++) {
                if (this.canMoveToFoundation(card, i)) {
                    this.waste.pop();
                    this.foundations[i].push(card);
                    this.score += 10;
                    moved = true;
                    break;
                }
            }
        }
        
        // Check tableau piles
        for (let t = 0; t < 7; t++) {
            const tableau = this.tableau[t];
            if (tableau.length > 0) {
                const card = tableau[tableau.length - 1];
                if (card.faceUp) {
                    for (let i = 0; i < 4; i++) {
                        if (this.canMoveToFoundation(card, i)) {
                            tableau.pop();
                            this.foundations[i].push(card);
                            this.score += 10;
                            
                            // Flip next card if needed
                            if (tableau.length > 0 && !tableau[tableau.length - 1].faceUp) {
                                tableau[tableau.length - 1].faceUp = true;
                                this.score += 5;
                            }
                            moved = true;
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            this.moves++;
            this.renderGame();
            this.updateStats();
            this.checkWin();
            
            // Continue auto-completing if more moves available
            setTimeout(() => this.autoComplete(), 200);
        }
    }

    canMoveToFoundation(card, foundationIndex) {
        const foundation = this.foundations[foundationIndex];
        
        if (foundation.length === 0) {
            return card.rank === 'A';
        } else {
            const topCard = foundation[foundation.length - 1];
            return card.suit === topCard.suit && card.value === topCard.value + 1;
        }
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.newGame();
    }

    saveMoveForUndo(type, fromPile, fromIndex, toPile, toIndex) {
        if (this.maxUndos === 0) return;

        const move = {
            type: type,
            fromPile: fromPile,
            fromIndex: fromIndex,
            toPile: toPile,
            toIndex: toIndex,
            cards: [],
            score: this.score
        };

        // Save the cards that were moved
        if (type === 'move') {
            move.cards = this.getCardsToMove(fromPile, fromIndex).map(card => ({...card}));
        } else if (type === 'stock') {
            move.cards = [this.waste[this.waste.length - 1]];
        }

        this.undoStack.push(move);
        
        // Limit undo stack size
        if (this.undoStack.length > this.maxUndos) {
            this.undoStack.shift();
        }
    }

    undoMove() {
        if (this.undoStack.length === 0 || this.maxUndos === 0) {
            this.updateStatus('No undos available!');
            return;
        }

        const move = this.undoStack.pop();
        
        if (move.type === 'move') {
            // Undo card move
            const cards = move.cards;
            
            // Remove cards from destination
            if (move.toPile.startsWith('foundation')) {
                const foundationIndex = parseInt(move.toPile.replace('foundation', ''));
                this.foundations[foundationIndex].pop();
            } else if (move.toPile.startsWith('tableau')) {
                const tableauIndex = parseInt(move.toPile.replace('tableau', ''));
                this.tableau[tableauIndex].splice(move.toIndex);
            }

            // Add cards back to source
            if (move.fromPile === 'waste') {
                this.waste.push(...cards);
            } else if (move.fromPile.startsWith('foundation')) {
                const foundationIndex = parseInt(move.fromPile.replace('foundation', ''));
                this.foundations[foundationIndex].push(...cards);
            } else if (move.fromPile.startsWith('tableau')) {
                const tableauIndex = parseInt(move.fromPile.replace('tableau', ''));
                this.tableau[tableauIndex].splice(move.fromIndex, 0, ...cards);
            }

        } else if (move.type === 'stock') {
            // Undo stock draw
            const card = this.waste.pop();
            card.faceUp = false;
            this.stock.push(card);
        }

        this.score = move.score;
        this.moves--;
        this.renderGame();
        this.updateStats();
        this.updateStatus('Move undone!');
    }

    updateDifficultyDisplay() {
        const difficultyElement = document.getElementById('solitaireDifficulty');
        if (difficultyElement) {
            const difficultyNames = {
                'easy': 'Easy',
                'normal': 'Normal', 
                'hard': 'Hard',
                'very_hard': 'Very Hard'
            };
            difficultyElement.textContent = difficultyNames[this.difficulty];
        }

        // Update undo button state
        const undoButton = document.getElementById('solitaireUndo');
        if (undoButton) {
            undoButton.disabled = this.maxUndos === 0;
            undoButton.textContent = `Undo (${this.undoStack.length}/${this.maxUndos})`;
        }
    }

    showHint() {
        // Difficulty-specific hints
        let hint = '';
        switch (this.difficulty) {
            case 'easy':
                hint = 'Easy mode: You have 10 undos! Look for Aces to start foundations.';
                break;
            case 'normal':
                hint = 'Normal mode: You have 5 undos. Build foundations and tableau carefully.';
                break;
            case 'hard':
                hint = 'Hard mode: Only 2 undos! Can only move from tableau to foundation.';
                break;
            case 'very_hard':
                hint = 'Very hard mode: No undos! Must build foundations in suit order (♥♦♣♠).';
                break;
        }
        this.updateStatus(hint);
    }

    newGame() {
        this.stopTimer();
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.selectedCard = null;
        this.selectedPile = null;
        this.moves = 0;
        this.time = 0;
        this.gameWon = false;
        this.score = 0;
        this.undoStack = [];
        
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.setupDifficulty();
        this.renderGame();
        this.updateStats();
        this.startTimer();
        this.updateStatus(`New ${this.difficulty} game started! Good luck!`);
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.time++;
            this.updateStats();
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateStats() {
        document.getElementById('solitaireScore').textContent = this.score;
        document.getElementById('solitaireMoves').textContent = this.moves;
        document.getElementById('solitaireTime').textContent = this.formatTime(this.time);
        this.updateDifficultyDisplay();
    }

    updateStatus(message) {
        document.getElementById('solitaireStatus').textContent = message;
    }

    renderGame() {
        this.renderStock();
        this.renderWaste();
        this.renderFoundations();
        this.renderTableau();
    }

    renderStock() {
        const stockElement = document.getElementById('solitaireStock');
        stockElement.innerHTML = '';
        
        if (this.stock.length > 0) {
            const cardElement = this.createCardElement({ faceUp: false }, 'stock', 0);
            stockElement.appendChild(cardElement);
        } else {
            stockElement.innerHTML = '<div class="empty-pile">♻</div>';
        }
    }

    renderWaste() {
        const wasteElement = document.getElementById('solitaireWaste');
        wasteElement.innerHTML = '';
        
        if (this.waste.length > 0) {
            const topCard = this.waste[this.waste.length - 1];
            const cardElement = this.createCardElement(topCard, 'waste', this.waste.length - 1);
            wasteElement.appendChild(cardElement);
        } else {
            wasteElement.innerHTML = '<div class="empty-pile"></div>';
        }
    }

    renderFoundations() {
        for (let i = 0; i < 4; i++) {
            const foundationElement = document.getElementById(`solitaireFoundation${i}`);
            foundationElement.innerHTML = '';
            
            const foundation = this.foundations[i];
            if (foundation.length > 0) {
                const topCard = foundation[foundation.length - 1];
                const cardElement = this.createCardElement(topCard, `foundation${i}`, foundation.length - 1);
                foundationElement.appendChild(cardElement);
            } else {
                foundationElement.innerHTML = `<div class="empty-pile foundation-empty">${this.suitSymbols[this.suits[i]]}</div>`;
            }
        }
    }

    renderTableau() {
        for (let col = 0; col < 7; col++) {
            const tableauElement = document.getElementById(`solitaireTableau${col}`);
            tableauElement.innerHTML = '';
            
            const tableau = this.tableau[col];
            tableau.forEach((card, index) => {
                const cardElement = this.createCardElement(card, `tableau${col}`, index);
                cardElement.style.top = `${index * 20}px`;
                cardElement.style.zIndex = index;
                tableauElement.appendChild(cardElement);
            });
            
            if (tableau.length === 0) {
                tableauElement.innerHTML = '<div class="empty-pile tableau-empty">K</div>';
            }
        }
    }

    createCardElement(card, pile, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'solitaire-card';
        
        if (!card.faceUp) {
            cardElement.classList.add('face-down');
            cardElement.innerHTML = '<div class="card-back">🂠</div>';
        } else {
            cardElement.classList.add('face-up', card.color);
            cardElement.innerHTML = `
                <div class="card-rank">${card.rank}</div>
                <div class="card-suit-center">${this.suitSymbols[card.suit]}</div>
                <div class="card-rank-bottom">${card.rank}</div>
            `;
        }
        
        // Add selection highlight
        if (this.selectedCard && this.selectedCard.pile === pile && this.selectedCard.index === index) {
            cardElement.classList.add('selected');
        }
        
        // Add click handler
        cardElement.addEventListener('click', () => {
            this.selectCard(pile, index);
        });
        
        return cardElement;
    }

    // Sound effects
    createAudioContext() {
        if (!this.audioContext) {
            this.audioContext = window.sharedAudioContext || new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playWinSound() {
        this.createAudioContext();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Victory fanfare
        const frequencies = [523, 659, 784, 1047, 1319];
        const timeStep = 0.2;
        
        frequencies.forEach((freq, index) => {
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * timeStep);
        });
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + frequencies.length * timeStep);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + frequencies.length * timeStep);
    }
}

// Export the class for use in app.js
window.RetroSolitaire = RetroSolitaire;
