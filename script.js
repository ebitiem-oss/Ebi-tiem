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
        gameState.players.push({ id: i, name: `P${i + 1}` });
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
    // ۱. رندر بازیکنان
    const playersArea = document.getElementById('players-area');
    if (playersArea) {
        playersArea.innerHTML = '';
        gameState.players.forEach((player, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'player-wrapper';
            const profile = document.createElement('div');
            profile.className = 'player-profile';
            if(index === gameState.currentPlayer) profile.style.borderColor = "#fff";

            const countLabel = document.createElement('div');
            countLabel.className = 'card-count';
            countLabel.innerText = gameState.playerHands[index].length;

            wrapper.appendChild(profile);
            wrapper.appendChild(countLabel);
            playersArea.appendChild(wrapper);
        });
    }

    // ۲. رندر کارت وسط (Discard Pile)
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

    // ۳. رندر بانک کارت‌ها (Deck)
    const deckElement = document.getElementById('card-deck');
    if (deckElement) {
        deckElement.onclick = () => {
            if (deck.length > 0) {
                const drawn = deck.pop();
                gameState.playerHands[0].push(drawn);
                renderGame();
            }
        };
    }

    // ۴. رندر دست بازیکن (پایین صفحه)
    renderPlayerHand(0);
}

function renderPlayerHand(playerIndex) {
    const handContainer = document.getElementById('player-hand');
    if (!handContainer) return;
    handContainer.innerHTML = '';
    
    const hand = gameState.playerHands[playerIndex] || [];
    // محدود کردن نمایش به ۱۵ کارت (طبق درخواست شما)
    const visibleHand = hand.slice(0, 15);

    visibleHand.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(card.color);
        cardDiv.innerText = card.value;
        handContainer.appendChild(cardDiv);
    });
}

function getCardColor(color) {
    switch(color) {
        case 'red': return '#ff5555';
        case 'blue': return '#5555ff';
        case 'green': return '#55aa55';
        case 'yellow': return '#ffaa00';
        case 'wild': return '#222';
        default: return '#ffffff';
    }
                                                   }
