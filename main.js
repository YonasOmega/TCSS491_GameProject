const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(() => {
	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	gameEngine.init(ctx);

	// Add our typing game
	const typingGame = new TypingGame(gameEngine);
	gameEngine.addEntity(typingGame);

	gameEngine.start();
});