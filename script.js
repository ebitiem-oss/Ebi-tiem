const VERSION = "102";

document.addEventListener('DOMContentLoaded', () => {
    // نمایش لودینگ برای ۲ ثانیه و سپس شروع بازی
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
        
        initGame();
    }, 2000);
});

function initGame() {
    console.log("Game Started - Version " + VERSION);
    createPlayers(10); // تست با ۱۰ بازیکن برای دیدن میز و پروفایل‌ها
    createMockHand();
}

function createPlayers(count) {
    const area = document.getElementById('players-area');
    area.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const profile = document.createElement('div');
        profile.className = 'player-profile';
        area.appendChild(profile);
    }
}

function createMockHand() {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = i;
        handContainer.appendChild(card);
    }
}
