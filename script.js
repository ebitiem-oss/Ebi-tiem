const VERSION = "111"; // نسخه جدید

const COLORS = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['+2', 'Skip', 'Reverse', 'Wild', 'Wild +4', '1', '2', '3', '4', '5', '6', '7', '8'];

let gameState = {
    players: [],
    currentPlayer: 0,
    discardPile: [],
    playerHands: [],
    deck: [],
    isGameOver: false
};

document.addEventListener('DOMContentLoaded', () => {
    startNewGame();
});

function startNewGame() {
    gameState.isGameOver = false;
    createDeck();
    setupPlayers(5);
    dealCards(5, 7); 
    renderGame();
}

function createDeck() {
    let deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(value => {
            deck.push({ color: color, value: value });
        });
    });
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'Wild' });
        deck.push({ color: 'wild', value: 'Wild +4' });
    }
    gameState.deck = deck.sort(() => Math.random() - 0.5);
}

function setupPlayers(count) {
    gameState.players = [];
    for (let i = 0; i < count; i++) {
        gameState.players.push({ id: i, name: `P${i + 1}` });
    }
}

function dealCards(playerCount, cardsPerPlayer) {
    gameState.playerHands = [];
    for (let i = 0; i < playerCount; i++) {
        let hand = [];
        for (let j = 0; j < cardsPerPlayer; j++) {
            if (gameState.deck.length > 0) hand.push(gameState.deck.pop());
        }
        gameState.playerHands.push(hand);
    }
    if (gameState.deck.length > 0) {
        gameState.discardPile = [gameState.deck.pop()];
    }
}

function renderGame() {
    if (gameState.isGameOver) return;

    // ۱. رندر بازیکنان
    const playersArea = document.getElementById('players-area');
    if (playersArea) {
        playersArea.innerHTML = '';
        gameState.players.forEach((player, index) => {
            const wrapper = document.createElement('div');
            wrapper.style.textAlign = 'center';
            const profile = document.createElement('div');
            profile.className = `player-profile ${index === gameState.currentPlayer ? 'active' : ''}`;
            profile.style.margin = '0 auto';
            const countLabel = document.createElement('div');
            countLabel.className = 'card-count';
            countLabel.innerText = gameState.playerHands[index].length;
            wrapper.appendChild(profile);
            wrapper.appendChild(countLabel);
            playersArea.appendChild(wrapper);
        });
    }

    // ۲. رندر کارت وسط
    const discardContainer = document.getElementById('discard-pile-container');
    if (discardContainer) {
        discardContainer.innerHTML = '';
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        if (topCard) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            cardDiv.style.backgroundColor = getCardColor(topCard.color);
            cardDiv.innerText = topCard.value;
            discardContainer.appendChild(cardDiv);
        }
    }

    // ۳. رندر دست بازیکن (فقط برای بازیکن فعلی نمایش داده می‌شود در این نسخه ساده)
    renderPlayerHand(0);
}

function renderPlayerHand(playerIndex) {
    const handContainer = document.getElementById('player-hand');
    if (!handContainer) return;
    handContainer.innerHTML = '';
    
    const hand = gameState.playerHands[playerIndex];
    hand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(card.color);
        cardDiv.innerText = card.value;
        cardDiv.onclick = () => playCard(playerIndex, index);
        handContainer.appendChild(cardDiv);
    });
}

// --- منطق اصلی بازی (قوانین تطابق) ---

function playCard(playerIndex, cardIndex) {
    if (gameState.isGameOver) return;
    if (playerIndex !== gameState.currentPlayer) return;

    const hand = gameState.playerHands[playerIndex];
    const cardToPlay = hand[cardIndex];
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];

    // بررسی قانون تطابق: رنگ یا عدد باید یکی باشد، یا کارت Wild باشد
    const isColorMatch = cardToPlay.color === topCard.color;
    const isValueMatch = cardToPlay.value === topCard.value;
    const isWildCard = cardToPlay.color === 'wild';

    if (isColorMatch || isValueMatch || isWildCard) {
        // اگر درست بود، کارت را بازی کن
        hand.splice(cardIndex, 1);
        gameState.discardPile.push(cardToPlay);
        
        console.log("Card played successfully!");

        if (checkWinner()) return;
        nextTurn();
    } else {
        // اگر اشتباه بود
        console.log("Invalid move! Match color or value.");
        // اینجا در مراحل بعد یک پیام قرمز رنگ نشان می‌دهیم
    }
}

function drawCard() {
    if (gameState.deck.length > 0 && !gameState.isGameOver) {
        gameState.playerHands[0].push(gameState.deck.pop());
        nextTurn();
    }
}

function nextTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    renderGame();
}

function checkWinner() {
    for (let i = 0; i < gameState.playerHands.length; i++) {
        if (gameState.playerHands[i].length === 0) {
            gameState.isGameOver = true;
            setTimeout(() => alert(`🎉 WINNER: Player ${i + 1}!`), 100);
            return true;
        }
    }
    return false;
}

function getCardColor(color) {
    switch(color) {
        case 'red': return '#ff4b2b';
        case 'blue': return '#2193b0';
        case 'green': return '#11998e';
        case 'yellow': return '#ffe259';
        case 'wild': return '#222222';
        default: return '#ffffff';
    }
                                }
