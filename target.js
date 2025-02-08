class Target {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;

        // Animation properties
        this.maxRadius = 30;
        this.minRadius = 1;
        this.currentRadius = this.minRadius;
        this.growthRate = 0.15; // Reduced growth rate for slower animation
        this.growing = true;

        // Game properties
        this.removeFromWorld = false;
        this.cometImage = ASSET_MANAGER.getAsset("./comet.png");
        this.scored = false;
    }

    update() {
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
        }
    }

    isClicked(click) {
        const dx = click.x - this.x;
        const dy = click.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.currentRadius;
    }
}