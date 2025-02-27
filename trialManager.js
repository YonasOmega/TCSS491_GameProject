class TrialManager {
    constructor(game) {
        this.game = game;
        this.successCount = 0;
        this.failureCount = 0;
        this.planetScale = 1; // initial scale factor for the planet sprite
        this.planetImage = new Image();
        this.planetImage.src = "assets/planet.png"; // load your planet image from the assets folder
    }
    
    completeTrial(success) {
        if (success) {
            this.successCount++;
        } else {
            this.failureCount++;
        }
        // Increase planet scale by 20% after each trial.
        this.planetScale += 0.2;
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
