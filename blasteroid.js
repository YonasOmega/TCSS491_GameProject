// Utility function for random integers
function randomInt(max) {
    return Math.floor(Math.random() * max);
}

// Target class used by Blasteroid
class Target {
    constructor(game, x, y, cometImage) {
        // 'game' here refers to the Blasteroid instance
        this.game = game;
        this.x = x;
        this.y = y;
        this.maxRadius = 30;
        this.minRadius = 1;
        this.currentRadius = this.minRadius;
        this.growthRate = 0.15; // Adjust growth rate as desired
        this.growing = true;
        this.removeFromWorld = false;
        this.cometImage = cometImage; // Use the passed image
        this.scored = false;
    }

    update() {
        // Animate the target: grow then shrink
        if (this.growing) {
            this.currentRadius += this.growthRate;
            if (this.currentRadius >= this.maxRadius) {
                this.growing = false;
            }
        } else {
            this.currentRadius -= this.growthRate;
            if (this.currentRadius <= this.minRadius) {
                if (!this.scored) {
                    this.game.lives--;
                    this.scored = true;
                }
                this.removeFromWorld = true;
            }
        }

        // Check for click detection
        if (this.game.game.click && this.isClicked(this.game.game.click)) {
            if (!this.scored) {
                this.game.score++;
                this.scored = true;
                
                // Display milestone message at 20 points but continue playing
                if (this.game.score === 20) {
                    this.game.showMilestoneMessage();
                }
            }
            this.removeFromWorld = true;
            this.game.game.click = null; // Reset click after handling
        }
    }

    draw(ctx) {
        if (this.cometImage) {
            ctx.save();
            ctx.drawImage(
                this.cometImage,
                this.x - this.currentRadius,
                this.y - this.currentRadius,
                this.currentRadius * 2,
                this.currentRadius * 2
            );
            ctx.restore();
        } else {
            // Fallback: draw a red circle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.closePath();
        }
    }

    isClicked(click) {
        const dx = click.x - this.x;
        const dy = click.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.currentRadius;
    }
}

// Blasteroid class definition
class Blasteroid {
    constructor(game) {
        // 'game' should be your GameEngine instance (or similar) with a valid canvas context.
        this.game = game;
        // Blasteroid-specific state
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameStarted = false;
        this.showTitleScreen = true;
        this.showMilestone = false;
        this.milestoneTimestamp = 0;
        this.targets = []; // Array to hold active targets
        this.lastSpawnTime = Date.now();
        this.SPAWN_INTERVAL = 765; // milliseconds

        // Load the comet image directly
        this.cometImage = new Image();
        this.cometImage.src = './Assets/comet.png'; // Path to the comet sprite
        this.cometImage.onerror = () => {
            console.error("Failed to load comet image!");
        };
        
        // Create UI for the title screen
        this.initTitleScreen();
    }
    
    // Initialize title screen UI
    initTitleScreen() {
        const canvas = this.game.ctx.canvas;
        const container = canvas.parentNode;
        
        // Create title screen container
        this.titleContainer = document.createElement('div');
        this.titleContainer.id = 'blasteroidTitleScreen';
        this.titleContainer.style.position = 'absolute';
        this.titleContainer.style.top = '0';
        this.titleContainer.style.left = '0';
        this.titleContainer.style.width = '100%';
        this.titleContainer.style.height = '100%';
        this.titleContainer.style.display = 'flex';
        this.titleContainer.style.flexDirection = 'column';
        this.titleContainer.style.justifyContent = 'center';
        this.titleContainer.style.alignItems = 'center';
        this.titleContainer.style.pointerEvents = 'auto';
        container.appendChild(this.titleContainer);
        
        // Create title
        this.titleElement = document.createElement('h1');
        this.titleElement.textContent = 'BLASTEROID';
        this.titleElement.style.fontFamily = 'monospace';
        this.titleElement.style.fontSize = '48px';
        this.titleElement.style.color = '#0f0'; // Neon green
        this.titleElement.style.textShadow = '0 0 10px #0f0, 0 0 20px #0f0';
        this.titleElement.style.marginBottom = '50px';
        this.titleContainer.appendChild(this.titleElement);
        
        // Create start button
        this.startButton = document.createElement('button');
        this.startButton.textContent = 'START GAME';
        this.startButton.style.padding = '15px 30px';
        this.startButton.style.fontSize = '24px';
        this.startButton.style.backgroundColor = '#000';
        this.startButton.style.color = '#0f0';
        this.startButton.style.border = '2px solid #0f0';
        this.startButton.style.boxShadow = '0 0 10px #0f0';
        this.startButton.style.cursor = 'pointer';
        this.startButton.style.fontFamily = 'monospace';
        
        this.startButton.onmouseover = () => {
            this.startButton.style.backgroundColor = '#0f0';
            this.startButton.style.color = '#000';
        };
        
        this.startButton.onmouseout = () => {
            this.startButton.style.backgroundColor = '#000';
            this.startButton.style.color = '#0f0';
        };
        
        this.startButton.onclick = () => {
            this.startGame();
        };
        
        this.titleContainer.appendChild(this.startButton);
    }
    
