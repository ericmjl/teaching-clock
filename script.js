/* ==========================================
   TEACHING CLOCK - JAVASCRIPT
   ========================================== */

// ==========================================
// DEV MODE - Set to true to unlock all levels
// ==========================================
const DEV_MODE = true;

// ==========================================
// INTERNATIONALIZATION (i18n)
// ==========================================
const strings = {
    en: {
        title: "Learn to Tell Time!",
        play: "Play",
        quiz: "Quiz",
        practice: "Practice",
        level: "Level:",
        levelHours: "Hours",
        levelHalf: "Half",
        levelQuarter: "Quarter",
        levelFive: "5-min",
        levelAny: "Any",
        whatTime: "What time is it?",
        setClockTo: "Set the clock to:",
        checkAnswer: "Check!",
        hint: "Hint 💡",
        correct: "Great job! 🎉",
        tryAgain: "Try again! 💪",
        streak: "Streak:",
        score: "Score:",
        best: "Best:",
        playInstruction: "Drag the clock hands to explore different times!",
        levelUnlocked: "Level Unlocked!",
        stayHere: "Stay Here",
        tryNewLevel: "Try New Level!",
        newLevelMessage: "You've unlocked a new level! Ready to try something harder?",
    },
    zh: {
        title: "学习看时钟！",
        play: "玩一玩",
        quiz: "问答",
        practice: "练习",
        level: "级别：",
        levelHours: "整点",
        levelHalf: "半点",
        levelQuarter: "刻钟",
        levelFive: "五分",
        levelAny: "任意",
        whatTime: "现在几点？",
        setClockTo: "把时钟调到：",
        checkAnswer: "检查！",
        hint: "提示 💡",
        correct: "太棒了！🎉",
        tryAgain: "再试一次！💪",
        streak: "连胜：",
        score: "分数：",
        best: "最佳：",
        playInstruction: "拖动时钟指针来探索不同的时间！",
        levelUnlocked: "新级别解锁！",
        stayHere: "留在这里",
        tryNewLevel: "试试新级别！",
        newLevelMessage: "你解锁了新级别！准备好挑战更难的了吗？",
    }
};

// Time words in English
const timeWordsEn = {
    hours: ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"],
    
    getTimeWords(hours, minutes, simple = false) {
        const h = hours % 12;
        const nextH = (h + 1) % 12;
        
        if (simple) {
            // Simple format for younger kids
            if (minutes === 0) return `${this.hours[h]} o'clock`;
            const minStr = minutes < 10 ? `oh ${this.numberToWords(minutes)}` : this.numberToWords(minutes);
            return `${this.hours[h]} ${minStr}`;
        }
        
        // Traditional clock reading format
        if (minutes === 0) return `${this.hours[h]} o'clock`;
        if (minutes === 15) return `quarter past ${this.hours[h]}`;
        if (minutes === 30) return `half past ${this.hours[h]}`;
        if (minutes === 45) return `quarter to ${this.hours[nextH]}`;
        
        if (minutes < 30) {
            return `${this.numberToWords(minutes)} past ${this.hours[h]}`;
        } else {
            return `${this.numberToWords(60 - minutes)} to ${this.hours[nextH]}`;
        }
    },
    
    numberToWords(n) {
        const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", 
                      "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", 
                      "seventeen", "eighteen", "nineteen"];
        const tens = ["", "", "twenty", "thirty", "forty", "fifty"];
        
        if (n < 20) return ones[n];
        const t = Math.floor(n / 10);
        const o = n % 10;
        return tens[t] + (o ? "-" + ones[o] : "");
    }
};

