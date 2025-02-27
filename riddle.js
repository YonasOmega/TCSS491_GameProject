// riddle.js

// Utility function for random integers
function randomInt(max) {
    return Math.floor(Math.random() * max);
}

// Xenomorph class definition
class Xenomorph {
    constructor(game) {
        this.game = game;
        this.image = new Image();
        this.image.src = "./assets/xeno.png"; // Make sure this path is correct
        this.image.onerror = () => {
            console.error("Failed to load Xenomorph image. Check the path: ./assets/xeno.png");
        };
        this.baseSize = 100;
        this.size = this.baseSize;
        this.x = game.game.ctx.canvas.width / 2;
        this.y = game.game.ctx.canvas.height / 2;
        this.growing = false;
        this.growthTarget = this.size;
    }

    grow() {
        this.growthTarget = this.baseSize + (this.game.wrongAnswers * 200);
        this.growing = true;
    }

    shrink() {
        this.growthTarget = this.baseSize;
        this.growing = true;
    }

    update() {
        if (this.growing) {
            this.size += (this.growthTarget - this.size) * 0.1;
            if (Math.abs(this.size - this.growthTarget) < 0.1) {
                this.size = this.growthTarget;
                this.growing = false;
            }
        }

        // Check for click detection
        if (this.game.game.click && this.isClicked(this.game.game.click)) {
            console.log("Xenomorph clicked!");
            this.shrink();
            this.game.game.click = null;
        }
    }

