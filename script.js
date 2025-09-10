// Game State Management
class MultiplicationQuiz {
    constructor() {
        this.currentLevel = 1;
        this.currentStage = 'sequential'; // 'sequential' or 'mixed'
        this.currentQuestion = 0;
        this.questionsPerStage = 10;
        this.score = 0;
        this.timeLimit = 30; // seconds
        this.timer = null;
        this.timeRemaining = 0;
        this.totalTime = 0;
        this.gameStartTime = 0;
        this.soundEnabled = true;
        this.isGameActive = false;
        
        // Game elements
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.quizScreen = document.getElementById('quizScreen');
        this.resultsScreen = document.getElementById('resultsScreen');
        this.settingsModal = document.getElementById('settingsModal');
        
        // UI elements
        this.currentLevelDisplay = document.getElementById('currentLevel');
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.questionText = document.getElementById('questionText');
        this.answerInput = document.getElementById('answerInput');
        this.feedbackContainer = document.getElementById('feedbackContainer');
        
        // Current question data
        this.currentQuestionData = null;
        
        this.initializeEventListeners();
        this.loadSettings();
    }

    initializeEventListeners() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });

        // Submit button and Enter key
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.submitAnswer();
        });

        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
        });

        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('unlockBtn').addEventListener('click', () => {
            this.unlockSettings();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Close modal on overlay click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
    }

    startGame() {
        this.isGameActive = true;
        this.gameStartTime = Date.now();
        this.welcomeScreen.style.display = 'none';
        this.quizScreen.classList.add('active');
        this.generateQuestion();
        this.updateUI();
        this.startTimer();
        this.playSound('start');
    }

    generateQuestion() {
        let num1, num2;
        
        if (this.currentStage === 'sequential') {
            // Sequential questions for current level (e.g., 1x1, 1x2, 1x3, ...)
            num1 = this.currentLevel;
            num2 = (this.currentQuestion % 10) + 1;
        } else {
            // Mixed questions for current level
            num1 = this.currentLevel;
            num2 = Math.floor(Math.random() * 10) + 1;
        }

        this.currentQuestionData = {
            num1: num1,
            num2: num2,
            answer: num1 * num2
        };

        this.questionText.textContent = `${num1} × ${num2} = ?`;
        this.answerInput.value = '';
        this.answerInput.focus();
        this.clearFeedback();

        // Add question animation
        this.questionText.style.animation = 'none';
        setTimeout(() => {
            this.questionText.style.animation = 'questionAppear 0.5s ease-out';
        }, 10);
    }

    submitAnswer() {
        if (!this.isGameActive) return;

        const userAnswer = parseInt(this.answerInput.value);
        const correctAnswer = this.currentQuestionData.answer;

        if (userAnswer === correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
    }

    handleCorrectAnswer() {
        this.score += 10;
        this.currentQuestion++;
        this.showFeedback('Doğru! 🎉', 'correct');
        this.playSound('correct');
        this.createSparkleEffect();

        setTimeout(() => {
            if (this.currentQuestion >= this.questionsPerStage) {
                this.advanceLevel();
            } else {
                this.generateQuestion();
                this.startTimer();
            }
            this.updateUI();
        }, 1500);
    }

    handleIncorrectAnswer() {
        this.showFeedback(`Yanlış! Doğru cevap: ${this.currentQuestionData.answer} 😔`, 'incorrect');
        this.playSound('incorrect');
        
        setTimeout(() => {
            this.resetToBeginning();
        }, 2000);
    }

    advanceLevel() {
        if (this.currentStage === 'sequential') {
            // Move to mixed questions for same level
            this.currentStage = 'mixed';
            this.currentQuestion = 0;
            this.showFeedback(`${this.currentLevel}x tablosu tamamlandı! Şimdi karışık sorular... 🚀`, 'correct');
        } else {
            // Move to next level
            if (this.currentLevel >= 10) {
                this.endGame(true); // Game completed successfully
                return;
            }
            this.currentLevel++;
            this.currentStage = 'sequential';
            this.currentQuestion = 0;
            this.showFeedback(`Seviye atlandı! ${this.currentLevel}x tablosuna geçiliyor... 🎯`, 'correct');
        }

        setTimeout(() => {
            this.generateQuestion();
            this.startTimer();
            this.updateUI();
        }, 2000);
    }

    resetToBeginning() {
        this.currentLevel = 1;
        this.currentStage = 'sequential';
        this.currentQuestion = 0;
        this.score = 0;
        this.showFeedback('Başa dönülüyor... Tekrar dene! 💪', 'incorrect');
        
        setTimeout(() => {
            this.generateQuestion();
            this.startTimer();
            this.updateUI();
        }, 2000);
    }

    startTimer() {
        this.clearTimer();
        this.timeRemaining = this.timeLimit;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    handleTimeUp() {
        this.clearTimer();
        this.showFeedback(`Süre doldu! Doğru cevap: ${this.currentQuestionData.answer} ⏰`, 'incorrect');
        this.playSound('timeup');
        
        setTimeout(() => {
            this.resetToBeginning();
        }, 2000);
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = `${this.timeRemaining}s`;
        
        // Change color based on remaining time
        if (this.timeRemaining <= 5) {
            this.timerDisplay.style.color = '#ff4757';
            this.timerDisplay.style.animation = 'pulse 0.5s infinite';
        } else if (this.timeRemaining <= 10) {
            this.timerDisplay.style.color = '#ffa502';
            this.timerDisplay.style.animation = 'none';
        } else {
            this.timerDisplay.style.color = '#ffffff';
            this.timerDisplay.style.animation = 'none';
        }
    }

    updateUI() {
        // Update level display
        const stageText = this.currentStage === 'sequential' ? 'Sıralı' : 'Karışık';
        this.currentLevelDisplay.textContent = `${this.currentLevel}x Tablosu (${stageText})`;
        
        // Update score
        this.scoreDisplay.textContent = this.score;
        
        // Update progress bar
        const totalQuestions = this.questionsPerStage;
        const progress = (this.currentQuestion / totalQuestions) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `Soru ${this.currentQuestion + 1}/${totalQuestions}`;
    }

    showFeedback(message, type) {
        this.clearFeedback();
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `feedback-message feedback-${type}`;
        feedbackDiv.textContent = message;
        
        this.feedbackContainer.appendChild(feedbackDiv);
        
        // Auto-clear after 3 seconds
        setTimeout(() => {
            this.clearFeedback();
        }, 3000);
    }

    clearFeedback() {
        this.feedbackContainer.innerHTML = '';
    }

    createSparkleEffect() {
        const sparkleCount = 20;
        const container = document.querySelector('.question-card');
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.animationDelay = Math.random() * 1 + 's';
            
            container.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 2000);
        }
    }

    endGame(completed = false) {
        this.isGameActive = false;
        this.clearTimer();
        this.totalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        this.quizScreen.classList.remove('active');
        this.resultsScreen.classList.add('active');
        
        // Update results
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = `${this.currentLevel}x`;
        document.getElementById('totalTime').textContent = `${this.totalTime}s`;
        
        if (completed) {
            document.getElementById('resultsTitle').textContent = 'Tebrikler! Tüm Seviyeleri Tamamladın! 🏆';
            this.playSound('victory');
        } else {
            document.getElementById('resultsTitle').textContent = 'Oyun Bitti! 🎯';
            this.playSound('gameover');
        }
    }

    resetGame() {
        this.isGameActive = false;
        this.clearTimer();
        this.currentLevel = 1;
        this.currentStage = 'sequential';
        this.currentQuestion = 0;
        this.score = 0;
        this.totalTime = 0;
        
        this.quizScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');
        this.welcomeScreen.style.display = 'block';
        
        this.updateUI();
        this.clearFeedback();
    }

    // Settings Management
    openSettings() {
        this.settingsModal.classList.add('active');
        document.getElementById('passwordInput').value = '';
        document.getElementById('settingsSection').style.display = 'none';
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
    }

    unlockSettings() {
        const password = document.getElementById('passwordInput').value;
        if (password === '090909') {
            document.getElementById('settingsSection').style.display = 'block';
            document.getElementById('timeLimit').value = this.timeLimit;
            document.getElementById('soundEnabled').checked = this.soundEnabled;
            this.showFeedback('Ayarlar kilidi açıldı! 🔓', 'correct');
        } else {
            this.showFeedback('Yanlış şifre! 🔒', 'incorrect');
        }
    }

    saveSettings() {
        this.timeLimit = parseInt(document.getElementById('timeLimit').value);
        this.soundEnabled = document.getElementById('soundEnabled').checked;
        
        // Save to localStorage
        localStorage.setItem('quizSettings', JSON.stringify({
            timeLimit: this.timeLimit,
            soundEnabled: this.soundEnabled
        }));
        
        this.showFeedback('Ayarlar kaydedildi! ✅', 'correct');
        this.closeSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('quizSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.timeLimit = settings.timeLimit || 30;
            this.soundEnabled = settings.soundEnabled !== false;
        }
    }

    // Sound Effects (using Web Audio API for better performance)
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // Create audio context if not exists
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Generate different tones for different events
        const frequencies = {
            correct: [523.25, 659.25, 783.99], // C-E-G major chord
            incorrect: [220, 185, 165], // Lower, dissonant frequencies
            start: [440, 554.37, 659.25], // A-C#-E
            victory: [523.25, 659.25, 783.99, 1046.50], // C major with octave
            gameover: [220, 196, 174.61], // Descending minor
            timeup: [880, 440] // High-low warning
        };
        
        const freqs = frequencies[type] || [440];
        
        freqs.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.1, type === 'victory' ? 0.3 : 0.15);
            }, index * 100);
        });
    }

    playTone(frequency, duration, volume = 0.1) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Çarpım Tablosu Ustası - Oyun başlatılıyor...');
    
    // Create game instance
    window.multiplicationQuiz = new MultiplicationQuiz();
    
    // Add some visual enhancements
    createFloatingNumbers();
    
    // Performance optimization
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            preloadSounds();
        });
    }
    
    console.log('Oyun hazır! 🚀');
});

