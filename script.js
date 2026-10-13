const VERSION = "105";

const COLORS = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['+2', 'Skip', 'Reverse', 'Wild', 'Wild +4', '1', '2', '3', '4', '5', '6', '7', '8'];

let deck = [];
let gameState = {
    players: [],
    currentPlayer: 0,
    discardPile: [],
    playerHands: []
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
        startNewGame();
    }, 1000);
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
            if (deck.length > 0) hand.push(deck.pop());
        }
        gameState.playerHands.push(hand);
    }
    if (deck.length > 0) gameState.discardPile.push(deck.pop());
}

function renderGame() {
    // رندر پروفایل بازیکنان
    const playersArea = document.getElementById('players-area');
    if (playersArea) {
        playersArea.innerHTML = '';
        gameState.players.forEach((player, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'player-wrapper';
            
            const profile = document.createElement('div');
            profile.className = 'player-profile';
            if(index === gameState.currentPlayer) profile.style.boxShadow = "0 0 15px #fff";

            const countLabel = document.createElement('div');
            countLabel.className = 'card-count';
            countLabel.innerText = gameState.playerHands[index] ? gameState.playerHands[index].length : 0;

            wrapper.appendChild(profile);
            wrapper.appendChild(countLabel);
            playersArea.appendChild(wrapper);
        });
    }

    // رندر کارت وسط میز (Discard Pile)
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

    // رندر دست بازیکن در پایین صفحه
    renderPlayerHand(0); 
}

function renderPlayerHand(playerIndex) {
    const handContainer = document.getElementById('player-hand');
    if (!handContainer) return;
    
    handContainer.innerHTML = '';
    const hand = gameState.playerHands[playerIndex] || [];
    
    hand.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(card.color);
        cardDiv.innerText = card.value;
        handContainer.appendChild(cardDiv);
    });
}

// کلیک روی بانک کارت‌ها برای کشیدن کارت جدید
const deckElement = document.getElementById('card-deck');
if (deckElement) {
    deckElement.addEventListener('click', () => {
        if (deck.length > 0) {
            const drawnCard = deck.pop();
            gameState.playerHands[0].push(drawnCard);
            renderGame();
        } else {
            alert("بانک تمام شد!");
        }
    });
}

function getCardColor(color) {
    switch(color) {
        case 'red': return '#ff5555';
        case 'blue': return '#5555ff';
        case 'green': return '#55aa55'; /* اصلاح شد */
        case 'yellow': return '#ffaa00';
        case 'wild': return '#222222';
        default: return '#ffffff';
    }
                }
