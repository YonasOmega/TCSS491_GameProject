class GameOverScreen {
    constructor(game, message) {
        this.game = game;
        this.message = message;
        this.showMessage = true; // Controls blinking effect

        // Blinking effect for text
        setInterval(() => {
            this.showMessage = !this.showMessage;
        }, 500);

        // Listen for 'T' key to return to terminal
        this.keyListener = (event) => {
            if (event.key.toLowerCase() === "t") {
                console.log("🔄 Returning to Terminal...");
                this.game.endGameOverScreen();
            }
        };

        window.addEventListener("keydown", this.keyListener);
    }

    update() {
        // No logic needed, just waiting for keypress
    }

    draw(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.fillStyle = "rgb(0, 255, 0)";
        ctx.font = "48px monospace";
        ctx.fillText(this.message, ctx.canvas.width / 2 - 150, ctx.canvas.height / 2 - 50);

        if (this.showMessage) {
            ctx.font = "24px monospace";
            ctx.fillText("Press 'T' to return to terminal", ctx.canvas.width / 2 - 150, ctx.canvas.height / 2 + 50);
        }
    }

    removeListeners() {
        window.removeEventListener("keydown", this.keyListener);
    }
}

export { GameOverScreen };
