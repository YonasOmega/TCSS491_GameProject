import { Timer } from "./timer.js";
import { TypingGame } from "./typingGame.js"; // ✅ Import TypingGame

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
    }

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
        console.log("✅ Game Engine Initialized");
    }

    start() {
        this.running = true;
        console.log("✅ Game Loop Started");

        const gameLoop = () => {
            if (this.running) {
                this.loop();
                requestAnimationFrame(gameLoop); // ✅ Corrected `requestAnimFrame`
            }
        };

        gameLoop();
    }

    startInput() {
        const getXandY = (e) => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });

        // ✅ Mouse Listeners
        this.ctx.canvas.addEventListener("mousemove", (e) => {
            if (this.options.debugging) console.log("MOUSE_MOVE", getXandY(e));
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", (e) => {
            if (this.options.debugging) console.log("CLICK", getXandY(e));
            this.click = getXandY(e);
        });

        this.ctx.canvas.addEventListener("wheel", (e) => {
            if (this.options.debugging) console.log("WHEEL", getXandY(e), e.wheelDelta);
            e.preventDefault(); // Prevent scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", (e) => {
            if (this.options.debugging) console.log("RIGHT_CLICK", getXandY(e));
            e.preventDefault(); // Prevent context menu
            this.rightclick = getXandY(e);
        });

        // ✅ Keyboard Listeners (Using `window` to prevent canvas focus issues)
        window.addEventListener("keydown", (event) => (this.keys[event.key] = true));
        window.addEventListener("keyup", (event) => (this.keys[event.key] = false));
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    // ✅ Start the Typing Minigame
    startTypingGame() {
        console.log("🚀 Starting Typing Minigame...");
        this.currentMinigame = new TypingGame(this);
    }
    //  start breakout game
    startBreakoutGame(){

        console.log(" Starting breakout game...");
        this.currentMinigame = new Breakout(this);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        if (this.currentMinigame) {
            console.log("🚀 drawing minigame!")
            this.currentMinigame.draw(this.ctx);
        } else {
            for (let i = 0; i < this.entities.length; i++) {
                this.entities[i].draw(this.ctx);
            }
        }
    }

    update() {
        if (this.currentMinigame) {
            this.currentMinigame.update();
            console.log("🔄 Updating Typing Minigame...");
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
