const COLORS = ['red', 'yellow', 'green', 'blue'];
const VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', 'Skip', 'Reverse', '+2'];

let gameState = {
    players: [],
    currentPlayer: 0,
    direction: 1, // 1 برای جهت ساعت‌گرد، -1 برای پاد ساعت‌گرد
    discardPile: [],
    playerHands: [],
    deck: [],
    isGameOver: false,
    chatLogs: [],
    pendingWildCardIndex: null
};

function initGameFromSetup() {
    const nameInput = document.getElementById('player-name-input').value.trim();
    const countSelect = document.getElementById('player-count-select').value;
    
    let playerName = nameInput || 'You';
    let totalPlayers = parseInt(countSelect);

    let playersList = [{ id: 0, name: playerName }];
    for (let i = 1; i < totalPlayers; i++) {
        playersList.push({ id: i, name: `Bot ${i}` });
    }

    document.getElementById('setup-screen').style.display = 'none';
    startNewGame(playersList);
}

function startNewGame(playersList) {
    gameState.isGameOver = false;
    gameState.currentPlayer = 0;
    gameState.direction = 1;
    gameState.chatLogs = [{ sender: 'سیستم', text: 'بازی شروع شد! موفق باشید.' }];
    gameState.players = playersList;
    
    let deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(value => {
            deck.push({ color, value });
        });
    });
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'Wild' });
        deck.push({ color: 'wild', value: 'Wild +4' });
    }
    gameState.deck = deck.sort(() => Math.random() - 0.5);

    gameState.playerHands = [];
    gameState.players.forEach(() => {
        let hand = [];
        for (let i = 0; i < 7; i++) {
            if (gameState.deck.length > 0) {
                hand.push(gameState.deck.pop());
            }
        }
        gameState.playerHands.push(hand);
    });

    if (gameState.deck.length > 0) {
        // مطمئن شویم کارت روی میز عدد ساده باشد تا قوانین شروع درگیر نشوند
        let firstCard = gameState.deck.pop();
        while(firstCard.color === 'wild' || firstCard.value === 'Skip' || firstCard.value === 'Reverse' || firstCard.value === '+2') {
            gameState.deck.unshift(firstCard);
            firstCard = gameState.deck.pop();
        }
        gameState.discardPile = [firstCard];
    }

    renderGame();
}

function renderGame() {
    const playersArea = document.getElementById('players-area');
    playersArea.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'player-wrapper';
        
        const profile = document.createElement('div');
        profile.className = `player-profile ${index === gameState.currentPlayer ? 'active' : ''}`;
        
        const countLabel = document.createElement('div');
        countLabel.className = 'card-count';
        countLabel.innerText = `${player.name} (${gameState.playerHands[index].length})`;
        
        wrapper.appendChild(profile);
        wrapper.appendChild(countLabel);
        playersArea.appendChild(wrapper);
    });

    const discardContainer = document.getElementById('discard-pile-container');
    discardContainer.innerHTML = '';
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (topCard) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(topCard.color);
        let displayText = topCard.value;
        if (topCard.chosenColor) {
            displayText += ` (${topCard.chosenColor[0].toUpperCase()})`;
        }
        cardDiv.innerText = displayText;
        discardContainer.appendChild(cardDiv);
    }

    const handContainer = document.getElementById('player-hand');
    handContainer.innerHTML = '';
    const myHand = gameState.playerHands[0];
    
    myHand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundColor = getCardColor(card.color);
        cardDiv.innerText = card.value;
        cardDiv.onclick = () => playCard(0, index);
        handContainer.appendChild(cardDiv);
    });

    updateChatBar();
}

function playCard(playerIndex, cardIndex) {
    if (gameState.isGameOver) return;
    if (playerIndex !== gameState.currentPlayer) return;

    let hand = gameState.playerHands[playerIndex];
    let card = hand[cardIndex];
    let topCard = gameState.discardPile[gameState.discardPile.length - 1];
    let effectiveColor = topCard.chosenColor || topCard.color;

    if (card.color === effectiveColor || card.value === topCard.value || card.color === 'wild') {
        
        // اگر کارت Wild بود، رنگ انتخاب شود
        if (card.color === 'wild') {
            if (playerIndex === 0) {
                gameState.pendingWildCardIndex = cardIndex;
                document.getElementById('color-picker-modal').style.display = 'flex';
                return;
            } else {
                // ربات به صورت تصادفی رنگ انتخاب می‌کند
                let randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                card.chosenColor = randomColor;
            }
        }

        executeCardPlay(playerIndex, cardIndex);
    }
}

function selectWildColor(color) {
    document.getElementById('color-picker-modal').style.display = 'none';
    let cardIndex = gameState.pendingWildCardIndex;
    let hand = gameState.playerHands[0];
    hand[cardIndex].chosenColor = color;
    addChatMessage('You', `رنگ ${color} را انتخاب کرد.`);
    executeCardPlay(0, cardIndex);
    gameState.pendingWildCardIndex = null;
}

function executeCardPlay(playerIndex, cardIndex) {
    let hand = gameState.playerHands[playerIndex];
    let card = hand.splice(cardIndex, 1)[0];
    gameState.discardPile.push(card);

    if (hand.length === 0) {
        gameState.isGameOver = true;
        let winnerName = gameState.players[playerIndex].name;
        addChatMessage('سیستم', `🎉 ${winnerName} برنده شد!`);
        setTimeout(() => alert(`🎉 ${winnerName} برنده شد!`), 100);
        return;
    }

    applyCardEffects(card);
}

