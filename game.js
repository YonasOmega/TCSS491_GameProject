let totalDistance = 200; // The total distance required to reach the destination
let distanceLeft = totalDistance; // Tracks the remaining distance

let routes = {
    "5-Distance": 5,
    "10-Distance": 10,
    "20-Distance": 20,
    "30-Distance": 30,
    "50-Distance": 50,
    "75-Distance": 75,
    "100-Distance": 100,
    "150-Distance": 150,
    "200-Distance": 200
};
let shipHealth = 3;
let hasStartedJourney = false;

// Command Processing
function handleCommand(command) {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand === "help") {
        return "Commands: TRAVEL [route], LIST, STATUS, CLEAR, HELP, EXIT";
    } 
    
    else if (lowerCommand === "list") {
        return Object.keys(routes).length > 0
            ? "Available routes: " + Object.keys(routes).join(", ")
            : "No more routes available.";
    } 
    
    else if (lowerCommand === "status") {
        return `Health: ${shipHealth} | Distance Left: ${distanceLeft}`;
    } 
    
    else if (lowerCommand.startsWith("travel ")) {
        let route = command.split(" ")[1];

        if (routes[route]) {
            currentRoute = route; // Store the selected route for minigame
            return [`Traveled via ${route}. Starting minigame...`, "start_minigame"];
        } else {
            return "Unknown route. Type 'LIST' to see available routes.";
        }
    } 
    
    else if (lowerCommand === "clear") {
        history.length = 0; // Clear command history
        input = ""; // Clear input
        cursorPosition = 0; // Reset cursor position
        commandIndex = commandHistory.length; // Reset history index
    
        drawScreen(); // Force redraw
    
        return ""; // Ensure no extra blank entry in history
    }
    
    else if (lowerCommand === "exit") {
        gameState = "idle";
        return "exit_terminal";
    } 
    
    else {
        return "Unknown command. Type 'HELP' for options.";
    }
}


function resetGameState() {
    shipHealth = 3;
    distanceLeft = totalDistance; // Reset the total journey distance
    hasStartedJourney = false;
    gameState = "idle";
    history.length = 0; // Clear terminal history
    commandHistory.length = 0; // Clear command history
    commandIndex = -1; // Reset history index
    input = ""; // Clear current input
    cursorPosition = 0; // Reset cursor position
    drawScreen();

    // Restore all routes
    routes = {
        "5-Distance": 5,
        "10-Distance": 10,
        "20-Distance": 20,
        "30-Distance": 30,
        "50-Distance": 50,
        "75-Distance": 75,
        "100-Distance": 100,
        "150-Distance": 150,
        "200-Distance": 200
    };
}