    // Show a message when the player reaches 20 points
    showMilestoneMessage() {
        this.showMilestone = true;
        this.milestoneTimestamp = Date.now();
        
        // Create milestone message container if it doesn't exist
        if (!this.milestoneContainer) {
            const canvas = this.game.ctx.canvas;
            const container = canvas.parentNode;
            
            this.milestoneContainer = document.createElement('div');
            this.milestoneContainer.id = 'milestoneMessage';
            this.milestoneContainer.style.position = 'absolute';
            this.milestoneContainer.style.top = '50%';
            this.milestoneContainer.style.left = '50%';
            this.milestoneContainer.style.transform = 'translate(-50%, -50%)';
            this.milestoneContainer.style.padding = '15px 30px';
            this.milestoneContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            this.milestoneContainer.style.color = '#0f0';
            this.milestoneContainer.style.border = '2px solid #0f0';
            this.milestoneContainer.style.boxShadow = '0 0 20px #0f0';
            this.milestoneContainer.style.fontFamily = 'monospace';
            this.milestoneContainer.style.fontSize = '24px';
            this.milestoneContainer.style.textAlign = 'center';
            this.milestoneContainer.style.zIndex = '1000';
            this.milestoneContainer.textContent = 'Achievement Unlocked: 20 Asteroids Destroyed!';
            
            container.appendChild(this.milestoneContainer);
            
            // Remove the message after 3 seconds
            setTimeout(() => {
                this.hideMilestoneMessage();
            }, 3000);
        }
    }
    
    // Hide the milestone message
    hideMilestoneMessage() {
        this.showMilestone = false;
        if (this.milestoneContainer && this.milestoneContainer.parentNode) {
            this.milestoneContainer.parentNode.removeChild(this.milestoneContainer);
            this.milestoneContainer = null;
        }
    }
    
    // Start the game when the start button is clicked
    startGame() {
        this.removeTitleScreen();
        this.gameStarted = true;
        this.showTitleScreen = false;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.targets = [];
        this.lastSpawnTime = Date.now();
    }
    
    // Remove the title screen UI
    removeTitleScreen() {
        if (this.titleContainer && this.titleContainer.parentNode) {
            this.titleContainer.parentNode.removeChild(this.titleContainer);
        }
    }

    // Creates a new target and adds it to the targets array.
    createTarget() {
        if (this.gameOver || !this.gameStarted) return;
        const canvasWidth = this.game.ctx.canvas.width;
        const canvasHeight = this.game.ctx.canvas.height;
        // Ensure target is fully within canvas; target radius is up to 30.
        const x = randomInt(canvasWidth - 60) + 30;
        const y = randomInt(canvasHeight - 60) + 30;
        const target = new Target(this, x, y, this.cometImage); // Pass the loaded image
        this.targets.push(target);
    }

    update() {
        if (this.showTitleScreen) {
            return; // Don't update game state while on title screen
        }
        
        // Check if milestone message should be removed
        if (this.showMilestone && Date.now() - this.milestoneTimestamp > 3000) {
            this.hideMilestoneMessage();
        }
        
        // Spawn new targets at defined intervals
        if (this.gameStarted && !this.gameOver) {
            const currentTime = Date.now();
            if (currentTime - this.lastSpawnTime >= this.SPAWN_INTERVAL) {
                this.createTarget();
                this.lastSpawnTime = currentTime;
            }
        }

        // Update each target
        for (let target of this.targets) {
            if (typeof target.update === "function") target.update();
        }
        // Remove targets flagged for removal
        this.targets = this.targets.filter(target => !target.removeFromWorld);

        // Check for game over condition
        if (this.lives <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.gameStarted = false;
            setTimeout(() => {
                this.endMinigame(`Game Over! You've destroyed ${this.score} asteroids!`);
            }, 100);
        }
    }