    draw(ctx) {
        if (this.image.complete && this.image.naturalHeight !== 0) {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.drawImage(
                this.image,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
            ctx.restore();
        } else {
            // Fallback if image isn't loaded
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = "#555";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    isClicked(click) {
        const dx = click.x - this.x;
        const dy = click.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.size / 2;
    }
}

// RiddleGame class definition
class RiddleGame {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.wrongAnswers = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.xenomorph = new Xenomorph(this);
        this.questions = this.getQuestions();
        this.currentQuestionIndex = 0;
        this.currentQuestion = this.questions[this.currentQuestionIndex];
        this.questionTimer = 8; // Timer for each question
        this.currentTime = this.questionTimer;
        this.lastTimestamp = 0;
        this.uiInitialized = false;

        // Initialize UI
        this.initUI();
    }

    getQuestions() {
        const allQuestions =  [
            // EASY QUESTIONS
        {
            question: "What is the closest planet to the Sun?",
            answers: ["Venus", "Earth", "Mercury"],
            correctAnswer: "Mercury"
        },
        {
            question: "Which planet is known as the Red Planet?",
            answers: ["Saturn", "Mars", "Venus"],
            correctAnswer: "Mars"
        },
        {
            question: "What is the name of Earth's natural satellite?",
            answers: ["Europa", "The Moon", "Titan"],
            correctAnswer: "The Moon"
        },
        {
            question: "What is the largest planet in our solar system?",
            answers: ["Neptune", "Jupiter", "Saturn"],
            correctAnswer: "Jupiter"
        },
        {
            question: "Which planet has the most moons in our solar system?",
            answers: ["Mars", "Jupiter", "Saturn"],
            correctAnswer: "Saturn"
        },
        {
            question: "What is the name of the first human to walk on the Moon?",
            answers: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin"],
            correctAnswer: "Neil Armstrong"
        },
        {
            question: "What is the name of the second largest planet in our solar system?",
            answers: ["Uranus", "Saturn", "Neptune"],
            correctAnswer: "Saturn"
        },
        {
            question: "Which planet is famous for its beautiful rings?",
            answers: ["Saturn", "Neptune", "Uranus"],
            correctAnswer: "Saturn"
        },
        {
            question: "What is the name of the planet that we live on?",
            answers: ["Earth", "Mars", "Venus"],
            correctAnswer: "Earth"
        },
        {
            question: "How many planets are there in our solar system?",
            answers: ["7", "8", "9"],
            correctAnswer: "8"
        },
        {
            question: "Which planet is known for its beautiful blue color?",
            answers: ["Neptune", "Earth", "Mars"],
            correctAnswer: "Neptune"
        },

        // MEDIUM QUESTIONS
        {
            question: "What is the name of the galaxy we live in?",
            answers: ["Andromeda", "Triangulum", "The Milky Way"],
            correctAnswer: "The Milky Way"
        },
        {
            question: "Which planet has the longest day in our solar system?",
            answers: ["Venus", "Mars", "Jupiter"],
            correctAnswer: "Venus"
        },
        {
            question: "What is the name of the spacecraft that took humans to the Moon in 1969?",
            answers: ["Gemini 12", "Discovery", "Apollo 11"],
            correctAnswer: "Apollo 11"
        },
        {
            question: "What is the largest moon of Jupiter?",
            answers: ["Io", "Europa", "Ganymede"],
            correctAnswer: "Ganymede"
        },
        {
            question: "What is the name of the first artificial satellite launched into space?",
            answers: ["Explorer 1", "Vanguard 1", "Sputnik 1"],
            correctAnswer: "Sputnik 1"
        },
        {
            question: "Which space mission was the first to land humans on the Moon?",
            answers: ["Apollo 13", "Apollo 17", "Apollo 11"],
            correctAnswer: "Apollo 11"
        },
        {
            question: "What is the name of the space agency that launched the Hubble Space Telescope?",
            answers: ["ESA", "Roscosmos", "NASA"],
            correctAnswer: "NASA"
        },
        {
            question: "What is the primary composition of Saturn's rings?",
            answers: ["Rock", "Ice", "Gas"],
            correctAnswer: "Ice"
        },
        // HARD QUESTIONS
        {
            question: "Which planet has the largest storm in the solar system, the Great Red Spot?",
            answers: ["Saturn", "Neptune", "Jupiter"],
            correctAnswer: "Jupiter"
        },
        {
            question: "What element makes up most of the Sun?",
            answers: ["Helium", "Oxygen", "Hydrogen"],
            correctAnswer: "Hydrogen"
        },
        {
            question: "What is the term for a star that has collapsed in on itself, creating a singularity?",
            answers: ["Neutron star", "White dwarf", "Black hole"],
            correctAnswer: "Black hole"
        },
        {
            question: "What is the name of the first woman to go to space?",
            answers: ["Sally Ride", "Mae Jemison", "Valentina Tereshkova"],
            correctAnswer: "Valentina Tereshkova"
        },
        {
            question: "What was the first country to send a human into space?",
            answers: ["China", "United States", "Soviet Union"],
            correctAnswer: "Soviet Union"
        },
        {
            question: "What is the name of the space station that orbits Earth and is a collaboration between NASA, Roscosmos, and others?",
            answers: ["Space Shuttle Atlantis", "Hubble Space Telescope", "International Space Station (ISS)"],
            correctAnswer: "International Space Station (ISS)"
        },
        {
            question: "What is the name of the first space probe to reach interstellar space?",
            answers: ["New Horizons", "Voyager 1", "Parker Solar Probe"],
            correctAnswer: "Voyager 1"
        },
        {
            question: "What is the term for the region around a black hole from which nothing can escape?",
            answers: ["Singularity", "Event Horizon", "Accretion disk"],
            correctAnswer: "Event Horizon"
        },
        {
            question: "Which planet has a moon named Titan, which has lakes of liquid methane?",
            answers: ["Jupiter", "Uranus", "Saturn"],
            correctAnswer: "Saturn"
        },
        {
            question: "Which astronomer was the first to use a telescope to observe the night sky?",
            answers: ["Johannes Kepler", "Isaac Newton", "Galileo Galilei"],
            correctAnswer: "Galileo Galilei"
        },
        {
            question: "How long does it take light from the Sun to reach Earth?",
            answers: ["8 minutes", "1 hour", "24 minutes"],
            correctAnswer: "8 minutes"
        }
    ];
        // Shuffle the array of questions
        for (let i = allQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
        }
        
        return allQuestions;
    }

    initUI() {
                // Check if UI already exists, clean up if it does
                if (this.uiInitialized) {
                    this.removeUI();
                }
        console.log("We are initializing the UI");
        const canvas = this.game.ctx.canvas;
        const container = canvas.parentNode;

        // Create UI container to manage all UI elements
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'riddleGameUI';
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.pointerEvents = 'none'; // Allow clicks to pass through to canvas
        container.appendChild(this.uiContainer);

        // Create danger meter
        this.dangerMeter = document.createElement('div');
        this.dangerMeter.id = 'dangerMeter';
        this.dangerMeter.style.position = 'absolute';
        this.dangerMeter.style.top = '60px';
        this.dangerMeter.style.left = '20px';
        this.dangerMeter.style.width = '200px';
        this.dangerMeter.style.height = '20px';
        this.dangerMeter.style.border = '2px solid #30f2f2';
        this.dangerMeter.style.backgroundColor = '#000';
        this.uiContainer.appendChild(this.dangerMeter);

        this.dangerFill = document.createElement('div');
        this.dangerFill.style.width = '0%';
        this.dangerFill.style.height = '100%';
        this.dangerFill.style.backgroundColor = '#ff0000';
        this.dangerFill.style.transition = 'width 0.5s ease';
        this.dangerMeter.appendChild(this.dangerFill);

        // Create UI elements
        this.riddleDisplay = document.createElement('div');
        this.riddleDisplay.id = 'riddleDisplay';
        this.riddleDisplay.style.position = 'absolute';
        this.riddleDisplay.style.top = '100px';
        this.riddleDisplay.style.left = '0';
        this.riddleDisplay.style.width = '100%';
        this.riddleDisplay.style.textAlign = 'center';
        this.riddleDisplay.style.color = '#30f2f2';
        this.riddleDisplay.style.fontSize = '24px';
        this.riddleDisplay.style.marginBottom = '20px';
        this.riddleDisplay.style.fontFamily = 'monospace';
        this.riddleDisplay.style.textShadow = '0 0 10px #30f2f2';
        this.uiContainer.appendChild(this.riddleDisplay);

        this.answersContainer = document.createElement('div');
        this.answersContainer.id = 'answersContainer';
        this.answersContainer.style.position = 'absolute';
        this.answersContainer.style.top = '150px';
        this.answersContainer.style.left = '0';
        this.answersContainer.style.width = '100%';
        this.answersContainer.style.display = 'flex';
        this.answersContainer.style.justifyContent = 'center';
        this.answersContainer.style.gap = '10px';
        this.answersContainer.style.marginTop = '20px';
        this.answersContainer.style.pointerEvents = 'auto'; // Enable click events for answer buttons
        this.uiContainer.appendChild(this.answersContainer);

        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.id = 'scoreDisplay';
        this.scoreDisplay.style.position = 'absolute';
        this.scoreDisplay.style.top = '20px';
        this.scoreDisplay.style.left = '20px';
        this.scoreDisplay.style.color = '#30f2f2';
        this.scoreDisplay.style.fontSize = '24px';
        this.scoreDisplay.style.fontFamily = 'monospace';
        this.uiContainer.appendChild(this.scoreDisplay);

        this.timerDisplay = document.createElement('div');
        this.timerDisplay.id = 'timerDisplay';
        this.timerDisplay.style.position = 'absolute';
        this.timerDisplay.style.top = '20px';
        this.timerDisplay.style.right = '20px';
        this.timerDisplay.style.color = '#30f2f2';
        this.timerDisplay.style.fontSize = '24px';
        this.timerDisplay.style.fontFamily = 'monospace';
        this.timerDisplay.style.textShadow = '0 0 10px #30f2f2';
        this.uiContainer.appendChild(this.timerDisplay);

        this.gameStarted = true;
        this.lastTimestamp = performance.now();
        this.createAnswerButtons();
        this.uiInitialized = true;
    }

    createAnswerButtons() {
        // Clear existing buttons
        this.answersContainer.innerHTML = '';
        console.log("We are clearning the answer container" + this.answersContainer.innerHTML);
        
        
        this.currentQuestion.answers.forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.style.padding = '10px 20px';
            button.style.fontSize = '18px';
            button.style.backgroundColor = '#000';
            button.style.color = '#30f2f2';
            button.style.border = '2px solid #30f2f2';
            button.style.cursor = 'pointer';
            button.style.margin = '0 5px';
            button.style.fontFamily = 'monospace';
            button.style.pointerEvents = 'auto';

            button.onmouseover = () => {
                button.style.backgroundColor = '#30f2f2';
                button.style.color = '#000';
            };
            button.onmouseout = () => {
                button.style.backgroundColor = '#000';
                button.style.color = '#30f2f2';
            };

            button.onclick = (e) => {
                e.preventDefault(); // Prevent default click behavior
                this.handleAnswer(answer);
            };
            
            this.answersContainer.appendChild(button);
        });
        console.log("We created the answer buttons" + this.answersContainer.innerHTML);
    }

