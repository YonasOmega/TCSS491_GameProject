class TrialManager {
    constructor(game) {
        this.game = game;
        this.successCount = 0;
        this.failureCount = 0;
        this.planetScale = 1; // initial scale factor for the planet sprite
        this.planetImage = new Image();
        this.planetImage.src = "path/to/earth.png"; // load your Earth sprite
    }
    
    completeTrial(success) {
        if(success) {
            this.successCount++;
            // Increase planet scale by, say, 20% each success
            this.planetScale += 0.2;
            // Optionally, move the ship closer, update game state, etc.
        } else {
            this.failureCount++;
            if(this.failureCount >= 3) {
                this.game.explodeShip(); // Define your explosion sequence
            }
        }
    }
    
    drawDestination(ctx, canvasWidth) {
        // Draw the destination planet on the top-right corner
        const planetWidth = this.planetImage.width * this.planetScale;
        const planetHeight = this.planetImage.height * this.planetScale;
        const x = canvasWidth - planetWidth - 20;
        const y = 20;
        ctx.drawImage(this.planetImage, x, y, planetWidth, planetHeight);
    }
}