// Time words in Chinese
const timeWordsZh = {
    numbers: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
    
    getTimeWords(hours, minutes, simple = false) {
        const h = hours % 12 || 12;
        const nextH = (h % 12) + 1;
        
        if (simple) {
            // Simple format
            if (minutes === 0) return `${this.numbers[h]}点整`;
            if (minutes < 10) return `${this.numbers[h]}点零${this.numbers[minutes]}分`;
            return `${this.numbers[h]}点${this.minuteToWords(minutes)}分`;
        }
        
        // Traditional format
        if (minutes === 0) return `${this.numbers[h]}点整`;
        if (minutes === 15) return `${this.numbers[h]}点一刻`;
        if (minutes === 30) return `${this.numbers[h]}点半`;
        if (minutes === 45) return `差一刻${this.numbers[nextH]}点`;
        
        if (minutes < 10) {
            return `${this.numbers[h]}点零${this.numbers[minutes]}分`;
        } else if (minutes < 30) {
            return `${this.numbers[h]}点${this.minuteToWords(minutes)}分`;
        } else {
            return `差${this.minuteToWords(60 - minutes)}分${this.numbers[nextH]}点`;
        }
    },
    
    minuteToWords(n) {
        if (n <= 10) return this.numbers[n];
        if (n < 20) return `十${this.numbers[n - 10]}`;
        const t = Math.floor(n / 10);
        const o = n % 10;
        if (o === 0) return `${this.numbers[t]}十`;
        return `${this.numbers[t]}十${this.numbers[o]}`;
    }
};

// ==========================================
// APPLICATION STATE
// ==========================================
const state = {
    currentTime: { hours: 12, minutes: 0 },
    targetTime: { hours: 0, minutes: 0 },
    mode: 'play', // 'play', 'quiz', 'practice'
    level: 1,
    language: 'en',
    theme: 'rainbow',
    dragging: null, // 'hour' or 'minute'
    
    // Stats
    currentStreak: 0,
    totalCorrect: 0,
    longestStreak: 0,
    
    // Level progress
    levelProgress: {
        1: { correct: 0, attempts: 0, stars: 0, unlocked: true },
        2: { correct: 0, attempts: 0, stars: 0, unlocked: true },
        3: { correct: 0, attempts: 0, stars: 0, unlocked: true },
        4: { correct: 0, attempts: 0, stars: 0, unlocked: true },
        5: { correct: 0, attempts: 0, stars: 0, unlocked: true },
    }
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const elements = {
    clock: null,
    hourHand: null,
    minuteHand: null,
    hourHandDrag: null,
    minuteHandDrag: null,
    digitalTime: null,
    timeWords: null,
    timeWordsAlt: null,
    quizOptions: null,
    targetTimeEl: null,
    targetTimeWords: null,
    feedback: null,
    feedbackText: null,
    statStreak: null,
    statScore: null,
    statBest: null,
    celebrationContainer: null,
    unlockModal: null,
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
    // Cache DOM elements
    elements.clock = document.getElementById('clock');
    elements.hourHand = document.getElementById('hour-hand');
    elements.minuteHand = document.getElementById('minute-hand');
    elements.hourHandDrag = document.getElementById('hour-hand-drag');
    elements.minuteHandDrag = document.getElementById('minute-hand-drag');
    elements.digitalTime = document.getElementById('digital-time');
    elements.timeWords = document.getElementById('time-words');
    elements.timeWordsAlt = document.getElementById('time-words-alt');
    elements.quizOptions = document.getElementById('quiz-options');
    elements.targetTimeEl = document.getElementById('target-time');
    elements.targetTimeWords = document.getElementById('target-time-words');
    elements.feedback = document.getElementById('feedback');
    elements.feedbackText = document.getElementById('feedback-text');
    elements.statStreak = document.getElementById('stat-streak');
    elements.statScore = document.getElementById('stat-score');
    elements.statBest = document.getElementById('stat-best');
    elements.celebrationContainer = document.getElementById('celebration-container');
    elements.unlockModal = document.getElementById('unlock-modal');
    
    // Generate clock markers
    generateClockMarkers();
    
    // Load saved state
    loadState();
    
    // Set up event listeners
    setupEventListeners();
    
    // Apply initial state
    applyTheme(state.theme);
    applyLanguage(state.language);
    setMode(state.mode);
    setLevel(state.level);
    updateClockDisplay();
    updateStats();
    updateLevelButtons();
}

function generateClockMarkers() {
    const hourMarkersGroup = document.getElementById('hour-markers');
    const minuteMarkersGroup = document.getElementById('minute-markers');
    
    // Generate minute markers
    for (let i = 0; i < 60; i++) {
        if (i % 5 !== 0) { // Skip hour positions
            const angle = (i * 6 - 90) * (Math.PI / 180);
            const x1 = 100 + 82 * Math.cos(angle);
            const y1 = 100 + 82 * Math.sin(angle);
            const x2 = 100 + 86 * Math.cos(angle);
            const y2 = 100 + 86 * Math.sin(angle);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('class', 'minute-marker');
            minuteMarkersGroup.appendChild(line);
        }
    }
    
    // Generate hour markers and numbers
    for (let i = 1; i <= 12; i++) {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        
        // Hour marker line
        const x1 = 100 + 78 * Math.cos(angle);
        const y1 = 100 + 78 * Math.sin(angle);
        const x2 = 100 + 86 * Math.cos(angle);
        const y2 = 100 + 86 * Math.sin(angle);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'hour-marker-line');
        hourMarkersGroup.appendChild(line);
        
        // Hour number
        const numX = 100 + 68 * Math.cos(angle);
        const numY = 100 + 68 * Math.sin(angle);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', numX);
        text.setAttribute('y', numY);
        text.setAttribute('class', 'hour-number');
        text.textContent = i;
        hourMarkersGroup.appendChild(text);
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Language toggle
    document.getElementById('btn-en').addEventListener('click', () => applyLanguage('en'));
    document.getElementById('btn-zh').addEventListener('click', () => applyLanguage('zh'));
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });
    
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    
    // Level buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const level = parseInt(btn.dataset.level);
            if (state.levelProgress[level].unlocked) {
                setLevel(level);
            }
        });
    });
    
    // Clock hand dragging
    setupClockDragging();
    
    // Practice mode buttons
    document.getElementById('btn-check').addEventListener('click', checkPracticeAnswer);
    document.getElementById('btn-hint').addEventListener('click', showHint);
    
    // Modal buttons
    document.getElementById('btn-stay').addEventListener('click', () => {
        elements.unlockModal.classList.add('hidden');
    });
    document.getElementById('btn-try-new').addEventListener('click', () => {
        elements.unlockModal.classList.add('hidden');
        setLevel(state.level + 1);
    });
}

