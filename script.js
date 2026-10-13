const VERSION = "104";

// ۱. تعریف رنگ‌ها و مقادیر کارت‌های اونو
const COLORS = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['+2', 'Skip', 'Reverse', 'Wild', 'Wild +4', '1', '2', '3', '4', '5', '6', '7', '8'];

// ساخت لیست کامل کارت‌ها (مثال برای ساخت ساختار)
let deck = [];

function createDeck() {
    deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(value => {
            deck.push({ color: color, value: value });
        });
    });
    // اضافه کردن کارت‌های Wild (بدون رنگ مشخص)
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'Wild' });
        deck.push({ color: 'wild', value: 'Wild +4' });
    }
    // مخلوط کردن کارت‌ها
    deck.sort(() => Math.random() - 0.5);
}

// ۲. مدیریت وضعیت بازی
let gameState = {
    players: [],      // لیست بازیکنان
    currentPlayer: 0, // شماره بازیکن فعلی
    discardPile: [], // کارت‌هایی که دور ریخته شده‌اند
    playerHands: []   // کارت‌های در دست هر بازیکن
};

// ۳. شروع بازی
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
        
        startNewGame();
    }, 2000);
});

function startNewGame() {
    createDeck();
    setupPlayers(5); // تست با ۵ بازیکن
    dealCards(5, 7); // برای تست فعلاً ۷ کارت به هر نفر می‌دهیم
    renderGame();
}

function setupPlayers(count) {
    gameState.players = [];
    for (let i = 0; i < count; i++) {
        gameState.players.push({ id: i, name: `Player ${i + 1}`, hand: [] });
    }
}

function dealCards(playerCount, cardsPerPlayer) {
    gameState.playerHands = [];
    for (let i = 0; i < playerCount; i++) {
        let hand = [];
        for (let j = 0; j < cardsPerPlayer; j++) {
            hand.push(deck.pop());
        }
        gameState.playerHands.push(hand);
    }
    // اولین کارت برای وسط میز
    gameState.discardPile.push(deck.pop());
}

// ۴. رندر کردن (نمایش) اطلاعات در صفحه
function renderGame() {
    // نمایش بازیکنان (پروفایل‌ها)
    const playersArea = document.getElementById('players-area');
    playersArea.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'player-wrapper';
        
        const profile = document.createElement('div');
        profile.className = 'player-profile';
        if(index === gameState.currentPlayer) profile.style.boxShadow = "0 0 15px #fff"; // درخشش برای بازیکن فعلی

        const countLabel = document.createElement('div');
        countLabel.className = 'card-count';
        countLabel.innerText = gameState.playerHands[index].length;

        wrapper.appendChild(profile);
        wrapper.appendChild(countLabel);
        playersArea.appendChild(wrapper);
    });

    // نمایش کارت‌های وسط میز
    const tableCenter = document.getElementById('table-center');
    tableCenter.innerHTML = '';
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.style.backgroundColor = getCardColor(topCard.color);
    cardDiv.innerText = topCard.value;
    tableCenter.appendChild(cardDiv);

    // نمایش دست بازیکن (فرض می‌کنیم بازیکن شماره ۰ هستیم)
    renderPlayerHand(0);
}

function renderPlayerHand(playerIndex) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    gameState.playerHands[playerIndex].forEach(card => {
        const cardDiv = document.createElement('div');
        card.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(card.color);
        cardDiv.innerText = card.value;
        handContainer.appendChild(cardDiv);
    });
}

function getCardColor(color) {
    switch(color) {
        case 'red': return '#ff5555';
        case 'blue': return '#5555ff';
        case 'green': return '#55ff55';
        case 'yellow': return '#ffff55';
        case 'wild': return '#ffffff';
        default: return '#fff';
    }
}
