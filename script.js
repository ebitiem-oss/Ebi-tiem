const COLORS = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', 'Skip', 'Reverse', '+2'];

let gameState = {
    players: [],
    currentPlayer: 0,
    discardPile: [],
    playerHands: [],
    deck: [],
    isGameOver: false
};

window.onload = function() {
    startNewGame();
};

function startNewGame() {
    gameState.isGameOver = false;
    gameState.currentPlayer = 0;
    
    let deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(value => {
            deck.push({ color, value });
        });
    });
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'Wild' });
        deck.push({ color: 'wild', value: 'Wild +4' });
    }
    gameState.deck = deck.sort(() => Math.random() - 0.5);

    gameState.players = [
        { id: 0, name: 'You' },
        { id: 1, name: 'Bot 1' },
        { id: 2, name: 'Bot 2' },
        { id: 3, name: 'Bot 3' },
        { id: 4, name: 'Bot 4' }
    ];

    gameState.playerHands = [];
    gameState.players.forEach(() => {
        let hand = [];
        for (let i = 0; i < 7; i++) {
            if (gameState.deck.length > 0) {
                hand.push(gameState.deck.pop());
            }
        }
        gameState.playerHands.push(hand);
    });

    if (gameState.deck.length > 0) {
        gameState.discardPile = [gameState.deck.pop()];
    }

    renderGame();
}

function renderGame() {
    const playersArea = document.getElementById('players-area');
    playersArea.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'player-wrapper';
        
        const profile = document.createElement('div');
        profile.className = `player-profile ${index === gameState.currentPlayer ? 'active' : ''}`;
        
        const countLabel = document.createElement('div');
        countLabel.className = 'card-count';
        countLabel.innerText = `${player.name} (${gameState.playerHands[index].length})`;
        
        wrapper.appendChild(profile);
        wrapper.appendChild(countLabel);
        playersArea.appendChild(wrapper);
    });

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

    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    const myHand = gameState.playerHands[0];
    
    myHand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(card.color);
        cardDiv.innerText = card.value;
        cardDiv.onclick = () => playCard(0, index);
        handContainer.appendChild(cardDiv);
    });
}

function playCard(playerIndex, cardIndex) {
    if (gameState.isGameOver) return;
    if (playerIndex !== gameState.currentPlayer) return;

    let hand = gameState.playerHands[playerIndex];
    let card = hand[cardIndex];
    let topCard = gameState.discardPile[gameState.discardPile.length - 1];

    if (card.color === topCard.color || card.value === topCard.value || card.color === 'wild') {
        hand.splice(cardIndex, 1);
        gameState.discardPile.push(card);

        if (hand.length === 0) {
            gameState.isGameOver = true;
            setTimeout(() => alert('🎉 برنده شدید!'), 100);
            return;
        }

        nextTurn();
    }
}

function drawCard() {
    if (gameState.isGameOver) return;
    if (gameState.deck.length > 0) {
        let card = gameState.deck.pop();
        gameState.playerHands[gameState.currentPlayer].push(card);
        nextTurn(); // کشیدن کارت به صورت خودکار نوبت را عوض می‌کند
    }
}

function nextTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    renderGame();
}

function toggleMic() {
    alert('وضعیت میکروفون تغییر کرد (آماده برای قابلیت صوتی آینده)');
}

function getCardColor(color) {
    switch (color) {
        case 'red': return '#e74c3c';
        case 'blue': return '#3498db';
        case 'green': return '#2ecc71';
        case 'yellow': return '#f1c40f';
        case 'wild': return '#34495e';
        default: return '#95a5a6';
    }
}
