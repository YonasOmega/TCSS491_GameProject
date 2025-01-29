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
        this.showWrongMessage = false;
        this.wrongMessageTimer = 0;
        this.wrongMessageDuration = 1;
        this.particles = [];
        this.victoryTime = 0;

        // Debug mode properties
        this.debugMode = false;
        this.debugBuffer = "";
        this.debugStartTime = 0;

        document.addEventListener("keydown", (event) => {
            if (!this.isGameOver && !this.hasWon) this.handleKeyPress(event);
        });

        this.generateNewSequence();
    }

    generateNewSequence() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const length = this.baseSequenceLength + Math.floor(this.level / 3);
        this.currentSequence = '';
        for (let i = 0; i < length; i++) {
            this.currentSequence += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        this.playerInput = '';
    }

    handleKeyPress(event) {
        if (event.key.length === 1) {
            // Debug mode check
            const input = event.key.toLowerCase();
            const currentTime = Date.now();

            // Reset debug buffer if too much time has passed
            if (currentTime - this.debugStartTime > 1000) {
                this.debugBuffer = "";
            }
            this.debugStartTime = currentTime;

            // Add to debug buffer and check for "uwt"
            this.debugBuffer += input;
            if (this.debugBuffer.endsWith("uwt")) {
                this.debugMode = !this.debugMode;
                this.debugBuffer = "";
                // Visual feedback for debug mode toggle
                this.showWrongMessage = true;
                this.wrongMessageTimer = this.wrongMessageDuration;
                return;
            }

            // If in debug mode, don't process normal game input
            if (this.debugMode) return;

            // Normal game input processing
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
        } else if (event.key === 'Enter' && !this.debugMode) {
            const hasWrongInput = this.playerInput !== this.currentSequence.substring(0, this.playerInput.length);
            if (this.playerInput.length !== this.currentSequence.length || hasWrongInput) {
                this.timeBar = Math.max(0, this.timeBar - this.wrongPenalty);
                this.playerInput = '';
                this.showWrongMessage = true;
                this.wrongMessageTimer = this.wrongMessageDuration;
            }
        }
    }

    update() {
        if (!this.isGameOver && !this.hasWon && !this.debugMode) {
            this.timeBar -= this.decreaseRate * this.game.clockTick;

            if (this.showWrongMessage) {
                this.wrongMessageTimer -= this.game.clockTick;
                if (this.wrongMessageTimer <= 0) {
                    this.showWrongMessage = false;
                }
            }

            if (this.timeBar <= 0) {
                this.isGameOver = true;
                this.timeBar = 0;
            }
        }

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

    initVictoryParticles() {
        // Initialize with a burst of particles
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
        const type = Math.floor(Math.random() * 3); // Different particle types
        this.particles.push(new Particle(x, y, angle, speed, size, type));
    }

    draw(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw time bar
        const barWidth = (this.timeBar / 30) * 800;
        ctx.fillStyle = "rgb(200, 200, 200)";
        ctx.fillRect(112, 50, 800, 30);
        ctx.fillStyle = `rgb(${Math.floor(255 * (1 - this.timeBar / 30))}, 
                           ${Math.floor(255 * (this.timeBar / 30))}, 0)`;
        ctx.fillRect(112, 50, barWidth, 30);

        // Draw level
        ctx.font = "24px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(`Level: ${this.level}/${this.maxLevel}`, 112, 120);

        if (!this.hasWon) {
            // Draw sequence to type
            ctx.font = "48px Courier";
            ctx.fillStyle = "black";
            let sequenceText = "";
            for (let i = 0; i < this.currentSequence.length; i++) {
                if (i < this.playerInput.length) {
                    // Color code based on correctness
                    ctx.fillStyle = this.playerInput[i] === this.currentSequence[i] ? "green" : "red";
                    sequenceText += this.currentSequence[i] + " ";
                } else {
                    ctx.fillStyle = "black";
                    sequenceText += this.currentSequence[i] + " ";
                }
                ctx.fillText(this.currentSequence[i], 112 + i * 50, 200);
            }

            // Draw player input
            ctx.font = "32px Courier";
            for (let i = 0; i < this.playerInput.length; i++) {
                ctx.fillStyle = this.playerInput[i] === this.currentSequence[i] ? "green" : "red";
                ctx.fillText(this.playerInput[i], 112 + i * 50, 250);
            }
        }

        // Draw victory particles and message
        if (this.hasWon) {
            // Draw all particles
            this.particles.forEach(particle => particle.draw(ctx, this.victoryTime));

            // Draw victory message with wave effect
            ctx.save();
            ctx.font = "64px Arial";
            const text = "VICTORY!";
            const centerX = ctx.canvas.width / 2;
            const centerY = ctx.canvas.height / 2;

            // Create wave effect for text
            for (let i = 0; i < text.length; i++) {
                const letterOffset = Math.sin(this.victoryTime * 5 + i * 0.5) * 20;
                const x = centerX - (text.length * 20) + i * 40;
                const y = centerY + letterOffset;

                ctx.fillStyle = `hsl(${(this.victoryTime * 100 + i * 30) % 360}, 70%, 50%)`;
                ctx.fillText(text[i], x, y);
            }
            ctx.restore();
        }

        // Draw game over message
        if (this.isGameOver) {
            ctx.font = "64px Arial";
            ctx.fillStyle = "red";
            ctx.fillText("GAME OVER", 112, 400);
            ctx.font = "32px Arial";
            ctx.fillText(`Final Level: ${this.level}/${this.maxLevel}`, 112, 450);
        }

        // Draw wrong input message
        if (this.showWrongMessage) {
            ctx.save();
            ctx.font = "48px Arial";
            ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(1, this.wrongMessageTimer)})`;

            const wobble = Math.sin(this.wrongMessageTimer * 10) * 3;
            ctx.translate(ctx.canvas.width / 2 + 20, ctx.canvas.height / 2 - 50);
            ctx.rotate(wobble * Math.PI / 180);

            // Show different message for debug mode toggle
            const message = this.debugMode ? "Debug Mode ON" :
                (!this.debugMode && this.debugBuffer.endsWith("uwt")) ? "Debug Mode OFF" :
                    "Wrong Input!";
            ctx.fillText(message, -100, 0);
            ctx.restore();
        }

        // Draw debug mode indicator
        if (this.debugMode) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "purple";
            ctx.fillText("DEBUG MODE", ctx.canvas.width - 150, 30);
        }

    }
}