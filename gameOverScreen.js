class GameOverScreen {
    constructor(game, message) {
        this.game = game;
        this.message = message;
        this.showMessage = true; // Controls blinking effect

        // Determine screen type based on the message content.
        this.isWin = this.message.toLowerCase().includes("congratulations");
        this.isFailure = this.message.toLowerCase().includes("game over");

        // Blinking effect for the instruction text.
        setInterval(() => {
            this.showMessage = !this.showMessage;
        }, 500);

        // Listen for the 'T' key to either return to the terminal or restart the game.
        this.keyListener = (event) => {
            if (event.key.toLowerCase() === "t") {
                console.log("🔄 Restarting game...");
                // If the screen is a win or failure screen, reload the page to restart.
                if (this.isWin || this.isFailure) {
                    window.location.reload();
                } else {
                    this.game.endGameOverScreen();
                }
            }
        };

        window.addEventListener("keydown", this.keyListener);
    }

    update() {
        // No additional update logic needed.
    }

    draw(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Choose text color based on win or failure.
        if (this.isWin) {
            ctx.fillStyle = "rgb(255, 215, 0)"; // Gold for win
        } else if (this.isFailure) {
            ctx.fillStyle = "rgb(255, 0, 0)";   // Red for failure
        } else {
            ctx.fillStyle = "rgb(0, 255, 0)";
        }
        ctx.font = "48px monospace";
        ctx.fillText(this.message, ctx.canvas.width / 2 - 150, ctx.canvas.height / 2 - 50);

        if (this.showMessage) {
            ctx.font = "24px monospace";
            // For win or failure screens, instruct the player to press 'T' to restart.
            if (this.isWin || this.isFailure) {
                ctx.fillText("Press 'T' to restart", ctx.canvas.width / 2 - 150, ctx.canvas.height / 2 + 50);
            } else {
                ctx.fillText("Press 'T' to return to terminal", ctx.canvas.width / 2 - 150, ctx.canvas.height / 2 + 50);
            }
        }
    }

    removeListeners() {
        window.removeEventListener("keydown", this.keyListener);
    }
}

export { GameOverScreen };
