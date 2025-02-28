import { handleCommand } from "./commandHandler.js";

class Terminal {
    // The optional bootup parameter (default true) controls whether to print full game instructions.
    constructor(game, bootup = true) {
        this.game = game;
        this.canvas = document.getElementById("terminalCanvas");
        this.ctx = this.canvas.getContext("2d");

        // Set canvas dimensions to full screen (managed by CSS)
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.font = "16px monospace";
        this.ctx.fillStyle = "rgb(0, 255, 0)";
        this.ctx.textBaseline = "top";

        // Terminal area: bottom third of the canvas
        this.terminalHeight = this.canvas.height / 3;
        this.terminalY = this.canvas.height - this.terminalHeight;

        // Initialize twinkling night sky (above terminal area)
        this.initializeStars();

        // Initialize sidebar (left side, above terminal)
        this.initializeSidebar();

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

        // Flag to ensure trial confirmation input is processed only once per prompt.
        this.trialConfirmed = false;

        // If bootup is true, print the full boot‑up and instruction text.
        if (bootup) {
            this.gameInstructions();
        }

        // Prevent duplicate intervals
        if (this.cursorInterval) clearInterval(this.cursorInterval);
        // Set up cursor blinking
        this.cursorInterval = setInterval(() => {
            this.showCursor = !this.showCursor;
        }, 500);

        console.log("Terminal constructor");
        this.keyListener = (event) => {
            if (!event.repeat) {
                this.handleInput(event);
            }
        };
        window.addEventListener("keydown", this.keyListener);
    }

    gameInstructions() {
        // Lock user input while instructions are printing.
        this.gameState = "instructions";
        const bootText = [
            "Initializing system...",
            "Loading modules...",
            "System boot complete."
        ];
        const instructionsText = [
            "Welcome, Pilot!",
            "Complete trials to move the ship closer to its destination.",
            "Fail three trials and the ship explodes!",
            "Good luck!",
            "ATTEMPT TRIAL 1? [Y]"
        ];
        const delayBetweenLines = 700;
        let delay = 0;
        bootText.forEach((line) => {
            setTimeout(() => {
                this.history.push(line);
            }, delay);
            delay += delayBetweenLines;
        });
        instructionsText.forEach((line) => {
            setTimeout(() => {
                this.history.push(line);
            }, delay);
            delay += delayBetweenLines;
        });
        setTimeout(() => {
            this.gameState = "trial-confirmation";
        }, delay);
    }

    postTrialInstructions() {
        this.history.push("Trial completed.");
        this.history.push("Ready for next trial? [Y]");
        this.gameState = "trial-confirmation";
    }

    // ----- Sidebar Functions -----
    initializeSidebar() {
        this.sidebar = {
            x: 0,
            y: 0,
            width: 200,
            height: this.terminalY,
            info: {
                "Flux": 50,
                "Quantum": 75,
                "Stellar Drift": 5.00,
                "Core Temp": 3000
            }
        };
    }

    updateSidebar() {
        this.sidebar.info["Flux"] = Math.max(0, Math.min(100, this.sidebar.info["Flux"] + (Math.random() - 0.5) * 0.5));
        this.sidebar.info["Quantum"] = Math.max(0, Math.min(100, this.sidebar.info["Quantum"] + (Math.random() - 0.5) * 0.5));
        this.sidebar.info["Stellar Drift"] = Number((this.sidebar.info["Stellar Drift"] + (Math.random() - 0.5) * 0.02).toFixed(2));
        this.sidebar.info["Core Temp"] = Math.max(2000, Math.min(5000, this.sidebar.info["Core Temp"] + (Math.random() - 0.5) * 10));
    }

    drawSidebar(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(this.sidebar.x, this.sidebar.y, this.sidebar.width, this.sidebar.height);
        ctx.strokeStyle = "rgb(0, 255, 0)";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.sidebar.x, this.sidebar.y, this.sidebar.width, this.sidebar.height);

