let topCard = { color: 'red', val: '5' };
let myHand = [{color: 'blue', val: '2'}, {color: 'green', val: '8'}];

// تابع کشیدن کارت
function drawCard() {
    const newCard = { 
        color: ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)], 
        val: Math.floor(Math.random() * 9) + 1 
    };
    myHand.push(newCard);
    renderHand();
}

function playCard(index) {
    const card = myHand[index];
    if (card.color === topCard.color || card.val === topCard.val) {
        topCard = myHand.splice(index, 1)[0];
        renderTable();
        renderHand();
    } else {
        alert("این کارت نمی‌خورد! یکی دیگر انتخاب کن یا از دسته کارت بکش.");
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

renderTable();
renderHand();
