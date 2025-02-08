class Target {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;

        // Animation properties
        this.maxRadius = 30;
        this.minRadius = 1;
        this.currentRadius = this.minRadius;
        this.growthRate = 0.15;
        this.growing = true;

        // Game properties
        this.removeFromWorld = false;
        this.cometImage = ASSET_MANAGER.getAsset("./comet.png");
        this.explosionImage = ASSET_MANAGER.getAsset("./explosion.gif");
        this.scored = false;

        // Explosion properties
        this.exploding = false;
        this.explosionTimer = 0;
        this.explosionDuration = 30; // frames the explosion will last
    }

    update() {
        if (this.exploding) {
            this.explosionTimer++;
            if (this.explosionTimer >= this.explosionDuration) {
                this.removeFromWorld = true;
            }
            return;
        }

        // Handle size animation
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

        // Handle click detection
        if (this.game.click && this.isClicked(this.game.click)) {
            if (!this.scored) {
                this.game.score++;
                this.scored = true;
                this.exploding = true;
                this.explosionTimer = 0;
            }
            this.game.click = null;
        }
    }

    draw(ctx) {
        if (this.exploding) {
            // Draw explosion
            ctx.drawImage(
                this.explosionImage,
                this.x - 32, // Adjust these values based on your explosion.gif size
                this.y - 32,
                64,         // Adjust based on desired explosion size
                64
            );
        } else if (this.cometImage) {
            // Draw comet
            ctx.save();
            ctx.drawImage(
                this.cometImage,
                this.x - this.currentRadius,
                this.y - this.currentRadius,
                this.currentRadius * 2,
                this.currentRadius * 2
            );
            ctx.restore();
        }
    }

    isClicked(click) {
        const dx = click.x - this.x;
        const dy = click.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.currentRadius;
    }
}