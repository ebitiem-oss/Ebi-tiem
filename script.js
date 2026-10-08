const colors = ['red', 'blue', 'green', 'yellow'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

let playerHand = [];
let topCard = null;
let gameActive = false;

function startGame() {
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

function generateRandomCard() {
    return { 
        color: colors[Math.floor(Math.random() * colors.length)], 
        value: values[Math.floor(Math.random() * values.length)] 
    };
}

function drawCard() {
    if (!gameActive) return;
    
    // محدودیت ۲۵ کارت
    if (playerHand.length < 25) {
        playerHand.push(generateRandomCard());
        updateUI();
    } else {
        // وقتی ۲۵ تا پر شد، فقط یک لرزش کوچک می‌دهد (بدون پیام)
        const handDiv = document.getElementById('player-hand');
        handDiv.classList.add('error-shake');
        setTimeout(() => handDiv.classList.remove('error-shake'), 200);
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
    } else {
        // لرزش برای کارت اشتباه (بدون Alert)
        const handDiv = document.getElementById('player-hand');
        handDiv.classList.add('error-shake');
        setTimeout(() => handDiv.classList.remove('error-shake'), 200);
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
        
