// --- تنظیمات اولیه ---
const ADMIN_ID = "ebitiem";

// مدیریت حافظه و خطاهای ورود
let loginAttempts = parseInt(localStorage.getItem('login_attempts')) || 0;
let lockoutTime = parseInt(localStorage.getItem('lockout_time')) || 0; // زمان پایان مسدودسازی (Timestamp)

function getUserData() {
    const savedData = localStorage.getItem('nivra_user');
    return savedData ? JSON.parse(savedData) : null;
}

function saveUserData(data) {
    localStorage.setItem('nivra_user', JSON.stringify(data));
}

// --- سیستم تایمر مسدودسازی (بسیار مهم) ---
function startLockoutTimer() {
    const now = Date.now();
    const thirtyMinutesInMs = 30 * 60 * 1000;
    const expiryTime = now + thirtyMinutesInMs;
    
    localStorage.setItem('lockout_time', expiryTime);
    localStorage.setItem('login_attempts', 0); // ریست کردن تعداد تلاش‌ها
    
    runTimerDisplay(expiryTime);
}

function runTimerDisplay(expiryTime) {
    const timerInterval = setInterval(() => {
        const now = Date.now();
        const timeLeft = expiryTime - now;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            localStorage.removeItem('lockout_time');
            localStorage.setItem('login_attempts', 0);
            alert("زمان مسدودسازی تمام شد. اکنون می‌توانید دوباره تلاش کنید.");
            document.getElementById('btn-login').disabled = false;
            return;
        }

        // تبدیل میلی‌ثانیه به دقیقه و ثانیه
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        // نمایش تایمر در صفحه (اگر المنت وجود داشت)
        let timerEl = document.getElementById('lockout-timer-display');
        if (!timerEl) {
            timerEl = document.createElement('div');
            timerEl.id = 'lockout-timer-display';
            timerEl.style = "color: red; margin-top: 10px; font-weight: bold;";
            document.querySelector('.login-container').appendChild(timerEl);
        }
        timerEl.innerText = `مسدود شده! تلاش مجدد در: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
    }, 1000);
}

// --- مدیریت ورود ---
document.getElementById('btn-login').addEventListener('click', () => {
    const now = Date.now();
    const expiryTime = parseInt(localStorage.getItem('lockout_time'));

    // چک کردن اینکه آیا کاربر در دوره مسدودسازی است یا خیر
    if (expiryTime && now < expiryTime) {
        alert("شما مسدود هستید! لطفاً صبر کنید.");
        return;
    }

    const idInput = document.getElementById('login-id').value.trim();
    const passInput = document.getElementById('login-pass').value.trim();

    // در دنیای واقعی اینجا چک می‌شود، اینجا برای تست:
    if (idInput === "test" && passInput === "12345678") {
        const user = { id: idInput, name: idInput, hasChangedName: false, isCreator: (idInput === ADMIN_ID) };
        saveUserData(user);
        loginAttempts = 0;
        localStorage.setItem('login_attempts', 0);
        startApp();
    } else {
        // اشتباه وارد شده
        loginAttempts++;
        localStorage.setItem('login_attempts', loginAttempts);
        
        if (loginAttempts >= 3) {
            alert("۳ بار اشتباه! شما ۳۰ دقیقه مسدود شدید.");
            startLockoutTimer();
            document.getElementById('btn-login').disabled = true;
        } else {
            alert(`رمز اشتباه است. (${3 - loginAttempts} تلاش باقی‌مانده)`);
        }
    }
});

// --- شروع اپلیکیشن ---
function startApp() {
    const user = getUserData();
    if (!user) return;

    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    document.getElementById('my-id').innerText = "@" + user.id;
    document.getElementById('my-name').innerText = user.name;
    if (user.isCreator) document.getElementById('btn-admin').style.display = "block";

    renderRooms();
}

// --- بخش اتاق و چت (استایل تلگرام) ---
function openRoom(hostName) {
    const overlay = document.getElementById('room-overlay');
    document.getElementById('room-host-name').innerText = hostName;
    overlay.style.display = "flex";
    
    const seatsContainer = document.getElementById('seats-container');
    seatsContainer.innerHTML = "";
    
    // ساخت صندلی‌ها
    for(let i=1; i<=10; i++) {
        const seat = document.createElement('div');
        seat.className = 'room-item';
        if(i <= 2) {
            seat.innerHTML = `<div class="item-pic"></div><div class="item-info"><div class="item-name">بازیکن ${i}</div><div class="item-sub">آماده ✅</div></div>`;
        } else {
            seat.innerHTML = `<div class="item-sub" style="margin-right:50px;">اینجا خالی است</div>`;
        }
        seatsContainer.appendChild(seat);
    }

    // اضافه کردن بخش چت (استایل حباب تلگرام)
    const chatContainer = document.createElement('div');
    chatContainer.id = "room-chat-area";
    chatContainer.style = "flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px;";
    
    // پیام نمونه
    const msg = document.createElement('div');
    msg.style = "background: #2b5278; padding: 8px 12px; border-radius: 15px; align-self: flex-start; max-width: 80%; font-size: 14px;";
    msg.innerText = "سلام به همه!";
    chatContainer.appendChild(msg);

    const myMsg = document.createElement('div');
    myMsg.style = "background: #2481cc; padding: 8px 12px; border-radius: 15px; align-self: flex-end; max-width: 80%; font-size: 14px;";
    myMsg.innerText = "سلام، خوش آمدید";
    chatContainer.appendChild(myMsg);

    seatsContainer.after(chatContainer);
}

document.getElementById('close-room').onclick = () => {
    document.getElementById('room-overlay').style.display = "none";
    // حذف بخش چت برای باز شدن مجدد اتاق بعدی
    const oldChat = document.getElementById('room-chat-area');
    if(oldChat) oldChat.remove();
};

// سایر توابع (تب‌ها و غیره) مشابه قبل...
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(item.getAttribute('data-target')).classList.add('active');
    });
});

function renderRooms() {
    const roomList = document.getElementById('room-list');
    roomList.innerHTML = ""; 
    for(let i=1; i<=5; i++) {
        const room = document.createElement('div');
        room.className = 'room-item';
        room.innerHTML = `<div class="item-pic"></div><div class="item-info"><div class="item-name">میزبان ${i}</div><div class="item-sub">در حال بازی...</div><div class="dots-indicator">${Array(10).fill('<div class="dot active"></div>').join('')}</div></div>`;
        room.onclick = () => openRoom(`میزبان ${i}`);
        roomList.appendChild(room);
    }
}

window.onload = () => {
    const user = getUserData();
    const now = Date.now();
    const expiryTime = parseInt(localStorage.getItem('lockout_time'));

    if (expiryTime && now < expiryTime) {
        runTimerDisplay(expiryTime);
        document.getElementById('btn-login').disabled = true;
    } else if (user) {
        startApp();
    }
};
        
