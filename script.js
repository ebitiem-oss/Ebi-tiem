const VERSION = "109"; // نسخه جدید با رفع مشکل ظاهر

let gameState = {
    players: [],
    currentPlayer: 0,
    discardPile: [],
    playerHands: [],
    deck: [],
    isGameOver: false
};

const COLORS = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['+2', 'Skip', 'Reverse', 'Wild', 'Wild +4', '1', '2', '3', '4', '5', '6', '7', '8'];

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        startNewGame();
    }, 500);
});

function startNewGame() {
    gameState.isGameOver = false;
    createDeck();
    setupPlayers(5);
    dealCards(5, 15); // شروع با ۱۵ کارت
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

    // رندر بازیکن‌ها
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

    // رندر کارت وسط (Discard Pile)
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

    // رندر بانک (Deck)
    const deckElement = document.getElementById('deck-container');
    if (deckElement) {
        deckElement.innerHTML = '';
        const deckDiv = document.createElement('div');
        deckDiv.className = 'card';
        deckDiv.style.backgroundColor = '#333';
        deckDiv.innerText = '🎴';
        deckDiv.onclick = drawCard;
        deckElement.appendChild(deckDiv);
    }

    // رندر دست بازیکن (فقط بازیکن اول برای تست در موبایل)
    renderPlayerHand(0);
}

function drawCard() {
    if (gameState.deck.length > 0) {
        gameState.playerHands[0].push(gameState.deck.pop());
        nextTurn();
    }
}

function renderPlayerHand(playerIndex) {
    const handContainer = document.getElementById('player-hand');
    if (!handContainer) return;
    handContainer.innerHTML = '';
    
    const hand = gameState.playerHands[playerIndex];
    hand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(card.color
