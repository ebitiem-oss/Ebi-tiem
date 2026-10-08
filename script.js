const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

let playerHand = [];
let topCard = null;
let activePlayers = 4;
let currentTurn = 0; // 0 برای تو، بقیه برای هوش مصنوعی

function startGame() {
    activePlayers = parseInt(document.getElementById('player-count').value);
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    
    setupPlayers();
    topCard = generateRandomCard();
    playerHand = Array.from({length: 7}, () => generateRandomCard());
    updateUI();
}

function setupPlayers() {
    const container = document.getElementById('other-players-container');
    container.innerHTML = '';
    for (let i = 1; i < activePlayers; i++) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.innerText = 'AI ' + i;
        const angle = (i / activePlayers) * 2 * Math.PI - Math.PI/2;
        slot.style.left = (50 + 45 * Math.cos(angle)) + '%';
        slot.style.top = (50 + 45 * Math.sin(angle)) + '%';
        container.appendChild(slot);
    }
}

function generateRandomCard() {
    return { color: colors[Math.floor(Math.random() * colors.length)], value: values[Math.floor(Math.random() * values.length)] };
}

function updateUI() {
    const pile = document.getElementById('discard-pile');
    pile.className = `card ${topCard.color}`;
    pile.innerHTML = '<div class="oval"></div><div class="value">' + topCard.value + '</div>';

    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    playerHand.forEach((card, index) => {
        const c = document.createElement('div');
        c.className = `card ${card.color}`;
        c.innerHTML = '<div class="oval"></div><div class="value">' + card.value + '</div>';
        c.onclick = () => playCard(index);
        handDiv.appendChild(c);
    });
}

function playCard(index) {
    if (currentTurn !== 0) return;
    const card = playerHand[index];
    if (card.color === topCard.color || card.value === topCard.value) {
        topCard = card;
        playerHand.splice(index, 1);
        nextTurn();
        updateUI();
    }
}

function nextTurn() {
    currentTurn = (currentTurn + 1) % activePlayers;
    if (currentTurn !== 0) setTimeout(aiTurn, 1000);
}

function aiTurn() {
    topCard = generateRandomCard(); // هوش مصنوعی ساده
    nextTurn();
    updateUI();
}