function setupClockDragging() {
    const svg = elements.clock;
    
    // Track continuous rotation for smooth hour hand movement
    let totalMinuteRotation = 0; // Tracks total rotation including multiple revolutions
    let lastAngle = 0;
    
    // Helper to get angle and distance from center
    function getPointerInfo(e) {
        const rect = svg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const angleDeg = (angle * 180 / Math.PI + 90 + 360) % 360;
        
        // Normalize distance relative to clock size
        const clockRadius = rect.width / 2;
        const normalizedDistance = distance / clockRadius;
        
        return { angleDeg, normalizedDistance };
    }
    
    // Determine which hand to drag based on click position
    function determineHand(e) {
        const { normalizedDistance } = getPointerInfo(e);
        
        // Hour hand is shorter (ends around 50% from center)
        // Minute hand is longer (ends around 75% from center)
        // If click is closer to center, drag hour hand; otherwise minute hand
        // Threshold at ~55% of radius
        if (normalizedDistance < 0.55) {
            return 'hour';
        } else {
            return 'minute';
        }
    }
    
    // Start drag - determine which hand based on distance from center
    function startDrag(e) {
        e.preventDefault();
        const hand = determineHand(e);
        state.dragging = hand;
        document.body.style.cursor = 'grabbing';
        
        // Initialize rotation tracking for smooth movement
        if (hand === 'minute') {
            const { angleDeg } = getPointerInfo(e);
            lastAngle = angleDeg;
            // Initialize total rotation based on current time
            totalMinuteRotation = state.currentTime.minutes * 6 + ((state.currentTime.hours % 12) * 360);
        }
        
        // Add visual feedback - highlight the hand being dragged
        if (hand === 'minute') {
            elements.minuteHand.style.strokeWidth = '6';
        } else {
            elements.hourHand.style.strokeWidth = '8';
        }
    }
    
    // Handle drag - smooth movement following the mouse
    function handleDrag(e) {
        if (!state.dragging) return;
        e.preventDefault();
        
        const { angleDeg } = getPointerInfo(e);
        
        if (state.dragging === 'minute') {
            // Calculate the delta angle (how much we moved)
            let deltaAngle = angleDeg - lastAngle;
            
            // Handle wraparound: if we crossed the 0/360 boundary
            if (deltaAngle > 180) {
                deltaAngle -= 360;  // We went counter-clockwise across 0
            } else if (deltaAngle < -180) {
                deltaAngle += 360;  // We went clockwise across 0
            }
            
            // Update total rotation
            totalMinuteRotation += deltaAngle;
            lastAngle = angleDeg;
            
            // Calculate hours and minutes from total rotation
            // Every 360 degrees = 1 hour, every 6 degrees = 1 minute
            const totalMinutes = totalMinuteRotation / 6;
            
            // Handle negative values properly for hours (wrap around 12-hour clock)
            let hours = Math.floor(totalMinutes / 60) % 12;
            hours = ((hours % 12) + 12) % 12; // Ensure positive 0-11
            hours = hours || 12; // Convert 0 to 12
            
            const minutes = ((totalMinutes % 60) + 60) % 60; // Handle negative
            
            state.currentTime.hours = hours;
            
            // Update display with smooth visual angle
            updateClockDisplaySmooth(angleDeg, minutes, hours);
        } else if (state.dragging === 'hour') {
            // Hour hand moves in discrete hour steps but smoothly between them
            let hours = Math.round(angleDeg / 30) % 12 || 12;
            state.currentTime.hours = hours;
            updateClockDisplay();
        }
    }
    
    // End drag - snap to valid position
    function endDrag() {
        if (!state.dragging) return;
        
        if (state.dragging === 'minute') {
            // Snap to valid minute based on level
            const totalMinutes = totalMinuteRotation / 6;
            const rawMinutes = ((totalMinutes % 60) + 60) % 60;
            state.currentTime.minutes = snapMinutes(Math.round(rawMinutes));
            
            // Handle negative values properly for hours
            let hours = Math.floor(totalMinutes / 60) % 12;
            hours = ((hours % 12) + 12) % 12;
            hours = hours || 12;
            state.currentTime.hours = hours;
            
            elements.minuteHand.style.strokeWidth = '';
        } else if (state.dragging === 'hour') {
            elements.hourHand.style.strokeWidth = '';
        }
        
        state.dragging = null;
        document.body.style.cursor = '';
        delete state.currentTime.rawMinutes;
        
        // Final update with snapped position
        updateClockDisplay();
    }
    
    // Mouse events - use the whole clock face as drag area
    svg.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events
    svg.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

// Update clock display with smooth minute angle (for dragging)
function updateClockDisplaySmooth(minuteAngleDeg, minutes, hours) {
    // Hour angle: base hour position + fraction based on minutes
    const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30;
    
    // Update hand positions smoothly
    elements.minuteHand.style.transform = `rotate(${minuteAngleDeg}deg)`;
    elements.hourHand.style.transform = `rotate(${hourAngle}deg)`;
    elements.minuteHandDrag.style.transform = `rotate(${minuteAngleDeg}deg)`;
    elements.hourHandDrag.style.transform = `rotate(${hourAngle}deg)`;
    
    // Update digital time
    const displayMinutesNum = Math.round(minutes) % 60;
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = displayMinutesNum.toString().padStart(2, '0');
    elements.digitalTime.textContent = `${displayHour}:${displayMinutes}`;
    
    // Update time in words
    const useSimple = state.level <= 2;
    const enWords = timeWordsEn.getTimeWords(hours, displayMinutesNum, useSimple);
    const zhWords = timeWordsZh.getTimeWords(hours, displayMinutesNum, useSimple);
    
    if (state.language === 'en') {
        elements.timeWords.textContent = enWords;
        elements.timeWordsAlt.textContent = zhWords;
    } else {
        elements.timeWords.textContent = zhWords;
        elements.timeWordsAlt.textContent = enWords;
    }
}

function snapMinutes(minutes) {
    // Snap based on current level
    switch (state.level) {
        case 1: // Hours only
            return 0;
        case 2: // Half hours
            return minutes < 15 || minutes >= 45 ? 0 : 30;
        case 3: // Quarter hours
            if (minutes < 8) return 0;
            if (minutes < 23) return 15;
            if (minutes < 38) return 30;
            if (minutes < 53) return 45;
            return 0;
        case 4: // 5-minute intervals
            return Math.round(minutes / 5) * 5 % 60;
        case 5: // Any minute
        default:
            return minutes;
    }
}

// ==========================================
// CLOCK DISPLAY
// ==========================================
function updateClockDisplay() {
    const { hours, minutes } = state.currentTime;
    
    // Update hand positions
    const minuteAngle = minutes * 6;
    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    
    elements.minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    elements.hourHand.style.transform = `rotate(${hourAngle}deg)`;
    elements.minuteHandDrag.style.transform = `rotate(${minuteAngle}deg)`;
    elements.hourHandDrag.style.transform = `rotate(${hourAngle}deg)`;
    
    // Update digital time
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    elements.digitalTime.textContent = `${displayHour}:${displayMinutes}`;
    
    // Update time in words
    const useSimple = state.level <= 2;
    const enWords = timeWordsEn.getTimeWords(hours, minutes, useSimple);
    const zhWords = timeWordsZh.getTimeWords(hours, minutes, useSimple);
    
    if (state.language === 'en') {
        elements.timeWords.textContent = enWords;
        elements.timeWordsAlt.textContent = zhWords;
    } else {
        elements.timeWords.textContent = zhWords;
        elements.timeWordsAlt.textContent = enWords;
    }
}

function setClockTime(hours, minutes) {
    state.currentTime.hours = hours;
    state.currentTime.minutes = minutes;
    updateClockDisplay();
}

// ==========================================
// MODES
// ==========================================
function setMode(mode) {
    state.mode = mode;
    
    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Update content visibility
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${mode}-content`).classList.add('active');
    
    // Hide/show time display based on mode (hide in quiz to make it a challenge)
    const timeDisplay = document.querySelector('.time-display');
    if (mode === 'quiz') {
        timeDisplay.classList.add('hidden');
    } else {
        timeDisplay.classList.remove('hidden');
    }
    
    // Hide feedback
    hideFeedback();
    
    // Initialize mode
    if (mode === 'quiz') {
        generateQuizQuestion();
    } else if (mode === 'practice') {
        generatePracticeChallenge();
    }
    
    saveState();
}

// ==========================================
// QUIZ MODE
// ==========================================
function generateQuizQuestion() {
    // Generate random time based on level
    const { hours, minutes } = generateRandomTime();
    setClockTime(hours, minutes);
    
    // Generate options (1 correct + 3 wrong)
    const options = [formatTimeOption(hours, minutes)];
    
    while (options.length < 4) {
        const wrong = generateWrongAnswer(hours, minutes);
        const wrongStr = formatTimeOption(wrong.hours, wrong.minutes);
        if (!options.includes(wrongStr)) {
            options.push(wrongStr);
        }
    }
    
    // Shuffle options
    shuffleArray(options);
    
    // Render options
    elements.quizOptions.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => handleQuizAnswer(btn, opt, formatTimeOption(hours, minutes)));
        elements.quizOptions.appendChild(btn);
    });
}

function handleQuizAnswer(button, selected, correct) {
    const isCorrect = selected === correct;
    
    // Disable all buttons
    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.disabled = true;
        if (formatTimeOption(state.currentTime.hours, state.currentTime.minutes) === btn.textContent) {
            btn.classList.add('correct');
        }
    });
    
    if (isCorrect) {
        button.classList.add('correct');
        handleCorrectAnswer();
    } else {
        button.classList.add('incorrect');
        handleWrongAnswer();
    }
    
    // Generate next question after delay
    setTimeout(() => {
        hideFeedback();
        generateQuizQuestion();
    }, 1500);
}

function formatTimeOption(hours, minutes) {
    const h = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${h}:${minutes.toString().padStart(2, '0')}`;
}

function generateWrongAnswer(correctHours, correctMinutes) {
    const variations = [];
    
    // Different hour, same minutes
    let wrongHour = (correctHours + Math.floor(Math.random() * 3) + 1) % 12 || 12;
    variations.push({ hours: wrongHour, minutes: correctMinutes });
    
    // Same hour, different minutes (based on level)
    let wrongMinutes = getWrongMinutes(correctMinutes);
    variations.push({ hours: correctHours, minutes: wrongMinutes });
    
    // Both different
    wrongHour = (correctHours + Math.floor(Math.random() * 5) + 1) % 12 || 12;
    wrongMinutes = getWrongMinutes(correctMinutes);
    variations.push({ hours: wrongHour, minutes: wrongMinutes });
    
    return variations[Math.floor(Math.random() * variations.length)];
}

function getWrongMinutes(correctMinutes) {
    const validMinutes = getValidMinutesForLevel();
    const wrongOptions = validMinutes.filter(m => m !== correctMinutes);
    return wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
}

function getValidMinutesForLevel() {
    switch (state.level) {
        case 1: return [0];
        case 2: return [0, 30];
        case 3: return [0, 15, 30, 45];
        case 4: return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
        case 5: return Array.from({ length: 60 }, (_, i) => i);
        default: return [0];
    }
}

// ==========================================
// PRACTICE MODE
// ==========================================
function generatePracticeChallenge() {
    const { hours, minutes } = generateRandomTime();
    state.targetTime = { hours, minutes };
    
    // Reset clock to 12:00
    setClockTime(12, 0);
    
    // Display target
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    elements.targetTimeEl.textContent = `${displayHour}:${minutes.toString().padStart(2, '0')}`;
    
    // Display target in words
    const useSimple = state.level <= 2;
    const words = state.language === 'en' 
        ? timeWordsEn.getTimeWords(hours, minutes, useSimple)
        : timeWordsZh.getTimeWords(hours, minutes, useSimple);
    elements.targetTimeWords.textContent = `(${words})`;
}

function checkPracticeAnswer() {
    const { hours, minutes } = state.currentTime;
    const target = state.targetTime;
    
    // Normalize hours for comparison (handle 12/0)
    const currentH = hours % 12;
    const targetH = target.hours % 12;
    
    if (currentH === targetH && minutes === target.minutes) {
        handleCorrectAnswer();
        setTimeout(() => {
            hideFeedback();
            generatePracticeChallenge();
        }, 1500);
    } else {
        handleWrongAnswer();
    }
}

function showHint() {
    const { hours, minutes } = state.targetTime;
    
    // Animate hands to correct position briefly
    const minuteAngle = minutes * 6;
    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    
    elements.minuteHand.classList.add('hint');
    elements.hourHand.classList.add('hint');
    
    // Show correct position temporarily
    const origMinute = elements.minuteHand.style.transform;
    const origHour = elements.hourHand.style.transform;
    
    elements.minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    elements.hourHand.style.transform = `rotate(${hourAngle}deg)`;
    
    setTimeout(() => {
        elements.minuteHand.style.transform = origMinute;
        elements.hourHand.style.transform = origHour;
        elements.minuteHand.classList.remove('hint');
        elements.hourHand.classList.remove('hint');
    }, 1000);
}

// ==========================================
// ANSWER HANDLING
// ==========================================
function handleCorrectAnswer() {
    state.currentStreak++;
    state.totalCorrect++;
    state.levelProgress[state.level].correct++;
    state.levelProgress[state.level].attempts++;
    
    if (state.currentStreak > state.longestStreak) {
        state.longestStreak = state.currentStreak;
    }
    
    showFeedback(true);
    updateStats();
    triggerCelebration();
    checkLevelProgress();
    saveState();
}

function handleWrongAnswer() {
    state.currentStreak = 0;
    state.levelProgress[state.level].attempts++;
    
    showFeedback(false);
    updateStats();
    saveState();
}

function showFeedback(success) {
    const text = success 
        ? strings[state.language].correct 
        : strings[state.language].tryAgain;
    
    elements.feedbackText.textContent = text;
    elements.feedback.classList.remove('hidden', 'success', 'error');
    elements.feedback.classList.add(success ? 'success' : 'error');
}

function hideFeedback() {
    elements.feedback.classList.add('hidden');
}

// ==========================================
// LEVEL PROGRESSION
// ==========================================
function setLevel(level) {
    if (!state.levelProgress[level].unlocked) return;
    
    state.level = level;
    
    // Update level buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
    });
    
    // Reset for new level if in quiz/practice mode
    if (state.mode === 'quiz') {
        generateQuizQuestion();
    } else if (state.mode === 'practice') {
        generatePracticeChallenge();
    }
    
    // Update clock snap behavior
    const { hours, minutes } = state.currentTime;
    state.currentTime.minutes = snapMinutes(minutes);
    updateClockDisplay();
    
    saveState();
}