function applyCardEffects(card) {
    let nextIdx = getNextPlayerIndex();

    if (card.value === 'Skip') {
        addChatMessage('سیستم', `نوبت ${gameState.players[nextIdx].name} رد شد!`);
        gameState.currentPlayer = nextIdx; // پرش از بازیکن بعدی
        nextTurn(false);
    } else if (card.value === 'Reverse') {
        gameState.direction *= -1;
        addChatMessage('سیستم', 'جهت بازی معکوس شد!');
        nextTurn();
    } else if (card.value === '+2') {
        for (let i = 0; i < 2; i++) {
            if (gameState.deck.length > 0) {
                gameState.playerHands[nextIdx].push(gameState.deck.pop());
            }
        }
        addChatMessage('سیستم', `${gameState.players[nextIdx].name} دو کارت جریمه کشید!`);
        gameState.currentPlayer = nextIdx;
        nextTurn(false);
    } else if (card.value === 'Wild +4') {
        for (let i = 0; i < 4; i++) {
            if (gameState.deck.length > 0) {
                gameState.playerHands[nextIdx].push(gameState.deck.pop());
            }
        }
        addChatMessage('سیستم', `${gameState.players[nextIdx].name} چهار کارت جریمه کشید!`);
        gameState.currentPlayer = nextIdx;
        nextTurn(false);
    } else {
        nextTurn();
    }
}

function getNextPlayerIndex() {
    let count = gameState.players.length;
    return (gameState.currentPlayer + gameState.direction + count) % count;
}

function nextTurn(advance = true) {
    if (advance) {
        gameState.currentPlayer = getNextPlayerIndex();
    }
    renderGame();

    if (gameState.currentPlayer !== 0 && !gameState.isGameOver) {
        setTimeout(botTurn, 1000);
    }
}

function drawCard() {
    if (gameState.isGameOver) return;
    if (gameState.currentPlayer !== 0) return;

    if (gameState.deck.length > 0) {
        let card = gameState.deck.pop();
        gameState.playerHands[0].push(card);
        addChatMessage('سیستم', 'یک کارت کشیدید.');
        nextTurn();
    }
}

function botTurn() {
    if (gameState.isGameOver) return;
    let botIdx = gameState.currentPlayer;
    let hand = gameState.playerHands[botIdx];
    let topCard = gameState.discardPile[gameState.discardPile.length - 1];
    let effectiveColor = topCard.chosenColor || topCard.color;

    let playedIndex = hand.findIndex(c => c.color === effectiveColor || c.value === topCard.value || c.color === 'wild');

    if (playedIndex !== -1) {
        let card = hand[playedIndex];
        if (card.color === 'wild') {
            card.chosenColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
        hand.splice(playedIndex, 1);
        gameState.discardPile.push(card);

        if (hand.length === 0) {
            gameState.isGameOver = true;
            addChatMessage('سیستم', `${gameState.players[botIdx].name} برنده بازی شد!`);
            alert(`😢 ${gameState.players[botIdx].name} برنده شد!`);
            return;
        }

        if (Math.random() < 0.3) {
            const botMsgs = ['عجب کارتی!', 'کارتام دارن تموم میشن!', 'الان می‌برم!'];
            let randomMsg = botMsgs[Math.floor(Math.random() * botMsgs.length)];
            addChatMessage(gameState.players[botIdx].name, randomMsg);
        }

        applyCardEffects(card);
    } else if (gameState.deck.length > 0) {
        hand.push(gameState.deck.pop());
        addChatMessage('سیستم', `${gameState.players[botIdx].name} یک کارت کشید.`);
        nextTurn();
    }
}

function openChatModal() {
    document.getElementById('chat-modal').style.display = 'flex';
    updateChatHistory();
}

function closeChatModal() {
    document.getElementById('chat-modal').style.display = 'none';
}

function addChatMessage(sender, text) {
    gameState.chatLogs.push({ sender, text });
    if (gameState.chatLogs.length > 30) gameState.chatLogs.shift();
    updateChatBar();
    updateChatHistory();
}

function updateChatBar() {
    const chatBar = document.getElementById('chat-messages');
    if (gameState.chatLogs.length > 0) {
        let lastMsg = gameState.chatLogs[gameState.chatLogs.length - 1];
        chatBar.innerText = `${lastMsg.sender}: ${lastMsg.text}`;
    }
}

function updateChatHistory() {
    const historyDiv = document.getElementById('chat-history');
    historyDiv.innerHTML = '';
    gameState.chatLogs.forEach(log => {
        const msgDiv = document.createElement('div');
        msgDiv.innerHTML = `<b>${log.sender}:</b> ${log.text}`;
        historyDiv.appendChild(msgDiv);
    });
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    let text = input.value.trim();
    if (text) {
        let playerName = gameState.players[0] ? gameState.players[0].name : 'You';
        addChatMessage(playerName, text);
        input.value = '';
    }
}

function toggleMic() {
    alert('وضعیت میکروفون تغییر کرد (آماده برای قابلیت صوتی آینده)');
}

function getCardColor(color) {
    switch (color) {
        case 'red': return '#e74c3c';
        case 'blue': return '#3498db';
        case 'green': return '#2ecc71';
        case 'yellow': return '#f1c40f';
        case 'wild': return '#34495e';
        default: return '#95a5a6';
    }
            }
                                                     
