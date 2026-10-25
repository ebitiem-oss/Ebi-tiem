const ADMIN_ID = "ebitiem";
const SUPPORT_PHONE = "09991990035";

let loginAttempts = parseInt(localStorage.getItem('login_attempts')) || 0;

function getUserData() {
    const saved = localStorage.getItem('nivra_user');
    return saved ? JSON.parse(saved) : null;
}

function saveUserData(data) {
    localStorage.setItem('nivra_user', JSON.stringify(data));
}

// --- سیستم تایمر مسدودسازی ۳۰ دقیقه‌ای ---
function startLockoutTimer() {
    const now = Date.now();
    const expiry = now + (30 * 60 * 1000);
    localStorage.setItem('lockout_time', expiry);
    localStorage.setItem('login_attempts', 0);
    runTimerDisplay(expiry);
}

function runTimerDisplay(expiry) {
    const interval = setInterval(() => {
        const left = expiry - Date.now();
        if (left <= 0) {
            clearInterval(interval);
            localStorage.removeItem('lockout_time');
            localStorage.setItem('login_attempts', 0);
            alert("زمان مسدودسازی تمام شد. می‌توانید دوباره تلاش کنید.");
            document.getElementById('btn-login').disabled = false;
            const timerEl = document.getElementById('lockout-timer-display');
            if(timerEl) timerEl.remove();
            return;
        }
        const min = Math.floor((left % (1000 * 60 * 60)) / (1000 * 60));
        const sec = Math.floor((left % (1000 * 60)) / 1000);
        
        let timerEl = document.getElementById('lockout-timer-display');
        if (!timerEl) {
            timerEl = document.createElement('div');
            timerEl.id = 'lockout-timer-display';
            timerEl.style = "color: #ff4d4d; margin-top: 10px; font-weight: bold; font-size:14px;";
            document.querySelector('.login-container').appendChild(timerEl);
        }
        timerEl.innerText = `مسدود شده! تلاش مجدد در: ${min}:${sec < 10 ? '0' : ''}${sec}`;
    }, 1000);
}

// مدیریت دکمه فراموشی رمز
document.getElementById('btn-forgot').onclick = () => {
    alert(`برای بازیابی رمز عبور با پشتیبانی تماس بگیرید:\n${SUPPORT_PHONE}`);
};

// مدیریت ورود
document.getElementById('btn-login').addEventListener('click', () => {
    const now = Date.now();
    const expiry = parseInt(localStorage.getItem('lockout_time'));
    if (expiry && now < expiry) {
        alert("حساب شما موقتاً مسدود است.");
        return;
    }

    const idInput = document.getElementById('login-id').value.trim();
    const passInput = document.getElementById('login-pass').value.trim();

    if (passInput.length !== 8) {
        alert("رمز عبور باید دقیقاً ۸ کاراکتر باشد.");
        return;
    }

    // تست ورود (می‌توانید با آیدی تست و رمز ۸ رقمی وارد شوید)
    if (idInput && passInput.length === 8) {
        const user = { 
            id: idInput, 
            name: idInput, 
            hasChangedName: false, 
            isCreator: (idInput === ADMIN_ID) 
        };
        saveUserData(user);
        localStorage.setItem('login_attempts', 0);
        startApp();
    } else {
        loginAttempts++;
        localStorage.setItem('login_attempts', loginAttempts);
        if (loginAttempts >= 3) {
            alert("۳ بار رمز اشتباه! ۳۰ دقیقه مسدود شدید.");
            startLockoutTimer();
            document.getElementById('btn-login').disabled = true;
        } else {
            alert(`رمز یا آیدی اشتباه است. (${3 - loginAttempts} تلاش باقی‌مانده)`);
        }
    }
});

// شروع برنامه بعد از ورود موفق
function startApp() {
    const user = getUserData();
    if (!user) return;

    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    document.getElementById('my-id').innerText = "@" + user.id;
    document.getElementById('my-name').innerText = user.name;
    
    if (user.isCreator) {
        document.getElementById('btn-admin').style.display = "block";
    }

    renderRooms();
}

// تغییر نام کاربری (فقط یک‌بار رایگان)
document.getElementById('btn-change-username').onclick = () => {
    const user = getUserData();
    const newName = document.getElementById('new-username-input').value.trim();
    if (!newName) return;

    if (user.hasChangedName) {
        alert("شما یک‌بار نام خود را تغییر داده‌اید! برای تغییرات بیشتر نیاز به خرید اشتراک دارید.");
        document.getElementById('btn-buy-subscription').style.display = "block";
        return;
    }

    user.name = newName;
    user.hasChangedName = true;
    saveUserData(user);
    document.getElementById('my-name').innerText = newName;
    alert("نام کاربری با موفقیت تغییر کرد.");
};

