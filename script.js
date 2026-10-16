// نسخه ۱۲۰ - پیام‌رسان پیشرفته، تب‌های چت، پیام خصوصی و ایموجی‌های سریع
const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

let gameState = {
    players: [],
    myIndex: 0,
    currentTurn: 0,
    deck: [],
    discardPile: [],
    myHand: [],
    soundEnabled: true,
    micEnabled: false,
    pendingWildCard: null,
    currentTab: 'room',
    privateTarget: null
};

function getRegisteredUsers() {
    let users = localStorage.getItem('neura_registered_users');
    return users ? JSON.parse(users) : ['سارا', 'علی', 'رضا'];
}

function saveRegisteredUsers(users) {
    localStorage.setItem('neura_registered_users', JSON.stringify(users));
}

document.addEventListener('DOMContentLoaded', () => {
    let savedName = localStorage.getItem('neura_my_name');
    if (savedName) {
        document.getElementById('player-name-input').value = savedName;
        let nameChangedBefore = localStorage.getItem('neura_name_changed') === 'true';
        if (nameChangedBefore) {
            document.getElementById('subscription-notice').classList.remove('hidden');
        }
    }

    document.getElementById('start-game-btn').addEventListener('click', initGame);
    document.getElementById('deck-pile').addEventListener('click', playerDrawCard);
    document.getElementById('send-chat-btn').addEventListener('click', sendChatMsg);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMsg();
    });

    document.getElementById('audio-toggle-btn').addEventListener('click', toggleAudio);
    document.getElementById('mic-toggle-btn').addEventListener('click', toggleMic);

    document.querySelectorAll('.color-opt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let chosenColor = e.target.getAttribute('data-color');
            applyWildColor(chosenColor);
        });
    });
});

function initGame() {
    let nameInput = document.getElementById('player-name-input').value.trim();
    let errorEl = document.getElementById('name-error');
    if (nameInput === '') {
        errorEl.innerText = 'لطفاً یک نام وارد کنید!';
        errorEl.classList.remove('hidden');
        return;
    }

    let registeredUsers = getRegisteredUsers();
    let oldSavedName = localStorage.getItem('neura_my_name');
    let nameChangedBefore = localStorage.getItem('neura_name_changed') === 'true';
    let hasActiveSub = localStorage.getItem('neura_has_sub') === 'true';

    if (oldSavedName && oldSavedName !== nameInput && nameChangedBefore && !hasActiveSub) {
        errorEl.innerText = 'شما قبلاً نام خود را تغییر داده‌اید. برای تغییر مجدد باید اشتراک بخرید!';
        errorEl.classList.remove('hidden');
        document.getElementById('subscription-notice').classList.remove('hidden');
        return;
    }

    if (!oldSavedName || oldSavedName !== nameInput) {
        if (registeredUsers.includes(nameInput)) {
            errorEl.innerText = 'این آیدی قبلاً توسط بازیکن دیگری انتخاب شده است!';
            errorEl.classList.remove('hidden');
            return;
        }
        
        if (oldSavedName && oldSavedName !== nameInput) {
            localStorage.setItem('neura_name_changed', 'true');
            registeredUsers = registeredUsers.filter(u => u !== oldSavedName);
        }

        registeredUsers.push(nameInput);
        saveRegisteredUsers(registeredUsers);
        localStorage.setItem('neura_my_name', nameInput);
        if (hasActiveSub) {
            localStorage.setItem('neura_has_sub', 'false');
        }
    }

    errorEl.classList.add('hidden');

    let opponents = registeredUsers.filter(u => u !== nameInput).slice(0, 3);
    while (opponents.length < 3) {
        opponents.push('ربات_' + Math.floor(Math.random() * 100));
    }

    gameState.players = [
        { name: nameInput, isBot: false, handCount: 7 },
        { name: opponents[0], isBot: true, handCount: 7 },
        { name: opponents[1], isBot: true, handCount: 7 },
        { name: opponents[2], isBot: true, handCount: 7 }
    ];

    gameState.myIndex = 0;
    gameState.currentTurn = 0;

    buildDeck();
    shuffleDeck();

    gameState.myHand = [];
    for (let i = 0; i < 7; i++) {
        gameState.myHand.push(gameState.deck.pop());
    }

    let firstCard;
    do {
        shuffleDeck();
        firstCard = gameState.deck.pop();
    } while (firstCard.type === 'wild');

    gameState.discardPile.push(firstCard);

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');

    addSystemChat(`بازی شروع شد. ${nameInput} خوش آمدید!`);
    updateUI();
}

