// Enhanced Typing Game with Increased Difficulty
class TypingGame {
    constructor(game) {
        this.game = game;
        this.timeBar = 45;
        // Increase time pressure - faster decline rate
        this.decreaseRate = 0.9; // Increased from 0.9
        // Reduced time rewards
        this.increaseAmount = 1.8; // Decreased from 1.8
        // Increased wrong answer penalty
        this.wrongPenalty = 1.4; 
        this.currentSequence = "";
        this.playerInput = "";
        // Longer sequences to start with
        this.baseSequenceLength = 3; 
        this.level = 1;
        this.maxLevel = 15;
        this.isGameOver = false;
        this.hasWon = false;
        this.endCalled = false;

        // Game start state
        this.gameStarted = false;

        // Track player stats for end-game display
        this.stats = {
            totalCorrect: 0,
            totalWrong: 0,
            startTime: 0,
            bestTime: Infinity,
            worstTime: 0
        };
            // Initialize background music
        this.bgMusic = new Audio('assets/type.mp3'); 
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.3;
        this.playBackgroundMusic();

        // Enhanced message system
        this.messageEffect = {
            active: true,
            timer: 30,
            duration: 1,
            intensity: 1,
            message: "Enter to decay",
            isStartMessage: true
        };

        // Glitch effect system
        this.glitchEffect = {
            active: false,
            duration: 0.5,
            timer: 0,
            intensity: 0,
            slices: [],
            characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&!?</>[]*"
        };

        // Special effects to increase difficulty
        this.specialEffects = {
            // Letters randomly shift positions
            letterShift: {
                active: false,
                timer: 0,
                duration: 2,
                triggerLevel: 5
            },
            // Screen shakes
            screenShake: {
                active: false,
                timer: 0,
                duration: 1.5,
                intensity: 0,
                triggerLevel: 4
            },
            // Letters fade in/out
            letterFade: {
                active: false,
                letters: [],
                triggerLevel: 7 // Starts at level 7
            },
            // Random case changing (uppercase/lowercase)
            randomCase: {
                active: false,
                triggerLevel: 9
            },
            // Reversed sequence direction
            reversed: {
                active: false,
                triggerLevel: 11 // Starts at level 11
            },
            // Sequence changes mid-level
            sequenceChange: {
                active: false,
                timer: 0,
                changeInterval: 6, // Seconds between changes
                triggerLevel: 13 // Starts at level 10
            }
        };

        // Particle system
        this.particles = [];
        this.victoryTime = 0;

        // Debug mode properties
        this.debugMode = false;
        this.debugBuffer = "";
        this.debugStartTime = 0;

        // Pip-Boy color theme
        this.colors = {
            primary: "rgba(0, 255, 0, 0.8)",
            dimmed: "rgba(0, 255, 0, 0.6)",
            background: "rgba(0, 255, 0, 0.1)",
            error: "rgba(255, 50, 50, 0.8)"
        };

        // Store key listener for later removal
        this.keyListener = (event) => this.handleKeyPress(event);
        window.addEventListener("keydown", this.keyListener);
        
        // Track timing for sequence change
        this.lastSequenceChangeTime = 0;
    }
    playBackgroundMusic() {
        const playPromise = this.bgMusic.play();
        
        // Handle potential play() promise rejection (autoplay policy)
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented. Using first interaction to start music");
                
                // Use first interaction as a trigger for music
                const startAudio = () => {
                    this.bgMusic.play().catch(e => console.log("Still couldn't play audio:", e));
                    document.removeEventListener('keydown', startAudio);
                    document.removeEventListener('click', startAudio);
                };
                
                document.addEventListener('keydown', startAudio);
                document.addEventListener('click', startAudio);
            });
        }
    }

    generateNewSequence() {
        // Include more complex characters in higher levels
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        if (this.level >= (this.maxLevel - 3)) chars += '!@#$%^&*()'; 
        if (this.level >= (this.maxLevel - 1)) chars += '[]<>';
        
        // Gradually increase sequence length
        const length = this.baseSequenceLength + Math.floor(this.level / 2); // More characters per level
        
        this.currentSequence = '';
        for (let i = 0; i < length; i++) {
            this.currentSequence += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Apply special effects based on level
        if (this.level >= this.specialEffects.randomCase.triggerLevel && Math.random() < 0.6) {
            this.specialEffects.randomCase.active = true;
            // Apply random case to some characters
            this.currentSequence = this.currentSequence.split('').map(char => 
                Math.random() < 0.5 ? char.toLowerCase() : char
            ).join('');
        } else {
            this.specialEffects.randomCase.active = false;
        }
        
        // Reverse sequence at higher levels
        if (this.level >= this.specialEffects.reversed.triggerLevel && Math.random() < 0.3) {
            this.specialEffects.reversed.active = true;
            this.currentSequence = this.currentSequence.split('').reverse().join('');
        } else {
            this.specialEffects.reversed.active = false;
        }
        
        // Setup letter fade effect
        if (this.level >= this.specialEffects.letterFade.triggerLevel) {
            this.specialEffects.letterFade.active = true;
            this.specialEffects.letterFade.letters = this.currentSequence.split('').map(() => ({
                visible: true,
                fadeTimer: Math.random() * 2
            }));
        } else {
            this.specialEffects.letterFade.active = false;
        }
        
        this.playerInput = '';
        
        // Activate screen shake randomly at higher levels
        if (this.level >= this.specialEffects.screenShake.triggerLevel && Math.random() < 0.4) {
            this.startScreenShake();
        }
        
        // Start sequence change timer for highest levels
        if (this.level >= this.specialEffects.sequenceChange.triggerLevel) {
            this.specialEffects.sequenceChange.active = true;
            this.specialEffects.sequenceChange.timer = 0;
            this.lastSequenceChangeTime = 0;
        }
        if(this.level >= this.maxLevel - 3) {
            this.decreaseRate = 0.6;
        }
    }

    startScreenShake() {
        this.specialEffects.screenShake.active = true;
        this.specialEffects.screenShake.timer = this.specialEffects.screenShake.duration;
        this.specialEffects.screenShake.intensity = 1;
    }

    startGlitchEffect() {
        this.glitchEffect.active = true;
        this.glitchEffect.timer = this.glitchEffect.duration;
        this.glitchEffect.intensity = 1;
        this.glitchEffect.slices = [];
        
        // Reduced number of slices for better performance
        const numSlices = 5;
        for (let i = 0; i < numSlices; i++) {
            this.glitchEffect.slices.push({
                offset: (Math.random() - 0.5) * 30,
                y: Math.random() * this.game.ctx.canvas.height,
                height: Math.random() * 50 + 10
            });
        }
        
    }

    startLetterShift() {
        if (this.level >= this.specialEffects.letterShift.triggerLevel) {
            this.specialEffects.letterShift.active = true;
            this.specialEffects.letterShift.timer = this.specialEffects.letterShift.duration;
            
            // Shuffle the positions of some letters
            if (this.currentSequence.length > 2) {
                const letters = this.currentSequence.split('');
                for (let i = 0; i < Math.min(2, letters.length - 1); i++) {
                    const idx1 = Math.floor(Math.random() * letters.length);
                    let idx2 = Math.floor(Math.random() * letters.length);
                    while (idx2 === idx1) {
                        idx2 = Math.floor(Math.random() * letters.length);
                    }
                    [letters[idx1], letters[idx2]] = [letters[idx2], letters[idx1]];
                }
                // Update current sequence with shuffled letters
                this.currentSequence = letters.join('');
            }
        }
    }

    // Modified handleKeyPress method to support letter-specific retry
handleKeyPress(event) {
    // If the game is over or won, ignore further input.
    if (this.isGameOver || this.hasWon) {
        return;
    }

    // Start the game when ENTER is pressed
    if (!this.gameStarted) {
        if (event.key === 'Enter') {
            this.gameStarted = true;
            this.messageEffect.active = false;
            this.generateNewSequence();
            this.stats.startTime = Date.now();
            // Optionally start audio
            // this.noiseAudio.play();
        }
        return;
    }

    // Debug mode toggle
    if (event.key.length === 1) {
        const input = event.key.toLowerCase();
        const currentTime = Date.now();
        if (currentTime - this.debugStartTime > 1000) {
            this.debugBuffer = "";
        }
        this.debugStartTime = currentTime;
        this.debugBuffer += input;
        if (this.debugBuffer.endsWith("uwt")) {
            this.debugMode = !this.debugMode;
            this.debugBuffer = "";
            this.messageEffect.active = true;
            this.messageEffect.timer = this.messageEffect.duration;
            return;
        }
        if (this.debugMode) return;
        
        // Process normal gameplay input - handle both cases if randomCase is active
        let gameInput = event.key.toUpperCase();
        
        // Get the expected character at the current position
        const expectedChar = this.currentSequence[this.playerInput.length];
        const isMatch = this.specialEffects.randomCase.active ? 
            (gameInput === expectedChar.toUpperCase() || gameInput.toLowerCase() === expectedChar.toLowerCase()) :
            (gameInput === expectedChar);
        
        // Track input time for stats
        const inputTime = (Date.now() - this.stats.startTime) / 1000;
        
        if (isMatch) {
            // Add the correct input to player input
            this.playerInput += gameInput;
            
            // Apply diminishing returns for time bar increases at higher levels
            const levelFactor = Math.max(0.5, 1 - (this.level / (this.maxLevel * 1.5)));
            this.timeBar = Math.min(30, this.timeBar + (this.increaseAmount * levelFactor));
            this.stats.totalCorrect++;
            
            // Update timing stats
            this.stats.bestTime = Math.min(this.stats.bestTime, inputTime);
            this.stats.worstTime = Math.max(this.stats.worstTime, inputTime);
            
            if (this.playerInput.length === this.currentSequence.length) {
                this.level++;
                if (this.level > this.maxLevel) {
                    this.hasWon = true;
                    this.initVictoryParticles();
                } else {
                    this.generateNewSequence();
                }
            }
        } else {
            // WRONG INPUT HANDLING:
            // Do NOT add the wrong input to playerInput - this enables the "retry letter" functionality
            // Player must re-attempt the current letter
            
            this.stats.totalWrong++;
            this.timeBar = Math.max(0, this.timeBar - this.wrongPenalty * (1 + this.level / 20));
            
            // Visual feedback for error
            this.messageEffect.active = true;
            this.messageEffect.timer = this.messageEffect.duration;
            this.messageEffect.isStartMessage = false;
            this.messageEffect.message = `Expected: ${expectedChar}`;
            this.startGlitchEffect();
            
            // Add additional punishment effects at higher levels
            if (this.level >= this.specialEffects.letterShift.triggerLevel && Math.random() < 0.6) {
                this.startLetterShift();
            }
            if (this.level >= this.specialEffects.screenShake.triggerLevel) {
                this.startScreenShake();
            }
        }
    } else if (event.key === 'Enter' && !this.debugMode) {
        // Enter key handling - check if player wants to skip/reset
        const hasCorrectInputSoFar = this.playerInput === this.currentSequence.substring(0, this.playerInput.length);
        
        // Handle special case for randomCase
        const hasCorrectInputCaseSensitive = !this.specialEffects.randomCase.active || 
            this.playerInput.toLowerCase() === this.currentSequence.substring(0, this.playerInput.length).toLowerCase();
            
        if (!hasCorrectInputSoFar || !hasCorrectInputCaseSensitive) {
            // Apply penalty for trying to skip with wrong input
            this.timeBar = Math.max(0, this.timeBar - this.wrongPenalty * (1 + this.level / 20));
            this.messageEffect.active = true;
            this.messageEffect.timer = this.messageEffect.duration;
            this.messageEffect.isStartMessage = false;
            this.startGlitchEffect();
            this.stats.totalWrong++;
        }
    }
}
        
    initVictoryParticles() {
        for (let i = 0; i < 50; i++) {
            this.addVictoryParticle();
        }
    }

    addVictoryParticle() {
        const canvas = this.game.ctx.canvas;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 100;
        const size = 5 + Math.random() * 15;
        const type = Math.floor(Math.random() * 3);
        this.particles.push(new Particle(x, y, angle, speed, size, type));
    }

    updateGlitchEffect() {
        if (this.glitchEffect.active) {
            this.glitchEffect.timer -= this.game.clockTick;
            this.glitchEffect.intensity = this.glitchEffect.timer / this.glitchEffect.duration;
            if (this.glitchEffect.timer <= 0) {
                this.glitchEffect.active = false;

            }
        }
    }

    updateSpecialEffects() {
        // Update screen shake
        if (this.specialEffects.screenShake.active) {
            this.specialEffects.screenShake.timer -= this.game.clockTick;
            this.specialEffects.screenShake.intensity = this.specialEffects.screenShake.timer / 
                                                      this.specialEffects.screenShake.duration;
            if (this.specialEffects.screenShake.timer <= 0) {
                this.specialEffects.screenShake.active = false;
            }
        }
        
        // Update letter shift
        if (this.specialEffects.letterShift.active) {
            this.specialEffects.letterShift.timer -= this.game.clockTick;
            if (this.specialEffects.letterShift.timer <= 0) {
                this.specialEffects.letterShift.active = false;
            }
        }
        
        // Update letter fade effect
        if (this.specialEffects.letterFade.active && this.specialEffects.letterFade.letters.length > 0) {
            for (let i = 0; i < this.specialEffects.letterFade.letters.length; i++) {
                const letter = this.specialEffects.letterFade.letters[i];
                letter.fadeTimer -= this.game.clockTick;
                if (letter.fadeTimer <= 0) {
                    letter.visible = !letter.visible;
                    letter.fadeTimer = Math.random() * 0.5 + 0.5; // Random fade interval
                }
            }
        }
        
        // Update sequence change at highest levels
        if (this.specialEffects.sequenceChange.active && this.level >= this.specialEffects.sequenceChange.triggerLevel) {
            this.specialEffects.sequenceChange.timer += this.game.clockTick;
            if (this.specialEffects.sequenceChange.timer >= this.specialEffects.sequenceChange.changeInterval) {
                this.specialEffects.sequenceChange.timer = 0;
                // Don't change if player has made progress
                if (this.playerInput.length === 0 || Math.random() < 0.3) { 
                    this.generateNewSequence();
                    this.startGlitchEffect();
                }
            }
        }
    }

    removeListeners() {
        console.log("🛑 Removing key event listeners...");
        window.removeEventListener("keydown", this.keyListener);
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }

    update() {
        this.updateGlitchEffect();
        this.updateSpecialEffects();
    
        if (this.gameStarted && !this.debugMode) {
            // Increase time bar decrease rate with level
            const levelFactor = 1 + (this.level / (this.maxLevel * 1.5));
            this.timeBar -= this.decreaseRate * this.game.clockTick * levelFactor;
            
            if (this.messageEffect.active) {
                this.messageEffect.timer -= this.game.clockTick;
                if (this.messageEffect.timer <= 0) {
                    this.messageEffect.active = this.messageEffect.isStartMessage;
                    this.messageEffect.timer = this.messageEffect.duration;
                }
            }
            if (this.timeBar <= 0) {
                console.log("🚨 Time ran out! Game Over triggered.");
                this.isGameOver = true;
                this.timeBar = 0;
            }
        }
    
        if (this.hasWon && !this.endCalled) {
            this.endCalled = true;
            // Allow a short delay to show final state, then call endMinigame with success.
            setTimeout(() => {
                this.game.endMinigame("Trial passed (typing game)", true);
            }, 1500); // Longer delay to showcase victory
            return;
        }
    
        if (this.isGameOver && !this.endCalled) {
            this.endCalled = true;
            // Allow a short delay, then call endMinigame with failure.
            setTimeout(() => {
                this.game.endMinigame("Trial failed (typing game)", false);
            }, 1500); // Longer delay to show game over state
            return;
        }
    
        if (!this.isGameOver && !this.hasWon) {
            this.timeBar = Math.min(30, this.timeBar); // cap the time bar
        }
    
        if (this.hasWon) {
            this.victoryTime += this.game.clockTick;
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update(this.game.clockTick);
                if (this.particles[i].life <= 0) {
                    this.particles.splice(i, 1);
                }
            }
            if (this.victoryTime % 0.1 < this.game.clockTick) {
                this.addVictoryParticle();
            }
        }
    }    

    drawMessageEffect(ctx) {
        if (this.messageEffect.active) {
            const glitchChars = "@#$%&!?<>";
            const message = this.messageEffect.isStartMessage ? "Enter to decay" : "Wrong Input!";
            const levelIntensity = this.level / this.maxLevel;
            
            // Reduced number of copies for better performance
            const numCopies = 2;
            
            for (let i = 0; i < numCopies; i++) {
                ctx.save();
                ctx.font = "48px monospace";
                
                // Simplified positioning
                let messageX, messageY;
                const centerX = ctx.canvas.width / 2 - 100;
                const centerY = ctx.canvas.height / 2 - 50;
                
                if (this.messageEffect.isStartMessage) {
                    const baseX = ((Math.cos(Date.now() / 2000 / 3) + 1) / 2) * (ctx.canvas.width - 300);
                    messageX = baseX;
                    messageY = centerY;
                } else {
                    messageX = centerX;
                    messageY = centerY;
                }
                
                // Simplified wobble effect
                const wobble = Math.sin(this.messageEffect.timer * 5) * 5;
                
                if (i % 2 === 0) {
                    ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(0.8, this.messageEffect.timer)})`;
                } else {
                    ctx.fillStyle = `rgba(0, 255, 0, ${Math.min(0.8, this.messageEffect.timer)})`;
                }
                
                ctx.translate(messageX + wobble, messageY);
                ctx.rotate(wobble * Math.PI / 360);
                
                // Reduce amount of character glitching
                let glitchedMessage = message;
                if (Math.random() < 0.3) {
                    // Only glitch occasionally
                    glitchedMessage = message.split('').map(char =>
                        Math.random() < 0.1 ? 
                            glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
                    ).join('');
                }
                
                ctx.fillText(glitchedMessage, 0, 0);
                ctx.restore();
            }
        }
    }

    drawGlitchEffect(ctx) {
        if (!this.glitchEffect.active) return;
        
        // Limit number of slices based on intensity to reduce processing
        const activeSlices = Math.floor(this.glitchEffect.slices.length * this.glitchEffect.intensity);
        
        // Skip expensive pixel manipulation, focus on slices
        for (let i = 0; i < activeSlices; i++) {
            const slice = this.glitchEffect.slices[i];
            const offset = slice.offset * this.glitchEffect.intensity;
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, slice.y, ctx.canvas.width, slice.height);
            ctx.clip();
            ctx.drawImage(
                ctx.canvas,
                offset, 0, ctx.canvas.width, ctx.canvas.height,
                0, 0, ctx.canvas.width, ctx.canvas.height
            );
            ctx.restore();
        }
        
        // Add some random green squares for glitch effect
        const numSquares = Math.floor(30 * this.glitchEffect.intensity);
        ctx.fillStyle = `rgba(0, 255, 0, ${0.1 * this.glitchEffect.intensity})`;
        for (let i = 0; i < numSquares; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = Math.random() * ctx.canvas.height;
            const size = Math.random() * 3 + 1;
            ctx.fillRect(x, y, size, size);
        }
    }

    draw(ctx) {
        // Apply screen shake if active
        let offsetX = 0, offsetY = 0;
        if (this.specialEffects.screenShake.active) {
            offsetX = (Math.random() - 0.5) * 10 * this.specialEffects.screenShake.intensity;
            offsetY = (Math.random() - 0.5) * 10 * this.specialEffects.screenShake.intensity;
            ctx.save();
            ctx.translate(offsetX, offsetY);
        }
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        if (this.gameStarted) {
            // Draw time bar with color gradient based on amount
            const maxBarWidth = ctx.canvas.width - 224;
            const barWidth = (this.timeBar / 30) * maxBarWidth;
            ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
            ctx.fillRect(112, 50, maxBarWidth, 30);
            
            // Bar color changes from green to red as time decreases
            const timePercent = this.timeBar / 30;
            let barColor;
            if (timePercent > 0.6) {
                barColor = this.colors.primary;
            } else if (timePercent > 0.3) {
                barColor = "rgba(255, 255, 0, 0.8)"; // Yellow
            } else {
                barColor = this.colors.error; // Red
            }
            ctx.fillStyle = barColor;
            ctx.fillRect(112, 50, barWidth, 30);
            
            // Draw level indicator
            ctx.font = "24px monospace";
            ctx.fillStyle = this.colors.primary;
            ctx.fillText(`Level: ${this.level}/${this.maxLevel}`, 112, 100);
            
            // Draw special effect indicators
            let effectY = 130;
            if (this.specialEffects.randomCase.active) {
                ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
                ctx.fillText("MIXED CASE", 112, effectY);
                effectY += 25;
            }
            if (this.specialEffects.reversed.active) {
                ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
                ctx.fillText("REVERSED", 112, effectY);
                effectY += 25;
            }
            if (this.specialEffects.sequenceChange.active) {
                ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
                ctx.fillText("UNSTABLE SEQUENCE", 112, effectY);
                effectY += 25;
            }
            
            if (!this.hasWon && !this.isGameOver) {
                ctx.font = "48px monospace";
                for (let i = 0; i < this.currentSequence.length; i++) {
                    // Apply letter fade effect at higher levels
                    let isVisible = true;
                    if (this.specialEffects.letterFade.active && 
                        this.specialEffects.letterFade.letters[i] && 
                        !this.specialEffects.letterFade.letters[i].visible) {
                        isVisible = false;
                    }
                    
                    if (isVisible) {
                        if (i < this.playerInput.length) {
                            const isMatch = this.specialEffects.randomCase.active ?
                                this.playerInput[i].toLowerCase() === this.currentSequence[i].toLowerCase() :
                                this.playerInput[i] === this.currentSequence[i];
                                
                            ctx.fillStyle = isMatch ? this.colors.primary : this.colors.error;
                        } else {
                            ctx.fillStyle = this.colors.dimmed;
                        }
                        
                        // Apply letter shift effect
                        let xOffset = 0;
                        if (this.specialEffects.letterShift.active) {
                            xOffset = Math.sin(Date.now() / 200 + i * 0.5) * 10 * 
                                      (this.specialEffects.letterShift.timer / this.specialEffects.letterShift.duration);
                        }
                        
                        ctx.fillText(this.currentSequence[i], 112 + i * 50 + xOffset, 200);
                    }
                }
                
                // Draw player input
                ctx.font = "32px monospace";
                for (let i = 0; i < this.playerInput.length; i++) {
                    const isMatch = this.specialEffects.randomCase.active ?
                        this.playerInput[i].toLowerCase() === this.currentSequence[i].toLowerCase() :
                        this.playerInput[i] === this.currentSequence[i];
                        
                    ctx.fillStyle = isMatch ? this.colors.primary : this.colors.error;
                    ctx.fillText(this.playerInput[i], 112 + i * 50, 250);
                }
                
                // Draw stats
                ctx.font = "20px monospace";
                ctx.fillStyle = this.colors.primary;
                ctx.fillText(`Correct: ${this.stats.totalCorrect}`, ctx.canvas.width - 200, 30);
                ctx.fillText(`Errors: ${this.stats.totalWrong}`, ctx.canvas.width - 200, 55);
            }
        }
        
        this.drawMessageEffect(ctx);
        
        // Victory state
        if (this.hasWon) {
            this.particles.forEach(particle => {
                ctx.fillStyle = `rgba(0, 255, 0, ${0.5 + Math.sin(this.victoryTime * 5) * 0.3})`;
                particle.draw(ctx, this.victoryTime);
            });
            ctx.save();
            ctx.font = "64px monospace";
            const text = "VICTORY!";
            const centerX = ctx.canvas.width / 2;
            const centerY = ctx.canvas.height / 2;
            for (let i = 0; i < text.length; i++) {
                const letterOffset = Math.sin(this.victoryTime * 5 + i * 0.5) * 20;
                const x = centerX - (text.length * 20) + i * 40;
                const y = centerY + letterOffset;
                ctx.fillStyle = this.colors.primary;
                ctx.globalAlpha = 0.7 + Math.sin(this.victoryTime * 3 + i * 0.5) * 0.3;
                ctx.fillText(text[i], x, y);
            }
            ctx.restore();
            
            // Display final stats
            ctx.font = "24px monospace";
            ctx.fillStyle = this.colors.primary;
            ctx.fillText(`Perfect Victory! Level ${this.maxLevel} Completed!`, 112, 350);
            ctx.fillText(`Correct Inputs: ${this.stats.totalCorrect}`, 112, 380);
            ctx.fillText(`Mistakes: ${this.stats.totalWrong}`, 112, 410);
            if (this.stats.bestTime !== Infinity) {
                ctx.fillText(`Best Time: ${this.stats.bestTime.toFixed(2)}s`, 112, 440);
            }
        }
        
        // Game over state
        if (this.isGameOver) {
            ctx.font = "64px monospace";
            ctx.fillStyle = this.colors.error;
            ctx.fillText("GAME OVER", 112, 350);
            ctx.font = "32px monospace";
            ctx.fillStyle = this.colors.primary;
            ctx.fillText(`Final Level: ${this.level}/${this.maxLevel}`, 112, 400);
            ctx.font = "24px monospace";
            ctx.fillText(`Correct Inputs: ${this.stats.totalCorrect}`, 112, 430);
            ctx.fillText(`Mistakes: ${this.stats.totalWrong}`, 112, 460);
            if (this.stats.bestTime !== Infinity) {
                ctx.fillText(`Best Time: ${this.stats.bestTime.toFixed(2)}s`, 112, 490);
            }
        }
        
        if (this.debugMode) {
            ctx.font = "24px monospace";
            ctx.fillStyle = this.colors.primary;
            ctx.fillText("DEBUG MODE", ctx.canvas.width - 150, 30);
        }
        
        this.drawScanlines(ctx);
        this.drawGlitchEffect(ctx);
        
        // Restore transform after screen shake
        if (this.specialEffects.screenShake.active) {
            ctx.restore();
        }
    }

    drawScanlines(ctx) {
        const scanLineHeight = 4;
        const alpha = 0.1;
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        for (let i = 0; i < ctx.canvas.height; i += scanLineHeight * 2) {
            ctx.fillRect(0, i, ctx.canvas.width, scanLineHeight);
        }
    }
}

// Particle class for victory effects
class Particle {
    constructor(x, y, angle, speed, size, type) {
        this.x = x;
        this.y = y;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.size = size;
        this.type = type;
        this.life = 1;
        this.decay = Math.random() * 0.2 + 0.3;
        // Add random color variation for enhanced particles
        this.colorShift = Math.random() * 0.5;
    }

    update(deltaTime) {
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        this.life -= this.decay * deltaTime;
        
        // Add some randomness to movement for more interesting effects
        this.dx += (Math.random() - 0.5) * 10 * deltaTime;
        this.dy += (Math.random() - 0.5) * 10 * deltaTime;
    }

    draw(ctx, time) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(time * 2);
        
        // Add pulsing effect
        const pulse = 0.7 + Math.sin(time * 5) * 0.3;
        ctx.scale(pulse, pulse);
        
        if (this.type === 0) {
            // Cross shape
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 4);
            }
        } else if (this.type === 1) {
            // Circle shape with color variation
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(this.size / 2, 0);
            ctx.lineTo(0, this.size / 2);
            ctx.lineTo(-this.size / 2, 0);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

// Terminal integration functions for testing TypingGame independently
let typingGame;

function startTypingGame(ctx) {
    let game = {
        clockTick: 1 / 60,
        ctx: ctx,
        // Mock endMinigame function for testing
        endMinigame: function(message, success) {
            console.log(`Game ended: ${message}, Success: ${success}`);
        }
    };
    typingGame = new TypingGame(game);
    // Start animation loop
    updateTypingGame(ctx, game);
}

function updateTypingGame(ctx, game) {
    if (!typingGame) return;
    typingGame.update();
    // Automatically end the trial if win or game over conditions are met.
    if (typingGame.hasWon || typingGame.isGameOver) {
        // Drawing one final frame so the player sees the end state.
        typingGame.draw(ctx);
        return;
    }
    typingGame.draw(ctx);
    requestAnimationFrame(() => updateTypingGame(ctx, game));
}

export { TypingGame, startTypingGame };