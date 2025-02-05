const canvas = document.getElementById("terminalCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;
ctx.font = "16px monospace";
ctx.fillStyle = "rgb(0, 255, 0)";
ctx.textBaseline = "top";

let input = "";
let history = [];
const maxLines = 20;
let showCursor = true;
let scanlineY = 0;
let gameState = "idle";
let minigameResult = "";
let commandHistory = [];
let commandIndex = -1;
let cursorPosition = 0;

// Create the flicker effect overlay
const flickerEffect = document.createElement("div");
flickerEffect.classList.add("flicker");
document.body.appendChild(flickerEffect);

// Cursor blinking
setInterval(() => {
    if (gameState === "terminal") {
        showCursor = !showCursor;
        drawScreen();
    }
}, 500);

// Scanline animation (moves downward slowly)
setInterval(() => {
    scanlineY += 2;
    if (scanlineY > canvas.height) scanlineY = 0;
    drawScreen();
}, 50);

// Handle keyboard input
document.addEventListener("keydown", (event) => {
    if (gameState === "idle" && event.key === "t") {
        gameState = "terminal"; // Enter terminal mode
    } 
    
    else if (gameState === "terminal") {
        if (event.key === "Enter") {
            if (input.trim() !== "") {
                commandHistory.push(input); // Save command to history
                commandIndex = commandHistory.length; // Reset index
            }
            processCommand(input);
            input = ""; // Clear input after execution
            cursorPosition = 0; // Reset cursor
        } 
        
        else if (event.key === "Backspace") {
            if (cursorPosition > 0) {
                input = input.slice(0, cursorPosition - 1) + input.slice(cursorPosition);
                cursorPosition--; // Move cursor back
            }
        } 
        
        else if (event.key.length === 1) {
            input = input.slice(0, cursorPosition) + event.key + input.slice(cursorPosition);
            cursorPosition++; // Move cursor forward after typing
        } 
        
        else if (event.key === "ArrowUp") {  // Navigate up (older commands)
            if (commandIndex > 0) {
                commandIndex--;
                input = commandHistory[commandIndex];
                cursorPosition = input.length; // Move cursor to end of command
            }
        } 
        
        else if (event.key === "ArrowDown") { // Navigate down (newer commands)
            if (commandIndex < commandHistory.length - 1) {
                commandIndex++;
                input = commandHistory[commandIndex];
                cursorPosition = input.length; // Move cursor to end of command
            } else {
                commandIndex = commandHistory.length;
                input = ""; // Clear input if at the newest position
                cursorPosition = 0;
            }
        } 
        
        else if (event.key === "ArrowLeft") { // Move cursor left
            if (cursorPosition > 0) {
                cursorPosition--;
            }
        } 
        
        else if (event.key === "ArrowRight") { // Move cursor right
            if (cursorPosition < input.length) {
                cursorPosition++;
            }
        }
    }

    drawScreen(); // Redraw terminal after input
});

// Handle terminal input
function handleTerminalInput(event) {
    if (event.key === "Enter") {
        processCommand(input);
        input = "";
    } else if (event.key === "Backspace") {
        input = input.slice(0, -1);
    } else if (event.key.length === 1) {
        input += event.key;
    }
}

// Process commands
function processCommand(command) {
    if (command.toLowerCase() !== "clear") {
        history.push("> " + command);
    }

    let response = handleCommand(command);
    
    if (Array.isArray(response)) {
        let [message, state] = response;
        history.push(message);

        if (state === "game_win") {
            gameState = "game_win";
        } else if (state === "start_minigame") {
            gameState = "minigame";
        }
    } else {
        if (command.toLowerCase() !== "clear") {  // Prevent pushing empty responses after clear
            history.push(response);
        }
    }

    if (history.length > maxLines) history.shift();
}

// Draw different states
function drawScreen() {
    ctx.fillStyle = "black"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "rgb(0, 255, 0)";

    if (gameState === "idle") {
        drawIdleScreen();
    } else if (gameState === "terminal") {
        drawTerminal();
    } else if (gameState === "minigame") {
        drawMinigameScreen();
    } else if (gameState === "game_win") {
        drawGameWinScreen();
    } else if (gameState === "game_over") {
        drawGameOverScreen();
    }

    drawScanline();
}

// Draw idle state (outside terminal)
function drawIdleScreen() {
    ctx.fillStyle = "rgb(0, 255, 0)"; 
    ctx.fillText("Press 'T' to access terminal", 300, 300);
}

// Draw the terminal UI
function drawTerminal() {
    ctx.fillStyle = "rgb(0, 255, 0)";
    let padding = 10;
    let maxWidth = canvas.width - (padding * 2);
    let y = 20;

    if (history.length > 0) {
        for (let line of history) {
            let wrappedLines = wrapText(line, maxWidth, ctx.font);
            for (let wrappedLine of wrappedLines) {
                ctx.fillText(wrappedLine, padding, y);
                y += 20;
            }
        }
    }

    // Always reset cursor to the top when history is cleared
    if (history.length === 0) {
        y = 20;
    }

    let cursor = showCursor ? "_" : " ";
    ctx.fillText("> " + input + cursor, padding, y);
}


function wrapText(text, maxWidth, font) {
    let words = text.split(" ");
    let lines = [];
    let line = "";

    for (let word of words) {
        let testLine = line + word + " ";
        let testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && line.length > 0) {
            lines.push(line);
            line = word + " "; // Start new line
        } else {
            line = testLine;
        }
    }

    lines.push(line.trim()); // Add last line
    return lines;
}

