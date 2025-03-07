// AsteroidGame class for the minigame system
class AsteroidGame {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;

    // Game state
    this.lives = 3;
    this.gameOver = false;
    this.hasWon = false;

    // World objects
    this.destination = {
      x: 2000,
      y: 1500
    };

    // The player's ship object with physics properties
    this.ship = {
      pos: { x: 0, y: 0 },         // World position (starts at 0,0)
      vel: { x: 0, y: 0 },         // Velocity vector
      angle: 0,                    // Facing angle in radians (0 = to the right)
      rotationSpeed: 0.05,         // Radians per frame when turning
      acceleration: 0.2,           // Thrust applied when accelerating
      brakeFactor: 0.1,            // Deceleration factor when braking
      maxSpeed: 8,                 // Maximum speed for the ship
      radius: 10                   // For collision purposes
    };

    // Array to hold all asteroids
    this.asteroids = [];
    this.asteroidSpawnInterval = 60; // Frames between new asteroid spawns
    this.asteroidSpawnTimer = 0;

    // Visual effects
    this.particles = [];
    this.arrowPulse = 0;
    this.arrowAlpha = 1;
    this.destGlow = 0;

    // UI elements
    this.message = "";
    this.messageTimer = 0;

    // Key state tracker (for continuous input)
    this.keys = {
      ArrowLeft: false,
      ArrowRight: false,
      Space: false, // Thrust
      b: false,     // Brake
      a: false,     // Alternate for left turn
      d: false,     // Alternate for right turn
      w: false      // Alternate for thrust
    };

    // Create initial asteroids
    for (let i = 0; i < 10; i++) {
      this.spawnAsteroid();
    }

    // Bind event handlers to maintain 'this' context
    this.keydownHandler = this.handleKeyDown.bind(this);
    this.keyupHandler = this.handleKeyUp.bind(this);

