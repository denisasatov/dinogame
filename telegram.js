// Telegram Web App integration
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    // Disable vertical bouncing
    tg.disableVerticalSwipes();

    // Set header color to match game
    tg.setHeaderColor('#0f172a');
    tg.setBackgroundColor('#0f172a');

    // Use Telegram theme if available
    if (tg.themeParams.bg_color) {
        const isDark = tg.themeParams.bg_color && (
            tg.themeParams.bg_color.startsWith('#0') ||
            tg.themeParams.bg_color.startsWith('#1') ||
            tg.themeParams.bg_color === 'black'
        );

        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('dino-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('dino-theme', 'light');
        }
    }

    // Haptic feedback on game over
    const originalHandleGameOver = window.handleGameOver;

    // BackButton handling - pause game
    tg.BackButton.onClick(() => {
        if (window.gameStatus === 'PLAYING' || window.gameStatus === 'PAUSED') {
            if (typeof window.togglePause === 'function') {
                window.togglePause();
            }
        }
    });

    // Show back button when game is active
    const observer = new MutationObserver(() => {
        const startOverlay = document.getElementById('start-overlay');
        if (startOverlay && startOverlay.classList.contains('hidden')) {
            tg.BackButton.show();
        } else {
            tg.BackButton.hide();
        }
    });

    const startOverlay = document.getElementById('start-overlay');
    if (startOverlay) {
        observer.observe(startOverlay, { attributes: true, attributeFilter: ['class'] });
    }
}

// Expose game status for Telegram integration
window.tg = tg;
