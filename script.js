const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

let playerHand = [];

function startGame() {
    // ۱. مخفی کردن دکمه شروع
    document.getElementById('start-btn').style.display = 'none';
    
    // ۲. تولید کارت‌ها
    playerHand = [];
    for (let i = 0; i < 10; i++) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomValue = values[Math.floor(Math.random() * values.length)];
        playerHand.push({ color: randomColor, value: randomValue });
    }
    renderHand();
}

function renderHand() {
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = ''; 

    playerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.innerHTML = `<span>${card.value}</span>`;
        
        // ۳. افزودن قابلیت کلیک برای بازی کردن کارت
        cardElement.onclick = function() {
            playCard(index);
        };
        
        handDiv.appendChild(cardElement);
    });
}

function playCard(index) {
    // ۴. حذف کارت از دست
    playerHand.splice(index, 1);
    // ۵. به‌روزرسانی نمایش کارت‌ها
    renderHand();
}
