import { GameEngine } from "./gameEngine.js";
import { Terminal } from "./terminal.js";
import { handleCommand, resetGameState } from "./commandHandler.js";

// Get the canvas from index.html
const canvas = document.getElementById("terminalCanvas");
if (!canvas) {
    console.error("❌ ERROR: <canvas id='terminalCanvas'> is missing in index.html!");
}

const ctx = canvas.getContext("2d");

// Create game engine
const gameEngine = new GameEngine({ debugging: true });
gameEngine.init(ctx);

// Add terminal entity
// console.log("making terminal from main.js");
// const terminal = new Terminal(gameEngine);
// gameEngine.addEntity(terminal);

// Start the game loop
gameEngine.start();

console.log("✅ main.js is running");