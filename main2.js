const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./xeno.png");

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
    canvas.style.border = "2px solid #30f2f2";

    gameEngine.init(ctx);

    gameEngine.xenomorph = new Xenomorph(gameEngine);
    gameEngine.addEntity(gameEngine.xenomorph);

    gameEngine.questions = [
        {
            question: "What is the capital of Mars?",
            answers: ["Ares City", "Olympus", "New Earth"],
            correctAnswer: "Ares City"
        },
        {
            question: "What is the largest moon of Saturn?",
            answers: ["Titan", "Rhea", "Iapetus"],
            correctAnswer: "Titan"
        },
        {
            question: "What is the nearest star to our solar system?",
            answers: ["Proxima Centauri", "Alpha Centauri", "Sirius"],
            correctAnswer: "Proxima Centauri"
        },
        {
            question: "Which spacecraft first landed humans on the Moon?",
            answers: ["Apollo 11", "Soyuz 1", "Gemini 3"],
            correctAnswer: "Apollo 11"
        },
        {
            question: "What is the name of SpaceX's first crewed spacecraft?",
            answers: ["Crew Dragon", "Starship", "Falcon"],
            correctAnswer: "Crew Dragon"
        },
        {
            question: "Which planet is known as the Morning Star?",
            answers: ["Venus", "Mars", "Mercury"],
            correctAnswer: "Venus"
        },
        {
            question: "What is the largest known dwarf planet in our solar system?",
            answers: ["Pluto", "Eris", "Ceres"],
            correctAnswer: "Pluto"
        }
    ];
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    gameEngine.questions = shuffleArray([...gameEngine.questions]);
    gameEngine.currentQuestionIndex = 0;
    gameEngine.currentQuestion = gameEngine.questions[gameEngine.currentQuestionIndex];
    gameEngine.score = 0;
    gameEngine.wrongAnswers = 0;
    gameEngine.gameOver = false;
    gameEngine.questionTimer = 5; //TIMERR
    gameEngine.currentTime = gameEngine.questionTimer;
    gameEngine.lastTimestamp = 0;

    const gameContainer = document.createElement('div');
    gameContainer.style.position = 'relative';
    gameContainer.style.width = '1024px';
    gameContainer.style.margin = '0 auto';
    canvas.parentNode.insertBefore(gameContainer, canvas);
    gameContainer.appendChild(canvas);

    // Create danger meter
    const dangerMeter = document.createElement('div');
    dangerMeter.id = 'dangerMeter';
    dangerMeter.style.position = 'absolute';
    dangerMeter.style.top = '60px';
    dangerMeter.style.left = '20px';
    dangerMeter.style.width = '200px';
    dangerMeter.style.height = '20px';
    dangerMeter.style.border = '2px solid #30f2f2';
    dangerMeter.style.backgroundColor = '#000';
    gameContainer.appendChild(dangerMeter);

    const dangerFill = document.createElement('div');
    dangerFill.style.width = '0%';
    dangerFill.style.height = '100%';
    dangerFill.style.backgroundColor = '#ff0000';
    dangerFill.style.transition = 'width 0.5s ease';
    dangerMeter.appendChild(dangerFill);


    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.bottom = '20px';
    uiContainer.style.left = '50%';
    uiContainer.style.transform = 'translateX(-50%)';
    uiContainer.style.width = '80%';
    uiContainer.style.textAlign = 'center';
    gameContainer.appendChild(uiContainer);

    const riddleDisplay = document.createElement('div');
    riddleDisplay.id = 'riddleDisplay';
    riddleDisplay.style.color = '#30f2f2';
    riddleDisplay.style.fontSize = '24px';
    riddleDisplay.style.marginBottom = '20px';
    riddleDisplay.style.fontFamily = 'monospace';
    riddleDisplay.style.textShadow = '0 0 10px #30f2f2';
    uiContainer.appendChild(riddleDisplay);

    const answersContainer = document.createElement('div');
    answersContainer.style.display = 'flex';
    answersContainer.style.justifyContent = 'center';
    answersContainer.style.gap = '10px';
    answersContainer.style.marginTop = '20px';
    uiContainer.appendChild(answersContainer);

    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'scoreDisplay';
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '20px';
    scoreDisplay.style.left = '20px';
    scoreDisplay.style.color = '#30f2f2';
    scoreDisplay.style.fontSize = '24px';
    scoreDisplay.style.fontFamily = 'monospace';
    gameContainer.appendChild(scoreDisplay);

    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'timerDisplay';
    timerDisplay.style.position = 'absolute';
    timerDisplay.style.top = '20px';
    timerDisplay.style.right = '20px';
    timerDisplay.style.color = '#30f2f2';
    timerDisplay.style.fontSize = '24px';
    timerDisplay.style.fontFamily = 'monospace';
    timerDisplay.style.textShadow = '0 0 10px #30f2f2';
    gameContainer.appendChild(timerDisplay);

    function createAnswerButtons() {
        answersContainer.innerHTML = '';
        gameEngine.currentQuestion.answers.forEach(answer => {
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

            button.onmouseover = () => {
                button.style.backgroundColor = '#30f2f2';
                button.style.color = '#000';
            };
            button.onmouseout = () => {
                button.style.backgroundColor = '#000';
                button.style.color = '#30f2f2';
            };

            button.onclick = () => handleAnswer(answer);
            answersContainer.appendChild(button);
        });
    }

    function handleAnswer(userAnswer) {
        if (gameEngine.gameOver) return;

        if (userAnswer === gameEngine.currentQuestion.correctAnswer) {
            gameEngine.score++;
        } else {
            gameEngine.wrongAnswers++;
            gameEngine.xenomorph.grow();
            // Update danger meter
            dangerFill.style.width = `${(gameEngine.wrongAnswers / 3) * 100}%`;
        }

        gameEngine.currentQuestionIndex++;
        if (gameEngine.currentQuestionIndex < gameEngine.questions.length) {
            gameEngine.currentQuestion = gameEngine.questions[gameEngine.currentQuestionIndex];
            gameEngine.currentTime = gameEngine.questionTimer;
            gameEngine.lastTimestamp = performance.now();
            createAnswerButtons();
        } else {
            gameEngine.gameOver = true;
        }
    }

    canvas.addEventListener('blur', () => {
        canvas.focus();
    });

    gameEngine.update = function() {
        GameEngine.prototype.update.call(this);

        if (!this.gameOver) {
            const currentTimestamp = performance.now();
            if (this.lastTimestamp === 0) {
                this.lastTimestamp = currentTimestamp;
            }

            const deltaTime = (currentTimestamp - this.lastTimestamp) / 1000;
            this.lastTimestamp = currentTimestamp;

            this.currentTime -= deltaTime;

            const timeLeft = Math.max(0, Math.ceil(this.currentTime));
            timerDisplay.textContent = `Time: ${timeLeft}s`;

            if (timeLeft <= 1.9) {
                timerDisplay.style.color = '#ff0000';
                timerDisplay.style.textShadow = '0 0 10px #ff0000';
            } else if (timeLeft <= 3.9) {
                timerDisplay.style.color = '#ff9900';
                timerDisplay.style.textShadow = '0 0 10px #ff9900';
            } else {
                timerDisplay.style.color = '#30f2f2';
                timerDisplay.style.textShadow = '0 0 10px #30f2f2';
            }

            if (this.currentTime <= 0) {
                this.wrongAnswers++;
                this.xenomorph.grow();
                dangerFill.style.width = `${(this.wrongAnswers / 3) * 100}%`;
                this.currentQuestionIndex++;

                if (this.currentQuestionIndex < this.questions.length) {
                    this.currentQuestion = this.questions[this.currentQuestionIndex];
                    this.currentTime = this.questionTimer;
                    createAnswerButtons();
                } else {
                    this.gameOver = true;
                }
            }

            riddleDisplay.textContent = this.currentQuestion.question;
            scoreDisplay.textContent = `Score: ${this.score} | Wrong: ${this.wrongAnswers}`;

            if (this.wrongAnswers >= 3) {
                this.gameOver = true;
            }
        } else {
            riddleDisplay.textContent = `Game Over! Final Score: ${this.score}`;
            answersContainer.style.display = 'none';
            timerDisplay.style.display = 'none';
            dangerMeter.style.display = 'none';
            ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    createAnswerButtons();
    gameEngine.start();
    canvas.focus();
});