document.getElementById('btn-buy-subscription').onclick = () => {
    alert("درگاه خرید اشتراک (به زودی فعال می‌شود).");
};

// پنل سازنده
document.getElementById('btn-admin').onclick = () => {
    const targetId = prompt("آیدی کاربری که می‌خواهید رمز آن را ریست کنید وارد کنید:");
    if (targetId) {
        alert(`رمز کاربر @${targetId} با موفقیت توسط سازنده ریست شد.`);
    }
};

// ناوبری بین تب‌ها
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(item.getAttribute('data-target')).classList.add('active');
    });
});

// رندر کردن لابی و اتاق‌ها
function renderRooms() {
    const list = document.getElementById('room-list');
    list.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
        const item = document.createElement('div');
        item.className = 'room-item';
        item.innerHTML = `
            <div class="item-pic"></div>
            <div class="item-info">
                <div class="item-name">میزبان ${i}</div>
                <div class="item-sub">در حال بازی...</div>
                <div class="dots-indicator">
                    ${Array(10).fill('<div class="dot active"></div>').join('')}
                </div>
            </div>
        `;
        item.onclick = () => openRoom(`میزبان ${i}`);
        list.appendChild(list.appendChild(item));
    }
}

// باز کردن محیط اتاق
function openRoom(hostName) {
    document.getElementById('room-host-name').innerText = hostName;
    document.getElementById('room-overlay').style.display = "flex";
    
    const container = document.getElementById('seats-container');
    container.innerHTML = "";

    // ساخت لیست صندلی‌ها (۱۰ صندلی)
    for (let i = 1; i <= 10; i++) {
        const seat = document.createElement('div');
        seat.className = 'room-item';
        if (i <= 3) {
            seat.innerHTML = `
                <div class="item-pic" style="width:35px; height:35px;"></div>
                <div class="item-info">
                    <div class="item-name" style="font-size:14px;">بازیکن شماره ${i}</div>
                    <div class="item-sub">آماده ✓</div>
                </div>
            `;
        } else {
            seat.innerHTML = `<div class="item-sub" style="margin-right:40px;">اینجا خالی است</div>`;
        }
        container.appendChild(seat);
    }

    // اضافه کردن بخش چت داخل اتاق
    const chatArea = document.createElement('div');
    chatArea.id = "room-chat-box";
    chatArea.style = "flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px;";
    
    const sampleMsg = document.createElement('div');
    sampleMsg.style = "background:#2b5278; padding:8px 12px; border-radius:12px; max-width:80%; align-self:flex-start; font-size:13px;";
    sampleMsg.innerText = "سلام! خوش آمدید.";
    chatArea.appendChild(sampleMsg);

    container.after(chatArea);
}

// بستن اتاق
document.getElementById('close-room').onclick = () => {
    document.getElementById('room-overlay').style.display = "none";
    const chatBox = document.getElementById('room-chat-box');
    if (chatBox) chatBox.remove();
};

// منوی سه‌نقطه بالایی اتاق
const menuBtn = document.getElementById('room-menu-btn');
const dropdown = document.getElementById('room-dropdown-menu');

menuBtn.onclick = (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
};

window.onclick = () => {
    dropdown.style.display = "none";
};

// گزینه‌های منوی اتاق
document.getElementById('menu-invite').onclick = () => {
    alert("لینک دعوت به اتاق کپی شد!");
};

document.getElementById('menu-attendees').onclick = () => {
    alert("لیست افراد حاضر در اتاق: (نمایش بازیکنان فعال)");
};

const hostModal = document.getElementById('host-settings-modal');
document.getElementById('menu-settings').onclick = () => {
    hostModal.style.display = "flex";
};

document.getElementById('close-host-settings').onclick = () => {
    hostModal.style.display = "none";
};

// ارسال پیام در چت اتاق
document.getElementById('send-chat-btn').onclick = () => {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    const chatBox = document.getElementById('room-chat-box');
    const msg = document.createElement('div');
    msg.style = "background:#2481cc; padding:8px 12px; border-radius:12px; max-width:80%; align-self:flex-end; font-size:13px;";
    msg.innerText = text;
    chatBox.appendChild(msg);
    
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
};

// بارگذاری اولیه و چک کردن مسدودسازی در صورت رفرش
window.onload = () => {
    const user = getUserData();
    const expiry = parseInt(localStorage.getItem('lockout_time'));
    const now = Date.now();

    if (expiry && now < expiry) {
        runTimerDisplay(expiry);
        document.getElementById('btn-login').disabled = true;
    } else if (user) {
        startApp();
    }
};
            
