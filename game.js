let destinations = {
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
let distanceLeft = 200;
let currentDestination = "";
let hasStartedJourney = false;

// Command Processing
function handleCommand(command) {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand === "help") {
        return "Commands: TRAVEL [destination], LIST, STATUS, CLEAR, HELP, EXIT";
    } 
    
    else if (lowerCommand === "list") {
        return Object.keys(destinations).length > 0
            ? "Available destinations: " + Object.keys(destinations).join(", ")
            : "No more destinations available.";
    } 
    
    else if (lowerCommand === "status") {
        return `Health: ${shipHealth} | Distance Left: ${distanceLeft}`;
    } 
    
    else if (lowerCommand.startsWith("travel ")) {
        let destination = command.split(" ")[1];

        if (destinations[destination]) {
            if (currentDestination === destination && hasStartedJourney) {
                return `Already traveling to ${destination}. Distance left: ${distanceLeft}`;
            }
            
            currentDestination = destination;
            if (!hasStartedJourney) {
                distanceLeft = destinations[destination]; // Set distance only if starting fresh
                hasStartedJourney = true;
            }
            
            return `Plotting course to ${destination}... Distance: ${distanceLeft}`, "start_minigame";
        } else {
            return "Unknown destination. Type 'LIST' to see options.";
        }
    } 
    
    else if (lowerCommand === "clear") {
        history.length = 0;
        return "";
    } 
    
    else if (lowerCommand === "exit") {
        return "exit_terminal";
    } 
    
    else {
        return "Unknown command. Type 'HELP' for options.";
    }
}
