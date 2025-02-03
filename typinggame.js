class TypingGame {
    constructor(game) {
        this.game = game;
        this.timeBar = 30;
        this.decreaseRate = 1.25;
        this.increaseAmount = 1.5;
        this.wrongPenalty = 1.75;
        this.currentSequence = "";
        this.playerInput = "";
        this.baseSequenceLength = 3;
        this.level = 1;
        this.maxLevel = 15;
        this.isGameOver = false;
        this.hasWon = false;


        // Game start state
        this.gameStarted = false;

        // Initialize audio
        this.noiseAudio = new Audio('noize.mp3');
        this.noiseAudio.loop = true;

        // Enhanced message system
        this.messageEffect = {
            active: true,
            timer: 30,
            duration: 1,
            intensity: 1,
            message: "Enter to decay",
            isStartMessage: true
        };

        // Glitch effect system
        this.glitchEffect = {
            active: false,
            duration: 0.5,
            timer: 0,
            intensity: 0,
            slices: [],
            characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&!?</>[]*"
        };

        // Particle system
        this.particles = [];
        this.victoryTime = 0;

        // Debug mode properties
        this.debugMode = false;
        this.debugBuffer = "";
        this.debugStartTime = 0;

        // Pip-Boy color theme
        this.colors = {
            primary: "rgba(0, 255, 0, 0.8)",    // Bright green
            dimmed: "rgba(0, 255, 0, 0.6)",     // Dimmed green
            background: "rgba(0, 255, 0, 0.1)",  // Very dim green
            error: "rgba(255, 50, 50, 0.8)"     // Error red
        };

        // Matrix effect properties
        this.matrixChars = [];
        this.maxMatrixChars = 50;

        // Initialize matrix effect
        this.initMatrixEffect();

        // Set up event listener
        document.addEventListener("keydown", (event) => {
            if (!this.isGameOver && !this.hasWon) this.handleKeyPress(event);
        });
    }

    initMatrixEffect() {
        for (let i = 0; i < this.maxMatrixChars; i++) {
            this.matrixChars.push({
                x: Math.random() * this.game.ctx.canvas.width,
                y: Math.random() * this.game.ctx.canvas.height,
                speed: Math.random() * 50 + 20,
                value: Math.floor(Math.random() * 10),
                alpha: Math.random() * 0.5 + 0.1
            });
        }
    }

    generateNewSequence() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = this.baseSequenceLength + Math.floor(this.level / 2);
        this.currentSequence = '';
        for (let i = 0; i < length; i++) {
            this.currentSequence += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.playerInput = '';
    }

    startGlitchEffect() {
        this.glitchEffect.active = true;
        this.glitchEffect.timer = this.glitchEffect.duration;
        this.glitchEffect.intensity = 1;

        // Create random slices for the glitch effect
        this.glitchEffect.slices = [];
        const numSlices = 10;
        for (let i = 0; i < numSlices; i++) {
            this.glitchEffect.slices.push({
                offset: (Math.random() - 0.5) * 30,
                y: Math.random() * this.game.ctx.canvas.height,
                height: Math.random() * 50 + 10
            });
        }

        // Scramble the current sequence
        const scrambledSequence = this.currentSequence.split('');
        for (let i = scrambledSequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [scrambledSequence[i], scrambledSequence[j]] = [scrambledSequence[j], scrambledSequence[i]];

            // Randomly replace some characters with glitch characters
            if (Math.random() < 0.3) {
                scrambledSequence[i] = this.glitchEffect.characters.charAt(
                    Math.floor(Math.random() * this.glitchEffect.characters.length)
                );
            }
        }
        this.currentSequence = scrambledSequence.join('');
    }

    handleKeyPress(event) {
        if (!this.gameStarted) {
            if (event.key === 'Enter') {
                this.gameStarted = true;
                this.messageEffect.active = false;
                this.generateNewSequence();
            }
            return;
        }

        if (event.key.length === 1) {
            const input = event.key.toLowerCase();
            const currentTime = Date.now();

            if (currentTime - this.debugStartTime > 1000) {
                this.debugBuffer = "";
            }
            this.debugStartTime = currentTime;

            this.debugBuffer += input;
            if (this.debugBuffer.endsWith("uwt")) {
                this.debugMode = !this.debugMode;
                this.debugBuffer = "";
                this.messageEffect.active = true;
                this.messageEffect.timer = this.messageEffect.duration;
                return;
            }

            if (this.debugMode) return;

            const gameInput = event.key.toUpperCase();
            this.playerInput += gameInput;

            if (gameInput === this.currentSequence[this.playerInput.length - 1]) {
                this.timeBar = Math.min(30, this.timeBar + this.increaseAmount);

                if (this.playerInput.length === this.currentSequence.length) {
                    this.level++;
                    if (this.level > this.maxLevel) {
                        this.hasWon = true;
                        this.initVictoryParticles();
                    } else {
                        this.generateNewSequence();
                    }
                }
            }
        } else if (event.key === 'Enter') {
            const hasWrongInput = this.playerInput !== this.currentSequence.substring(0, this.playerInput.length);
            if (this.playerInput.length !== this.currentSequence.length || hasWrongInput) {
                this.timeBar = Math.max(0, this.timeBar - this.wrongPenalty);
                this.playerInput = '';
                this.messageEffect.active = true;
                this.messageEffect.timer = this.messageEffect.duration;
                this.messageEffect.isStartMessage = false;
                this.startGlitchEffect();
            }
        }
    }

    initVictoryParticles() {
        for (let i = 0; i < 50; i++) {
            this.addVictoryParticle();
        }
    }

    addVictoryParticle() {
        const canvas = this.game.ctx.canvas;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 100;
        const size = 5 + Math.random() * 15;
        const type = Math.floor(Math.random() * 3);
        this.particles.push(new Particle(x, y, angle, speed, size, type));
    }

    updateGlitchEffect() {
        if (this.glitchEffect.active) {
            this.glitchEffect.timer -= this.game.clockTick;
            this.glitchEffect.intensity = this.glitchEffect.timer / this.glitchEffect.duration;

            if (this.glitchEffect.timer <= 0) {
                this.glitchEffect.active = false;
                this.generateNewSequence();
            }
        }
    }
    // Drawing methods
    update() {
        this.updateGlitchEffect();

        // Only decrease time bar if game has started
        if (this.gameStarted && !this.isGameOver && !this.hasWon && !this.debugMode) {
            this.timeBar -= this.decreaseRate * this.game.clockTick;

            if (this.messageEffect.active) {
                this.messageEffect.timer -= this.game.clockTick;
                if (this.messageEffect.timer <= 0) {
                    this.messageEffect.active = this.messageEffect.isStartMessage;
                    this.messageEffect.timer = this.messageEffect.duration;
                }
            }

            if (this.timeBar <= 0) {
                this.isGameOver = true;
                this.timeBar = 0;
            }
        }

        // Update victory particles if won
        if (this.hasWon) {
            this.victoryTime += this.game.clockTick;
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update(this.game.clockTick);
                if (this.particles[i].life <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            if (this.victoryTime % 0.1 < this.game.clockTick) {
                this.addVictoryParticle();
            }
        }
    }

    drawMessageEffect(ctx) {
        if (this.messageEffect.active) {
            const glitchChars = "@#$%&!?<>[]";
            const message = this.messageEffect.isStartMessage ? "Enter to decay" : "Wrong Input!";
            const levelIntensity = this.level / this.maxLevel;

            // Reduced number of copies for cleaner look
            const numCopies = 3;

            for (let i = 0; i < numCopies; i++) {
                ctx.save();
                ctx.font = "48px monospace";

                // Reduced offset effects
                const offset = Math.random() * (5 + levelIntensity * 8) - (2.5 + levelIntensity * 4);

                // Color channels with varying opacity
                if (i % 3 === 0) ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(0.8, this.messageEffect.timer)})`;
                if (i % 3 === 1) ctx.fillStyle = `rgba(0, 255, 0, ${Math.min(0.8, this.messageEffect.timer)})`;
                if (i % 3 === 2) ctx.fillStyle = `rgba(0, 0, 255, ${Math.min(0.8, this.messageEffect.timer)})`;

                // Position based on message type and color channel
                let messageX, messageY;
                const centerX = ctx.canvas.width / 2 - 100;
                const centerY = ctx.canvas.height / 2 - 50;
                const radius = 10; // Smaller radius for tighter orbits
                const time = Date.now() / 2000; // Much slower rotation (2 seconds per rotation)

                if (this.messageEffect.isStartMessage) {
                    // Slower base horizontal movement
                    const baseX = ((Math.cos(time / 3) + 1) / 2) * (ctx.canvas.width - 300);
                    // Add gentler circular offset based on color channel
                    if (i % 3 === 0) { // Red channel
                        messageX = baseX + Math.cos(time) * radius;
                        messageY = centerY + Math.sin(time) * radius;
                    } else if (i % 3 === 1) { // Green channel
                        messageX = baseX + Math.cos(time + (Math.PI * 2/3)) * radius;
                        messageY = centerY + Math.sin(time + (Math.PI * 2/3)) * radius;
                    } else { // Blue channel
                        messageX = baseX + Math.cos(time + (Math.PI * 4/3)) * radius;
                        messageY = centerY + Math.sin(time + (Math.PI * 4/3)) * radius;
                    }
                } else {
                    // Error message with gentler circular motion
                    if (i % 3 === 0) { // Red channel
                        messageX = centerX + Math.cos(time) * radius;
                        messageY = centerY + Math.sin(time) * radius;
                    } else if (i % 3 === 1) { // Green channel
                        messageX = centerX + Math.cos(time + (Math.PI * 2/3)) * radius;
                        messageY = centerY + Math.sin(time + (Math.PI * 2/3)) * radius;
                    } else { // Blue channel
                        messageX = centerX + Math.cos(time + (Math.PI * 4/3)) * radius;
                        messageY = centerY + Math.sin(time + (Math.PI * 4/3)) * radius;
                    }
                }

                // Slowed down wobble effect
                const wobbleSpeed = 5 + levelIntensity * 8;
                const wobbleAmount = 3 + levelIntensity * 5;
                const wobble = Math.sin((this.messageEffect.timer + i) * wobbleSpeed) * wobbleAmount;

                ctx.translate(messageX + wobble, messageY);

                // Reduced rotation
                const maxRotation = (Math.PI / 4) * levelIntensity; // Max 45 degrees rotation
                const randomRotation = (Math.random() - 0.5) * maxRotation;
                ctx.rotate(randomRotation + (wobble * Math.PI / 360)); // Reduced wobble rotation impact

                // Reduced glitch character probability
                let glitchedMessage = message.split('').map(char =>
                    Math.random() < (0.05 + levelIntensity * 0.15) ?
                        glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
                ).join('');

                // Reduced scaling
                const scale = 1 + (Math.random() - 0.5) * 0.25 * levelIntensity;
                ctx.scale(scale, scale);

                ctx.fillText(glitchedMessage, offset, offset);
                ctx.restore();
            }
        }
    }

    drawGlitchEffect(ctx) {
        if (!this.glitchEffect.active) return;

        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const pixels = imageData.data;

        // RGB shift effect
        for (let i = 0; i < pixels.length; i += 4) {
            const offset = Math.floor(Math.random() * 30) * this.glitchEffect.intensity;
            if (i + offset * 4 < pixels.length) {
                pixels[i] = pixels[i + offset * 4]; // Red channel shift
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Draw glitch slices
        this.glitchEffect.slices.forEach(slice => {
            const offset = slice.offset * this.glitchEffect.intensity;
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, slice.y, ctx.canvas.width, slice.height);
            ctx.clip();
            ctx.drawImage(
                ctx.canvas,
                offset, 0, ctx.canvas.width, ctx.canvas.height,
                0, 0, ctx.canvas.width, ctx.canvas.height
            );
            ctx.restore();
        });

        // Add noise
        ctx.fillStyle = `rgba(0, 255, 0, ${0.1 * this.glitchEffect.intensity})`;
        for (let i = 0; i < 100 * this.glitchEffect.intensity; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = Math.random() * ctx.canvas.height;
            const size = Math.random() * 3 + 1;
            ctx.fillRect(x, y, size, size);
        }
    }

    draw(ctx) {
        // Clear and add green tint background
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (this.gameStarted) {
            const barWidth = (this.timeBar / 30) * 800;
            ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
            ctx.fillRect(112, 50, 800, 30);
            ctx.fillStyle = this.colors.primary;
            ctx.fillRect(112, 50, barWidth, 30);

            // Draw level
            ctx.font = "24px monospace";
            ctx.fillStyle = this.colors.primary;
            ctx.fillText(`Level: ${this.level}/${this.maxLevel}`, 112, 120);

            if (!this.hasWon) {
                // Draw sequence to type
                ctx.font = "48px monospace";
                for (let i = 0; i < this.currentSequence.length; i++) {
                    if (i < this.playerInput.length) {
                        ctx.fillStyle = this.playerInput[i] === this.currentSequence[i] ?
                            this.colors.primary : this.colors.error;
                    } else {
                        ctx.fillStyle = this.colors.dimmed;
                    }
                    ctx.fillText(this.currentSequence[i], 112 + i * 50, 200);
                }

                // Draw player input
                ctx.font = "32px monospace";
                for (let i = 0; i < this.playerInput.length; i++) {
                    ctx.fillStyle = this.playerInput[i] === this.currentSequence[i] ?
                        this.colors.primary : this.colors.error;
                    ctx.fillText(this.playerInput[i], 112 + i * 50, 250);
                }
            }
        }

        // Draw message effects
        this.drawMessageEffect(ctx);

        // Draw victory effects
        if (this.hasWon) {
            this.particles.forEach(particle => {
                ctx.fillStyle = `rgba(0, 255, 0, ${0.5 + Math.sin(this.victoryTime * 5) * 0.3})`;
                particle.draw(ctx, this.victoryTime);
            });

            ctx.save();
            ctx.font = "64px monospace";
            const text = "VICTORY!";
            const centerX = ctx.canvas.width / 2;
            const centerY = ctx.canvas.height / 2;

            for (let i = 0; i < text.length; i++) {
                const letterOffset = Math.sin(this.victoryTime * 5 + i * 0.5) * 20;
                const x = centerX - (text.length * 20) + i * 40;
                const y = centerY + letterOffset;

                ctx.fillStyle = this.colors.primary;
                ctx.globalAlpha = 0.7 + Math.sin(this.victoryTime * 3 + i * 0.5) * 0.3;
                ctx.fillText(text[i], x, y);
            }
            ctx.restore();
        }

        // Draw game over message
        if (this.isGameOver) {
            ctx.font = "64px monospace";
            ctx.fillStyle = this.colors.error;
            ctx.fillText("GAME OVER", 112, 400);
            ctx.font = "32px monospace";
            ctx.fillStyle = this.colors.primary;
            ctx.fillText(`Final Level: ${this.level}/${this.maxLevel}`, 112, 450);
        }

        // Draw debug mode indicator
        if (this.debugMode) {
            ctx.font = "24px monospace";
            ctx.fillStyle = this.colors.primary;
            ctx.fillText("DEBUG MODE", ctx.canvas.width - 150, 30);
        }

        // Add scanline effect
        this.drawScanlines(ctx);

        // Apply glitch effect last
        this.drawGlitchEffect(ctx);
    }

    drawScanlines(ctx) {
        const scanLineHeight = 4;
        const alpha = 0.1;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;

        for (let i = 0; i < ctx.canvas.height; i += scanLineHeight * 2) {
            ctx.fillRect(0, i, ctx.canvas.width, scanLineHeight);
        }
    }
}

// Particle class for victory effects
class Particle {
    constructor(x, y, angle, speed, size, type) {
        this.x = x;
        this.y = y;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.size = size;
        this.type = type;
        this.life = 1;
        this.decay = Math.random() * 0.2 + 0.3; // Random decay rate
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

        if (this.type === 0) {
            // Star shape
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
