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
                
                // Display achievement messages at milestone scores
                if (this.game.score === 20) {
                    this.game.showAchievementMessage("Achievement: 20 Asteroids Destroyed!");
                } else if (this.game.score === 40) {
                    this.game.showAchievementMessage("Achievement: 40 Asteroids Destroyed, How Far Can You Go?");
                } else if (this.game.score === 60) {
                    this.game.showAchievementMessage("Achievement: 60 Asteroids Destroyed, You're on Fire!");
                } else if (this.game.score === 80) {
                    this.game.showAchievementMessage("Achievement: 80 Asteroids Destroyed, Keep Blasting!");
                } else if (this.game.score === 100) {
                    this.game.showAchievementMessage("Achievement: 100 Asteroids Destroyed, You're a Blasteroid Master!");
                } else if (this.game.score === 150) {
                    this.game.showAchievementMessage("Achievement: 150 Asteroids Destroyed, Please Take a Break!");
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
        this.showAchievement = false;
        this.achievementTimestamp = 0;
        this.targets = []; // Array to hold active targets
        this.lastSpawnTime = Date.now();
        this.SPAWN_INTERVAL = 765; // milliseconds ********TIME BETWEEN SPAWNS*******
        this.stars = []; // Array to hold star objects
        this.generateStarfield(100); // Generate 100 stars

        this.cursorImage = new Image();
        this.cursorImage.src = './assets/red_crosshair.png'; // Adjust the path as needed
        this.cursorImage.onload = () => {
            // Once image is loaded, set up the custom cursor
            this.setupCustomCursor();
        };

        // Load the comet image directly
        this.cometImage = new Image();
        this.cometImage.src = './assets/comet.png'; // Path to the comet sprite
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
        // Create instruction set
        this.instructionText = document.createElement('p');
        this.instructionText.textContent = 'Shoot the asteroids! Destroy 20 to win!';
        this.instructionText.style.fontFamily = 'monospace';
        this.instructionText.style.fontSize = '20px';
        this.instructionText.style.color = '#0f0'; // Neon green
        this.instructionText.style.marginTop = '15px';
        
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
        this.titleContainer.appendChild(this.instructionText);
    }
    
    // Show an achievement message when the player reaches milestone scores
    showAchievementMessage(message) {
        this.showAchievement = true;
        this.achievementTimestamp = Date.now();
        
        // Create achievement message container if it doesn't exist
        if (!this.achievementContainer) {
            const canvas = this.game.ctx.canvas;
            const container = canvas.parentNode;
            
            this.achievementContainer = document.createElement('div');
            this.achievementContainer.id = 'achievementMessage';
            this.achievementContainer.style.position = 'absolute';
            this.achievementContainer.style.top = '15px';
            this.achievementContainer.style.right = '15px';
            this.achievementContainer.style.padding = '10px 15px';
            this.achievementContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            this.achievementContainer.style.color = '#0f0';
            this.achievementContainer.style.border = '2px solid #0f0';
            this.achievementContainer.style.boxShadow = '0 0 10px #0f0';
            this.achievementContainer.style.fontFamily = 'monospace';
            this.achievementContainer.style.fontSize = '16px';
            this.achievementContainer.style.textAlign = 'center';
            this.achievementContainer.style.zIndex = '1000';
            this.achievementContainer.style.animation = 'fadeIn 0.3s';
            this.achievementContainer.textContent = message;
            
            container.appendChild(this.achievementContainer);
            
            // Remove the message after 1.5 seconds
            setTimeout(() => {
                this.hideAchievementMessage();
            }, 1500);
        } else {
            // Update existing message
            this.achievementContainer.textContent = message;
            // Reset the timer
            setTimeout(() => {
                this.hideAchievementMessage();
            }, 1500);
        }
    }
    
    // Hide the achievement message
    hideAchievementMessage() {
        this.showAchievement = false;
        if (this.achievementContainer && this.achievementContainer.parentNode) {
            this.achievementContainer.parentNode.removeChild(this.achievementContainer);
            this.achievementContainer = null;
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
        
        // LOSS CONDITION: If lives are 0 (game ends), then check if score > 20.
        if (this.lives <= 0 && !this.gameOver) {
            this.gameOver = true;
            this.gameStarted = false;
            setTimeout(() => {
                if (this.score > 20) {
                    this.endMinigame(`Trial passed! You've destroyed ${this.score} asteroids!`, true);
                } else {
                    this.endMinigame(`Game Over! You've destroyed ${this.score} asteroids!`, false);
                }
            }, 100);
            return;
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

        // Check for achievement message removal
        if (this.showAchievement && Date.now() - this.achievementTimestamp > 1500) {
            this.hideAchievementMessage();
        }
    }
    
    generateStarfield(numStars) {
        const canvas = this.game.ctx.canvas;
        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.05 + 0.01
            });
        }
    }
    
    drawStarfield(ctx) {
        for (let star of this.stars) {
            // Make stars twinkle by changing brightness
            star.brightness += star.twinkleSpeed;
            if (star.brightness > 1 || star.brightness < 0.3) {
                star.twinkleSpeed = -star.twinkleSpeed;
            }
            
            // Draw the star
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }
    }
    
    draw(ctx) {
        // Clear the canvas with a background color
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
        // Draw starfield background
        this.drawStarfield(ctx);
    
        if (this.showTitleScreen) {
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
    endMinigame(message, wasSuccess) {
        if (typeof this.game.endMinigame === "function") {
            this.game.endMinigame(message, wasSuccess);
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
    }
    
    setupCustomCursor() {
        const canvas = this.game.ctx.canvas;
        const container = canvas.parentNode;
        
        // Hide the default cursor when over the canvas
        canvas.style.cursor = 'none';
        
        // Create a cursor element
        this.cursor = document.createElement('div');
        this.cursor.id = 'customCursor';
        this.cursor.style.position = 'absolute';
        this.cursor.style.width = '32px'; // Adjust based on your image size
        this.cursor.style.height = '32px'; // Adjust based on your image size
        this.cursor.style.backgroundImage = `url(${this.cursorImage.src})`;
        this.cursor.style.backgroundSize = 'contain';
        this.cursor.style.backgroundRepeat = 'no-repeat';
        this.cursor.style.pointerEvents = 'none'; // Make it pass-through for clicks
        this.cursor.style.zIndex = '1000';
        this.cursor.style.transform = 'translate(-50%, -50%)'; // Center the cursor
        
        // Initially hide the cursor until mouse movement
        this.cursor.style.display = 'none';
        
        container.appendChild(this.cursor);
        
        // Move cursor with mouse
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.cursor.style.left = `${e.clientX - rect.left}px`;
            this.cursor.style.top = `${e.clientY - rect.top}px`;
            
            // Make cursor visible on first mouse movement
            if (this.cursor.style.display === 'none') {
                this.cursor.style.display = 'block';
            }
        });
        
        // Hide cursor when mouse leaves canvas
        canvas.addEventListener('mouseleave', () => {
            this.cursor.style.display = 'none';
        });
    }
    
    // Remove end screen
    removeEndScreen() {
        if (this.endContainer && this.endContainer.parentNode) {
            this.endContainer.parentNode.removeChild(this.endContainer);
        }
    }
    
    removeCursor() {
        if (this.cursor && this.cursor.parentNode) {
            this.cursor.parentNode.removeChild(this.cursor);
            // Restore default cursor
            this.game.ctx.canvas.style.cursor = 'default';
        }
    }

    removeListeners() {
        this.removeTitleScreen();
        this.hideAchievementMessage();
        this.removeCursor();
        if (this.endContainer) {
            this.removeEndScreen();
        }
    }
}

export { Blasteroid };
