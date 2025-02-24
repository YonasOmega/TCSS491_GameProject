class BreakoutGame {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;

        // Game constants
        this.BLOCK_ROWS = 2;
        this.BLOCK_COLS = 9;
        this.BLOCK_WIDTH = 60;
        this.BLOCK_HEIGHT = 20;
        this.BLOCK_PADDING = 10;
        this.BALL_RADIUS = 8;
        this.PADDLE_WIDTH = 100;
        this.PADDLE_HEIGHT = 15;
        this.PADDLE_SPEED = 8;
        this.INITIAL_BALL_SPEED = 5;
        this.SPEED_INCREMENT = 0.2;

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
                space: false,
                minus: false,
                equals: false
            }
        };

        // Initialize game elements
        this.initializeBlocks();
        this.resetBall();

        // Bind event handlers
        this.keydownHandler = this.handleKeydown.bind(this);
        this.keyupHandler = this.handleKeyup.bind(this);
        this.setupInputHandlers();
    }

    initializeBlocks() {
        this.state.blocks = [];
        const startX = (this.ctx.canvas.width - (this.BLOCK_COLS * (this.BLOCK_WIDTH + this.BLOCK_PADDING))) / 2;
        const startY = 100;

        for (let row = 0; row < this.BLOCK_ROWS; row++) {
            for (let col = 0; col < this.BLOCK_COLS; col++) {
                this.state.blocks.push({
                    x: startX + col * (this.BLOCK_WIDTH + this.BLOCK_PADDING),
                    y: startY + row * (this.BLOCK_HEIGHT + this.BLOCK_PADDING),
                    width: this.BLOCK_WIDTH,
                    height: this.BLOCK_HEIGHT,
                    active: true
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
        if (!this.state.isPlaying) {
            this.state.ball.dx = this.state.ball.speed * Math.cos(this.state.ball.angle);
            this.state.ball.dy = this.state.ball.speed * Math.sin(this.state.ball.angle);
            this.state.isPlaying = true;
        }
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
                block.active = false;
                this.state.score += 100 * this.state.multiplier;
                this.state.ball.speed += this.SPEED_INCREMENT;

                if (closest.x === block.x || closest.x === block.x + block.width) {
                    this.state.ball.dx *= -1;
                }
                if (closest.y === block.y || closest.y === block.y + block.height) {
                    this.state.ball.dy *= -1;
                }
            }
        }

        if (this.state.blocks.every(block => !block.active)) {
            this.game.endMinigame("You won Breakout!");
        }
    }

    checkCollisions() {
        if (this.state.ball.x - this.BALL_RADIUS <= 0 || this.state.ball.x + this.BALL_RADIUS >= this.ctx.canvas.width) {
            this.state.ball.dx *= -1;
        }
        if (this.state.ball.y - this.BALL_RADIUS <= 0) {
            this.state.ball.dy *= -1;
        }

        if (this.state.ball.y + this.BALL_RADIUS >= this.state.paddle.y &&
            this.state.ball.x >= this.state.paddle.x &&
            this.state.ball.x <= this.state.paddle.x + this.PADDLE_WIDTH) {
            const hitPosition = (this.state.ball.x - this.state.paddle.x) / this.PADDLE_WIDTH;
            const angle = -Math.PI / 2 + (hitPosition - 0.5) * Math.PI * 0.7;
            this.state.ball.dx = this.state.ball.speed * Math.cos(angle);
            this.state.ball.dy = this.state.ball.speed * Math.sin(angle);
        }

        if (this.state.ball.y + this.BALL_RADIUS > this.ctx.canvas.height) {
            this.state.balls--;
            if (this.state.balls <= 0) {
                this.state.gameOver = true;
                this.game.endMinigame("You lost Breakout!");
            } else {
                this.resetBall();
            }
        }
    }

    update() {
        if (this.state.isPlaying && !this.state.gameOver) {
            this.state.ball.x += this.state.ball.dx;
            this.state.ball.y += this.state.ball.dy;
            this.updatePaddle();
            this.checkCollisions();
            this.checkBlockCollisions();
        } else {
            this.updatePaddle();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.state.blocks.forEach(block => {
            if (block.active) {
                this.ctx.fillStyle = '#0F0';
                this.ctx.fillRect(block.x, block.y, block.width, block.height);
            }
        });

        this.ctx.fillStyle = '#0F0';
        this.ctx.fillRect(this.state.paddle.x, this.state.paddle.y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);

        this.ctx.beginPath();
        this.ctx.arc(this.state.ball.x, this.state.ball.y, this.BALL_RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }

    setupInputHandlers() {
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    handleKeydown(event) {
        if (this.game.currentMinigameType !== "breakout") return;
        if (event.key === 'ArrowLeft' || event.key === 'a') this.state.keys.left = true;
        if (event.key === 'ArrowRight' || event.key === 'd') this.state.keys.right = true;
        if (event.key === ' ') this.launchBall();
    }

    handleKeyup(event) {
        if (event.key === 'ArrowLeft' || event.key === 'a') this.state.keys.left = false;
        if (event.key === 'ArrowRight' || event.key === 'd') this.state.keys.right = false;
    }

    removeListeners() {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
    }
}

export { BreakoutGame };
