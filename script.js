const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

let playerHand = [];

function startGame() {
    playerHand = [];
    document.getElementById('game-status').innerText = "بازی شروع شد!";
    
    // ساخت ۱۰ کارت تصادفی برای شروع
    for (let i = 0; i < 10; i++) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomValue = values[Math.floor(Math.random() * values.length)];
        playerHand.push({ color: randomColor, value: randomValue });
    }
    
    renderHand();
}

function renderHand() {
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = ''; // پاک کردن دست قبلی

    playerHand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        cardElement.innerText = card.value;
        handDiv.appendChild(cardElement);
    });
}
