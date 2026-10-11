window.onload = function() {
    renderTable();
    renderHand();
};

let topCard = { color: 'red', val: '5' };
let myHand = [
    {color: 'red', val: '5'}, 
    {color: 'blue', val: '2'}, 
    {color: 'green', val: '8'}
];

function drawCard() {
    // محدودیت ۲۰ کارت
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
    // اگر کارت نخورد، هیچ اتفاقی نمی‌افتد (ساکت)
    if (card.color !== topCard.color && card.val !== topCard.val) return;
    
    topCard = myHand.splice(index, 1)[0];
    renderTable();
    renderHand();
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
