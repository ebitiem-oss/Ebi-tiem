window.onload = function() {
    createPlayers();
    renderTable();
    renderHand();
};

// ساخت بازیکن‌ها دور میز بیضی
function createPlayers() {
    const container = document.getElementById('players-container');
    container.innerHTML = ''; 
    const totalPlayers = 10;
    
    for (let i = 0; i < totalPlayers; i++) {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.id = `player-${i}`;
        slot.innerText = `P${i+1}`;
        
        // محاسبه موقعیت دور میز بیضی با استفاده از ریاضیات مثلثات
        const angle = (i / totalPlayers) * (2 * Math.PI);
        
        // تنظیم ضرایب برای کشیده شدن (میز بیضی است، پس X باید بزرگتر از Y باشد)
        const xFactor = 42; // میزان پخش شدن افقی
        const yFactor = 35; // میزان پخش شدن عمودی
        
        const x = Math.cos(angle) * xFactor;
        const y = Math.sin(angle) * yFactor;
        
        // تبدیل به درصد برای قرارگیری در لبه‌های میز
        const percentX = 50 + (x); 
        const percentY = 50 + (y);

        slot.style.left = `${percentX}%`;
        slot.style.top = `${percentY}%`;
        slot.style.transform = 'translate(-50%, -50%)';
        
        // بازیکن اول فعال است
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
    // چک کردن صحت حرکت (استفاده از String برای جلوگیری از خطا)
    if (card.color === topCard.color || String(card.val) === String(topCard.val)) {
        topCard = myHand.splice(index, 1)[0];
        renderTable();
        renderHand();
    } else {
        alert("Move invalid!");
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
