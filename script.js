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
        
        // محاسبه موقعیت دور میز بیضی (استفاده از معادله بیضی)
        const angle = (i / totalPlayers) * (2 * Math.PI);
        
        // این اعداد باعث می‌شوند بازیکن‌ها دور میز بیضی پخش شوند
        const x = Math.cos(angle) * 40; // ضریب افقی
        const y = Math.sin(angle) * 35; // ضریب عمودی
        
        // تبدیل به درصد برای قرارگیری دقیق در لبه میز
        const percentX = 50 + (x * 4); 
        const percentY = 50 + (y * 4);

        slot.style.left = `${percentX}%`;
        slot.style.top = `${percentY}%`;
        slot.style.transform = 'translate(-50%, -50%)';
        
        if (i === 0) slot.classList.add('active-player');
        container.appendChild(slot);
    }
}

let topCard = { color: 'red', val: '5' };
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
    if (card.color === topCard.color || String(card.val) === String(topCard.val)) {
        topCard = myHand.splice(index, 1)[0];
        renderTable();
        renderHand();
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