// Draw minigame state
function drawMinigameScreen() {
    ctx.fillStyle = "rgb(0, 255, 0)"; 
    ctx.fillText("Minigame Started!", 320, 250);
    ctx.fillText("Press 'C' to Complete or 'F' to Fail", 250, 300);
}

// Draw the scanline effect
function drawScanline() {
    ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
    ctx.fillRect(0, scanlineY, canvas.width, 2);
    ctx.fillStyle = "rgb(0, 255, 0)";
}

// Handle minigame keypress
document.addEventListener("keydown", (event) => {
    if (gameState === "minigame") {
        if (event.key === "c") { // Success
            if (currentRoute && routes[currentRoute]) {
                let reward = routes[currentRoute]; // Get the distance reward
                distanceLeft -= reward; // Deduct distance

                delete routes[currentRoute]; // Remove route from the list
                currentRoute = null; // Clear the selected route

                if (distanceLeft <= 0) {
                    minigameResult = `Mission successful! You've arrived at your destination!`;
                    gameState = "game_win"; // Transition to win screen
                } else {
                    minigameResult = `Success! -${reward} distance. Remaining: ${distanceLeft}`;
                    gameState = "terminal";
                }
                history.push(minigameResult);
            }
        } 
        
        else if (event.key === "f") { // Failure
            shipHealth -= 1;
            delete routes[currentRoute]; // Remove route from the list
            if (shipHealth <= 0) {
                minigameResult = `Mission failed... Ship destroyed. GAME OVER.`;
                gameState = "game_over"; // Transition to game over screen
            } else {
                minigameResult = `Mission failed... -1 Health. Remaining: ${shipHealth}`;
                gameState = "terminal";
            }
            history.push(minigameResult);
        }
        
        drawScreen();
    }
});


function drawGameWinScreen() {
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.font = "24px monospace";
    ctx.fillText("Game Win!", canvas.width / 2 - 50, canvas.height / 2 - 40);
    ctx.font = "16px monospace";
    ctx.fillText("Press 'R' to Restart", canvas.width / 2 - 80, canvas.height / 2);

    document.addEventListener("keydown", restartGame);
}

function drawGameOverScreen() {
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.font = "24px monospace";
    ctx.fillText("GAME OVER", canvas.width / 2 - 60, canvas.height / 2 - 40);
    ctx.font = "16px monospace";
    ctx.fillText("Press 'R' to Restart", canvas.width / 2 - 80, canvas.height / 2);

    document.addEventListener("keydown", restartGame);
}

function restartGame(event) {
    if (event.key === "r") {
        resetGameState();
        document.removeEventListener("keydown", restartGame); // Remove listener to prevent duplicates
    }
}


// Initial draw
drawScreen();
