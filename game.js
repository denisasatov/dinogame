// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const highScoreDisplay = document.getElementById('high-score-display');
const startOverlay = document.getElementById('start-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');
const aiMessageDisplay = document.getElementById('ai-message');
const retryBtn = document.getElementById('retry-btn');

// Constants
let CANVAS_WIDTH = 800;
let CANVAS_HEIGHT = 200;
const GRAVITY = 0.8;
const JUMP_FORCE = -14;
const INITIAL_SPEED = 5;
const SPEED_INCREMENT = 0.0007;

// Responsive canvas for mobile
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const gameArea = container ? container.querySelector('.relative') : null;
    if (gameArea) {
        const rect = gameArea.getBoundingClientRect();
        const newWidth = Math.floor(rect.width);
        const aspectRatio = 200 / 800;
        const newHeight = Math.floor(newWidth * aspectRatio);
        canvas.width = newWidth;
        canvas.height = newHeight;
        CANVAS_WIDTH = newWidth;
        CANVAS_HEIGHT = newHeight;
        dino.y = CANVAS_HEIGHT - dino.height;
    }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
    setTimeout(resizeCanvas, 100);
});

// State
let status = 'IDLE';
let score = 0;
let highScore = 0;
let speed = INITIAL_SPEED;
let frameCount = 0;
let obstacles = [];
let dino = {
    x: 50,
    y: 200 - 50,
    width: 40,
    height: 40,
    dy: 0,
    grounded: true,
    legFrame: 0
};

// Expose status for Telegram integration
window.gameStatus = status;
window.togglePause = togglePause;

// Theme switcher
const themeBtns = document.querySelectorAll('.theme-btn');
const root = document.documentElement;

// Get computed CSS variable value
function getCSSVariable(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
}

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('dino-theme', theme);
    
    // Update active state on buttons
    themeBtns.forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Redraw canvas with new colors
    if (status !== 'PLAYING') {
        draw();
    }
}

// Load saved theme or use default
const savedTheme = localStorage.getItem('dino-theme') || 'dark';
setTheme(savedTheme);

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        setTheme(theme);
    });
});

// Wise dino quotes
const dinoQuotes = [
    "Дорога важнее цели.",
    "Каждое падение — это начало нового прыжка.",
    "Препятствия делают нас сильнее.",
    "Главное — не сдаваться.",
    "Путь в тысячу миль начинается с одного шага.",
    "Ошибки — лучшие учителя.",
    "Терпение и труд всё перетрут.",
    "Не важно, как медленно ты идёшь.",
    "Падать — не значит проигрывать.",
    "Каждая попытка приближает к победе."
];

function getDinoWisdom() {
    return dinoQuotes[Math.floor(Math.random() * dinoQuotes.length)];
}

function resetGame() {
    score = 0;
    speed = INITIAL_SPEED;
    frameCount = 0;
    obstacles = [];
    dino.y = CANVAS_HEIGHT - dino.height;
    dino.dy = 0;
    dino.grounded = true;
    status = 'PLAYING';
    window.gameStatus = status;
    
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    scoreDisplay.textContent = "00000";
    requestAnimationFrame(gameLoop);
}

function handleGameOver() {
    status = 'GAME_OVER';
    window.gameStatus = status;
    gameOverOverlay.classList.remove('hidden');
    
    const finalScore = Math.floor(score);
    if (finalScore > highScore) {
        highScore = finalScore;
        highScoreDisplay.textContent = `HI ${highScore.toString().padStart(5, '0')}`;
    }

    // Haptic feedback for Telegram
    if (window.tg?.HapticFeedback) {
        window.tg.HapticFeedback.notificationOccurred('error');
    }

    const message = getDinoWisdom();
    aiMessageDisplay.textContent = message;
}

