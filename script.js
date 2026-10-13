const VERSION = "103";

document.addEventListener('DOMContentLoaded', () => {
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
    // تست با ۵ بازیکن، هر کدام با ۷ کارت (مجموعاً ۳۵ کارت در بازی)
    createPlayers(5, 7); 
    createMockHand(15); // دست خود بازیکن: ۱۵ کارت
}

function createPlayers(count, cardsPerPlayer) {
    const area = document.getElementById('players-area');
    area.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'player-wrapper';

        const profile = document.createElement('div');
        profile.className = 'player-profile';

        const countLabel = document.createElement('div');
        countLabel.className = 'card-count';
        countLabel.innerText = cardsPerPlayer; // نمایش تعداد کارت‌ها

        wrapper.appendChild(profile);
        wrapper.appendChild(countLabel);
        area.appendChild(wrapper);
    }
}

function createMockHand(count) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = i;
        handContainer.appendChild(card);
    }
}
