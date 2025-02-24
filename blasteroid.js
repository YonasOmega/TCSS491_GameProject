// Blasteroid.js

// Utility function for random integers
function randomInt(max) {
    return Math.floor(Math.random() * max);
}

// Target class used by Blasteroid
class Target {
    constructor(game, x, y) {
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
        // Optionally, use an image asset if available:
        // this.cometImage = game.assetManager ? game.assetManager.getAsset("./Assets/comet.png") : null;
        this.cometImage = null;
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
        if (this.game.click && this.isClicked(this.game.click)) {
            if (!this.scored) {
                this.game.score++;
                this.scored = true;
            }
            this.removeFromWorld = true;
            this.game.click = null;
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
        return Math.sqrt(dx * dx + dy * dy) <= this.currentRadius;
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
        this.targets = []; // Array to hold active targets
        this.lastSpawnTime = Date.now();
        this.SPAWN_INTERVAL = 765; // milliseconds
    }
    
    // Creates a new target and adds it to the targets array.
    createTarget() {
        if (this.gameOver || !this.gameStarted) return;
        const canvasWidth = this.game.ctx.canvas.width;
        const canvasHeight = this.game.ctx.canvas.height;
        // Ensure target is fully within canvas; target radius is up to 30.
        const x = randomInt(canvasWidth - 60) + 30;
        const y = randomInt(canvasHeight - 60) + 30;
        const target = new Target(this, x, y);
        this.targets.push(target);
    }
    
    update() {
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
                alert(`Game Over! Final Score: ${this.score}`);
            }, 100);
        }
    }
    
    draw(ctx) {
        // Clear the canvas with a background color
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw all active targets
        for (let target of this.targets) {
            if (typeof target.draw === "function") target.draw(ctx);
        }
        
        // Draw UI: display score and lives
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        const hearts = "❤️".repeat(this.lives);
        ctx.fillText(`Score: ${this.score} | Lives: ${hearts}`, 20, 30);
    }
}

export { Blasteroid };
