// Game State Variables
let totalDistance = 200; // Total distance required to reach the destination
let distanceLeft = totalDistance; // Remaining distance
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
    "blasteroid": 100,
    "chess": 100,
    "riddle": 100
};

// Command Processing
function handleCommand(command) {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand === "help") {
        return "Commands: PURPOSE, TRAVEL [route], LIST, STATUS, CLEAR, HELP, EXIT, RESTART";
    } else if (lowerCommand === "list") {
        return Object.keys(routes).length > 0
            ? "Available routes: " + Object.keys(routes).join(", ")
            : "No more routes available.";
    } else if (lowerCommand === "status") {
        return `Health: ${shipHealth} | Distance Left: ${distanceLeft}`;
    } else if (lowerCommand === "breakout") {
        return ["Starting breakout minigame...", "start_breakout"];
    } else if (lowerCommand === "asteroid") {
        return ["Starting asteroid minigame...", "start_asteroid"];
    } else if (lowerCommand === "typing") {
        return ["Starting typing minigame...", "start_typing"];
    } else if (lowerCommand === "blasteroid") {
        return ["Starting blasteroid minigame...", "start_blasteroid"];
    } else if (lowerCommand === "purpose") {
        return "AAAAGGGGHHHH";
    } else if (lowerCommand === "chess") {
        return ["Starting chess minigame...", "start_chess"];
    } else if (lowerCommand === "riddle") {
        return ["Starting riddle minigame...", "start_riddle"];
    } else if (lowerCommand.startsWith("travel ")) {
        let route = command.split(" ")[1];
        if (routes[route]) {
            currentRoute = route; // Store the selected route
            return [`Traveled via ${route}. Starting minigame...`, "start_minigame"];
        } else {
            return "Unknown route. Type 'LIST' to see available routes.";
        }
    } else if (lowerCommand === "clear") {
        return "clear_screen";
    } else if (lowerCommand === "exit") {
        return "exit_terminal";
    } else if (lowerCommand === "restart") {
        resetGameState();
        return "Game has been restarted.";
    } else {
        // For unknown commands, return an empty string.
        return "";
    }
}

// Reset Game State
function resetGameState() {
    shipHealth = 3;
    distanceLeft = totalDistance;
    hasStartedJourney = false;
    currentRoute = null;
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

export { handleCommand, resetGameState };
