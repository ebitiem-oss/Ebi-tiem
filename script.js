const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

let playerHand = [];
let topCard = null; // کارتی که روی زمین است

function startGame() {
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    
    // کارت اول را تصادفی روی زمین می‌گذاریم
    topCard = { color: colors[Math.floor(Math.random() * colors.length)], value: values[Math.floor(Math.random() * values.length)] };
    
    playerHand = [];
    for (let i = 0; i < 7; i++) { // ۷ کارت اولیه
        playerHand.push(generateRandomCard());
    }
    updateUI();
}

function generateRandomCard() {
    return { color: colors[Math.floor(Math.random() * colors.length)], value: values[Math.floor(Math.random() * values.length)] };
}

function drawCard() {
    playerHand.push(generateRandomCard());
    updateUI();
}

function playCard(index) {
    const card = playerHand[index];
    
    // قانون بازی: رنگ یا عدد باید یکی باشد
    if (card.color === topCard.color || card.value === topCard.value) {
        topCard = card; // کارت جدید می‌رود روی زمین
        playerHand.splice(index, 1); // کارت از دست حذف می‌شود
        updateUI();
    } else {
        alert("این کارت را نمی‌توانی بازی کنی!");
    }
}

function updateUI() {
    // نمایش کارت روی زمین
    const pile = document.getElementById('discard-pile');
    pile.className = `card ${topCard.color}`;
    pile.innerHTML = `<span>${topCard.value}</span>`;

    // نمایش دست بازیکن
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
