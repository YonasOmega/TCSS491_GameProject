class TrialManager {
    constructor(game) {
        this.game = game;
        this.successCount = 0;
        this.failureCount = 0;
        this.planetScale = 1; // initial scale factor for the planet sprite
        this.planetImage = new Image();
        this.planetImage.src = "path/to/earth.png"; // update the path to your image as needed
    }
    
    completeTrial(success) {
        if (success) {
            this.successCount++;
            // Increase planet scale by 20% on each success.
            this.planetScale += 0.2;
        } else {
            this.failureCount++;
            // GameEngine will handle game over if failureCount reaches 3.
        }
    }
    
    drawDestination(ctx, canvasWidth) {
        const planetWidth = this.planetImage.width * this.planetScale;
        const planetHeight = this.planetImage.height * this.planetScale;
        const x = canvasWidth - planetWidth - 20;
        const y = 20;
        ctx.drawImage(this.planetImage, x, y, planetWidth, planetHeight);
    }
}

export { TrialManager };
