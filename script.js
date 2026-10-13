const VERSION = "107";

const COLORS = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['+2', 'Skip', 'Reverse', 'Wild', 'Wild +4', '1', '2', '3', '4', '5', '6', '7', '8'];

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
    dealCards(5, 15);
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
    // ۱. رندر بازیکنان
    const playersArea = document.getElementById('players-area');
    if (playersArea) {
        playersArea.innerHTML = '';
        gameState.players.forEach((player, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'player-wrapper';
            
            const profile = document.createElement('div');
            profile.className = `player-profile ${index === gameState.currentPlayer ? 'active' : ''}`;

            const countLabel = document.createElement('div');
            countLabel.className = 'card-count';
            countLabel.innerText = gameState.playerHands[index].length;

            wrapper.appendChild(profile);
            wrapper.appendChild(countLabel);
            playersArea.appendChild(wrapper);
        });
    }

    // ۲. رندر مرکز میز
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

    // ۳. رندر بانک (Deck)
    const deckElement = document.getElementById('deck-container');
    if (deckElement) {
        deckElement.onclick = () => {
            if (gameState.deck.length > 0) {
                const drawn = gameState.deck.pop();
                gameState.playerHands[0].push(drawn);
                renderGame();
            }
        };
    }

    // ۴. رندر دست بازیکن
    renderPlayerHand(0);
}

function renderPlayerHand(playerIndex) {
    const handContainer = document.getElementById('player-hand');
    if (!handContainer) return;
    handContainer.innerHTML = '';
    
    const hand = gameState.playerHands[playerIndex] || [];
    const displayHand = hand.slice(0, 15);

    displayHand.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(card.color);
        cardDiv.innerText = card.value;
        handContainer.appendChild(cardDiv);
    });
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
            