function updateLevelButtons() {
    document.querySelectorAll('.level-btn').forEach(btn => {
        const level = parseInt(btn.dataset.level);
        const progress = state.levelProgress[level];
        const starsEl = btn.querySelector('.level-stars');
        
        if (progress.unlocked) {
            btn.classList.remove('locked');
            // Show stars based on progress
            const stars = calculateStars(progress);
            starsEl.textContent = '⭐'.repeat(Math.max(1, stars));
        } else {
            btn.classList.add('locked');
            starsEl.textContent = '🔒';
        }
    });
}

function calculateStars(progress) {
    if (progress.correct >= 15 && progress.correct / progress.attempts >= 0.9) return 3;
    if (progress.correct >= 10 && progress.correct / progress.attempts >= 0.8) return 2;
    if (progress.correct >= 5) return 1;
    return 0;
}

function checkLevelProgress() {
    const progress = state.levelProgress[state.level];
    const stars = calculateStars(progress);
    
    // Check if next level should be unlocked
    if (stars >= 1 && state.level < 5) {
        const nextLevel = state.level + 1;
        if (!state.levelProgress[nextLevel].unlocked) {
            state.levelProgress[nextLevel].unlocked = true;
            updateLevelButtons();
            showUnlockModal(nextLevel);
        }
    }
    
    updateLevelButtons();
}

