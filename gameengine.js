import { Timer } from "./timer.js";
import { TypingGame } from "./typingGame.js"; // Import TypingGame
import { BreakoutGame } from "./breakout.js";
import { Terminal } from "./terminal.js";
import { Blasteroid } from "./blasteroid.js";
import { RiddleGame } from "./riddle.js";
import { GameOverScreen } from "./gameOverScreen.js";
import { TrialManager } from "./trialManager.js";
import { MemoryGame } from "./memoryGame.js"
import { AsteroidGame } from "./asteroid.js";

class GameEngine {
    constructor(options) {
        this.ctx = null; // Rendering context
        this.entities = []; // List of game entities
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {}; // Stores key states
        this.running = false;
        this.options = options || { debugging: false };
        this.currentMinigame = null;
        this.assetManager = null;
        this.currentTrial = 1;
        // Create a trial manager instance to track successes and failures.
        this.trialManager = new TrialManager(this);
    }

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
        console.log("✅ Game Engine Initialized");
        // Start with the Terminal instance (bootup mode: print full instructions)
        console.log("making terminal from gameEngine.js");
        this.currentTerminal = new Terminal(this, true);
        this.addEntity(this.currentTerminal);
    }

    start() {
        this.running = true;
        console.log("✅ Game Loop Started");
        const gameLoop = () => {
            if (this.running) {
                this.loop();
                requestAnimationFrame(gameLoop);
            }
        };
        gameLoop();
    }

    endMinigame(resultMessage, wasSuccess = false) {
        console.log("🚀 Minigame Ended, Showing Result Screen...");

        if (this.currentMinigame) {
            this.currentMinigame.removeListeners(); // Remove minigame key events
        }
    
        // Remove current minigame reference
        this.currentMinigame = null;
        this.currentMinigameType = null;
    
        // Update trial progress via the TrialManager
        this.trialManager.completeTrial(wasSuccess);
    
        // Check if three or more failures have occurred
        if (this.trialManager.failureCount >= 3) {
            console.log("Game Over: Too many failures.");
            this.currentGameOverScreen = new GameOverScreen(this, "Game Over! You've failed three times.");
            this.addEntity(this.currentGameOverScreen);
            return;
        }
    
        // Check win condition: if the player has completed all four trials
        if (this.currentTrial > 6) {
            console.log("Game Won: All trials completed.");
            this.currentGameOverScreen = new GameOverScreen(this, "Congratulations! You have won the game.");
            this.addEntity(this.currentGameOverScreen);
            return;
        }
    
        // If the trial failed but it's not yet game over, change the message
        if (!wasSuccess) {
            resultMessage = "Trial failed. Press 'T' to return to terminal.";
        }
    
        // Otherwise, show the trial result screen.
        this.currentGameOverScreen = new GameOverScreen(this, resultMessage);
        this.addEntity(this.currentGameOverScreen);
    }
    
    endGameOverScreen() {
        console.log("🔄 Transitioning from Game Over Screen to Terminal...");
    
        if (this.currentGameOverScreen) {
            this.currentGameOverScreen.removeListeners();
        }
        this.currentGameOverScreen = null;
    
        if (this.currentTerminal) {
            this.currentTerminal.removeListeners();
        }
    
        // Clear canvas before returning to the terminal
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.entities = [];
    
        // Create a new Terminal instance in post‑trial mode (skip bootup instructions)
        this.currentTerminal = new Terminal(this, false);
        // Show post‑trial instructions (e.g., prompt for next trial)
        this.currentTerminal.postTrialInstructions();
        this.addEntity(this.currentTerminal);
    }
    
    startInput() {
        const getXandY = (e) => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        // Mouse Listeners
        this.ctx.canvas.addEventListener("mousemove", (e) => {
            if (this.options.debugging) {
                //console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });
        this.ctx.canvas.addEventListener("click", (e) => {
            if (this.options.debugging) {
                //console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
        });
        this.ctx.canvas.addEventListener("wheel", (e) => {
            if (this.options.debugging) {
                //console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault();
            this.wheel = e;
        });
        this.ctx.canvas.addEventListener("contextmenu", (e) => {
            if (this.options.debugging) {
                //console.log("RIGHT_CLICK", getXandY(e));
            }
            this.rightclick = getXandY(e);
        });

        // Keyboard Listeners for normal input
        window.addEventListener("keydown", (event) => (this.keys[event.key] = true));
        window.addEventListener("keyup", (event) => (this.keys[event.key] = false));

        // Debugging keybinds: Quickly pass or fail a minigame using keys "1" and "2"
        if (this.options.debugging) {
            window.addEventListener("keydown", (event) => {
                if (this.currentMinigame) {
                    if (event.key === "{") {
                        console.log("Debug: Simulating minigame success");
                        this.endMinigame("Trial passed (debug)", true);
                    } else if (event.key === "}") {
                        console.log("Debug: Simulating minigame failure");
                        this.endMinigame("Trial failed (debug)", false);
                    }
                }
            });
        }
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    // Start the Typing Minigame
    startTypingGame() {
        console.log("🚀 Starting Typing Minigame...");
        // Remove Terminal listeners if active
        if (this.currentTerminal) {
            this.currentTerminal.removeListeners();
        }
        this.currentMinigame = new TypingGame(this);
        this.currentMinigameType = "typing";
    }
    // Start Breakout Game
    startBreakoutGame() {
        console.log("🚀 Starting Breakout Minigame...");
        if (this.currentTerminal) {
            this.currentTerminal.removeListeners();
        }
        this.currentMinigame = new BreakoutGame(this);
        this.currentMinigameType = "breakout";
    }
    // Start Blasteroid Game
    startBlasteroidGame() {
        console.log("🚀 Starting Blasteroid Minigame...");
        if (this.currentTerminal) {
            this.currentTerminal.removeListeners();
        }
        this.currentMinigame = new Blasteroid(this);
        this.currentMinigameType = "blasteroid";
    }
    // Start Memory Game
    startMemoryGame() {
        console.log("🚀 Starting Riddle Minigame...");
        if (this.currentTerminal) {
            this.currentTerminal.removeListeners();
        }
        this.currentMinigame = new MemoryGame(this);
        this.currentMinigameType = "memory";
    }
    // Start Riddle Game
    startRiddleGame() {
        console.log("🚀 Starting Riddle Minigame...");
        if (this.currentTerminal) {
            this.currentTerminal.removeListeners();
        }
        this.currentMinigame = new RiddleGame(this);
        this.currentMinigameType = "riddle";
    }
    // Start Asteroid Game
    startAsteroidGame() {
        console.log("🚀 Starting Asteroid Minigame...");
        if (this.currentTerminal) {
            this.currentTerminal.removeListeners();
        }
        this.currentMinigame = new AsteroidGame(this);
        this.currentMinigameType = "asteroid";
    }

    // New method to start a trial from the Terminal's Y/N prompt.
    startTrial(trialNumber) {
        console.log(`🚀 Starting Trial ${trialNumber}...`);
        switch (trialNumber) {
            case 1:
                this.startTypingGame();
                break;
            case 2:
                this.startBreakoutGame();
                break;
            case 3:
                this.startBlasteroidGame();
                break;
            case 4:
                this.startRiddleGame();
                break;
            case 5:
                this.startMemoryGame();
                break;
            case 6:
                this.startAsteroidGame();
                break;
            default:
                this.startTypingGame();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        if (this.currentMinigame) {
            // Draw the active minigame
            console.log("🚀 Drawing minigame!");
            this.currentMinigame.draw(this.ctx);
        } else {
            // Draw all entities (including Terminal)
            for (let i = 0; i < this.entities.length; i++) {
                this.entities[i].draw(this.ctx);
            }
        }
    }
    
    update() {
        if (this.currentMinigame) {
            this.currentMinigame.update();
        } else {
            for (let i = 0; i < this.entities.length; i++) {
                this.entities[i].update();
            }
            this.entities = this.entities.filter((entity) => !entity.removeFromWorld);
        }
    }
    
    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }
}

export { GameEngine };
