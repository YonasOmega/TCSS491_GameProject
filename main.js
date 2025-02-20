const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

gameEngine.score = 0;

gameEngine.createTarget = function() {
	const x = randomInt(1024 - 2 * 15) + 15; // Ensure target is fully within canvas
	const y = randomInt(768 - 2 * 15) + 15;
	const target = new Target(this, x, y);
	this.addEntity(target);
};

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	gameEngine.init(ctx);
	gameEngine.start();

	for (let i = 0; i < 5; i++) {
		gameEngine.createTarget();
	}

	const scoreDisplay = document.createElement('div');
	scoreDisplay.id = 'score';
	scoreDisplay.textContent = 'Score: 0';
	document.body.insertBefore(scoreDisplay, canvas);

	// Override the update function
	gameEngine.update = function() {
		GameEngine.prototype.update.call(this); // Call original update
		scoreDisplay.textContent = 'Score: ' + this.score;
	};
});