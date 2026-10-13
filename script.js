const VERSION = "104";

// ۱. تعریف کارت‌ها
const COLORS = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['+2', 'Skip', 'Reverse', 'Wild', 'Wild +4', '1', '2', '3', '4', '5', '6', '7', '8'];

let deck = [];
let gameState = {
    players: [],
    currentPlayer: 0,
    discardPile: [],
    playerHands: []
};

// ۲. مدیریت لودینگ
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
    setupPlayers(5);
    dealCards(5, 7); 
    renderGame();
}

function createDeck() {
    deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(value => {
            deck.push({ color: color, value: value });
        });
    });
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'Wild' });
        deck.push({ color: 'wild', value: 'Wild +4' });
    }
    deck.sort(() => Math.random() - 0.5);
}

function setupPlayers(count) {
    gameState.players = [];
    for (let i = 0; i < count; i++) {
        gameState.players.push({ id: i, name: `Player ${i + 1}` });
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
    gameState.discardPile.push(deck.pop());
}

// ۳. رندر کردن صفحه
function renderGame() {
    // رندر پروفایل بازیکنان
    const playersArea = document.getElementById('players-area');
    playersArea.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'player-wrapper';
        const profile = document.createElement('div');
        profile.className = 'player-profile';
        if(index === gameState.currentPlayer) profile.style.boxShadow = "0 0 15px #fff";

        const countLabel = document.createElement('div');
        countLabel.className = 'card-count';
        countLabel.innerText = gameState.playerHands[index].length;

        wrapper.appendChild(profile);
        wrapper.appendChild(countLabel);
        playersArea.appendChild(wrapper);
    });

    // رندر کارت دور ریخته شده (Discard Pile)
    const discardContainer = document.getElementById('discard-pile-container');
    discardContainer.innerHTML = '';
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (topCard) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(topCard.color);
        cardDiv.innerText = topCard.value;
        discardContainer.appendChild(cardDiv);
    }

    // رندر دست بازیکن (در پایین صفحه)
    renderPlayerHand(0); 
}

function renderPlayerHand(playerIndex) {
    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    gameState.playerHands[playerIndex].forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(card.color);
        cardDiv.innerText = card.value;
        handContainer.appendChild(cardDiv);
    });
}

// ۴. منطق کلیک روی بانک
document.getElementById('card-deck').addEventListener('click', () => {
    if (deck.length > 0) {
        const drawnCard = deck.pop();
        gameState.playerHands[0].push(drawnCard); // فعلاً به بازیکن اول می‌دهیم
        renderGame();
    } else {
        alert("بانک تمام شد!");
    }
});

function getCardColor(color) {
    switch(color) {
        case 'red': return '#ff5555';
        case 'blue': return '#5555ff';
        case 'green': return '#5555ff'; // اصلاح شد
        case 'yellow': return '#ffff55';
        case 'wild': return '#ffffff';
        default: return '#fff';
    }
            }
    
