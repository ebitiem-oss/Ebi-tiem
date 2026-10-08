const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

let playerHand = [];
let topCard = null;
let activePlayers = 4; 
let gameActive = false;
let currentTurn = 0; 

function startGame() {
    activePlayers = parseInt(document.getElementById('player-count').value);
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    
    setupPlayers();
    gameActive = true;
    currentTurn = 0;
    
    topCard = generateRandomCard();
    playerHand = [];
    for (let i = 0; i < 7; i++) {
        playerHand.push(generateRandomCard());
    }
    updateUI();
}

function setupPlayers() {
    const container = document.getElementById('other-players-container');
    container.innerHTML = '';

    for (let i = 1; i < activePlayers; i++) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.id = 'player-' + i;
        slot.innerText = 'P' + (i + 1);
        
        // چیدمان دایره‌ای خودکار بر اساس تعداد بازیکنان
        const angle = (i / (activePlayers - 1)) * 2 * Math.PI;
        const radius = 40; // شعاع چیدمان روی میز
        const x = 50 + radius * Math.cos(angle - Math.PI/2);
        const y = 50 + radius * Math.sin(angle - Math.PI/2);
        
        slot.style.left = x + '%';
        slot.style.top = y + '%';
        slot.style.transform = 'translate(-50%, -50%)';
        container.appendChild(slot);
    }
}

function generateRandomCard() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return { color, value };
}

function updateUI() {
    // آپدیت کارت وسط
    const pile = document.getElementById('discard-pile');
    pile.className = `card ${topCard.color}`;
    pile.innerHTML = `<span>${topCard.value}</span>`;

    // آپدیت دست بازیکن
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = ''; 
    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.innerHTML = `<span>${card.value}</span>`;
        cardElement.onclick = () => playCard(index);
        handDiv.appendChild(cardElement);
    });

    // هایلایت کردن نوبت فعال
    document.querySelectorAll('.player-slot').forEach((slot, idx) => {
        if (idx === currentTurn) {
            slot.style.borderColor = "#2ecc71";
            slot.style.boxShadow = "0 0 15px #2ecc71";
        } else {
            slot.style.borderColor = "transparent";
            slot.style.boxShadow = "none";
        }
    });

    // کنترل دکمه کشیدن کارت
    const drawBtn = document.getElementById('draw-btn');
    drawBtn.disabled = (currentTurn !== 0);
    drawBtn.style.opacity = (currentTurn === 0) ? "1" : "0.5";
}

function playCard(index) {
    if (!gameActive || currentTurn !== 0) return;

    const card = playerHand[index];
    if (card.color === topCard.color || card.value === topCard.value) {
        topCard = card;
        playerHand.splice(index, 1);
        
        handleSpecialCard(card.value);
        
        if (playerHand.length === 0) {
            winGame();
        } else {
            nextTurn();
        }
        updateUI();
    }
}

function handleSpecialCard(value) {
    if (value === 'Skip') nextTurn();
}

function drawCard() {
    if (!gameActive || currentTurn !== 0) return;
    playerHand.push(generateRandomCard());
    nextTurn();
    updateUI();
}

function nextTurn() {
    currentTurn = (currentTurn === 0) ? 1 : 0;
    
    if (currentTurn === 1 && gameActive) {
        setTimeout(aiTurn, 1200);
    }
}

function aiTurn() {
    if (!gameActive) return;
    // هوش مصنوعی به طور تصادفی یا کارت بازی می‌کند یا می‌کشد
    if (Math.random() > 0.4) {
        topCard = generateRandomCard();
    }
    nextTurn();
    updateUI();
}

function winGame() {
    gameActive = false;
    alert("تبریک! برنده شدی!");
    location.reload();
}