function showUnlockModal(level) {
    const levelNames = {
        2: state.language === 'en' ? 'Half Hours' : '半点',
        3: state.language === 'en' ? 'Quarter Hours' : '刻钟',
        4: state.language === 'en' ? '5-Minute Intervals' : '五分钟',
        5: state.language === 'en' ? 'Any Minute' : '任意分钟',
    };
    
    document.getElementById('unlock-message').textContent = 
        `${strings[state.language].newLevelMessage} (${levelNames[level]})`;
    
    elements.unlockModal.classList.remove('hidden');
}

// ==========================================
// UTILITIES
// ==========================================
function generateRandomTime() {
    const validMinutes = getValidMinutesForLevel();
    const hours = Math.floor(Math.random() * 12) + 1;
    const minutes = validMinutes[Math.floor(Math.random() * validMinutes.length)];
    return { hours, minutes };
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateStats() {
    elements.statStreak.textContent = state.currentStreak;
    elements.statScore.textContent = state.totalCorrect;
    elements.statBest.textContent = state.longestStreak;
}

// ==========================================
// THEMES
// ==========================================
function applyTheme(theme) {
    state.theme = theme;
    document.body.dataset.theme = theme;
    
    // Update theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    saveState();
}

// ==========================================
// LANGUAGE
// ==========================================
function applyLanguage(lang) {
    state.language = lang;
    
    // Update language buttons
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-zh').classList.toggle('active', lang === 'zh');
    
    // Update all translatable elements
    document.getElementById('app-title').textContent = strings[lang].title;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (strings[lang][key]) {
            el.textContent = strings[lang][key];
        }
    });
    
    // Update time words display
    updateClockDisplay();
    
    // Update practice target if in practice mode
    if (state.mode === 'practice' && state.targetTime.hours) {
        const useSimple = state.level <= 2;
        const words = lang === 'en'
            ? timeWordsEn.getTimeWords(state.targetTime.hours, state.targetTime.minutes, useSimple)
            : timeWordsZh.getTimeWords(state.targetTime.hours, state.targetTime.minutes, useSimple);
        elements.targetTimeWords.textContent = `(${words})`;
    }
    
    saveState();
}