    // Add event listeners
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);

    // Start the animation loop
    this.lastTimestamp = performance.now();
    this.animate();
  }

  // ===== Event Handlers =====

  handleKeyDown(event) {
    if (this.gameOver || this.hasWon) return;

    // Set the key state to true when pressed
    if (event.key in this.keys) {
      this.keys[event.key] = true;
      event.preventDefault();
    }
  }

  handleKeyUp(event) {
    // Set the key state to false when released
    if (event.key in this.keys) {
      this.keys[event.key] = false;
      event.preventDefault();
    }
  }

  // ===== Asteroid Spawning & Properties =====

  spawnAsteroid() {
    // Spawn an asteroid near the ship (with some random offset)
    let asteroid = {
      pos: {
        x: this.ship.pos.x + (Math.random() - 0.5) * 800,
        y: this.ship.pos.y + (Math.random() - 0.5) * 800
      },
      vel: {
        x: (Math.random() - 0.5) * 4, // Random initial velocity
        y: (Math.random() - 0.5) * 4
      },
      // Radius between 10 and 40
      radius: 10 + Math.random() * 30,
      maxSpeed: 5  // Maximum speed for asteroids
    };

    // Ensure asteroid isn't too close to the ship at spawn
    const dx = asteroid.pos.x - this.ship.pos.x;
    const dy = asteroid.pos.y - this.ship.pos.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 150) {
      // If too close, move it farther away
      asteroid.pos.x = this.ship.pos.x + (dx / distance) * 150;
      asteroid.pos.y = this.ship.pos.y + (dy / distance) * 150;
    }

    // Don't spawn directly at the destination
    const destDx = asteroid.pos.x - this.destination.x;
    const destDy = asteroid.pos.y - this.destination.y;
    const destDist = Math.hypot(destDx, destDy);

    if (destDist < 200) {
      // If too close to destination, adjust position
      asteroid.pos.x = this.destination.x + (destDx / destDist) * 200;
      asteroid.pos.y = this.destination.y + (destDy / destDist) * 200;
    }

    // Mass is proportional to the area (radius squared)
    asteroid.mass = asteroid.radius * asteroid.radius;
    this.asteroids.push(asteroid);
  }

  // ===== Particle Effects =====

  createExplosion(x, y, count = 20, size = 2, speed = 3, duration = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * speed;

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * size + 1,
        color: `rgba(255, ${Math.floor(Math.random() * 200)}, 0, 1)`,
        life: Math.random() * duration
      });
    }
  }

  // ===== Main Update Logic =====

  update(deltaTime) {
    if (this.gameOver || this.hasWon) return;

    // --- Ship Controls and Physics ---

    // Smooth continuous rotation
    if (this.keys.ArrowLeft || this.keys.a) {
      this.ship.angle -= this.ship.rotationSpeed;
    }
    if (this.keys.ArrowRight || this.keys.d) {
      this.ship.angle += this.ship.rotationSpeed;
    }

    // Thrust: accelerate in the direction the ship is pointing
    if (this.keys.Space || this.keys.w) {
      this.ship.vel.x += this.ship.acceleration * Math.cos(this.ship.angle);
      this.ship.vel.y += this.ship.acceleration * Math.sin(this.ship.angle);

      // Add thrust particles
      const thrustX = this.ship.pos.x - Math.cos(this.ship.angle) * 15;
      const thrustY = this.ship.pos.y - Math.sin(this.ship.angle) * 15;
      this.createExplosion(thrustX, thrustY, 1, 3, 1, 0.3);
    }

    // Brake: decelerate (apply braking force opposite to current velocity)
    if (this.keys.b) {
      this.ship.vel.x *= (1 - this.ship.brakeFactor);
      this.ship.vel.y *= (1 - this.ship.brakeFactor);
    }

    // Clamp ship speed to maximum
    let shipSpeed = Math.hypot(this.ship.vel.x, this.ship.vel.y);
    if (shipSpeed > this.ship.maxSpeed) {
      this.ship.vel.x = (this.ship.vel.x / shipSpeed) * this.ship.maxSpeed;
      this.ship.vel.y = (this.ship.vel.y / shipSpeed) * this.ship.maxSpeed;
    }

    // Update ship position
    this.ship.pos.x += this.ship.vel.x;
    this.ship.pos.y += this.ship.vel.y;

    // --- Asteroid Updates ---
    this.asteroidSpawnTimer++;
    if (this.asteroidSpawnTimer >= this.asteroidSpawnInterval) {
      this.spawnAsteroid();
      this.asteroidSpawnTimer = 0;
    }

    // Update each asteroid's position and check for collisions
    for (let i = 0; i < this.asteroids.length; i++) {
      let ast = this.asteroids[i];
      ast.pos.x += ast.vel.x;
      ast.pos.y += ast.vel.y;

      // Clamp asteroid speed
      let aSpeed = Math.hypot(ast.vel.x, ast.vel.y);
      if (aSpeed > ast.maxSpeed) {
        ast.vel.x = (ast.vel.x / aSpeed) * ast.maxSpeed;
        ast.vel.y = (ast.vel.y / aSpeed) * ast.maxSpeed;
      }

      // Check collisions with other asteroids (elastic collisions)
      for (let j = i + 1; j < this.asteroids.length; j++) {
        let other = this.asteroids[j];
        let dx = other.pos.x - ast.pos.x;
        let dy = other.pos.y - ast.pos.y;
        let dist = Math.hypot(dx, dy);
        if (dist < ast.radius + other.radius) {
          this.resolveCollision(ast, other);
        }
      }
    }

    // --- Collision Check: Ship vs. Asteroids ---
    for (let ast of this.asteroids) {
      let dx = ast.pos.x - this.ship.pos.x;
      let dy = ast.pos.y - this.ship.pos.y;
      let dist = Math.hypot(dx, dy);
      if (dist < ast.radius + this.ship.radius) {
        // Create explosion effect at collision point
        this.createExplosion(this.ship.pos.x, this.ship.pos.y, 50, 3, 5, 1.5);

        // Reduce lives and reset ship position
        this.lives--;
        this.ship.pos.x = 0;
        this.ship.pos.y = 0;
        this.ship.vel.x = 0;
        this.ship.vel.y = 0;

        // Show message
        this.message = "Ship Destroyed!";
        this.messageTimer = 2;

        // Check for game over
        if (this.lives <= 0) {
          this.gameOver = true;
          setTimeout(() => {
            this.game.endMinigame("You crashed too many times! Trial failed.", false);
          }, 2000);
        }
        break;
      }
    }

    // --- Check for Victory ---
    let dxd = this.destination.x - this.ship.pos.x;
    let dyd = this.destination.y - this.ship.pos.y;
    if (Math.hypot(dxd, dyd) < 50) { // within 50 units of destination
      this.hasWon = true;
      this.message = "Destination Reached!";
      this.messageTimer = 3;

      // Create victory particles
      this.createExplosion(this.destination.x, this.destination.y, 100, 4, 2, 2);

      // End the minigame after a short delay
      setTimeout(() => {
        this.game.endMinigame("You successfully navigated to the destination! Trial passed.", true);
      }, 2000);
    }

    // --- Update particles ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= deltaTime;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // --- Update UI effects ---
    this.arrowPulse += deltaTime * 5;
    this.arrowAlpha = 0.5 + Math.sin(this.arrowPulse) * 0.5;

    this.destGlow += deltaTime * 3;

    // Update message timer
    if (this.messageTimer > 0) {
      this.messageTimer -= deltaTime;
    }
  }

  // ===== Elastic Collision Resolution =====

  resolveCollision(a, b) {
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

  // ===== Animation Loop =====

  animate() {
    if (this.gameOver || this.hasWon) return;

    const now = performance.now();
    const deltaTime = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    // Update game state
    this.update(deltaTime);

    // Draw the game
    this.draw(this.ctx);

    // Request next frame
    requestAnimationFrame(() => this.animate());
  }

  // ===== Rendering =====

  draw(ctx) {
    // Clear the canvas with a space background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw some stars in the background
    ctx.fillStyle = "white";
    for (let i = 0; i < 100; i++) {
      const x = (this.ship.pos.x * 0.1 + i * 100) % ctx.canvas.width;
      const y = (this.ship.pos.y * 0.1 + i * 80) % ctx.canvas.height;
      const size = Math.random() * 2 + 1;
      ctx.fillRect(x, y, size, size);
    }

    // The camera is centered on the ship.
    // Calculate camera offset (world coordinates of the top-left of the canvas)
    let cameraX = this.ship.pos.x - ctx.canvas.width / 2;
    let cameraY = this.ship.pos.y - ctx.canvas.height / 2;

    // Draw the particles (behind everything else)
    for (const particle of this.particles) {
      const alpha = Math.min(1, particle.life * 2);
      ctx.fillStyle = particle.color.replace('1)', `${alpha})`);

      const screenX = particle.x - cameraX;
      const screenY = particle.y - cameraY;

      ctx.beginPath();
      ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw the destination with a pulsing glow effect
    const destScreenX = this.destination.x - cameraX;
    const destScreenY = this.destination.y - cameraY;

    // Draw outer glow
    const glowSize = 50 + Math.sin(this.destGlow) * 10;
    const gradient = ctx.createRadialGradient(
        destScreenX, destScreenY, 0,
        destScreenX, destScreenY, glowSize
    );
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(destScreenX, destScreenY, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw destination center
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(destScreenX, destScreenY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw a flashing arrow pointing to the destination
    this.drawDestinationArrow(ctx, cameraX, cameraY);

    // Draw all asteroids
    for (let ast of this.asteroids) {
      let screenX = ast.pos.x - cameraX;
      let screenY = ast.pos.y - cameraY;

      // Skip drawing if outside visible area (with margin)
      if (screenX < -100 || screenX > ctx.canvas.width + 100 ||
          screenY < -100 || screenY > ctx.canvas.height + 100) {
        continue;
      }

      // Draw asteroid with texture
      ctx.save();
      ctx.translate(screenX, screenY);

      // Create asteroid's rocky texture
      ctx.fillStyle = "#7a7a7a";
      ctx.beginPath();
      ctx.arc(0, 0, ast.radius, 0, Math.PI * 2);
      ctx.fill();

      // Add some crater details
      ctx.fillStyle = "#5a5a5a";
      const craters = 3 + Math.floor(ast.radius / 5);
      for (let i = 0; i < craters; i++) {
        const angle = (i / craters) * Math.PI * 2;
        const distance = ast.radius * 0.6 * Math.random();
        const size = ast.radius * 0.3 * Math.random();

        ctx.beginPath();
        ctx.arc(
            Math.cos(angle) * distance,
            Math.sin(angle) * distance,
            size, 0, Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    }

    // Draw the ship in the center of the screen
    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.rotate(this.ship.angle);

    // Draw ship body
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, -10);
    ctx.closePath();
    ctx.fill();

    // Draw engine glow when thrusting
    if (this.keys.Space || this.keys.w) {
      ctx.fillStyle = "rgba(255, 150, 0, 0.8)";
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(-15, 5);
      ctx.lineTo(-25 - Math.random() * 10, 0);
      ctx.lineTo(-15, -5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Draw UI elements

    // Lives indicator
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.font = "24px monospace";
    ctx.fillText(`LIVES: ${this.lives}`, 20, 30);

    // Display ship coordinates
    ctx.fillText(`X: ${Math.floor(this.ship.pos.x)}, Y: ${Math.floor(this.ship.pos.y)}`, 20, 60);

    // Distance to destination
    const distToDest = Math.hypot(
        this.destination.x - this.ship.pos.x,
        this.destination.y - this.ship.pos.y
    );
    ctx.fillText(`DISTANCE: ${Math.floor(distToDest)}`, 20, 90);

    // Display message if active
    if (this.messageTimer > 0) {
      const alpha = Math.min(1, this.messageTimer);
      ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
      ctx.font = "36px monospace";
      ctx.textAlign = "center";
      ctx.fillText(this.message, ctx.canvas.width / 2, ctx.canvas.height / 2 - 100);
      ctx.textAlign = "left";
    }

    // Instructions
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.font = "16px monospace";
    ctx.fillText("CONTROLS: ← → to rotate | SPACE to thrust | B to brake", 20, ctx.canvas.height - 20);
  }

  drawDestinationArrow(ctx, cameraX, cameraY) {
    // Ship is always at the center of the canvas
    const shipScreenX = ctx.canvas.width / 2;
    const shipScreenY = ctx.canvas.height / 2;

    const destScreenX = this.destination.x - cameraX;
    const destScreenY = this.destination.y - cameraY;

    // Calculate angle from ship to destination
    const dx = destScreenX - shipScreenX;
    const dy = destScreenY - shipScreenY;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    // Only draw arrow if destination is off-screen
    if (destScreenX >= 0 && destScreenX < ctx.canvas.width &&
        destScreenY >= 0 && destScreenY < ctx.canvas.height) {
      return;
    }

    // Calculate where arrow should be drawn (at screen edge)
    let arrowX, arrowY;

    // Find intersection with screen edge
    const margin = 40; // Distance from edge
    const halfWidth = ctx.canvas.width / 2 - margin;
    const halfHeight = ctx.canvas.height / 2 - margin;

    // Calculate position on edge of screen in the direction of destination
    if (Math.abs(dx / distance) * halfHeight > Math.abs(dy / distance) * halfWidth) {
      // Intersects with left or right edge
      arrowX = shipScreenX + (dx > 0 ? halfWidth : -halfWidth);
      arrowY = shipScreenY + dy * (halfWidth / Math.abs(dx));
    } else {
      // Intersects with top or bottom edge
      arrowX = shipScreenX + dx * (halfHeight / Math.abs(dy));
      arrowY = shipScreenY + (dy > 0 ? halfHeight : -halfHeight);
    }

    // Draw flashing arrow
    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(angle);

    // Arrow color with pulsing alpha
    ctx.fillStyle = `rgba(0, 255, 0, ${this.arrowAlpha})`;
    ctx.strokeStyle = `rgba(0, 255, 0, ${this.arrowAlpha})`;
    ctx.lineWidth = 2;

    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(0, -10);
    ctx.closePath();
    ctx.fill();

    // Draw pulsing circles indicating direction
    for (let i = 1; i <= 3; i++) {
      const pulseOffset = (this.arrowPulse + i * 0.3) % 1;
      const pulseSize = 5 + pulseOffset * 10;
      const pulseAlpha = (1 - pulseOffset) * this.arrowAlpha;

      ctx.fillStyle = `rgba(0, 255, 0, ${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(-10 - pulseOffset * 30, 0, pulseSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ===== Cleanup =====

  removeListeners() {
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("keyup", this.keyupHandler);
  }
}

export { AsteroidGame };