function buySubscription() {
    let confirmBuy = confirm('خرید اشتراک ویژه تغییر نام (نسخه آزمایشی: تایید برای شبیه‌سازی خرید موفق)');
    if (confirmBuy) {
        localStorage.setItem('neura_has_sub', 'true');
        localStorage.setItem('neura_name_changed', 'false');
        document.getElementById('subscription-notice').classList.add('hidden');
        alert('اشتراک شما با موفقیت فعال شد! اکنون می‌توانید نام خود را تغییر دهید.');
    }
}

function buildDeck() {
    gameState.deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(val => {
            gameState.deck.push({ color, value: val, type: 'normal' });
            if (val !== '0') {
                gameState.deck.push({ color, value: val, type: 'normal' });
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
    document.getElementById('current-turn-name').innerText = gameState.players[gameState.currentTurn].name;

    let topCard = gameState.discardPile[gameState.discardPile.length - 1];
    let discardEl = document.getElementById('discard-pile');
    discardEl.className = `card-pile discard-pile uno-card ${topCard.color}`;
    discardEl.innerHTML = `<span>${topCard.value}</span><span class="pile-label">زمین بازی</span>`;

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

    // به‌روزرسانی لیست مخاطبین
    updateContactsUI();
}

function updateContactsUI() {
    let contactsEl = document.getElementById('contacts-list');
    let html = '';
    gameState.players.forEach((p, idx) => {
        if (idx !== gameState.myIndex) {
            html += `
                <div class="contact-item" onclick="startPrivateChat('${p.name}')">
                    <span>${p.name}</span>
                    <span><span class="online-dot"></span> آنلاین</span>
                </div>
            `;
        }
    });
    contactsEl.innerHTML = html;
    document.getElementById('online-count').innerText = gameState.players.length;
}

function switchMessengerTab(tabName) {
    gameState.currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

    if (tabName === 'room') {
        document.querySelector('.messenger-tabs button:nth-child(1)').classList.add('active');
        document.getElementById('tab-room').classList.remove('hidden');
    } else if (tabName === 'private') {
        document.querySelector('.messenger-tabs button:nth-child(2)').classList.add('active');
        document.getElementById('tab-private').classList.remove('hidden');
    } else if (tabName === 'contacts') {
        document.querySelector('.messenger-tabs button:nth-child(3)').classList.add('active');
        document.getElementById('tab-contacts').classList.remove('hidden');
    }
}

function startPrivateChat(playerName) {
    gameState.privateTarget = playerName;
    switchMessengerTab('private');
    let privBox = document.getElementById('private-messages');
    privBox.innerHTML += `<div class="chat-msg system">شروع گفتگوی خصوصی با ${playerName}</div>`;
}

function sendQuickEmoji(emoji) {
    let myName = gameState.players[0].name;
    if (gameState.currentTab === 'room') {
        let chatBox = document.getElementById('chat-messages');
        chatBox.innerHTML += `<div class="chat-msg user-chat"><b>${myName}:</b> ${emoji}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } else if (gameState.currentTab === 'private' && gameState.privateTarget) {
        let privBox = document.getElementById('private-messages');
        privBox.innerHTML += `<div class="chat-msg user-chat"><b>به ${gameState.privateTarget}:</b> ${emoji}</div>`;
        privBox.scrollTop = privBox.scrollHeight;
    }
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

    let matches = (card.color === topCard.color || card.value === topCard.value || card.color === 'wild');

    if (!matches) {
        playerDrawCard();
        return;
    }

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
    card.color = chosenColor;
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

    if (gameState.players[gameState.currentTurn].isBot) {
        setTimeout(botTurn, 1000);
    }
}

function botTurn() {
    let bot = gameState.players[gameState.currentTurn];
    bot.handCount = Math.max(1, bot.handCount + (Math.random() > 0.5 ? 1 : -1));
    
    if (bot.handCount <= 0) {
        addSystemChat(`🏆 ${bot.name} برنده شد!`);
        return;
    }

    nextTurn();
}

function sendChatMsg() {
    let input = document.getElementById('chat-input');
    let text = input.value.trim();
    if (text === '') return;

    let myName = gameState.players[0].name;

    if (gameState.currentTab === 'room') {
        let chatBox = document.getElementById('chat-messages');
        chatBox.innerHTML += `<div class="chat-msg user-chat"><b>${myName}:</b> ${text}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } else if (gameState.currentTab === 'private') {
        if (!gameState.privateTarget) {
            alert('لطفاً ابتدا یک مخاطب را از تب مخاطبین انتخاب کنید.');
            return;
        }
        let privBox = document.getElementById('private-messages');
        privBox.innerHTML += `<div class="chat-msg user-chat"><b>به ${gameState.privateTarget}:</b> ${text}</div>`;
        privBox.scrollTop = privBox.scrollHeight;
    }

    input.value = '';
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
        
