// asteroid.js

// ===== Global World and Game Objects =====

// Define a destination point in the world (you can adjust these values)
const destination = {
    x: 2000,
    y: 1500
  };
  
  // The player's ship object with physics properties
  const ship = {
    pos: { x: 0, y: 0 },         // World position (starts at 0,0)
    vel: { x: 0, y: 0 },         // Velocity vector
    angle: 0,                   // Facing angle in radians (0 = to the right)
    rotationSpeed: 0.05,        // Radians per frame when turning
    acceleration: 0.2,          // Thrust applied when accelerating
    brakeFactor: 0.1,           // Deceleration factor when braking
    maxSpeed: 8,                // Maximum speed for the ship
    radius: 10                  // For collision purposes (rough approximation)
  };
  
  // Array to hold all asteroids
  const asteroids = [];
  const asteroidSpawnInterval = 60; // Frames between new asteroid spawns
  let asteroidSpawnTimer = 0;
  
  // Key state tracker (for continuous input)
  const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false, // Thrust
    b: false,     // Brake
    a: false,     // Alternate for left turn
    d: false,     // Alternate for right turn
    w: false      // Alternate for thrust
  };
  
  // ===== Initialization & Start =====
  
  // Call this to start the asteroid minigame
  function startAsteroidGame() {
    // Reset ship state
    ship.pos.x = 0;
    ship.pos.y = 0;
    ship.vel.x = 0;
    ship.vel.y = 0;
    ship.angle = 0;
    
    // Clear existing asteroids and reset spawn timer
    asteroids.length = 0;
    asteroidSpawnTimer = 0;
    
    // (Optional) Spawn a few initial asteroids
    for (let i = 0; i < 10; i++) {
      spawnAsteroid();
    }
    
    // Switch game state (a global from terminal.js) to asteroid mode
    gameState = "asteroids";
    
    // Start the update loop
    requestAnimationFrame(updateAsteroidGame);
  }
  
  // ===== Asteroid Spawning & Properties =====
  
  function spawnAsteroid() {
    // Spawn an asteroid near the ship (with some random offset)
    let asteroid = {
      pos: {
        x: ship.pos.x + (Math.random() - 0.5) * 800,
        y: ship.pos.y + (Math.random() - 0.5) * 800
      },
      vel: {
        x: (Math.random() - 0.5) * 4, // Random initial velocity
        y: (Math.random() - 0.5) * 4
      },
      // Radius between 10 and 40
      radius: 10 + Math.random() * 30,
      maxSpeed: 5  // Maximum speed for asteroids
    };
    // Mass is proportional to the area (radius squared)
    asteroid.mass = asteroid.radius * asteroid.radius;
    asteroids.push(asteroid);
  }
  
  // ===== Main Update Loop =====
  
  function updateAsteroidGame() {
    if (gameState !== "asteroids") return; // Stop if no longer in asteroid mode
    
    // --- Ship Controls and Physics ---
    // Smooth continuous rotation
    if (keys.ArrowLeft || keys.a) {
      ship.angle -= ship.rotationSpeed;
    }
    if (keys.ArrowRight || keys.d) {
      ship.angle += ship.rotationSpeed;
    }
    
    // Thrust: accelerate in the direction the ship is pointing
    if (keys.Space || keys.w) {
      ship.vel.x += ship.acceleration * Math.cos(ship.angle);
      ship.vel.y += ship.acceleration * Math.sin(ship.angle);
    }
    
    // Brake: decelerate (apply braking force opposite to current velocity)
    if (keys.b) {
      ship.vel.x *= (1 - ship.brakeFactor);
      ship.vel.y *= (1 - ship.brakeFactor);
    }
    
    // Clamp ship speed to maximum
    let shipSpeed = Math.hypot(ship.vel.x, ship.vel.y);
    if (shipSpeed > ship.maxSpeed) {
      ship.vel.x = (ship.vel.x / shipSpeed) * ship.maxSpeed;
      ship.vel.y = (ship.vel.y / shipSpeed) * ship.maxSpeed;
    }
    
    // Update ship position
    ship.pos.x += ship.vel.x;
    ship.pos.y += ship.vel.y;
    
    // --- Asteroid Updates ---
    asteroidSpawnTimer++;
    if (asteroidSpawnTimer >= asteroidSpawnInterval) {
      spawnAsteroid();
      asteroidSpawnTimer = 0;
    }
    
    // Update each asteroid's position and clamp its speed
    for (let i = 0; i < asteroids.length; i++) {
      let ast = asteroids[i];
      ast.pos.x += ast.vel.x;
      ast.pos.y += ast.vel.y;
      
      // Clamp asteroid speed
      let aSpeed = Math.hypot(ast.vel.x, ast.vel.y);
      if (aSpeed > ast.maxSpeed) {
        ast.vel.x = (ast.vel.x / aSpeed) * ast.maxSpeed;
        ast.vel.y = (ast.vel.y / aSpeed) * ast.maxSpeed;
      }
      
      // Check collisions with other asteroids (elastic collisions)
      for (let j = i + 1; j < asteroids.length; j++) {
        let other = asteroids[j];
        let dx = other.pos.x - ast.pos.x;
        let dy = other.pos.y - ast.pos.y;
        let dist = Math.hypot(dx, dy);
        if (dist < ast.radius + other.radius) {
          resolveCollision(ast, other);
        }
      }
    }
    
    // --- Collision Check: Ship vs. Asteroids ---
    for (let ast of asteroids) {
      let dx = ast.pos.x - ship.pos.x;
      let dy = ast.pos.y - ship.pos.y;
      let dist = Math.hypot(dx, dy);
      if (dist < ast.radius + ship.radius) {
        gameState = "game_over";
        history.push("You crashed into an asteroid!");
      }
    }
    
    // --- Check for Victory ---
    let dxd = destination.x - ship.pos.x;
    let dyd = destination.y - ship.pos.y;
    if (Math.hypot(dxd, dyd) < 30) { // within 30 units of destination
      gameState = "game_win";
      history.push("You reached your destination!");
    }
    
    // --- Render the World ---
    drawAsteroidGameScreen();
    
    // Schedule next update
    requestAnimationFrame(updateAsteroidGame);
  }
  
  // ===== Elastic Collision Resolution =====
  
  function resolveCollision(a, b) {
    // Vector from a to b
    let dx = b.pos.x - a.pos.x;
    let dy = b.pos.y - a.pos.y;
    let distance = Math.hypot(dx, dy);
    if (distance === 0) return; // Avoid division by zero
    
    // Normal vector
    let nx = dx / distance;
    let ny = dy / distance;
    
    // Relative velocity along the normal
    let vx = a.vel.x - b.vel.x;
    let vy = a.vel.y - b.vel.y;
    let p = 2 * (vx * nx + vy * ny) / (a.mass + b.mass);
    
    // Update velocities (elastic collision equations)
    a.vel.x -= p * b.mass * nx;
    a.vel.y -= p * b.mass * ny;
    b.vel.x += p * a.mass * nx;
    b.vel.y += p * a.mass * ny;
    
    // Separate the overlapping asteroids slightly
    let overlap = (a.radius + b.radius - distance) / 2;
    a.pos.x -= overlap * nx;
    a.pos.y -= overlap * ny;
    b.pos.x += overlap * nx;
    b.pos.y += overlap * ny;
  }
  
  // ===== Rendering: Camera and Drawing =====
  
  function drawAsteroidGameScreen() {
    // Clear the canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // The camera is centered on the ship.
    // Calculate camera offset (world coordinates of the top-left of the canvas)
    let cameraX = ship.pos.x - canvas.width / 2;
    let cameraY = ship.pos.y - canvas.height / 2;
    
    // Draw the destination arrow
    drawDestinationArrow(cameraX, cameraY);
    
    // Draw the ship at the center of the canvas
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(ship.angle);
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.beginPath();
    // Draw a triangle with the point facing right (the ship's forward direction)
    ctx.moveTo(20, 0);  
    ctx.lineTo(-10, 10);
    ctx.lineTo(-10, -10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Draw all asteroids in world space relative to the camera
    for (let ast of asteroids) {
      let screenX = ast.pos.x - cameraX;
      let screenY = ast.pos.y - cameraY;
      ctx.beginPath();
      ctx.arc(screenX, screenY, ast.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgb(200,200,200)";
      ctx.fill();
    }
  }
  
  // Draw an arrow from the ship (center of canvas) to the destination
  function drawDestinationArrow(cameraX, cameraY) {
    // Convert destination to screen coordinates
    let destScreenX = destination.x - cameraX;
    let destScreenY = destination.y - cameraY;
    
    // Ship is always at the center of the canvas
    let shipScreenX = canvas.width / 2;
    let shipScreenY = canvas.height / 2;
    
    // Draw the line
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(shipScreenX, shipScreenY);
    ctx.lineTo(destScreenX, destScreenY);
    ctx.stroke();
    
    // Optionally, draw an arrowhead at the destination end
    const angle = Math.atan2(destScreenY - shipScreenY, destScreenX - shipScreenX);
    const headLength = 10;
    ctx.beginPath();
    ctx.moveTo(destScreenX, destScreenY);
    ctx.lineTo(destScreenX - headLength * Math.cos(angle - Math.PI / 6), 
               destScreenY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(destScreenX, destScreenY);
    ctx.lineTo(destScreenX - headLength * Math.cos(angle + Math.PI / 6), 
               destScreenY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }
  
  // ===== Input Handling =====
  
  // Set key state on keydown
  document.addEventListener("keydown", (event) => {
    if (gameState === "asteroids") {
      keys[event.key] = true;
    }
  });
  
  // Clear key state on keyup
  document.addEventListener("keyup", (event) => {
    if (gameState === "asteroids") {
      keys[event.key] = false;
    }
  });
  