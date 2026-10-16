// نسخه ۱۱۸ - اونو نیورا با چت تمیز و سیستم صدا
const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];
const WILDS = ['Wild', 'Wild +4'];

let gameState = {
    players: [],
    myIndex: 0,
    currentTurn: 0,
    deck: [],
    discardPile: [],
    myHand: [],
    soundEnabled: true,
    micEnabled: false,
    pendingWildCard: null
};

// راه‌اندازی اولیه
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-game-btn').addEventListener('click', initGame);
    document.getElementById('deck-pile').addEventListener('click', playerDrawCard);
    document.getElementById('send-chat-btn').addEventListener('click', sendChatMsg);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMsg();
    });

    document.getElementById('audio-toggle-btn').addEventListener('click', toggleAudio);
    document.getElementById('mic-toggle-btn').addEventListener('click', toggleMic);

    // دکمه‌های انتخاب رنگ Wild
    document.querySelectorAll('.color-opt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let chosenColor = e.target.getAttribute('data-color');
            applyWildColor(chosenColor);
        });
    });
});

function initGame() {
    let nameInput = document.getElementById('player-name-input').value.trim();
    let playerName = nameInput !== '' ? nameInput : 'بازیکن من';

    // بازیکنان میز (برای تست فعلی خودتان به همراه حریفان تستی)
    gameState.players = [
        { name: playerName, isBot: false, handCount: 7 },
        { name: 'سارا', isBot: true, handCount: 7 },
        { name: 'علی', isBot: true, handCount: 7 },
        { name: 'رضا', isBot: true, handCount: 7 }
    ];

    gameState.myIndex = 0;
    gameState.currentTurn = 0;

    // ساخت دک و توزیع کارت‌ها
    buildDeck();
    shuffleDeck();

    gameState.myHand = [];
    for (let i = 0; i < 7; i++) {
        gameState.myHand.push(gameState.deck.pop());
    }

    // اولین کارت زمین (نباید Wild باشد)
    let firstCard;
    do {
        shuffleDeck();
        firstCard = gameState.deck.pop();
    } while (firstCard.type === 'wild');

    gameState.discardPile.push(firstCard);

    // تغییر صفحه
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');

    addSystemChat(`بازی شروع شد. ${playerName} خوش آمدید!`);
    updateUI();
}

function buildDeck() {
    gameState.deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(val => {
            gameState.deck.push({ color, value: val, type: 'normal' });
            if (val !== '0') {
                gameState.deck.push({ color, value: val, type: 'normal' }); // هر کارت دوتا به جز صفر
            }
        });
    });

    for (let i = 0; i < 4; i++) {
        gameState.deck.push({ color: 'wild', value: 'Wild', type: 'wild' });
        gameState.deck.push({ color: 'wild', value: 'Wild +4', type: 'wild' });
    }
}

function shuffleDeck() {
    for (let i = gameState.deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [gameState.deck[i], gameState.deck[j]] = [gameState.deck[j], gameState.deck[i]];
    }
}

function updateUI() {
    // بروزرسانی حلقه‌ی بازیکنان دور میز
    let ringHTML = '';
    gameState.players.forEach((p, idx) => {
        let isActive = (idx === gameState.currentTurn);
        let count = (idx === 0) ? gameState.myHand.length : p.handCount;
        ringHTML += `
            <div class="player-node ${isActive ? 'active-player' : ''}">
                <div>${p.name}</div>
                <div>کارت: ${count}</div>
            </div>
        `;
    });
    document.getElementById('players-ring').innerHTML = ringHTML;

    // نوبت فعلی
    document.getElementById('current-turn-name').innerText = gameState.players[gameState.currentTurn].name;

    // زمین بازی (آخرین کارت)
    let topCard = gameState.discardPile[gameState.discardPile.length - 1];
    let discardEl = document.getElementById('discard-pile');
    discardEl.className = `card-pile discard-pile uno-card ${topCard.color}`;
    discardEl.innerHTML = `<span>${topCard.value}</span><span class="pile-label">زمین بازی</span>`;

    // دست بازیکن من
    let handEl = document.getElementById('player-hand');
    let handHTML = '';
    gameState.myHand.forEach((card, index) => {
        handHTML += `
            <div class="uno-card ${card.color}" onclick="playCard(${index})">
                <span>${card.value}</span>
                <span>${card.value}</span>
            </div>
        `;
    });
    handEl.innerHTML = handHTML;
    document.getElementById('my-card-count').innerText = gameState.myHand.length;
}

