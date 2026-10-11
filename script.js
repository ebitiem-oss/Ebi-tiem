// ۱. وضعیت اولیه بازی
let topCard = { color: 'red', val: '5' }; // کارتی که الان وسط میز است
let myHand = [
    {color: 'red', val: '5'}, 
    {color: 'blue', val: '2'}, 
    {color: 'green', val: '8'},
    {color: 'red', val: '1'}
];

// ۲. تابع اصلی بازی کردن کارت
function playCard(index) {
    const card = myHand[index];

    // قانون اونو: چک کردن رنگ یا عدد
    if (card.color === topCard.color || card.val === topCard.val) {
        // اگر مجاز بود:
        topCard = myHand.splice(index, 1)[0]; // کارت از دست حذف و جایگزین topCard می‌شود
        renderTable(); // به‌روزرسانی میز
        renderHand();  // به‌روزرسانی کارت‌های دست
    } else {
        // اگر مجاز نبود:
        alert("خطا: رنگ یا عدد کارت همخوانی ندارد!");
    }
}

// ۳. نمایش کارت وسط میز
function renderTable() {
    const pile = document.getElementById('discard-pile');
    pile.className = `card ${topCard.color}`; // کلاس رنگ کارت
    pile.innerText = topCard.val;
}

// ۴. نمایش کارت‌های دست بازیکن
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

// اجرای اولیه
renderTable();
renderHand();
