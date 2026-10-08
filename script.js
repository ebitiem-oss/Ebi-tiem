const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

let playerHand = [];
let topCard = null;
let gameActive = false; // برای کنترل اینکه بازی در جریان است یا تمام شده

function startGame() {
    gameActive = true;
    // مخفی کردن دکمه شروع و نمایش محیط بازی
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    
    // کارت اول روی زمین
    topCard = generateRandomCard();
    
    // ساخت دست بازیکن (۷ کارت)
    playerHand = [];
    for (let i = 0; i < 7; i++) {
        playerHand.push(generateRandomCard());
    }
    updateUI();
}

function generateRandomCard() {
    return { 
        color: colors[Math.floor(Math.random() * colors.length)], 
        value: values[Math.floor(Math.random() * values.length)] 
    };
}

function drawCard() {
    if (!gameActive) return;
    playerHand.push(generateRandomCard());
    updateUI();
}

function playCard(index) {
    if (!gameActive) return;

    const card = playerHand[index];
    
    // بررسی قانون: رنگ یا عدد یکی باشد
    if (card.color === topCard.color || card.value === topCard.value) {
        topCard = card; 
        playerHand.splice(index, 1); // حذف کارت از دست
        
        // چک کردن شرط پیروزی
        if (playerHand.length === 0) {
            winGame();
        } else {
            updateUI();
        }
    } else {
        // فقط لرزش (بدون پیام مزاحم)
        const handDiv = document.getElementById('player-hand');
        handDiv.classList.add('error-shake');
        setTimeout(() => {
            handDiv.classList.remove('error-shake');
        }, 200);
    }
}

function winGame() {
    gameActive = false;
    updateUI();
    // نمایش پیام پیروزی در صفحه (نه به صورت Alert)
    const gameArea = document.getElementById('game-area');
    const winMessage = document.createElement('h2');
    winMessage.innerText = "🎉 برنده شدی! 🎉";
    winMessage.style.color = "#2ecc71";
    winMessage.style.fontSize = "24px";
    gameArea.appendChild(winMessage);
    
    // اضافه کردن دکمه شروع مجدد
    const restartBtn = document.createElement('button');
    restartBtn.innerText = "بازی دوباره";
    restartBtn.onclick = () => location.reload();
    gameArea.appendChild(restartBtn);
}

function updateUI() {
    // ۱. آپدیت کارت روی زمین
    const pile = document.getElementById('discard-pile');
    pile.className = `card ${topCard.color}`;
    pile.innerHTML = `<span>${topCard.value}</span>`;

    // ۲. آپدیت دست بازیکن
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = ''; 
    
    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.innerHTML = `<span>${card.value}</span>`;
        cardElement.onclick = () => playCard(index);
        handDiv.appendChild(cardElement);
    });
}
