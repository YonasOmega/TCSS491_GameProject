import { handleCommand } from "./commandHandler.js";

class Terminal {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById("terminalCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx.font = "16px monospace";
        this.ctx.fillStyle = "rgb(0, 255, 0)";
        this.ctx.textBaseline = "top";

        this.input = "";
        this.history = [];
        this.commandHistory = [];
        this.commandIndex = -1;
        this.cursorPosition = 0;
        this.maxLines = 20;
        this.showCursor = true;
        this.scanlineY = 0;
        this.gameState = "idle";

        // ✅ Prevent multiple intervals by clearing any existing one
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
        }

        // ✅ Properly store interval so it can be cleared later
        this.cursorInterval = setInterval(() => {
            if (this.gameState === "terminal") {
                this.showCursor = !this.showCursor;
            }
        }, 500);

        // ✅ Listen for keyboard input
        this.keyListener = (event) => this.handleInput(event);
        window.addEventListener("keydown", this.keyListener);
    }

    // ✅ Properly remove event listeners and intervals when Terminal is removed
    removeListeners() {
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
            this.cursorInterval = null; // Prevent re-clearing a null interval
        }
        window.removeEventListener("keydown", this.keyListener);
    }


    handleInput(event) {
        if (this.gameState === "idle" && event.key === "t") {
            this.gameState = "terminal"; // Enter terminal mode
        } else if (this.gameState === "terminal") {
            if (event.key === "Enter") {
                this.processCommand(this.input);
                this.input = "";
                this.cursorPosition = 0;
            } else if (event.key === "Backspace") {
                if (this.cursorPosition > 0) {
                    this.input = this.input.slice(0, this.cursorPosition - 1) + this.input.slice(this.cursorPosition);
                    this.cursorPosition--;
                }
            } else if (event.key.length === 1) {
                this.input = this.input.slice(0, this.cursorPosition) + event.key + this.input.slice(this.cursorPosition);
                this.cursorPosition++;
            }
        }
    }

    processCommand(command) {
        if (command.trim() === "") return;

        this.history.push("> " + command);
        let response = handleCommand(command);

        if (Array.isArray(response)) {
            let [message, state] = response;
            this.history.push(message);

            // Handle minigame starts properly
            if (state === "start_typing_game") {
                this.game.entities = []; // Remove Terminal
                this.game.startTypingGame(); // Start Typing Game
            } else if (state === "start_blasteroid") {
                this.game.startBlasteroidGame();
            } else if (state === "start_breakout") {
                this.game.startBreakoutGame(); // Trigger breakout game
            }
        } else {
            if (response === "clear_screen") {
                this.history = [];
            } else if (response === "exit_terminal") {
                this.gameState = "idle";
            } else {
                this.history.push(response);
            }
        }

        if (this.history.length > this.maxLines) this.history.shift();
    }

    update() {
        // If scanline reaches bottom, reset
        this.scanlineY += 2;
        if (this.scanlineY > this.canvas.height) {
            this.scanlineY = 0;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "rgb(0, 255, 0)";

        let padding = 10;
        let maxWidth = this.canvas.width - (padding * 2);
        let y = 20;

        for (let line of this.history) {
            let wrappedLines = this.wrapText(line, maxWidth, ctx.font);
            for (let wrappedLine of wrappedLines) {
                ctx.fillText(wrappedLine, padding, y);
                y += 20;
            }
        }

        const cursorX = ctx.measureText("> " + this.input.slice(0, this.cursorPosition)).width + padding;
        ctx.fillText("> " + this.input, padding, y);
        if (this.showCursor) {
            ctx.fillText("_", cursorX, y);
        }

        // Draw scanline effect
        ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
        ctx.fillRect(0, this.scanlineY, ctx.canvas.width, 2);
    }

    wrapText(text, maxWidth, font) {
        let words = text.split(" ");
        let lines = [];
        let line = "";

        for (let word of words) {
            let testLine = line + word + " ";
            let testWidth = this.ctx.measureText(testLine).width;

            if (testWidth > maxWidth && line.length > 0) {
                lines.push(line);
                line = word + " ";
            } else {
                line = testLine;
            }
        }

        lines.push(line.trim());
        return lines;
    }
}

// ✅ Export the Terminal class for ES Modules
export { Terminal };