function playerDrawCard() {
    if (gameState.currentTurn !== gameState.myIndex) {
        addSystemChat('نوبت شما نیست!');
        return;
    }

    if (gameState.deck.length === 0) {
        let top = gameState.discardPile.pop();
        gameState.deck = [...gameState.discardPile];
        gameState.discardPile = [top];
        shuffleDeck();
    }

    let drawn = gameState.deck.pop();
    gameState.myHand.push(drawn);
    updateUI();
    nextTurn();
}

function playCard(index) {
    if (gameState.currentTurn !== gameState.myIndex) {
        addSystemChat('نوبت شما نیست!');
        return;
    }

    let card = gameState.myHand[index];
    let topCard = gameState.discardPile[gameState.discardPile.length - 1];

    // بررسی تطابق کارت
    let matches = (card.color === topCard.color || card.value === topCard.value || card.color === 'wild');

    if (!matches) {
        // اگر کارت همخوانی نداشت، قانون شما: کارت کشیدن به عنوان جریمه
        playerDrawCard();
        return;
    }

    // اگر کارت Wild بود
    if (card.color === 'wild') {
        gameState.pendingWildCard = index;
        document.getElementById('color-picker-modal').classList.remove('hidden');
        return;
    }

    executePlayCard(index, card);
}

function applyWildColor(chosenColor) {
    document.getElementById('color-picker-modal').classList.add('hidden');
    let index = gameState.pendingWildCard;
    let card = gameState.myHand[index];
    card.color = chosenColor; // رنگ انتخابی اعمال می‌شود
    executePlayCard(index, card);
    gameState.pendingWildCard = null;
}

function executePlayCard(index, card) {
    gameState.myHand.splice(index, 1);
    gameState.discardPile.push(card);

    if (gameState.myHand.length === 0) {
        addSystemChat(`🎉 ${gameState.players[0].name} برنده بازی شد!`);
        alert('تبریک! شما برنده شدید.');
        return;
    }

    updateUI();
    nextTurn();
}

function nextTurn() {
    gameState.currentTurn = (gameState.currentTurn + 1) % gameState.players.length;
    updateUI();

    // اگر نوبت بات‌ها بود
    if (gameState.players[gameState.currentTurn].isBot) {
        setTimeout(botTurn, 1000);
    }
}

function botTurn() {
    // هوش مصنوعی ساده برای بات‌ها
    let bot = gameState.players[gameState.currentTurn];
    bot.handCount = Math.max(1, bot.handCount + (Math.random() > 0.5 ? 1 : -1));
    
    if (bot.handCount <= 0) {
        addSystemChat(`🏆 ${bot.name} برنده شد!`);
        return;
    }

    nextTurn();
}

// سیستم چت و صدا
function sendChatMsg() {
    let input = document.getElementById('chat-input');
    let text = input.value.trim();
    if (text === '') return;

    let myName = gameState.players[0].name;
    let chatBox = document.getElementById('chat-messages');
    chatBox.innerHTML += `<div class="chat-msg user-chat"><b>${myName}:</b> ${text}</div>`;
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addSystemChat(msg) {
    let chatBox = document.getElementById('chat-messages');
    chatBox.innerHTML += `<div class="chat-msg system">${msg}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function toggleAudio() {
    gameState.soundEnabled = !gameState.soundEnabled;
    let btn = document.getElementById('audio-toggle-btn');
    btn.innerText = gameState.soundEnabled ? '🔊' : '🔇';
    addSystemChat(gameState.soundEnabled ? 'صدا روشن شد.' : 'صدا قطع شد.');
}

function toggleMic() {
    gameState.micEnabled = !gameState.micEnabled;
    let btn = document.getElementById('mic-toggle-btn');
    btn.innerText = gameState.micEnabled ? '🎙️' : '🎤';
    addSystemChat(gameState.micEnabled ? 'میکروفون فعال شد.' : 'میکروفون غیرفعال شد.');
    }
        
