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
        const radius = window.innerWidth < 600 ? 130 : 220; 
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        slot.style.left = `calc(50% + ${x}px - 20px)`;
        slot.style.top = `calc(50% + ${y}px - 20px)`;
        
        if (i === 0) slot.classList.add('active-player');
        container.appendChild(slot);
    }
}

let topCard = { color: 'red', val: '5' };
let myHand = [
    {color: 'red', val: '5'}, 
    {color: 'blue', val: '2'}, 
    {color: 'green', val: '8'},
    {color: 'yellow', val: '1'}
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
    const colorMatch = (card.color === topCard.color);
    const valueMatch = (String(card.val) === String(topCard.val));

    if (colorMatch || valueMatch) {
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
