// Game State Variables
let totalDistance = 200; // The total distance required to reach the destination
let distanceLeft = totalDistance; // Tracks the remaining distance
let shipHealth = 3;
let hasStartedJourney = false;
let currentRoute = null;

let routes = {
    "5-Distance": 5,
    "10-Distance": 10,
    "20-Distance": 20,
    "30-Distance": 30,
    "50-Distance": 50,
    "75-Distance": 75,
    "100-Distance": 100,
    "150-Distance": 150,
    "200-Distance": 200,
    "asteroid": 100,
    "typing": 100,
    "breakout": 100,
    "blasteroid": 100
};

// Command Processing
function handleCommand(command) {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand === "help") {
        return "Commands: TRAVEL [route], LIST, STATUS, CLEAR, HELP, EXIT, RESTART";
    } 
    
    else if (lowerCommand === "list") {
        return Object.keys(routes).length > 0
            ? "Available routes: " + Object.keys(routes).join(", ")
            : "No more routes available.";
    } 
    
    else if (lowerCommand === "status") {
        return `Health: ${shipHealth} | Distance Left: ${distanceLeft}`;
    }
    else if (lowerCommand === "breakout") {
        return ["Starting breakout minigame...", "start_breakout"];

    }

    else if (lowerCommand === "asteroid") {
        return ["Starting asteroid minigame...", "start_asteroid"];
    }

    else if (lowerCommand === "typing") {
        return ["Starting typing minigame...", "start_typing"];
    }

    else if (lowerCommand === "blasteroid") {
        return ["Starting blasteroid minigame...", "start_blasteroid"]
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
        return "clear_screen"; // Flag for Terminal to clear history
    }
    
    else if (lowerCommand === "exit") {
        return "exit_terminal"; // Flag for Terminal to exit
    } 
    
    else if (lowerCommand === "restart") {
        resetGameState();
        return "Game has been restarted.";
    }
    
    else {
        return "Unknown command. Type 'HELP' for options.";
    }
}

// Reset Game State (Now Exported)
function resetGameState() {
    shipHealth = 3;
    distanceLeft = totalDistance;
    hasStartedJourney = false;
    currentRoute = null;

    // Reset routes
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

// Exports for ES Modules
export { handleCommand, resetGameState };
