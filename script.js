window.onload = function() {
    createPlayers();
    renderTable();
    renderHand();
};

function createPlayers() {
    const container = document.getElementById('players-container');
    container.innerHTML = ''; 
    const totalPlayers = 10;
    
    for (let i = 0; i < totalPlayers; i++) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.id = `player-${i}`;
        slot.innerText = `P${i+1}`;
        
        const angle = (i / totalPlayers) * (2 * Math.PI);
        const xFactor = 40; 
        const yFactor = 30; 
        
        const x = Math.cos(angle) * xFactor;
        const y = Math.sin(angle) * yFactor;
        
        const percentX = 50 + (x); 
        const percentY = 50 + (y);

        slot.style.left = `${percentX}%`;
        slot.style.top = `${percentY}%`;
        slot.style.transform = 'translate(-50%, -50%)';
        
        if (i === 0) slot.classList.add('active-player');
        container.appendChild(slot);
    }
}

// مقدار اولیه کارت روی زمین
let topCard = { color: 'red', val: '5' };
// کارت‌های دست بازیکن
let myHand = [
    {color: 'red', val: '5'}, {color: 'blue', val: '2'}, 
    {color: 'green', val: '8'}, {color: 'yellow', val: '1'},
    {color: 'red', val: '3'}, {color: 'blue', val: '9'},
    {color: 'green', val: '4'}, {color: 'yellow', val: '7'}
];

function drawCard() {
    if (myHand.length >= 20) return; 
    const colors = ['red', 'blue', 'green', 'yellow'];
    const newCard = { 
        color: colors[Math.floor(Math.random() * 4)], 
        val: Math.floor(Math.random() * 9) + 1 
    };
    myHand.push(newCard);
    renderHand();
}

function playCard(index) {
    const card = myHand[index];
    
    // اصلاح اصلی: تبدیل هر دو طرف به String برای اطمینان از درست بودن مقایسه
    const isColorMatch = card.color === topCard.color;
    const isValueMatch = String(card.val) === String(topCard.val);

    if (isColorMatch || isValueMatch) {
        topCard = myHand.splice(index, 1)[0];
        renderTable();
        renderHand();
    } else {
        alert("Move invalid! Match color or number.");
    }
}

function renderTable() {
    const pile = document.getElementById('discard-pile');
    pile.className = `card ${topCard.color}`;
    pile.innerText = topCard.val;
}

function renderHand() {
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    myHand.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = `card ${card.color}`;
        div.innerText = card.val;
        div.onclick = () => playCard(index);
        handDiv.appendChild(div);
    });
}