    handleAnswer(userAnswer) {
        if (this.gameOver) return;

        console.log("Current question answer: " + this.currentQuestion.answers);


        console.log(`Answer selected: ${userAnswer}`);

        if (userAnswer === this.currentQuestion.correctAnswer) {
            this.score++;
            console.log("Correct answer!");
            if (this.score >= 10) {                                       //SCORE TO WIN
                this.gameOver = true;
                this.removeUI();
                setTimeout(() => {
                    this.game.endMinigame("You've escaped the Xenomorph!");
                }, 100);
                return;
            }
        } else {
            this.wrongAnswers++;
            console.log("Wrong answer!");
            this.xenomorph.grow(); // Grow Xenomorph on wrong answer
            this.dangerFill.style.width = `${(this.wrongAnswers / 3) * 100}%`; // Update danger meter
        }

        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.questions.length || this.wrongAnswers >= 3) {
            this.gameOver = true;
            this.removeUI(); // Clear UI immediately
            // Add a small delay before ending minigame to ensure cleanup completes
            setTimeout(() => {
                if (this.wrongAnswers >= 3) {
                    this.game.endMinigame("Xenomorph killed you! Trial failed.");
                } else {
                    this.game.endMinigame(`Trial completed! you've escaped the Xenomorph! Score: ${this.score}`);
                }
            }, 100);
        } else {
            this.currentQuestion = this.questions[this.currentQuestionIndex];
            this.currentTime = this.questionTimer;
            this.lastTimestamp = performance.now();
            this.createAnswerButtons();
        }
    }

    removeUI() {
        // Remove the UI container and all child elements
        if (this.uiContainer && this.uiContainer.parentNode) {
            this.uiContainer.parentNode.removeChild(this.uiContainer);
            this.uiContainer = null;
        }
        if (this.answersContainer) {
            this.answersContainer.innerHTML = '';
        }

        // Reset UI initialization flag
        this.uiInitialized = false;
    }

    removeListeners() {
        // Clean up event listeners
        this.removeUI();
    }

    update() {
        if (!this.gameOver && this.gameStarted) {
            const currentTimestamp = performance.now();
            if (this.lastTimestamp === 0) {
                this.lastTimestamp = currentTimestamp;
            }

            const deltaTime = (currentTimestamp - this.lastTimestamp) / 1000;
            this.lastTimestamp = currentTimestamp;

            this.currentTime -= deltaTime;

            const timeLeft = Math.max(0, Math.ceil(this.currentTime));
            if (this.timerDisplay) {
                this.timerDisplay.textContent = `Time: ${timeLeft}s`;

                if (timeLeft <= 2.5) {
                    this.timerDisplay.style.color = '#ff0000';
                    this.timerDisplay.style.textShadow = '0 0 10px #ff0000';
                } else if (timeLeft <= 5.8) {
                    this.timerDisplay.style.color = '#ff9900';
                    this.timerDisplay.style.textShadow = '0 0 10px #ff9900';
                } else {
                    this.timerDisplay.style.color = '#30f2f2';
                    this.timerDisplay.style.textShadow = '0 0 10px #30f2f2';
                }
            }

            if (this.currentTime <= 0) {
                this.wrongAnswers++;
                this.xenomorph.grow();
                this.dangerFill.style.width = `${(this.wrongAnswers / 3) * 100}%`;
                this.currentQuestionIndex++;

                if (this.currentQuestionIndex < this.questions.length && this.wrongAnswers < 3) {
                    this.currentQuestion = this.questions[this.currentQuestionIndex];
                    this.currentTime = this.questionTimer;
                    this.createAnswerButtons();
                } else {
                    this.gameOver = true;
                    this.removeUI(); // Clear UI immediately
                    if (this.wrongAnswers >= 3) {
                        this.game.endMinigame("Xenomorph killed you! Trial failed.");
                    } else {
                        this.game.endMinigame(`Trial completed! you've escaped the Xenomorph! Score: ${this.score}`);
                    }
                }
            }

            if (this.riddleDisplay) {
                this.riddleDisplay.textContent = this.currentQuestion.question;
            }
            
            if (this.scoreDisplay) {
                this.scoreDisplay.textContent = `Score: ${this.score} | Wrong: ${this.wrongAnswers}`;
            }

            if (this.wrongAnswers >= 3 && !this.gameOver) {
                this.gameOver = true;
                this.removeUI(); // Clear UI immediately
                this.game.endMinigame("Xenomorph killed you! Trial failed.");
            }
            
            this.xenomorph.update();
        }
    }

    draw(ctx) {
        // Clear the canvas with a black background
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw Xenomorph
        this.xenomorph.draw(ctx);
        
        if (this.gameOver) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
}

export { RiddleGame };