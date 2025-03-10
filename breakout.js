class BreakoutGame {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;

        // Game constants
        this.BLOCK_ROWS = 3;           // Increased rows for more challenge
        this.BLOCK_COLS = 10;          // Slightly more columns
        this.BLOCK_WIDTH = 60;
        this.BLOCK_HEIGHT = 20;
        this.BLOCK_PADDING = 10;
        this.BALL_RADIUS = 8;
        this.PADDLE_WIDTH = 150;
        this.PADDLE_HEIGHT = 15;
        this.PADDLE_SPEED = 10;        // Slightly faster paddle
        this.INITIAL_BALL_SPEED = 6;
        this.SPEED_INCREMENT = 0.2;    // Reduced speed increment for smoother difficulty progression

        // New win condition: break 15 blocks to win
        this.BLOCKS_TO_WIN = 15;
        this.blocksDestroyed = 0;

        // Game state
        this.state = {
            score: 0,
            balls: 3,
            multiplier: 1,
            bonusActive: false,
            isPlaying: false,
            gameOver: false,
            blocks: [],
            paddle: {
                x: this.ctx.canvas.width / 2 - this.PADDLE_WIDTH / 2,
                y: this.ctx.canvas.height - 40
            },
            ball: {
                x: 0,
                y: 0,
                dx: 0,
                dy: 0,
                speed: this.INITIAL_BALL_SPEED,
                angle: -Math.PI / 4
            },
            keys: {
                left: false,
                right: false,
                space: false
            },
            timeLeft: 60 // Add a time limit for additional challenge
        };

        // Initialize game elements
        this.initializeBlocks();
        this.resetBall();

        // Initialize text effects
        this.messages = [];
        this.particles = [];

        // Progress indicator properties
        this.progressIndicator = {
            x: 30,
            y: 80,
            width: 20,
            height: this.ctx.canvas.height - 160,
            fillPercent: 0,
            shake: {
                active: false,
                intensity: 0,
                duration: 0,
                timer: 0
            }
        };

        // Bind event handlers
        this.keydownHandler = this.handleKeydown.bind(this);
        this.keyupHandler = this.handleKeyup.bind(this);
        this.setupInputHandlers();

        // Start the game timer
        this.lastTimestamp = Date.now();
        this.bgMusic = new Audio('./assets/brick.mp3'); 
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.1;
        this.playBackgroundMusic();
    }
    playBackgroundMusic() {
        const playPromise = this.bgMusic.play();
        
        // Handle potential play() promise rejection (autoplay policy)
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented. Adding click listener for music start");
                
                // Use space key press as a trigger for music
                const startAudioOnInput = () => {
                    this.bgMusic.play().catch(e => console.log("Still couldn't play audio:", e));
                    document.removeEventListener('keydown', startAudioOnInput);
                    document.removeEventListener('click', startAudioOnInput);
                };
                
                document.addEventListener('keydown', startAudioOnInput);
                document.addEventListener('click', startAudioOnInput);
            });
        }
    }
    

    initializeBlocks() {
        this.state.blocks = [];
        const startX = (this.ctx.canvas.width - (this.BLOCK_COLS * (this.BLOCK_WIDTH + this.BLOCK_PADDING))) / 2;
        const startY = 80;

        const colors = ['#0F0', '#00FF66', '#00FFAA']; // Different green shades for different rows

        for (let row = 0; row < this.BLOCK_ROWS; row++) {
            for (let col = 0; col < this.BLOCK_COLS; col++) {
                this.state.blocks.push({
                    x: startX + col * (this.BLOCK_WIDTH + this.BLOCK_PADDING),
                    y: startY + row * (this.BLOCK_HEIGHT + this.BLOCK_PADDING),
                    width: this.BLOCK_WIDTH,
                    height: this.BLOCK_HEIGHT,
                    active: true,
                    color: colors[row % colors.length],
                    hitPoints: 1 
                });
            }
        }
    }

    resetBall() {
        this.state.ball.x = this.state.paddle.x + this.PADDLE_WIDTH / 2;
        this.state.ball.y = this.state.paddle.y - this.BALL_RADIUS;
        this.state.ball.dx = 0;
        this.state.ball.dy = 0;
        this.state.isPlaying = false;
    }

    launchBall() {
        if (!this.state.isPlaying && !this.state.gameOver) {
            this.state.ball.dx = this.state.ball.speed * Math.cos(this.state.ball.angle);
            this.state.ball.dy = this.state.ball.speed * Math.sin(this.state.ball.angle);
            this.state.isPlaying = true;
            this.addMessage("LAUNCH!", this.state.ball.x, this.state.ball.y - 20);
        }
    }

    addMessage(text, x, y, duration = 1, color = "#0F0") {
        this.messages.push({
            text,
            x,
            y,
            duration,
            timer: duration,
            color
        });
    }

    addParticles(x, y, count = 10, color = "#0F0") {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.particles.push({
                x,
                y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 3,
                life: 1,
                color
            });
        }
    }

    triggerProgressShake() {
        this.progressIndicator.shake.active = true;
        this.progressIndicator.shake.intensity = 5;
        this.progressIndicator.shake.duration = 0.5;
        this.progressIndicator.shake.timer = this.progressIndicator.shake.duration;
    }

    updatePaddle() {
        if (this.state.keys.left && this.state.paddle.x > 0) {
            this.state.paddle.x -= this.PADDLE_SPEED;
        }
        if (this.state.keys.right && this.state.paddle.x < this.ctx.canvas.width - this.PADDLE_WIDTH) {
            this.state.paddle.x += this.PADDLE_SPEED;
        }

        if (!this.state.isPlaying) {
            this.state.ball.x = this.state.paddle.x + this.PADDLE_WIDTH / 2;
            this.state.ball.y = this.state.paddle.y - this.BALL_RADIUS;
        }
    }

    checkBlockCollisions() {
        for (let block of this.state.blocks) {
            if (!block.active) continue;

            const closest = {
                x: Math.max(block.x, Math.min(this.state.ball.x, block.x + block.width)),
                y: Math.max(block.y, Math.min(this.state.ball.y, block.y + block.height))
            };

            const distance = Math.hypot(
                this.state.ball.x - closest.x,
                this.state.ball.y - closest.y
            );

            if (distance < this.BALL_RADIUS) {
                block.hitPoints--;

                if (block.hitPoints <= 0) {
                    block.active = false;
                    this.blocksDestroyed++;

                    // Update progress indicator
                    this.progressIndicator.fillPercent = this.blocksDestroyed / this.BLOCKS_TO_WIN;
                    this.triggerProgressShake();

                    this.state.score += 100 * this.state.multiplier;
                    this.addMessage(`+${100 * this.state.multiplier}`, block.x + block.width / 2, block.y);
                    this.addParticles(closest.x, closest.y, 15, block.color);

                    // Check win condition - player has destroyed enough blocks
                    if (this.blocksDestroyed >= this.BLOCKS_TO_WIN) {
                        this.state.gameOver = true;
                        this.game.endMinigame(`You won! Destroyed ${this.blocksDestroyed} blocks!`, true);
                    }
                } else {
                    // Visual feedback for hit but not destroyed
                    this.addParticles(closest.x, closest.y, 5, block.color);
                }

                // Speed increases slightly with each hit
                this.state.ball.speed += this.SPEED_INCREMENT;

                // Determine bounce direction
                if (closest.x === block.x || closest.x === block.x + block.width) {
                    this.state.ball.dx *= -1;
                }
                if (closest.y === block.y || closest.y === block.y + block.height) {
                    this.state.ball.dy *= -1;
                }
            }
        }
    }

    checkCollisions() {
        // Wall collisions
        if (this.state.ball.x - this.BALL_RADIUS <= 0) {
            this.state.ball.dx = Math.abs(this.state.ball.dx);
            this.addParticles(this.state.ball.x, this.state.ball.y, 5);
        }

        if (this.state.ball.x + this.BALL_RADIUS >= this.ctx.canvas.width) {
            this.state.ball.dx = -Math.abs(this.state.ball.dx);
            this.addParticles(this.state.ball.x, this.state.ball.y, 5);
        }

        if (this.state.ball.y - this.BALL_RADIUS <= 0) {
            this.state.ball.dy = Math.abs(this.state.ball.dy);
            this.addParticles(this.state.ball.x, this.state.ball.y, 5);
        }

        // Paddle collision
        if (this.state.ball.y + this.BALL_RADIUS >= this.state.paddle.y &&
            this.state.ball.y - this.BALL_RADIUS <= this.state.paddle.y + this.PADDLE_HEIGHT &&
            this.state.ball.x >= this.state.paddle.x &&
            this.state.ball.x <= this.state.paddle.x + this.PADDLE_WIDTH) {

            // Calculate hit position for angle
            const hitPosition = (this.state.ball.x - this.state.paddle.x) / this.PADDLE_WIDTH;
            const angle = -Math.PI / 2 + (hitPosition - 0.5) * Math.PI * 0.8;

            this.state.ball.dx = this.state.ball.speed * Math.cos(angle);
            this.state.ball.dy = this.state.ball.speed * Math.sin(angle);

            // Ensure the ball is always moving upward after paddle hit
            this.state.ball.dy = -Math.abs(this.state.ball.dy);

            // Visual feedback
            this.addParticles(this.state.ball.x, this.state.paddle.y, 8);

            // Activate bonus
            if (Math.random() < 0.1 && !this.state.bonusActive) {
                this.state.bonusActive = true;
                this.state.multiplier = 2;
                this.addMessage("2x MULTIPLIER!", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2, 2);

                // Reset multiplier after 10 seconds
                setTimeout(() => {
                    this.state.bonusActive = false;
                    this.state.multiplier = 1;
                }, 10000);
            }
        }

        // Ball out of bounds
        if (this.state.ball.y + this.BALL_RADIUS > this.ctx.canvas.height) {
            this.state.balls--;
            this.addMessage("BALL LOST!", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2, 1.5, "#FF3333");

            if (this.state.balls <= 0) {
                this.state.gameOver = true;
                this.game.endMinigame("You lost at Breakout.", false);
            } else {
                this.resetBall();
            }
        }
    }

    updateMessages(deltaTime) {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const message = this.messages[i];
            message.timer -= deltaTime;
            message.y -= 30 * deltaTime; // Move message upward

            if (message.timer <= 0) {
                this.messages.splice(i, 1);
            }
        }
    }

    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life -= deltaTime * 2;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateProgressShake(deltaTime) {
        if (this.progressIndicator.shake.active) {
            this.progressIndicator.shake.timer -= deltaTime;
            this.progressIndicator.shake.intensity *= 0.9; // Decrease intensity over time

            if (this.progressIndicator.shake.timer <= 0) {
                this.progressIndicator.shake.active = false;
            }
        }
    }

    update() {
        // Calculate delta time
        const now = Date.now();
        const deltaTime = (now - this.lastTimestamp) / 1000;
        this.lastTimestamp = now;

        // Update timer
        if (this.state.isPlaying && !this.state.gameOver) {
            this.state.timeLeft -= deltaTime;
            if (this.state.timeLeft <= 0) {
                this.state.gameOver = true;
                this.game.endMinigame("Time's up! You lost at Breakout.", false);
            }
        }

        if (this.state.isPlaying && !this.state.gameOver) {
            this.state.ball.x += this.state.ball.dx;
            this.state.ball.y += this.state.ball.dy;
            this.checkCollisions();
            this.checkBlockCollisions();
        }

        this.updatePaddle();
        this.updateMessages(deltaTime);
        this.updateParticles(deltaTime);
        this.updateProgressShake(deltaTime);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw blocks
        this.state.blocks.forEach(block => {
            if (block.active) {
                this.ctx.fillStyle = block.color;
                this.ctx.fillRect(block.x, block.y, block.width, block.height);

                // Add a subtle 3D effect
                this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(block.x, block.y);
                this.ctx.lineTo(block.x + block.width, block.y);
                this.ctx.lineTo(block.x + block.width, block.y + block.height);
                this.ctx.stroke();

                this.ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
                this.ctx.beginPath();
                this.ctx.moveTo(block.x, block.y + block.height);
                this.ctx.lineTo(block.x + block.width, block.y + block.height);
                this.ctx.lineTo(block.x, block.y + block.height);
                this.ctx.lineTo(block.x, block.y);
                this.ctx.stroke();
            }
        });

        // Draw progress indicator with shake effect
        this.ctx.save();

        let shakeX = 0;
        let shakeY = 0;

        if (this.progressIndicator.shake.active) {
            shakeX = (Math.random() - 0.5) * this.progressIndicator.shake.intensity;
            shakeY = (Math.random() - 0.5) * this.progressIndicator.shake.intensity;
        }

        // Draw progress indicator background
        this.ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
        this.ctx.fillRect(
            this.progressIndicator.x + shakeX,
            this.progressIndicator.y + shakeY,
            this.progressIndicator.width,
            this.progressIndicator.height
        );

        // Draw progress fill
        const fillHeight = this.progressIndicator.height * Math.min(1, this.progressIndicator.fillPercent);
        this.ctx.fillStyle = "#0F0";
        this.ctx.fillRect(
            this.progressIndicator.x + shakeX,
            this.progressIndicator.y + this.progressIndicator.height - fillHeight + shakeY,
            this.progressIndicator.width,
            fillHeight
        );

        // Draw progress text
        this.ctx.font = "16px monospace";
        this.ctx.fillStyle = "#0F0";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
            `${this.blocksDestroyed}/${this.BLOCKS_TO_WIN}`,
            this.progressIndicator.x + this.progressIndicator.width / 2 + shakeX,
            this.progressIndicator.y - 10 + shakeY
        );
        this.ctx.textAlign = "left";
        this.ctx.restore();

        // Draw paddle with glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#0F0";
        this.ctx.fillStyle = "#0F0";
        this.ctx.fillRect(this.state.paddle.x, this.state.paddle.y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
        this.ctx.shadowBlur = 0;

        // Draw ball with glow effect
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#0F0";
        this.ctx.beginPath();
        this.ctx.arc(this.state.ball.x, this.state.ball.y, this.BALL_RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.shadowBlur = 0;

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;

        // Draw messages
        this.messages.forEach(message => {
            this.ctx.globalAlpha = Math.min(1, message.timer / (message.duration * 0.5));
            this.ctx.font = "bold 16px monospace";
            this.ctx.fillStyle = message.color;
            this.ctx.textAlign = "center";
            this.ctx.fillText(message.text, message.x, message.y);
        });
        this.ctx.globalAlpha = 1;
        this.ctx.textAlign = "left";

        // Draw score and balls
        this.ctx.font = "16px monospace";
        this.ctx.fillStyle = "#0F0";
        this.ctx.fillText(`Score: ${this.state.score}`, 10, 20);
        this.ctx.fillText(`Balls: ${this.state.balls}`, 10, 40);

        // Draw multiplier if active
        if (this.state.bonusActive) {
            this.ctx.fillStyle = "#FFFF00";
            this.ctx.fillText(`Multiplier: x${this.state.multiplier}`, 10, 60);
        }

        // Draw timer
        this.ctx.fillStyle = this.state.timeLeft < 10 ? "#FF3333" : "#0F0";
        this.ctx.fillText(`Time: ${Math.ceil(this.state.timeLeft)}`, this.ctx.canvas.width - 100, 20);

        // Draw game start instructions if not playing
        if (!this.state.isPlaying && !this.state.gameOver) {
            this.ctx.font = "24px monospace";
            this.ctx.fillStyle = "#0F0";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Press SPACE to launch", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
            this.ctx.fillText("Use LEFT/RIGHT arrows to move", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 30);
            this.ctx.fillText(`Break ${this.BLOCKS_TO_WIN} blocks to win!`, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 60);
            this.ctx.textAlign = "left";
        }

        // Draw game over message
        if (this.state.gameOver) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            this.ctx.font = "36px monospace";
            this.ctx.fillStyle = "#0F0";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Game Over", this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 - 20);
            this.ctx.font = "24px monospace";
            this.ctx.fillText(`Final Score: ${this.state.score}`, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 20);
            this.ctx.fillText(`Blocks Destroyed: ${this.blocksDestroyed}/${this.BLOCKS_TO_WIN}`, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2 + 50);
            this.ctx.textAlign = "left";
        }

        // Add CRT scan line effect
        this.drawScanlines();
    }

    drawScanlines() {
        const scanLineHeight = 4;
        const alpha = 0.1;
        this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;

        for (let i = 0; i < this.ctx.canvas.height; i += scanLineHeight * 2) {
            this.ctx.fillRect(0, i, this.ctx.canvas.width, scanLineHeight);
        }
    }

    setupInputHandlers() {
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    handleKeydown(event) {
        if (this.game.currentMinigameType !== "breakout") return;

        if (event.key === 'ArrowLeft' || event.key === 'a') this.state.keys.left = true;
        if (event.key === 'ArrowRight' || event.key === 'd') this.state.keys.right = true;
        if (event.key === ' ') {
            this.state.keys.space = true;
            this.launchBall();
        }
    }

    handleKeyup(event) {
        if (event.key === 'ArrowLeft' || event.key === 'a') this.state.keys.left = false;
        if (event.key === 'ArrowRight' || event.key === 'd') this.state.keys.right = false;
        if (event.key === ' ') this.state.keys.space = false;
    }

    removeListeners() {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }
}

export { BreakoutGame };