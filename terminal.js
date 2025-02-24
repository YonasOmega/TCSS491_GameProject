import { handleCommand } from "./commandHandler.js";

class Terminal {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById("terminalCanvas");
        this.ctx = this.canvas.getContext("2d");

        // Set canvas to full screen
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.font = "16px monospace";
        this.ctx.fillStyle = "rgb(0, 255, 0)";
        this.ctx.textBaseline = "top";

        // Define terminal area: bottom third of the canvas
        this.terminalHeight = this.canvas.height / 3;
        this.terminalY = this.canvas.height - this.terminalHeight;

        // Terminal state
        this.input = "";
        this.history = [];
        this.commandHistory = [];
        this.commandIndex = -1;
        this.cursorPosition = 0;
        this.maxLines = 20;
        this.showCursor = true;
        this.scanlineY = 0;
        this.gameState = "idle";

        // Prevent duplicate intervals
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
        }
        // Set up cursor blinking
        this.cursorInterval = setInterval(() => {
            if (this.gameState === "terminal") {
                this.showCursor = !this.showCursor;
            }
        }, 500);

        // Set up key listener and store it for removal later
        this.keyListener = (event) => this.handleInput(event);
        window.addEventListener("keydown", this.keyListener);
    }

    removeListeners() {
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
            this.cursorInterval = null;
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
            if (state === "start_typing") {
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
        // Update scanline within the terminal area
        this.scanlineY += 2;
        if (this.scanlineY > this.terminalHeight) {
            this.scanlineY = 0;
        }
    }

    draw(ctx) {
        // Draw terminal background in the bottom third
        ctx.fillStyle = "black";
        ctx.fillRect(0, this.terminalY, this.canvas.width, this.terminalHeight);

        ctx.fillStyle = "rgb(0, 255, 0)";
        const padding = 10;
        const maxWidth = this.canvas.width - (padding * 2);
        let y = this.terminalY + 10;

        // Draw each line of history with wrapping
        for (let line of this.history) {
            let wrappedLines = this.wrapText(line, maxWidth, ctx.font);
            for (let wrappedLine of wrappedLines) {
                ctx.fillText(wrappedLine, padding, y);
                y += 20;
            }
        }

        // Draw current input with cursor
        const inputLine = "> " + this.input;
        const cursorX = ctx.measureText("> " + this.input.slice(0, this.cursorPosition)).width + padding;
        ctx.fillText(inputLine, padding, y);
        if (this.showCursor) {
            ctx.fillText("_", cursorX, y);
        }

        // Draw scanline effect in terminal region
        ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
        ctx.fillRect(0, this.terminalY + this.scanlineY, this.canvas.width, 2);
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

export { Terminal };
