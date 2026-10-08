const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// --- تنظیمات اصلی بازی ---
let activePlayers = 4; // هر چقدر اینجا را تغییر دهی، تعداد پروفایل‌ها دور میز تغییر می‌کند
// -----------------------

let playerHand = [];
let topCard = null;
let gameActive = false;

function setupPlayers() {
    const container = document.getElementById('other-players-container');
    container.innerHTML = ''; // پاک کردن پروفایل‌های قبلی

    // اگر بازیکن فعال 1 باشد (فقط خودت)، هیچ پروفایل دیگری ساخته نشود
    if (activePlayers <= 1) return;

    // محاسبه موقعیت‌های دور میز بر اساس عدد (دایره‌ای)
    for (let i = 1; i < activePlayers; i++) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.innerText = 'P' + (i + 1);
        
        // فرمول ریاضی برای چیدن پروفایل‌ها به صورت دایره‌ای دور میز
        const angle = (i / (activePlayers - 1)) * 2 * Math.PI;
        const radius = 45; // میزان فاصله از مرکز میز (در درصد)
        
        // محاسبه موقعیت (با استفاده از درصد برای موبایل بهتر کار کند)
        // این بخش پروفایل‌ها را به صورت خودکار دور میز پخش می‌کند
        const x = 50 + 40 * Math.cos(angle - Math.PI/2);
        const y = 50 + 40 * Math.sin(angle - Math.PI/2);
        
        slot.style.left = x + '%';
        slot.style.top = y + '%';
        slot.style.transform = 'translate(-50%, -50%)';
        
        container.appendChild(slot);
    }
}

function startGame() {
    setupPlayers(); // پروفایل‌ها را درست می‌کند
    gameActive = true;
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    
    topCard = generateRandomCard();
    playerHand = [];
    for (let i = 0; i < 7; i++) {
        playerHand.push(generateRandomCard());
    }
    updateUI();
}

// بقیه توابع (drawCard, playCard, winGame, updateUI, generateRandomCard) 
// دقیقا مثل نسخه قبلی هستند، فقط مطمئن شو در فایل هستند.

function generateRandomCard() {
    return { 
        color: colors[Math.floor(Math.random() * colors.length)], 
        value: values[Math.floor(Math.random() * values.length)] 
    };
}

function drawCard() {
    if (!gameActive) return;
    if (playerHand.length < 20) {
        playerHand.push(generateRandomCard());
        updateUI();
    }
}

function playCard(index) {
    if (!gameActive) return;
    const card = playerHand[index];
    if (card.color === topCard.color || card.value === topCard.value) {
        topCard = card; 
        playerHand.splice(index, 1); 
        if (playerHand.length === 0) {
            winGame();
        } else {
            updateUI();
        }
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
    const pile = document.getElementById('discard-pile');
    pile.className = `card ${topCard.color}`;
    pile.innerHTML = `<span style="font-size:14px">${topCard.value}</span>`;

    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = ''; 
    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.innerHTML = `<span style="font-size:14px">${card.value}</span>`;
        cardElement.onclick = () => playCard(index);
        handDiv.appendChild(cardElement);
    });
    }
