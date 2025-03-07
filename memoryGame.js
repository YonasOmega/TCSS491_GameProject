// memoryGame.js
class MemoryGame {
    constructor(game) {
        this.game = game;
        this.canvas = this.game.ctx.canvas;
        this.ctx = this.game.ctx;
        
        // Set up the moving particle background
        this.particles = [];
        this.numParticles = 50;
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5, // velocity x
                vy: (Math.random() - 0.5) * 0.5, // velocity y
                size: Math.random() * 2 + 1,
                color: "rgba(255,255,255,0.7)"
            });
        }
        
        // Set up timer properties
        this.timeLimit = 60000; // 30 seconds in milliseconds
        this.startTime = performance.now();
        this.gameOver = false;  // Track if the game already ended
        
        // Grid settings for Memory game: 4 rows x 4 columns (16 cards = 8 pairs)
        this.rows = 4;
        this.cols = 4;
        this.cardWidth = 80;
        this.cardHeight = 80;
        this.padding = 10;
        // Center the grid on the canvas
        this.offsetX = (this.canvas.width - (this.cols * this.cardWidth + (this.cols - 1) * this.padding)) / 2;
        this.offsetY = (this.canvas.height - (this.rows * this.cardHeight + (this.rows - 1) * this.padding)) / 2;
        
        // Define 8 unique symbols (emojis, letters, etc.)
        this.symbols = ["🍎", "🍌", "🍇", "🍓", "🍒", "🍍", "🥝", "🍉"];
        this.cards = [];
        
        // Create an array with pairs of symbols and shuffle them.
        let cardSymbols = [];
        this.symbols.forEach(symbol => {
            cardSymbols.push(symbol, symbol);
        });
        cardSymbols = this.shuffleArray(cardSymbols);
        
        // Create card objects with positions and assign symbols
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const index = r * this.cols + c;
                const card = {
                    x: this.offsetX + c * (this.cardWidth + this.padding),
                    y: this.offsetY + r * (this.cardHeight + this.padding),
                    width: this.cardWidth,
                    height: this.cardHeight,
                    symbol: cardSymbols[index],
                    revealed: false,
                    matched: false
                };
                this.cards.push(card);
            }
        }
        
        // Array to track currently flipped cards
        this.flippedCards = [];
        // Lock clicking when checking for a match
        this.locked = false;
        
        // Bind and add mouse click listener
        this.handleClick = this.handleClick.bind(this);
        this.canvas.addEventListener("click", this.handleClick);
    }
    
    // Fisher-Yates shuffle
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    handleClick(event) {
        if (this.locked) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Check each card to see if it was clicked
        for (const card of this.cards) {
            if (!card.revealed && !card.matched &&
                clickX >= card.x && clickX <= card.x + card.width &&
                clickY >= card.y && clickY <= card.y + card.height) {
                card.revealed = true;
                this.flippedCards.push(card);
                break;  // Only flip one card per click
            }
        }
        
        // If two cards are flipped, check for a match
        if (this.flippedCards.length === 2) {
            this.locked = true;
            const [card1, card2] = this.flippedCards;
            if (card1.symbol === card2.symbol) {
                card1.matched = true;
                card2.matched = true;
                this.flippedCards = [];
                this.locked = false;
                // Check if all cards are matched → win condition
                if (this.cards.every(card => card.matched)) {
                    this.endGame(true);
                }
            } else {
                // Not a match: flip them back after 1 second
                setTimeout(() => {
                    card1.revealed = false;
                    card2.revealed = false;
                    this.flippedCards = [];
                    this.locked = false;
                }, 1000);
            }
        }
    }
    
    removeListeners() {
        this.canvas.removeEventListener("click", this.handleClick);
    }
    
    update() {
        // Update particles for moving background
        for (let p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            // Wrap around screen edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
        }
        
        // Check timer – if time limit is reached, end game as loss
        const elapsed = performance.now() - this.startTime;
        if (!this.gameOver && elapsed > this.timeLimit) {
            this.gameOver = true;
            this.endGame(false);
        }
    }
    
    draw(ctx) {
        // Draw moving particle background (no gradient)
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (const p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.closePath();
        }
        
        // Draw timer at top center
        const elapsed = performance.now() - this.startTime;
        const remaining = Math.max(0, this.timeLimit - elapsed);
        const seconds = (remaining / 1000).toFixed(1);
        ctx.fillStyle = "rgb(0,255,0)";
        ctx.font = "24px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(`Time: ${seconds}s`, ctx.canvas.width / 2, 10);
        
        // Draw each card in the grid
        for (const card of this.cards) {
            if (card.revealed || card.matched) {
                // Revealed or matched cards: white background with symbol
                ctx.fillStyle = "white";
                ctx.fillRect(card.x, card.y, card.width, card.height);
                ctx.fillStyle = "black";
                ctx.font = "40px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(card.symbol, card.x + card.width / 2, card.y + card.height / 2);
            } else {
                // Face-down cards: green background
                ctx.fillStyle = "rgb(0,255,0)";
                ctx.fillRect(card.x, card.y, card.width, card.height);
            }
            // Draw border around card
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.strokeRect(card.x, card.y, card.width, card.height);
        }
    }
    
    endGame(success) {
        const message = success ? "All pairs matched! Well done." : "Time's up! You lost the game.";
        setTimeout(() => {
            this.removeListeners();
            this.game.endMinigame(message, success);
        }, 500);
    }
}

export { MemoryGame };