// ==========================================
// CELEBRATION EFFECTS
// ==========================================
function triggerCelebration() {
    const container = elements.celebrationContainer;
    
    // Create confetti
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createConfetti(container);
        }, i * 30);
    }
    
    // Create stars
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            createStar(container);
        }, i * 50);
    }
}

function createConfetti(container) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // Random position
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    
    // Random color from theme
    const colors = getComputedStyle(document.body).getPropertyValue('--celebration-colors').split(',');
    const color = colors[Math.floor(Math.random() * colors.length)].trim();
    confetti.style.backgroundColor = color;
    
    // Random shape
    if (Math.random() > 0.5) {
        confetti.style.borderRadius = '50%';
    }
    
    // Random animation duration
    confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
    
    container.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => {
        confetti.remove();
    }, 3000);
}

function createStar(container) {
    const star = document.createElement('div');
    star.className = 'star-particle';
    star.textContent = getThemeCelebrationEmoji();
    
    // Random position
    star.style.left = (Math.random() * 80 + 10) + '%';
    star.style.top = '-20px';
    
    // Random animation duration
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    
    container.appendChild(star);
    
    // Remove after animation
    setTimeout(() => {
        star.remove();
    }, 4000);
}

function getThemeCelebrationEmoji() {
    const themeEmojis = {
        rainbow: ['⭐', '🌟', '✨', '💫', '🎉'],
        space: ['🚀', '⭐', '🌟', '🛸', '✨'],
        ocean: ['🐠', '🐟', '🐙', '🦀', '🫧'],
        garden: ['🦋', '🌸', '🌺', '🐝', '🌼'],
        safari: ['🐾', '🦁', '🐘', '🦒', '🌴'],
    };
    
    const emojis = themeEmojis[state.theme] || themeEmojis.rainbow;
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// ==========================================
// STATE PERSISTENCE
// ==========================================
function saveState() {
    const saveData = {
        settings: {
            theme: state.theme,
            language: state.language,
            level: state.level,
        },
        progress: state.levelProgress,
        stats: {
            totalCorrect: state.totalCorrect,
            currentStreak: state.currentStreak,
            longestStreak: state.longestStreak,
            lastPlayed: new Date().toISOString().split('T')[0],
        }
    };
    
    try {
        localStorage.setItem('teachingClock', JSON.stringify(saveData));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem('teachingClock');
        if (!saved) return;
        
        const data = JSON.parse(saved);
        
        // Restore settings
        if (data.settings) {
            state.theme = data.settings.theme || 'rainbow';
            state.language = data.settings.language || 'en';
            state.level = data.settings.level || 1;
        }
        
        // Restore progress
        if (data.progress) {
            Object.keys(data.progress).forEach(level => {
                if (state.levelProgress[level]) {
                    state.levelProgress[level] = { ...state.levelProgress[level], ...data.progress[level] };
                }
            });
        }
        
        // Restore stats
        if (data.stats) {
            state.totalCorrect = data.stats.totalCorrect || 0;
            state.longestStreak = data.stats.longestStreak || 0;
            // Don't restore currentStreak - start fresh each session
        }
        
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
    
    // DEV MODE: Force unlock all levels
    if (DEV_MODE) {
        Object.keys(state.levelProgress).forEach(level => {
            state.levelProgress[level].unlocked = true;
        });
    }
}

// ==========================================
// START APP
// ==========================================
document.addEventListener('DOMContentLoaded', init);
