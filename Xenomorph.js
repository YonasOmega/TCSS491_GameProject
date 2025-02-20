class Xenomorph {
    constructor(game) {
        this.game = game;
        this.image = ASSET_MANAGER.getAsset("./xeno.png");
        this.baseSize = 100;
        this.size = this.baseSize;
        this.x = game.ctx.canvas.width / 2;
        this.y = game.ctx.canvas.height / 2;
        this.growing = false;
        this.growthTarget = this.size;
    }

    grow() {
        this.growthTarget = this.baseSize + (this.game.wrongAnswers * 200); // Increased growth amount
        this.growing = true;
    }

    update() {
        if (this.growing) {
            this.size += (this.growthTarget - this.size) * 0.1;
            if (Math.abs(this.size - this.growthTarget) < 0.1) {
                this.size = this.growthTarget;
                this.growing = false;
            }
        }
    }

    draw(ctx) {
        if (this.image) {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.drawImage(
                this.image,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
            ctx.restore();
        }
    }
}