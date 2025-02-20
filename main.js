const ASSET_MANAGER = new AssetManager();

const canvas = document.getElementById("terminalCanvas");
const ctx = canvas.getContext("2d");

// ✅ Create game engine
const gameEngine = new GameEngine({ debugging: true });
gameEngine.init(ctx);

// ✅ Add terminal entity
const terminal = new Terminal(gameEngine);
gameEngine.addEntity(terminal);

// ✅ Start the game loop
gameEngine.start();
