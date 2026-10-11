// لیست بازیکنان (در آینده این را از سرور می‌گیریم)
const players = ["شما", "بازیکن ۲", "بازیکن ۳", "بازیکن ۴"];
let currentTurn = 0; // نوبت فعلی

// شروع بازی بلافاصله
window.onload = () => {
    setupPlayers();
    updateTurnIndicator();
};

function setupPlayers() {
    const container = document.getElementById('other-players-container');
    container.innerHTML = '';
    
    players.forEach((name, index) => {
        const slot = document.createElement('div');
        slot.className = 'player-slot';
        slot.innerText = name;
        slot.id = 'player-' + index;
        
        // چیدمان دایره‌ای دور میز
        const angle = (index / players.length) * 2 * Math.PI - Math.PI/2;
        slot.style.left = (50 + 40 * Math.cos(angle)) + '%';
        slot.style.top = (50 + 40 * Math.sin(angle)) + '%';
        
        container.appendChild(slot);
    });
}

function updateTurnIndicator() {
    const slots = document.querySelectorAll('.player-slot');
    slots.forEach((slot, index) => {
        if (index === currentTurn) {
            slot.classList.add('active'); // اضافه کردن حلقه درخشان
        } else {
            slot.classList.remove('active');
        }
    });
}

// تغییر نوبت (این تابع را هر وقت کارت بازی شد صدا بزن)
function nextTurn() {
    currentTurn = (currentTurn + 1) % players.length;
    updateTurnIndicator();
}

// برای تست: هر ۳ ثانیه نوبت عوض شود (فقط برای اینکه درخشش را ببینی)
setInterval(nextTurn, 3000);
