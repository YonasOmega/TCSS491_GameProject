// Star Wars style credits sequence
class CreditsScreen {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;

        // Canvas dimensions
        this.canvas = this.ctx.canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Text crawl properties
        this.scrollY = this.height;
        this.scrollSpeed = 50; // pixels per second
        this.perspective = 300; // perspective effect intensity
        this.textScale = 1.0;  // scaling of text as it scrolls

        // Stars background
        this.stars = [];
        this.initStars(200); // Create 200 stars

        // Credits text content
        this.title = "Void Terminal";
        this.subtitle = "the last OS";
        this.subtitle = "PRESS ESC TO RETURN TO TERMINAL";
        this.credits = [
            "CREATED BY",
            "",
            "Dalton Milton",
            "",
            "Jian Azul",
            "",
            "Yonas Omega",
            "",
            "",
            "SPECIAL THANKS",
            "",
            "Katie Lowe",
            "AND YOU, THE PLAYER",
            "",
            "",
            "MAY THE TERMINAL BE WITH YOU",
            "",
            "",
            "PRESS ESC TO RETURN TO TERMINAL"
        ];

        // Animation timing
        this.startTime = Date.now();
        this.running = true;

        // Event listener for ESC key
        this.escListener = (e) => {
            if (e.key === "Escape") {
                this.endCredits();
            }
        };
        window.addEventListener("keydown", this.escListener);
    }

    initStars(count) {
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1
            });
        }
    }

    updateStars() {
        for (let star of this.stars) {
            // Move stars slightly to enhance space effect
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        }
    }

    drawStars() {
        this.ctx.fillStyle = "#FFF";
        for (let star of this.stars) {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    update() {
        if (!this.running) return;

        // Calculate time elapsed
        const elapsed = (Date.now() - this.startTime) / 1000;

        // Update scroll position based on elapsed time
        this.scrollY = this.height - (elapsed * this.scrollSpeed);

        // Update stars animation
        this.updateStars();

        // End credits if they've scrolled completely off screen
        if (this.scrollY < -2000) {
            this.endCredits();
        }
    }

    draw() {
        // Clear the canvas and draw a starfield background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw stars
        this.drawStars();

        // Set up text properties
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "top";
        this.ctx.fillStyle = "#FFD700"; // Star Wars yellow

        // Draw main title (larger than the rest)
        this.ctx.font = "bold 48px monospace";
        this.ctx.fillText(this.title, this.width / 2, this.scrollY);

        // Draw subtitle
        this.ctx.font = "bold 28px monospace";
        this.ctx.fillText(this.subtitle, this.width / 2, this.scrollY + 60);

        // Draw scrolling credits
        this.ctx.font = "20px monospace";
        let creditY = this.scrollY + 140; // Start position after title

        for (let line of this.credits) {
            // Calculate scaling and position for perspective effect
            let distanceFromCenter = (creditY - this.height / 2) / this.perspective;
            let scale = Math.max(0.1, 1 - Math.abs(distanceFromCenter));
            let perspectiveY = creditY;

            this.ctx.globalAlpha = scale * 1.5; // Fade out as it moves away
            this.ctx.font = `${Math.floor(20 * scale)}px monospace`;
            this.ctx.fillText(line, this.width / 2, perspectiveY);
            this.ctx.globalAlpha = 1.0;

            creditY += 40 * scale; // Spacing between lines with perspective
        }
    }

    endCredits() {
        this.running = false;
        window.removeEventListener("keydown", this.escListener);

        // Return to terminal
        this.game.endCredits();
    }

    removeListeners() {
        window.removeEventListener("keydown", this.escListener);
    }
}

export { CreditsScreen };