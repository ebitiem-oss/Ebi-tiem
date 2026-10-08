const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

let playerHand = [];
let topCard = null;
let activePlayers = 4; 
let gameActive = false;
let currentTurn = 0; // 0 یعنی نوبت توست، 1 یعنی نوبت هوش مصنوعی است
let direction = 1;

function setupPlayers() {
    const container = document.getElementById('other-players-container');
    container.innerHTML = '';
    if (activePlayers <= 1) return;

    for (let i = 1; i < activePlayers; i++) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.id = 'player-' + i; // آیدی برای مشخص کردن نوبت
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

// --- سیستم نوبت‌دهی خودکار ---
function nextTurn() {
    // تغییر نوبت بین 0 و 1
    currentTurn = (currentTurn === 0) ? 1 : 0;
    updateUI();

    // اگر نوبت هوش مصنوعی بود (currentTurn === 1)
    if (gameActive && currentTurn === 1) {
        setTimeout(aiTurn, 1500); // 1.5 ثانیه صبر کن تا طبیعی به نظر برسد
    }
}

// --- هوش مصنوعی ساده ---
function aiTurn() {
    if (!gameActive) return;

    // هوش مصنوعی یک کارت تصادفی برای خودش در نظر می‌گیرد (شبیه‌سازی)
    // در واقع اینجا ما فقط شبیه‌سازی می‌کنیم که هوش مصنوعی کار می‌کند
    console.log("AI is thinking...");

    // شبیه‌سازی: هوش مصنوعی یا کارت بازی می‌کند یا کارت می‌کشد
    const randomAction = Math.random();

    if (randomAction > 0.3) { 
        // 70% احتمال دارد کارت بازی کند (شبیه‌سازی با یک کارت تصادفی)
        topCard = generateRandomCard();
        console.log("AI played a card");
    } else {
        // 30% احتمال دارد کارت بکشد
        console.log("AI drew a card");
    }

    nextTurn(); // بعد از حرکت هوش مصنوعی، نوبت برمی‌گردد به تو
}

function drawCard() {
    if (!gameActive || currentTurn !== 0) return;

    if (playerHand.length < 20) {
        playerHand.push(generateRandomCard());
        updateUI();
        nextTurn(); 
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

function handleSpecialCard(value) {
    if (value === 'Skip') {
        nextTurn(); // نوبت را یک بار دیگر رد کن
    } else if (value === 'Reverse') {
        direction *= -1;
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
    
    const restartBtn = document.createElement('button');
    restartBtn.innerText = "دوباره بازی کن";
    restartBtn.onclick = () => location.reload();
    gameArea.appendChild(restartBtn);
}

function updateUI() {
    // هایلایت کردن پروفایلی که نوبتش است
    document.querySelectorAll('.player-slot').forEach((slot, idx) => {
        if (idx === currentTurn) {
            slot.style.borderColor = "#2ecc71"; // سبز برای نوبت فعال
            slot.style.boxShadow = "0 0 15px #2ecc71";
        } else {
            slot.style.borderColor = "#f1c40f";
            slot.style.boxShadow = "none";
        }
    });

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

    // غیرفعال کردن دکمه کشیدن اگر نوبت تو نیست
    const drawBtn = document.getElementById('draw-btn');
    if (currentTurn !== 0) {
        drawBtn.disabled = true;
        drawBtn.style.opacity = "0.5";
    } else {
        drawBtn.disabled = false;
        drawBtn.style.opacity = "1";
    }
}
    
