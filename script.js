// Versioning for cache busting
const VERSION = "101";

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    console.log("Game Initialized - Version " + VERSION);
    createMockHand();
}

function createMockHand() {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = ''; // پاک کردن دستی

    // ایجاد ۱۰ کارت تست برای دیدن حالت دو ردیفی
    for (let i = 1; i <= 10; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerText = i;
        handContainer.appendChild(card);
    }
}