    draw(ctx) {
        // Clear the canvas with a background color
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (this.showTitleScreen) {
            // Draw starfield background for title screen
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * ctx.canvas.width;
                const y = Math.random() * ctx.canvas.height;
                const size = Math.random() * 2;
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.fillRect(x, y, size, size);
            }
            return;
        }

        // Draw all active targets
        for (let target of this.targets) {
            if (typeof target.draw === "function") target.draw(ctx);
        }

        // Draw UI: display score and lives
        ctx.fillStyle = "#0f0"; // Neon green
        ctx.font = "24px monospace";
        const hearts = "❤️".repeat(this.lives);
        ctx.fillText(`Score: ${this.score} | Lives: ${hearts}`, 20, 30);
        
        // Draw title at the top
        ctx.textAlign = "center";
        ctx.font = "30px monospace";
        ctx.fillText("BLASTEROID", ctx.canvas.width / 2, 30);
        ctx.textAlign = "left"; // Reset text alignment
    }
    
    // Method to end minigame and pass a message to the parent game
    endMinigame(message) {
        if (typeof this.game.endMinigame === "function") {
            this.game.endMinigame(message);
        } else {
            console.log("Game Over:", message);
            // If we're testing without a parent game, show an end screen
            this.showEndScreen(message);
        }
    }
    
    // Show end screen with final score
    showEndScreen(message) {
        const canvas = this.game.ctx.canvas;
        const container = canvas.parentNode;
        
        this.endContainer = document.createElement('div');
        this.endContainer.id = 'blasteroidEndScreen';
        this.endContainer.style.position = 'absolute';
        this.endContainer.style.top = '0';
        this.endContainer.style.left = '0';
        this.endContainer.style.width = '100%';
        this.endContainer.style.height = '100%';
        this.endContainer.style.display = 'flex';
        this.endContainer.style.flexDirection = 'column';
        this.endContainer.style.justifyContent = 'center';
        this.endContainer.style.alignItems = 'center';
        this.endContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        this.endContainer.style.pointerEvents = 'auto';
        container.appendChild(this.endContainer);
        
        // Create game over message
        const gameOverText = document.createElement('h2');
        gameOverText.textContent = 'GAME OVER';
        gameOverText.style.fontFamily = 'monospace';
        gameOverText.style.fontSize = '48px';
        gameOverText.style.color = '#0f0';
        gameOverText.style.textShadow = '0 0 10px #0f0, 0 0 20px #0f0';
        gameOverText.style.marginBottom = '20px';
        this.endContainer.appendChild(gameOverText);
        
        // Display score
        const scoreText = document.createElement('h3');
        scoreText.textContent = `You've destroyed ${this.score} asteroids!`;
        scoreText.style.fontFamily = 'monospace';
        scoreText.style.fontSize = '36px';
        scoreText.style.color = '#0f0';
        scoreText.style.marginBottom = '40px';
        this.endContainer.appendChild(scoreText);
        
        // Add play again button
        const playAgainButton = document.createElement('button');
        playAgainButton.textContent = 'PLAY AGAIN';
        playAgainButton.style.padding = '15px 30px';
        playAgainButton.style.fontSize = '24px';
        playAgainButton.style.backgroundColor = '#000';
        playAgainButton.style.color = '#0f0';
        playAgainButton.style.border = '2px solid #0f0';
        playAgainButton.style.boxShadow = '0 0 10px #0f0';
        playAgainButton.style.cursor = 'pointer';
        playAgainButton.style.fontFamily = 'monospace';
        
        playAgainButton.onmouseover = () => {
            playAgainButton.style.backgroundColor = '#0f0';
            playAgainButton.style.color = '#000';
        };
        
        playAgainButton.onmouseout = () => {
            playAgainButton.style.backgroundColor = '#000';
            playAgainButton.style.color = '#0f0';
        };
        
        playAgainButton.onclick = () => {
            this.removeEndScreen();
            this.startGame();
        };
        
        this.endContainer.appendChild(playAgainButton);
    }
    
    // Remove end screen
    removeEndScreen() {
        if (this.endContainer && this.endContainer.parentNode) {
            this.endContainer.parentNode.removeChild(this.endContainer);
        }
    }

    removeListeners() {
        this.removeTitleScreen();
        this.hideMilestoneMessage();
        if (this.endContainer) {
            this.removeEndScreen();
        }
    }
}

export { Blasteroid };