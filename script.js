const players = ["شما", "بازیکن ۲", "بازیکن ۳", "بازیکن ۴"];
let currentTurn = 0;
let myHand = [{color:'red', val:'5'}, {color:'blue', val:'2'}, {color:'red', val:'1'}];

function joinGame() {
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    setupPlayers();
    renderHand();
    updateTurnIndicator();
}

// تابع بازی کردن کارت
function playCard(index) {
    const card = myHand[index]; // کارت انتخابی
    // نمایش در وسط میز
    const pile = document.getElementById('discard-pile');
    pile.className = `card ${card.color}`;
    pile.innerText = card.val;
    
    // حذف از دست
    myHand.splice(index, 1);
    renderHand(); // دوباره کشیدن کارت‌های باقی‌مانده
}

function renderHand() {
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    myHand.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = `card ${card.color}`;
        div.innerText = card.val;
        // اضافه کردن قابلیت کلیک
        div.onclick = () => playCard(index);
        handDiv.appendChild(div);
    });
}

function setupPlayers() {
    const container = document.getElementById('other-players-container');
    players.forEach((name, index) => {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.innerText = name;
        slot.id = 'player-' + index;
        const angle = (index / players.length) * 2 * Math.PI - Math.PI/2;
        slot.style.left = (50 + 40 * Math.cos(angle)) + '%';
        slot.style.top = (50 + 40 * Math.sin(angle)) + '%';
        container.appendChild(slot);
    });
}

function updateTurnIndicator() {
    document.querySelectorAll('.player-slot').forEach((slot, index) => {
        slot.classList.toggle('active', index === currentTurn);
    });
}