// Create floating numbers animation
function createFloatingNumbers() {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '×', '='];
    const container = document.querySelector('.floating-shapes');
    
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every interval
            const numberElement = document.createElement('div');
            numberElement.className = 'floating-number';
            numberElement.textContent = numbers[Math.floor(Math.random() * numbers.length)];
            numberElement.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 20 + 15}px;
                color: rgba(255, 255, 255, 0.1);
                font-weight: bold;
                left: ${Math.random() * 100}%;
                top: 100%;
                pointer-events: none;
                animation: floatUp 8s linear forwards;
                font-family: 'Orbitron', monospace;
            `;
            
            container.appendChild(numberElement);
            
            setTimeout(() => {
                numberElement.remove();
            }, 8000);
        }
    }, 2000);
}

// Add floating number animation CSS
const floatingNumberStyle = document.createElement('style');
floatingNumberStyle.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
        }
        50% {
            opacity: 0.3;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(floatingNumberStyle);

// Preload sound system
function preloadSounds() {
    if (window.multiplicationQuiz && window.multiplicationQuiz.soundEnabled) {
        // Initialize audio context on user interaction
        document.addEventListener('click', function initAudio() {
            if (!window.multiplicationQuiz.audioContext) {
                window.multiplicationQuiz.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initAudio);
        }, { once: true });
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (!window.multiplicationQuiz) return;
    
    switch(e.key) {
        case 'Escape':
            if (window.multiplicationQuiz.settingsModal.classList.contains('active')) {
                window.multiplicationQuiz.closeSettings();
            }
            break;
        case 'r':
        case 'R':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                window.multiplicationQuiz.resetGame();
            }
            break;
        case 's':
        case 'S':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                window.multiplicationQuiz.openSettings();
            }
            break;
    }
});

// Add visibility change handling
document.addEventListener('visibilitychange', function() {
    if (window.multiplicationQuiz && window.multiplicationQuiz.isGameActive) {
        if (document.hidden) {
            // Pause timer when tab is not visible
            window.multiplicationQuiz.clearTimer();
        } else {
            // Resume timer when tab becomes visible
            if (window.multiplicationQuiz.timeRemaining > 0) {
                window.multiplicationQuiz.startTimer();
            }
        }
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`Oyun yükleme süresi: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        }, 0);
    });
}