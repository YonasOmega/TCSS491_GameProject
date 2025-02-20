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
            balls: 10,
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
                angle: -Math.PI / 4  // Initial angle for aiming
            },
            keys: {
                left: false,
                right: false,
                space: false,
                minus: false,
                equals: false,
                tab: false
            }
        };

        // Initialize the game
        this.initializeBlocks();
        this.resetBall();

        // Bind event listeners
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

        // Update ball position if not launched
        if (!this.state.isPlaying) {
            this.state.ball.x = this.state.paddle.x + this.PADDLE_WIDTH / 2;
            this.state.ball.y = this.state.paddle.y - this.BALL_RADIUS;
        }
    }

    updateBallAim() {
        if (!this.state.isPlaying) {
            if (this.state.keys.minus) {
                this.state.ball.angle = Math.max(this.state.ball.angle - 0.05, -Math.PI * 0.8);
            }
            if (this.state.keys.equals) {
                this.state.ball.angle = Math.min(this.state.ball.angle + 0.05, -Math.PI * 0.2);
            }
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
        if (this.state.ball.x - this.BALL_RADIUS <= 0 ||
            this.state.ball.x + this.BALL_RADIUS >= this.ctx.canvas.width) {
            this.state.ball.dx *= -1;
        }
        if (this.state.ball.y - this.BALL_RADIUS <= 0) {
            this.state.ball.dy *= -1;
        }

        // Paddle collision
        if (this.state.ball.y + this.BALL_RADIUS >= this.state.paddle.y &&
            this.state.ball.y - this.BALL_RADIUS <= this.state.paddle.y + this.PADDLE_HEIGHT &&
            this.state.ball.x >= this.state.paddle.x &&
            this.state.ball.x <= this.state.paddle.x + this.PADDLE_WIDTH) {

            const hitPosition = (this.state.ball.x - this.state.paddle.x) / this.PADDLE_WIDTH;
            const angle = -Math.PI/2 + (hitPosition - 0.5) * Math.PI * 0.7;

            this.state.ball.dx = this.state.ball.speed * Math.cos(angle);
            this.state.ball.dy = this.state.ball.speed * Math.sin(angle);
        }

        // Ball out of bounds
        if (this.state.ball.y + this.BALL_RADIUS > this.ctx.canvas.height) {
            this.state.balls--;
            if (this.state.balls <= 0) {
                this.state.gameOver = true;
                gameState = "game_over"; // Communicate with terminal
            } else {
                this.resetBall();
            }
        }
    }

    drawBlocks() {
        for (let block of this.state.blocks) {
            if (block.active) {
                this.ctx.beginPath();
                this.ctx.arc(
                    block.x + block.width / 2,
                    block.y + block.height / 2,
                    5,
                    0,
                    Math.PI * 2
                );
                this.ctx.fillStyle = '#0F0';
                this.ctx.fill();
                this.ctx.closePath();
            }
        }
    }

    drawPaddle() {
        this.ctx.fillStyle = '#0F0';
        this.ctx.fillRect(
            this.state.paddle.x,
            this.state.paddle.y,
            this.PADDLE_WIDTH,
            this.PADDLE_HEIGHT
        );
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(
            this.state.ball.x,
            this.state.ball.y,
            this.BALL_RADIUS,
            0,
            Math.PI * 2
        );
        this.ctx.fillStyle = '#0F0';
        this.ctx.fill();
        this.ctx.closePath();

        // Draw aim line when not playing
        if (!this.state.isPlaying) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.state.ball.x, this.state.ball.y);
            this.ctx.lineTo(
                this.state.ball.x + Math.cos(this.state.ball.angle) * 50,
                this.state.ball.y + Math.sin(this.state.ball.angle) * 50
            );
            this.ctx.strokeStyle = '#0F0';
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    drawUI() {
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = '20px monospace';

        // Score
        this.ctx.textAlign = 'right';
        this.ctx.fillText(
            `SCORE: ${this.state.score.toString().padStart(6, '0')}`,
            this.ctx.canvas.width - 20,
            30
        );

        // Balls
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`BALLS: ${this.state.balls}`, 20, 30);

        // Multiplier
        this.ctx.fillText(`MULTIPLIER: x${this.state.multiplier}`, 20, 60);

        // Bonus status
        this.ctx.fillText(
            `BONUS ${this.state.bonusActive ? 'ACTIVE' : 'INACTIVE'}`,
            20,
            90
        );

        // Controls
        this.ctx.textAlign = 'right';
        this.ctx.fillText('[SPACE] LAUNCH', this.ctx.canvas.width - 20, this.ctx.canvas.height - 80);
        this.ctx.fillText('[-][=] AIM', this.ctx.canvas.width - 20, this.ctx.canvas.height - 50);
        this.ctx.fillText('[TAB] STATS', this.ctx.canvas.width - 20, this.ctx.canvas.height - 20);
    }

    drawBorder() {
        this.ctx.strokeStyle = '#0F0';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        if (this.state.isPlaying && !this.state.gameOver) {
            // Update ball position
            this.state.ball.x += this.state.ball.dx;
            this.state.ball.y += this.state.ball.dy;

            this.updatePaddle();
            this.checkCollisions();
            this.checkBlockCollisions();
        } else {
            this.updatePaddle();
            this.updateBallAim();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#030';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.drawBorder();
        this.drawBlocks();
        this.drawPaddle();
        this.drawBall();
        this.drawUI();

        if (this.state.gameOver) {
            this.ctx.fillStyle = '#0F0';
            this.ctx.font = '40px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
        }
    }

    setupInputHandlers() {
        document.addEventListener('keydown', (event) => {
            if (gameState !== "breakout") return;

            switch (event.key.toLowerCase()) {
                case 'arrowleft':
                case 'a':
                    this.state.keys.left = true;
                    break;
                case 'arrowright':
                case 'd':
                    this.state.keys.right = true;
                    break;
                case ' ':
                    event.preventDefault();
                    this.state.keys.space = true;
                    this.launchBall();
                    break;
                case '-':
                    this.state.keys.minus = true;
                    break;
                case '=':
                    this.state.keys.equals = true;
                    break;
                case 'tab':
                    event.preventDefault();
                    this.state.keys.tab = true;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            if (gameState !== "breakout") return;

            switch (event.key.toLowerCase()) {
                case 'arrowleft':
                case 'a':
                    this.state.keys.left = false;
                    break;
                case 'arrowright':
                case 'd':
                    this.state.keys.right = false;
                    break;
                case ' ':
                    this.state.keys.space = false;
                    break;
                case '-':
                    this.state.keys.minus = false;
                    break;
                case '=':
                    this.state.keys.equals = false;
                    break;
                case 'tab':
                    this.state.keys.tab = false;
                    break;
            }
        });
    }
}

// Terminal integration functions
let breakoutGame;

function startBreakoutGame() {
    let game = {
        clockTick: 1 / 60,
        ctx: ctx
    };
    breakoutGame = new BreakoutGame(game);
    gameState = "breakout";
    updateBreakoutGame();
}

function updateBreakoutGame() {
    if (gameState !== "breakout") return;

    breakoutGame.update();
    breakoutGame.draw();

    // Check if all blocks are destroyed
    const remainingBlocks = breakoutGame.state.blocks.filter(block => block.active).length;
    if (remainingBlocks === 0) {
        gameState = "game_win";
        history.push("Successfully completed the breakout challenge!");
        return;
    }

    requestAnimationFrame(updateBreakoutGame);
}

export { BreakoutGame }