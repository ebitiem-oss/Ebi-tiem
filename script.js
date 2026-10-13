const VERSION = "108";

const COLORS = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['+2', 'Skip', 'Reverse', 'Wild', 'Wild +4', '1', '2', '3', '4', '5', '6', '7', '8'];

let gameState = {
    players: [],
    currentPlayer: 0,
    discardPile: [],
    playerHands: [],
    deck: []
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        startNewGame();
    }, 1000);
});

function startNewGame() {
    createDeck();
    setupPlayers(5);
    dealCards(5, 7); // شروع با ۷ کارت برای هر بازیکن
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

    // ۲. رندر مرکز میز (کارت وسط)
    const discardContainer =...
