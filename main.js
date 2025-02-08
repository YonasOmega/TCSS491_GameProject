const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

// Game state initialization
gameEngine.score = 0;
gameEngine.lives = 3;
gameEngine.gameOver = false;
gameEngine.gameStarted = false;

// Spawn control
let lastSpawnTime = 0;
const SPAWN_INTERVAL = 765; // (adjust this value to change timing)

gameEngine.createTarget = function() {
	if (this.gameOver || !this.gameStarted) return;

	const x = randomInt(1024 - 2 * 30) + 30;
	const y = randomInt(768 - 2 * 30) + 30;
	const target = new Target(this, x, y);
	this.addEntity(target);
};

ASSET_MANAGER.queueDownload("./comet.png");
ASSET_MANAGER.queueDownload("./explosion.gif");

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);
	gameEngine.start();

	// Create UI container
	const uiContainer = document.createElement('div');
	uiContainer.style.position = 'absolute';
	uiContainer.style.top = '10px';
	uiContainer.style.left = '10px';
	uiContainer.style.display = 'flex';
	uiContainer.style.flexDirection = 'column';
	uiContainer.style.gap = '10px';
	document.body.insertBefore(uiContainer, canvas);

	// Create stats display
	const statsDisplay = document.createElement('div');
	statsDisplay.id = 'stats';
	statsDisplay.style.color = 'white';
	statsDisplay.style.fontSize = '24px';
	statsDisplay.style.fontFamily = 'Arial, sans-serif';
	uiContainer.appendChild(statsDisplay);

	// Create start button
	const startButton = document.createElement('button');
	startButton.textContent = 'Start Game';
	startButton.style.padding = '10px 20px';
	startButton.style.fontSize = '18px';
	startButton.style.cursor = 'pointer';
	startButton.style.backgroundColor = '#4CAF50';
	startButton.style.color = 'white';
	startButton.style.border = 'none';
	startButton.style.borderRadius = '5px';
	startButton.style.width = 'fit-content';
	uiContainer.appendChild(startButton);

	function startGame() {
		gameEngine.gameStarted = true;
		gameEngine.gameOver = false;
		gameEngine.score = 0;
		gameEngine.lives = 3;
		gameEngine.entities = [];
		lastSpawnTime = Date.now();
		gameEngine.createTarget();
		startButton.textContent = 'Restart Game';
	}

	startButton.onclick = startGame;

	// Update function with fixed spawn timing
	gameEngine.update = function() {
		GameEngine.prototype.update.call(this);

		// Handle target spawning with proper timing
		if (this.gameStarted && !this.gameOver) {
			const currentTime = Date.now();
			if (currentTime - lastSpawnTime >= SPAWN_INTERVAL) {
				this.createTarget();
				lastSpawnTime = currentTime;
			}
		}

		// Update stats display
		const hearts = '❤️'.repeat(this.lives);
		if (this.gameStarted) {
			statsDisplay.textContent = `Score: ${this.score} | Lives: ${hearts}`;
		} else {
			statsDisplay.textContent = 'Click Start Game to begin!';
		}

		// Check for game over
		if (this.lives <= 0 && !this.gameOver) {
			this.gameOver = true;
			this.gameStarted = false;
			setTimeout(() => {
				alert(`Game Over! Final Score: ${this.score}`);
			}, 100);
		}
	};
});