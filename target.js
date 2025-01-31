class Target {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = "red";
        this.removeFromWorld = false;
        this.cometImage = ASSET_MANAGER.getAsset("./comet.png");
    }

    draw(ctx) {
        if (this.cometImage) { // Check if image is loaded
            ctx.drawImage(
                this.cometImage,
                this.x - this.radius, // Center the image
                this.y - this.radius,
                this.radius * 2,     // Width (double the radius)
                this.radius * 2      // Height (double the radius)
            );
        } else {
            // Draw a red circle as a fallback if the image hasn't loaded yet
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    update() {
        if (this.game.click && this.isClicked(this.game.click)) {
            this.removeFromWorld = true;
            this.game.score++;
            this.game.createTarget();
            this.game.click = null; // Important: Reset the click
        }
    }

    isClicked(click) {
        const dx = click.x - this.x;
        const dy = click.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.radius;
    }
}