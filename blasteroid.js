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

        console.log("Comet Image:", this.cometImage); // Debugging
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
            console.log("Comet clicked!"); // Debugging
            if (!this.scored) {
                this.game.score++;
                this.scored = true;
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
        console.log(`Click at (${click.x}, ${click.y}), Comet at (${this.x}, ${this.y}), Distance: ${distance}, Radius: ${this.currentRadius}`); // Debugging
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
        this.targets = []; // Array to hold active targets
        this.lastSpawnTime = Date.now();
        this.SPAWN_INTERVAL = 765; // milliseconds

        // Load the comet image directly
        this.cometImage = new Image();
        this.cometImage.src = './Assets/comet.png'; // Path to the comet sprite
        this.cometImage.onload = () => {
            console.log("Comet image loaded!");
            this.gameStarted = true; // Start the game once the image is loaded
        };
        this.cometImage.onerror = () => {
            console.error("Failed to load comet image!");
        };
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