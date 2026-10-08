const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

let playerHand = [];

function startGame() {
    playerHand = [];
    // تولید ۱۰ کارت تصادفی
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

    playerHand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.color}`;
        // استفاده از span برای اینکه روی نوار سفید قرار بگیرد
        cardElement.innerHTML = `<span>${card.value}</span>`;
        handDiv.appendChild(cardElement);
    });
}