function update() {
    if (status !== 'PLAYING') return;

    if (!dino.grounded) {
        dino.dy += GRAVITY;
        dino.y += dino.dy;
    }
    if (dino.y > CANVAS_HEIGHT - dino.height) {
        dino.y = CANVAS_HEIGHT - dino.height;
        dino.dy = 0;
        dino.grounded = true;
    }

    frameCount++;
    if (frameCount % Math.floor(130 / (speed / 5)) === 0) {
        const type = Math.random() > 0.8 ? 'bird' : 'cactus';
        const h = type === 'cactus' ? 25 + Math.random() * 20 : 25;
        const y = type === 'cactus' ? CANVAS_HEIGHT - h : CANVAS_HEIGHT - 70 - Math.random() * 30;
        obstacles.push({ x: CANVAS_WIDTH, y, width: 20, height: h, type });
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= speed;
        if (
            dino.x + 12 < obs.x + obs.width - 4 &&
            dino.x + dino.width - 12 > obs.x + 4 &&
            dino.y + 10 < obs.y + obs.height - 4 &&
            dino.y + dino.height - 4 > obs.y + 4
        ) {
            handleGameOver();
            return;
        }
        if (obs.x + obs.width < 0) obstacles.splice(i, 1);
    }

    speed += SPEED_INCREMENT;
    score += 0.1;
    scoreDisplay.textContent = Math.floor(score).toString().padStart(5, '0');
    
    // Animate legs when on ground (slower animation)
    if (dino.grounded) {
        dino.legFrame += speed * 0.05;
    }
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw line
    ctx.strokeStyle = getCSSVariable('--line-color');
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 1);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 1);
    ctx.stroke();

    // Dino
    ctx.fillStyle = getCSSVariable('--dino-color');
    ctx.fillRect(dino.x + 5, dino.y + 15, 25, 20);
    ctx.fillRect(dino.x + 20, dino.y + 5, 18, 15);
    ctx.fillRect(dino.x + 30, dino.y + 8, 10, 8);
    ctx.beginPath();
    ctx.moveTo(dino.x + 5, dino.y + 20);
    ctx.lineTo(dino.x - 8, dino.y + 32);
    ctx.lineTo(dino.x + 5, dino.y + 35);
    ctx.fill();
    // Spikes
    ctx.fillStyle = getCSSVariable('--dino-spike');
    for(let i = 0; i < 3; i++) {
        ctx.beginPath();
        const sx = dino.x + 8 + (i * 7);
        const sy = dino.y + 15;
        ctx.moveTo(sx, sy); ctx.lineTo(sx + 3, sy - 5); ctx.lineTo(sx + 6, sy);
        ctx.fill();
    }
    // Legs animation
    ctx.fillStyle = getCSSVariable('--dino-color');
    const legOffset = dino.grounded ? Math.sin(dino.legFrame) * 3 : 4;
    if (dino.grounded) {
        // Running animation - legs move back and forth in opposition
        const sinVal = Math.sin(dino.legFrame);
        const cosVal = Math.cos(dino.legFrame);
        // Left leg lifts up and moves forward/back in opposition
        const leftLegLift = sinVal > 0 ? sinVal * 5 : 0;
        const leftLegSlide = -cosVal * 3; // inverted direction
        // Right leg lifts up (opposite phase) and moves opposite direction
        const rightLegLift = sinVal < 0 ? -sinVal * 5 : 0;
        const rightLegSlide = cosVal * 3; // inverted direction
        ctx.fillRect(dino.x + 10 + leftLegSlide, dino.y + 35 - leftLegLift, 6, 5);
        ctx.fillRect(dino.x + 22 + rightLegSlide, dino.y + 35 - rightLegLift, 6, 5);
    } else {
        // Jumping pose - legs spread (higher by 3px, visible)
        ctx.fillRect(dino.x + 7, dino.y + 32, 6, 5);
        ctx.fillRect(dino.x + 25, dino.y + 32, 6, 5);
    }
    ctx.fillStyle = getCSSVariable('--dino-eye');
    ctx.fillRect(dino.x + 32, dino.y + 8, 3, 3);

    // Obs
    obstacles.forEach(obs => {
        ctx.fillStyle = getCSSVariable(obs.type === 'cactus' ? '--cactus-color' : '--bird-color');
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

function gameLoop() {
    if (status !== 'PLAYING') return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function handleJump(e) {
    if (e) e.preventDefault();
    if (status === 'PLAYING' && dino.grounded) {
        dino.dy = JUMP_FORCE;
        dino.grounded = false;
    } else if (status === 'IDLE') {
        resetGame();
    }
}

// Listeners
window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && (status === 'PLAYING' || status === 'PAUSED')) {
        togglePause();
    } else if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        handleJump(e);
    }
});

function togglePause() {
    if (status === 'PLAYING') {
        status = 'PAUSED';
        window.gameStatus = status;
        pauseOverlay.classList.remove('hidden');
        if (window.tg?.HapticFeedback) {
            window.tg.HapticFeedback.impactOccurred('light');
        }
    } else if (status === 'PAUSED') {
        status = 'PLAYING';
        window.gameStatus = status;
        pauseOverlay.classList.add('hidden');
        requestAnimationFrame(gameLoop);
    }
}
canvas.addEventListener('mousedown', handleJump);
canvas.addEventListener('touchstart', handleJump);
startOverlay.addEventListener('mousedown', () => { if(status === 'IDLE') resetGame(); });
retryBtn.addEventListener('click', (e) => { e.stopPropagation(); resetGame(); });

draw();
