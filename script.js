const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

let playerHand = [];
let topCard = null;
let activePlayers = 4; 
let gameActive = false;
let currentTurn = 0; // 0 یعنی نوبت بازیکن اصلی است
let direction = 1;   // 1 یعنی ساعتگرد، -1 یعنی پادساعتگرد

function setupPlayers() {
    const container = document.getElementById('other-players-container');
    container.innerHTML = '';
    if (activePlayers <= 1) return;

    for (let i = 1; i < activePlayers; i++) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.innerText = 'P' + (i + 1);
        const angle = (i / (activePlayers - 1)) * 2 * Math.PI;
        const x = 50 + 40 * Math.cos(angle - Math.PI/2);
        const y = 50 + 40 * Math.sin(angle - Math.PI/2);
        slot.style.left = x + '%';
        slot.style.top = y + '%';
        slot.style.transform = 'translate(-50%, -50%)';
        container.appendChild(slot);
    }
}

function startGame() {
    setupPlayers();
    gameActive = true;
    currentTurn = 0;
    direction = 1;
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    
    topCard = generateRandomCard();
    playerHand = [];
    for (let i = 0; i < 7; i++) {
        playerHand.push(generateRandomCard());
    }
    updateUI();
}

function generateRandomCard() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return { color, value };
}

function drawCard() {
    if (!gameActive || currentTurn !== 0) return; // فقط در نوبت خودت می‌توانی کارت بکشی

    if (playerHand.length < 20) {
        playerHand.push(generateRandomCard());
        updateUI();
        nextTurn(); // بعد از کشیدن کارت، نوبت تمام می‌شود
    }
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

// مدیریت کارت‌های خاص
function handleSpecialCard(value) {
    if (value === 'Skip') {
        // نوبت را دو بار رد می‌کنیم (یعنی نوبت بعدی را هم می‌پریم)
        nextTurn();
    } else if (value === 'Reverse') {
        direction *= -1; // جهت بازی عوض می‌شود
    } else if (value === '+2') {
        // در این نسخه ساده، فعلاً فقط یک پیام منطقی در کنسول یا برای بازیکن بعدی (فرضی) است
        console.log("Next player draws 2 cards!");
    }
}

function nextTurn() {
    // در این نسخه، ما فقط نوبت بازیکن اصلی را مدیریت می‌کنیم
    // برای تست، هر بار که کارت بازی می‌کنی، نوبت به "غیرفعال" می‌رود تا بفهمی سیستم کار می‌کند
    currentTurn = (currentTurn === 0) ? 1 : 0;
    
    // اگر نوبت بازیکن اصلی نباشد، یک دکمه "ادامه بازی" نشان می‌دهیم
    if (currentTurn !== 0) {
        const btn = document.getElementById('draw-btn');
        btn.innerText = "نوبت بازیکن دیگر است (کلیک برای ادامه)";
        btn.onclick = () => {
            currentTurn = 0;
            btn.innerText = "کارت کشیدن";
            btn.onclick = drawCard;
            updateUI();
        };
    }
}

function winGame() {
    gameActive = false;
    updateUI();
    const gameArea = document.getElementById('game-area');
    const winMessage = document.createElement('h2');
    winMessage.innerText = "🎉 برنده شدی! 🎉";
    winMessage.style.color = "#2ecc71";
    gameArea.appendChild(winMessage);
}

function updateUI() {
    const pile = document.getElementById('discard-pile');
    pile.className = `card ${topCard.color}`;
    pile.innerHTML = `<span style="font-size:14px">${topCard.value}</span>`;

    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = ''; 
    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.innerHTML = `<span style="font-size:12px">${card.value}</span>`;
        cardElement.onclick = () => playCard(index);
        handDiv.appendChild(cardElement);
    });
            }
