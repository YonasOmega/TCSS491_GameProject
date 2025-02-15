// Canvas setup
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);

// Game constants
const BLOCK_ROWS = 2;
const BLOCK_COLS = 9;
const BLOCK_WIDTH = 60;
const BLOCK_HEIGHT = 20;
const BLOCK_PADDING = 10;
const BALL_RADIUS = 8;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_SPEED = 8;
const INITIAL_BALL_SPEED = 5;
const SPEED_INCREMENT = 0.2;

// Game state
const gameState = {
    score: 0,
    balls: 10,
    multiplier: 1,
    bonusActive: false,
    isPlaying: false,
    gameOver: false,
    blocks: [],
    paddle: {
        x: canvas.width / 2 - PADDLE_WIDTH / 2,
        y: canvas.height - 40
    },
    ball: {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        speed: INITIAL_BALL_SPEED,
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

// Initialize blocks
function initializeBlocks() {
    gameState.blocks = [];
    const startX = (canvas.width - (BLOCK_COLS * (BLOCK_WIDTH + BLOCK_PADDING))) / 2;
    const startY = 100;

    for (let row = 0; row < BLOCK_ROWS; row++) {
        for (let col = 0; col < BLOCK_COLS; col++) {
            gameState.blocks.push({
                x: startX + col * (BLOCK_WIDTH + BLOCK_PADDING),
                y: startY + row * (BLOCK_HEIGHT + BLOCK_PADDING),
                width: BLOCK_WIDTH,
                height: BLOCK_HEIGHT,
                active: true
            });
        }
    }
}

// Reset ball position
function resetBall() {
    gameState.ball.x = gameState.paddle.x + PADDLE_WIDTH / 2;
    gameState.ball.y = gameState.paddle.y - BALL_RADIUS;
    gameState.ball.dx = 0;
    gameState.ball.dy = 0;
    gameState.isPlaying = false;
}

// Launch ball
function launchBall() {
    if (!gameState.isPlaying) {
        gameState.ball.dx = gameState.ball.speed * Math.cos(gameState.ball.angle);
        gameState.ball.dy = gameState.ball.speed * Math.sin(gameState.ball.angle);
        gameState.isPlaying = true;
    }
}

// Update paddle position
function updatePaddle() {
    if (gameState.keys.left && gameState.paddle.x > 0) {
        gameState.paddle.x -= PADDLE_SPEED;
    }
    if (gameState.keys.right && gameState.paddle.x < canvas.width - PADDLE_WIDTH) {
        gameState.paddle.x += PADDLE_SPEED;
    }

    // Update ball position if not launched
    if (!gameState.isPlaying) {
        gameState.ball.x = gameState.paddle.x + PADDLE_WIDTH / 2;
        gameState.ball.y = gameState.paddle.y - BALL_RADIUS;
    }
}

// Ball aiming logic
function updateBallAim() {
    if (!gameState.isPlaying) {
        if (gameState.keys.minus) {
            gameState.ball.angle = Math.max(gameState.ball.angle - 0.05, -Math.PI * 0.8);
        }
        if (gameState.keys.equals) {
            gameState.ball.angle = Math.min(gameState.ball.angle + 0.05, -Math.PI * 0.2);
        }
    }
}

// Block collision detection
function checkBlockCollisions() {
    for (let block of gameState.blocks) {
        if (!block.active) continue;

        const blockCenterX = block.x + block.width / 2;
        const blockCenterY = block.y + block.height / 2;

        // Calculate collision point
        const closest = {
            x: Math.max(block.x, Math.min(gameState.ball.x, block.x + block.width)),
            y: Math.max(block.y, Math.min(gameState.ball.y, block.y + block.height))
        };

        const distance = Math.hypot(
            gameState.ball.x - closest.x,
            gameState.ball.y - closest.y
        );

        if (distance < BALL_RADIUS) {
            block.active = false;
            gameState.score += 100 * gameState.multiplier;
            gameState.ball.speed += SPEED_INCREMENT;

            // Determine bounce direction
            if (closest.x === block.x || closest.x === block.x + block.width) {
                gameState.ball.dx *= -1;
            }
            if (closest.y === block.y || closest.y === block.y + block.height) {
                gameState.ball.dy *= -1;
            }
        }
    }
}

// Wall and paddle collision checks
function checkCollisions() {
    // Wall collisions
    if (gameState.ball.x - BALL_RADIUS <= 0 ||
        gameState.ball.x + BALL_RADIUS >= canvas.width) {
        gameState.ball.dx *= -1;
    }
    if (gameState.ball.y - BALL_RADIUS <= 0) {
        gameState.ball.dy *= -1;
    }

    // Paddle collision
    if (gameState.ball.y + BALL_RADIUS >= gameState.paddle.y &&
        gameState.ball.y - BALL_RADIUS <= gameState.paddle.y + PADDLE_HEIGHT &&
        gameState.ball.x >= gameState.paddle.x &&
        gameState.ball.x <= gameState.paddle.x + PADDLE_WIDTH) {

        // Calculate reflection angle based on where ball hits paddle
        const hitPosition = (gameState.ball.x - gameState.paddle.x) / PADDLE_WIDTH;
        const angle = -Math.PI/2 + (hitPosition - 0.5) * Math.PI * 0.7;

        gameState.ball.dx = gameState.ball.speed * Math.cos(angle);
        gameState.ball.dy = gameState.ball.speed * Math.sin(angle);
    }

    // Ball out of bounds
    if (gameState.ball.y + BALL_RADIUS > canvas.height) {
        gameState.balls--;
        if (gameState.balls <= 0) {
            gameState.gameOver = true;
        } else {
            resetBall();
        }
    }
}

// Drawing functions
function drawBlocks() {
    for (let block of gameState.blocks) {
        if (block.active) {
            ctx.beginPath();
            ctx.arc(
                block.x + block.width / 2,
                block.y + block.height / 2,
                5,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = '#0F0';
            ctx.fill();
            ctx.closePath();
        }
    }
}

function drawPaddle() {
    ctx.fillStyle = '#0F0';
    ctx.fillRect(
        gameState.paddle.x,
        gameState.paddle.y,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
    );
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(
        gameState.ball.x,
        gameState.ball.y,
        BALL_RADIUS,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = '#0F0';
    ctx.fill();
    ctx.closePath();

    // Draw aim line when not playing
    if (!gameState.isPlaying) {
        ctx.beginPath();
        ctx.moveTo(gameState.ball.x, gameState.ball.y);
        ctx.lineTo(
            gameState.ball.x + Math.cos(gameState.ball.angle) * 50,
            gameState.ball.y + Math.sin(gameState.ball.angle) * 50
        );
        ctx.strokeStyle = '#0F0';
        ctx.stroke();
        ctx.closePath();
    }
}

function drawUI() {
    ctx.fillStyle = '#0F0';
    ctx.font = '20px monospace';

    // Score
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${gameState.score.toString().padStart(6, '0')}`, canvas.width - 20, 30);

    // Balls
    ctx.textAlign = 'left';
    ctx.fillText(`BALLS: ${gameState.balls}`, 20, 30);

    // Multiplier
    ctx.fillText(`MULTIPLIER: x${gameState.multiplier}`, 20, 60);

    // Bonus status
    ctx.fillText(`BONUS ${gameState.bonusActive ? 'ACTIVE' : 'INACTIVE'}`, 20, 90);

    // Controls
    ctx.textAlign = 'right';
    ctx.fillText('[SPACE] LAUNCH', canvas.width - 20, canvas.height - 80);
    ctx.fillText('[-][=] AIM', canvas.width - 20, canvas.height - 50);
    ctx.fillText('[TAB] STATS', canvas.width - 20, canvas.height - 20);
}

function drawBorder() {
    ctx.strokeStyle = '#0F0';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Game loop functions
function updateGame() {
    if (gameState.isPlaying && !gameState.gameOver) {
        // Update ball position
        gameState.ball.x += gameState.ball.dx;
        gameState.ball.y += gameState.ball.dy;

        updatePaddle();
        checkCollisions();
        checkBlockCollisions();
    } else {
        updatePaddle();
        updateBallAim();
    }
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#030';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBorder();
    drawBlocks();
    drawPaddle();
    drawBall();
    drawUI();

    if (gameState.gameOver) {
        ctx.fillStyle = '#0F0';
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Input handling
document.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
            gameState.keys.left = true;
            break;
        case 'arrowright':
        case 'd':
            gameState.keys.right = true;
            break;
        case ' ':
            event.preventDefault(); // Prevent space from scrolling
            gameState.keys.space = true;
            launchBall();
            break;
        case '-':
            gameState.keys.minus = true;
            break;
        case '=':
            gameState.keys.equals = true;
            break;
        case 'tab':
            event.preventDefault();
            gameState.keys.tab = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
            gameState.keys.left = false;
            break;
        case 'arrowright':
        case 'd':
            gameState.keys.right = false;
            break;
        case ' ':
            gameState.keys.space = false;
            break;
        case '-':
            gameState.keys.minus = false;
            break;
        case '=':
            gameState.keys.equals = false;
            break;
        case 'tab':
            gameState.keys.tab = false;
            break;
    }
});

// Initialize and start game
function startGame() {
    initializeBlocks();
    resetBall();
    gameState.score = 0;
    gameState.balls = 10;
    gameState.multiplier = 1;
    gameState.bonusActive = false;
    gameState.gameOver = false;
    gameLoop();
}

// Start the game
startGame();