// Particle class for visual effects
class Particle {
    constructor(x, y, angle, speed, size, type, color) {
        this.x = x;
        this.y = y;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.size = size;
        this.type = type; // 0 = cross, 1 = circle, 2 = diamond
        this.life = 1;
        this.decay = Math.random() * 0.2 + 0.3;
        this.color = color; // Color based on success/failure
    }

    update(deltaTime) {
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        this.life -= this.decay * deltaTime;
    }

    draw(ctx, time) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(time * 2);
        ctx.fillStyle = this.color;

        if (this.type === 0) {
            // Cross shape
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 4);
            }
        } else if (this.type === 1) {
            // Circle shape
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(this.size / 2, 0);
            ctx.lineTo(0, this.size / 2);
            ctx.lineTo(-this.size / 2, 0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

class GameOverScreen {
    constructor(game, message) {
        this.game = game;
        this.message = message;
        this.showMessage = true; // Controls blinking effect

        // Determine screen type based on the message content
        this.isWin = this.message.toLowerCase().includes("congratulations");
        this.isFailure = this.message.toLowerCase().includes("game over");

        // Color theme based on outcome
        this.color = this.isWin ? "rgb(255, 215, 0)" : // Gold for win
            this.isFailure ? "rgb(255, 0, 0)" : // Red for failure
                "rgb(0, 255, 0)"; // Green for regular completion

        this.particleColor = this.isWin ? "rgba(255, 215, 0, 0.8)" : // Gold for win
            this.isFailure ? "rgba(255, 0, 0, 0.8)" : // Red for failure
                "rgba(0, 255, 0, 0.8)"; // Green for regular completion

        // Blinking effect for the instruction text
        setInterval(() => {
            this.showMessage = !this.showMessage;
        }, 500);

        // Animation and particles
        this.particles = [];
        this.lastTimestamp = Date.now();
        this.elapsedTime = 0;
        this.particleSpawnRate = 0.1; // Spawn particles every 0.1 seconds
        this.particleTimer = 0;

        // Initialize particles
        this.initParticles(50); // Start with 50 particles

        // Listen for the 'T' key to either return to the terminal or restart the game
        this.keyListener = (event) => {
            if (event.key.toLowerCase() === "t") {
                console.log("🔄 Restarting game...");
                // If the screen is a win or failure screen, reload the page to restart
                if (this.isWin || this.isFailure) {
                    window.location.reload();
                } else {
                    this.game.endGameOverScreen();
                }
            }
        };

        window.addEventListener("keydown", this.keyListener);
    }

    initParticles(count) {
        for (let i = 0; i < count; i++) {
            this.addParticle();
        }
    }

    addParticle() {
        const canvas = this.game.ctx.canvas;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 100; // Slightly faster than in typing game
        const size = 5 + Math.random() * 15;
        const type = Math.floor(Math.random() * 3); // 3 particle types
        this.particles.push(new Particle(x, y, angle, speed, size, type, this.particleColor));
    }

    update() {
        // Calculate delta time
        const now = Date.now();
        const deltaTime = (now - this.lastTimestamp) / 1000;
        this.lastTimestamp = now;
        this.elapsedTime += deltaTime;

        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);

            // Remove dead particles
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Add new particles over time
        this.particleTimer += deltaTime;
        if (this.particleTimer >= this.particleSpawnRate) {
            this.particleTimer = 0;
            this.addParticle();
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw particles
        this.particles.forEach(particle => {
            particle.draw(ctx, this.elapsedTime);
        });

        // Choose text color based on win or failure
        ctx.fillStyle = this.color;

        // Add a subtle glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;

        // Center text horizontally (and adjust vertical positions as needed)
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw main message with scale effect
        ctx.font = "48px monospace";
        const scale = 1 + Math.sin(this.elapsedTime * 2) * 0.05; // Subtle pulsing effect
        ctx.save();
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);
        ctx.scale(scale, scale);
        ctx.fillText(this.message, 0, 0);
        ctx.restore();

        // Draw instruction text with blinking effect
        if (this.showMessage) {
            ctx.shadowBlur = 5; // Less glow for instruction text
            ctx.font = "24px monospace";
            // For win or failure screens, instruct the player to press 'T' to restart
            if (this.isWin || this.isFailure) {
                ctx.fillText("Press 'T' to restart", ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
            } else {
                ctx.fillText("Press 'T' to return to terminal", ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
            }
        }

        // Reset shadow
        ctx.shadowBlur = 0;

        // Draw scanlines for retro effect
        this.drawScanlines(ctx);
    }

    drawScanlines(ctx) {
        const scanLineHeight = 4;
        const alpha = 0.1;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;

        for (let i = 0; i < ctx.canvas.height; i += scanLineHeight * 2) {
            ctx.fillRect(0, i, ctx.canvas.width, scanLineHeight);
        }
    }

    removeListeners() {
        window.removeEventListener("keydown", this.keyListener);
    }
}

export { GameOverScreen };