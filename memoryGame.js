// memoryGame.js
class MemoryGame {
    constructor(game) {
        this.game = game;
        this.canvas = this.game.ctx.canvas;
        this.ctx = this.game.ctx;
        
        // Retro computer theme colors
        this.colors = {
            background: "#000000",
            cardBack: "#00AA00",
            cardFront: "#111111",
            text: "#00FF00",
            particles: "#00FF00",
            accent: "#00CCFF"
        };
        
        // CRT scan line effect
        this.scanLineSpacing = 4;
        this.scanLineOpacity = 0.15;
        
        // Terminal text effect
        this.terminalCharacters = "01010101010";
        this.terminalIndex = 0;
        this.terminalSpeed = 3;
        this.terminalCounter = 0;
        
        // Set up the moving particle background (more grid-like for retro feel)
        this.particles = [];
        this.numParticles = 80; // More particles for a denser effect
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: Math.floor(Math.random() * this.canvas.width / 10) * 10, // Grid-aligned
                y: Math.floor(Math.random() * this.canvas.height / 10) * 10, // Grid-aligned
                vx: (Math.random() - 0.5) * 0.5, // velocity x
                vy: (Math.random() - 0.5) * 0.5, // velocity y
                size: Math.random() * 2 + 1,
                color: `rgba(0,255,0,${Math.random() * 0.5 + 0.2})`
            });
        }
        
        // Set up timer properties
        this.timeLimit = 45000; // 45 seconds (more challenging)
        this.startTime = performance.now();
        this.gameOver = false;
        
        // Add score tracking
        this.score = 0;
        this.combo = 0;
        this.lastMatchTime = 0;
        
        // Difficulty mechanics
        this.cardDisappearTime = 10000; // Cards disappear after 10 seconds if not matched
        this.revealedTimers = {}; // Track how long each card has been revealed
        
        // Grid settings for Memory game: 4 rows x 4 columns (16 cards = 8 pairs)
        this.rows = 4;
        this.cols = 4;
        this.cardWidth = 80;
        this.cardHeight = 80;
        this.padding = 10;
        // Center the grid on the canvas
        this.offsetX = (this.canvas.width - (this.cols * this.cardWidth + (this.cols - 1) * this.padding)) / 2;
        this.offsetY = (this.canvas.height - (this.rows * this.cardHeight + (this.rows - 1) * this.padding)) / 2;
        
        // Define 8 unique symbols (retro computer themed)
        this.symbols = ["@", "#", "$", "%", "&", "*", "!", "?"];
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
                    matched: false,
                    animation: {
                        flipping: false,
                        progress: 0,
                        speed: 0.1
                    },
                    disappearing: false,
                    glitchEffect: false,
                    glitchIntensity: 0
                };
                this.cards.push(card);
            }
        }
        
        // Array to track currently flipped cards
        this.flippedCards = [];
        // Lock clicking when checking for a match
        this.locked = false;
        
        // Sound effects (placeholder for implementation)
        this.sounds = {
            flip: new Audio(), // Create sounds if needed
            match: new Audio(),
            noMatch: new Audio(),
            win: new Audio(),
            lose: new Audio()
        };
        
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
                card.animation.flipping = true;
                card.animation.progress = 0;
                
                // Reset card's disappear timer
                this.revealedTimers[this.cards.indexOf(card)] = performance.now();
                
                this.flippedCards.push(card);
                break;  // Only flip one card per click
            }
        }
        
        // If two cards are flipped, check for a match
        if (this.flippedCards.length === 2) {
            this.locked = true;
            const [card1, card2] = this.flippedCards;
            if (card1.symbol === card2.symbol) {
                // Match found!
                setTimeout(() => {
                    card1.matched = true;
                    card2.matched = true;
                    
                    // Apply matched animation effect
                    card1.glitchEffect = true;
                    card2.glitchEffect = true;
                    
                    // Calculate score based on time and combo
                    const currentTime = performance.now();
                    const timeSinceLastMatch = currentTime - this.lastMatchTime;
                    
                    // Increase combo if matched quickly
                    if (timeSinceLastMatch < 3000 && this.lastMatchTime > 0) {
                        this.combo++;
                    } else {
                        this.combo = 1;
                    }
                    
                    // Calculate score: base + combo bonus + time bonus
                    const basePoints = 100;
                    const comboBonus = (this.combo - 1) * 50;
                    const timeBonus = Math.max(0, Math.floor((5000 - timeSinceLastMatch) / 100));
                    
                    this.score += basePoints + comboBonus + timeBonus;
                    this.lastMatchTime = currentTime;
                    
                    this.flippedCards = [];
                    this.locked = false;
                    
                    // Check if all cards are matched → win condition
                    if (this.cards.every(card => card.matched)) {
                        this.endGame(true);
                    }
                }, 500);
            } else {
                // Not a match: flip them back after 1 second
                setTimeout(() => {
                    // Apply a glitch effect briefly before flipping back
                    card1.glitchEffect = true;
                    card2.glitchEffect = true;
                    card1.glitchIntensity = 1;
                    card2.glitchIntensity = 1;
                    
                    setTimeout(() => {
                        card1.revealed = false;
                        card2.revealed = false;
                        card1.animation.flipping = true;
                        card2.animation.flipping = true;
                        card1.animation.progress = 0;
                        card2.animation.progress = 0;
                        card1.glitchEffect = false;
                        card2.glitchEffect = false;
                        this.flippedCards = [];
                        this.locked = false;
                        
                        // Reset combo on failed match
                        this.combo = 0;
                    }, 300);
                }, 700);
            }
        }
    }
    
    removeListeners() {
        this.canvas.removeEventListener("click", this.handleClick);
    }
    
    update() {
        // Update terminal text effect counter
        this.terminalCounter++;
        if (this.terminalCounter >= this.terminalSpeed) {
            this.terminalCounter = 0;
            this.terminalIndex = (this.terminalIndex + 1) % this.terminalCharacters.length;
        }
        
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
        
        // Update card animations
        for (const card of this.cards) {
            // Update flip animation
            if (card.animation.flipping) {
                card.animation.progress += card.animation.speed;
                if (card.animation.progress >= 1) {
                    card.animation.flipping = false;
                    card.animation.progress = 0;
                }
            }
            
            // Update glitch effect
            if (card.glitchEffect) {
                card.glitchIntensity = Math.max(0, card.glitchIntensity - 0.05);
                if (card.glitchIntensity <= 0) {
                    card.glitchEffect = false;
                }
            }
        }
        
        // Check for cards that need to auto-hide (disappear mechanic)
        const currentTime = performance.now();
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            if (card.revealed && !card.matched && !this.flippedCards.includes(card)) {
                const revealTime = this.revealedTimers[i] || 0;
                if (currentTime - revealTime > this.cardDisappearTime) {
                    card.revealed = false;
                    card.animation.flipping = true;
                    card.animation.progress = 0;
                    delete this.revealedTimers[i];
                }
            }
        }
        
        // Check timer – if time limit is reached, end game as loss
        const elapsed = performance.now() - this.startTime;
        if (!this.gameOver && elapsed > this.timeLimit) {
            this.gameOver = true;
            this.endGame(false);
        }
    }
    
    draw(ctx) {
        // Draw retro computer background
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw particles as digital "bits" flowing
        for (const p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.closePath();
        }
        
        // Draw CRT scan lines effect
        for (let y = 0; y < ctx.canvas.height; y += this.scanLineSpacing) {
            ctx.fillStyle = `rgba(0,0,0,${this.scanLineOpacity})`;
            ctx.fillRect(0, y, ctx.canvas.width, 1);
        }
        
        // Draw timer and score at top with retro terminal look
        const elapsed = performance.now() - this.startTime;
        const remaining = Math.max(0, this.timeLimit - elapsed);
        const seconds = (remaining / 1000).toFixed(1);
        
        // Draw green terminal-style header bar
        ctx.fillStyle = this.colors.cardBack;
        ctx.fillRect(0, 0, ctx.canvas.width, 40);
        
        // Draw timer with pixelated font look
        ctx.fillStyle = this.colors.text;
        ctx.font = "24px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        
        // Random terminal character effect for retro feel
        const terminalChar = this.terminalCharacters[this.terminalIndex];
        ctx.fillText(`TIME: ${seconds}s ${terminalChar}`, 20, 10);
        
        // Draw score on the right
        ctx.textAlign = "right";
        ctx.fillText(`SCORE: ${this.score} ${terminalChar}`, ctx.canvas.width - 20, 10);
        
        // Draw combo in the middle if active
        if (this.combo > 1) {
            ctx.textAlign = "center";
            ctx.fillText(`COMBO x${this.combo}`, ctx.canvas.width / 2, 10);
        }
        
        // Draw each card in the grid with flip animations
        for (const card of this.cards) {
            ctx.save();
            
            // Apply card position transform
            ctx.translate(card.x + card.width / 2, card.y + card.height / 2);
            
            // Apply flip animation if active
            if (card.animation.flipping) {
                const flipProgress = card.revealed ? 
                    card.animation.progress : 
                    1 - card.animation.progress;
                
                // Scale on X axis to create flip effect
                const scaleX = Math.cos(flipProgress * Math.PI);
                ctx.scale(scaleX, 1);
            }
            
            // Apply glitch effect if active
            if (card.glitchEffect) {
                const offsetX = (Math.random() - 0.5) * 10 * card.glitchIntensity;
                const offsetY = (Math.random() - 0.5) * 5 * card.glitchIntensity;
                ctx.translate(offsetX, offsetY);
            }
            
            // Draw card based on its state
            if ((card.revealed || card.matched) && 
                (!card.animation.flipping || card.animation.progress > 0.5)) {
                // Revealed or matched cards: terminal-style front with symbol
                ctx.fillStyle = this.colors.cardFront;
                ctx.fillRect(-card.width / 2, -card.height / 2, card.width, card.height);
                
                // Add terminal-style details to the card front
                ctx.strokeStyle = this.colors.text;
                ctx.lineWidth = 2;
                ctx.strokeRect(-card.width / 2 + 3, -card.height / 2 + 3, card.width - 6, card.height - 6);
                
                // Draw symbol
                ctx.fillStyle = card.matched ? this.colors.accent : this.colors.text;
                ctx.font = "40px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(card.symbol, 0, 0);
                
                // Add some digital noise to the card if matched
                if (card.matched) {
                    for (let i = 0; i < 10; i++) {
                        const dotX = (Math.random() - 0.5) * card.width * 0.8;
                        const dotY = (Math.random() - 0.5) * card.height * 0.8;
                        ctx.fillStyle = `rgba(0,255,255,${Math.random() * 0.3})`;
                        ctx.fillRect(dotX, dotY, 2, 2);
                    }
                }
            } else {
                // Face-down cards: terminal-style back
                ctx.fillStyle = this.colors.cardBack;
                ctx.fillRect(-card.width / 2, -card.height / 2, card.width, card.height);
                
                // Add grid pattern to the card back for retro feel
                ctx.strokeStyle = "rgba(0,0,0,0.3)";
                ctx.lineWidth = 1;
                
                // Horizontal grid lines
                for (let i = -card.height / 2 + 10; i < card.height / 2; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(-card.width / 2, i);
                    ctx.lineTo(card.width / 2, i);
                    ctx.stroke();
                }
                
                // Vertical grid lines
                for (let i = -card.width / 2 + 10; i < card.width / 2; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(i, -card.height / 2);
                    ctx.lineTo(i, card.height / 2);
                    ctx.stroke();
                }
                
                // Add CRT reflection effect
                const gradientY = (Math.sin(performance.now() / 1000) + 1) / 2 * card.height - card.height / 2;
                ctx.fillStyle = "rgba(255,255,255,0.1)";
                ctx.fillRect(-card.width / 2, gradientY - 3, card.width, 6);
            }
            
            // Restore context
            ctx.restore();
            
            // For cards that are revealed but not matched, draw disappearing timer
            if (card.revealed && !card.matched && !card.animation.flipping) {
                const revealTime = this.revealedTimers[this.cards.indexOf(card)] || 0;
                const currentTime = performance.now();
                const timeLeft = Math.max(0, this.cardDisappearTime - (currentTime - revealTime));
                const percentage = timeLeft / this.cardDisappearTime;
                
                // Draw timer circle around the card
                ctx.beginPath();
                ctx.arc(card.x + card.width / 2, card.y + card.height / 2, 
                       card.width / 2 + 5, 
                       -Math.PI / 2, 
                       -Math.PI / 2 + percentage * 2 * Math.PI, 
                       false);
                ctx.strokeStyle = this.colors.text;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }
    
    endGame(success) {
        // Calculate final score with time bonus if successful
        if (success) {
            const remainingTime = Math.max(0, this.timeLimit - (performance.now() - this.startTime));
            const timeBonus = Math.floor(remainingTime / 100);
            this.score += timeBonus;
        }
        
        const message = success ? 
            `MISSION COMPLETE!\nScore: ${this.score}` : 
            `SYSTEM FAILURE\nFinal Score: ${this.score}`;
            
        setTimeout(() => {
            this.removeListeners();
            this.game.endMinigame(message, success);
        }, 1000);
    }
}

export { MemoryGame };