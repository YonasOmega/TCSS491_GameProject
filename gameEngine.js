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

    draw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw all entities
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }
    }

    update() {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }

        // Remove entities marked for removal
        this.entities = this.entities.filter((entity) => !entity.removeFromWorld);
    }

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    }
}

// ✅ Ensure Timer is Defined or Imported
class Timer {
    constructor() {
        this.lastTimestamp = performance.now();
    }

    tick() {
        let now = performance.now();
        let delta = now - this.lastTimestamp;
        this.lastTimestamp = now;
        return delta / 1000; // Convert ms to seconds
    }
}

export { GameEngine };