        ctx.fillStyle = "rgb(0, 255, 0)";
        ctx.font = "16px monospace";
        let y = this.sidebar.y + 20;
        for (let key in this.sidebar.info) {
            ctx.fillText(`${key}: ${this.sidebar.info[key]}`, this.sidebar.x + 10, y);
            y += 24;
        }
    }

    // ----- Star (Night Sky) Functions -----
    initializeStars() {
        this.stars = [];
        const skyHeight = this.terminalY;
        const numStars = 150;
        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * skyHeight,
                radius: Math.random() * 2 + 0.5,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.05 + 0.01
            });
        }
    }

    updateStars() {
        for (let star of this.stars) {
            star.brightness += (Math.random() - 0.5) * star.twinkleSpeed;
            star.brightness = Math.max(0, Math.min(1, star.brightness));
        }
    }

    drawSky(ctx) {
        for (let star of this.stars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${star.brightness})`;
            ctx.fill();
            ctx.closePath();
        }
    }

    // ----- Input Handling -----
    removeListeners() {
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
            this.cursorInterval = null;
        }
        window.removeEventListener("keydown", this.keyListener);
    }

    handleInput(event) {
        event.preventDefault();
        if (event.key === "Enter") {
            const command = this.input.trim().toLowerCase();
            // Push the user's command into history so it is preserved.
            if (command !== "") {
                this.history.push("> " + this.input.trim());
            }
            if (this.gameState !== "instructions") {
                let response = handleCommand(command);
                if (Array.isArray(response) && response[1].startsWith("start_")) {
                    console.log("Pass 1");
                    this.showLoadingBar(() => {
                        this._processCommandResponse(response);
                    });
                    this.input = "";
                    return;
                } else {
                    console.log("Pass 2");
                    this._processCommandResponse(response);
                }
            }
            if (this.gameState === "trial-confirmation") {
                if (command === "y") {
                    this.history.push(`Starting Trial ${this.game.currentTrial}...`);
                    this.game.startTrial(this.game.currentTrial);
                    this.game.currentTrial++; // Increment AFTER starting trial
                    this.gameState = "terminal";
                } else {
                    this.history.push("Invalid input. Please type Y to continue.");
                }
            }
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

    _processCommandResponse(response) {
        if (Array.isArray(response)) {
            let [message, state] = response;
            this.history.push(message);
            switch (state) {
                case "start_typing":
                    this.game.entities = [];
                    this.game.startTypingGame();
                    break;
                case "start_blasteroid":
                    this.game.startBlasteroidGame();
                    break;
                case "start_breakout":
                    this.game.startBreakoutGame();
                    break;
                case "start_chess":
                    this.game.startChessGame();
                    break;
                case "start_riddle":
                    console.log("Starting Riddle Game from terminal");
                    this.game.startRiddleGame();
                    break;
                default:
                    console.warn("⚠️ Unknown game start state:", state);
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

    showLoadingBar(callback) {
        const totalSteps = 10;
        const intervalTime = 200;
        let progress = 0;
        const loadingMessageIndex = this.history.length;
        this.history.push("Loading: [" + " ".repeat(totalSteps) + "] 0%");
        const intervalId = setInterval(() => {
            progress++;
            const bar = "[" + "#".repeat(progress) + " ".repeat(totalSteps - progress) + "]";
            this.history[loadingMessageIndex] = "Loading: " + bar + " " + (progress * 10) + "%";
            if (progress >= totalSteps) {
                clearInterval(intervalId);
                this.history.splice(loadingMessageIndex, 1);
                callback();
            }
        }, intervalTime);
    }

    update() {
        this.updateStars();
        this.updateSidebar();
        this.scanlineY += 2;
        if (this.scanlineY > this.terminalHeight) {
            this.scanlineY = 0;
        }
    }

    draw(ctx) {
        // Draw the night sky above the terminal
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.terminalY);
        this.drawSky(ctx);
        // Draw horizontal separator above terminal area
        ctx.strokeStyle = "rgb(0, 255, 0)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.terminalY);
        ctx.lineTo(this.canvas.width, this.terminalY);
        ctx.stroke();
        ctx.closePath();
        // Draw terminal background (bottom third)
        ctx.fillStyle = "black";
        ctx.fillRect(0, this.terminalY, this.canvas.width, this.terminalHeight);
        // Draw terminal history and current input
        ctx.fillStyle = "rgb(0, 255, 0)";
        const padding = 10;
        const maxWidth = this.canvas.width - padding * 2;
        const lineHeight = 20;
        const maxLinesInTerminal = Math.floor((this.terminalHeight - 30) / lineHeight);
        let allLines = [];
        for (let line of this.history) {
            let wrapped = this.wrapText(line, maxWidth, ctx.font);
            allLines = allLines.concat(wrapped);
        }
        if (allLines.length > maxLinesInTerminal) {
            allLines = allLines.slice(allLines.length - maxLinesInTerminal);
        }
        let y = this.terminalY + 10;
        for (let line of allLines) {
            ctx.fillText(line, padding, y);
            y += lineHeight;
        }
        const inputLine = "> " + this.input;
        const cursorX = ctx.measureText("> " + this.input.slice(0, this.cursorPosition)).width + padding;
        ctx.fillText(inputLine, padding, y);
        if (this.showCursor) {
            ctx.fillText("_", cursorX, y);
        }
        // Draw scanline effect in terminal area
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
