// --- وضعیت اولیه و تنظیمات ---
let userProfile = {
    id: "",
    username: "",
    avatar: "https://via.placeholder.com/80",
    pass: "",
    isCreator: false, // برای تست، اگر آیدی شما ebitiem بود خودکار true می‌شود
    hasChangedID: false,
    hasSubscription: false
};

// --- مدیریت صفحات (Routing) ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- مدیریت ناوبری پایین (Bottom Nav) ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        const target = this.getAttribute('data-target');
        
        // تغییر استایل دکمه فعال
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        showScreen(target);
    });
});

// --- مدیریت دکمه بازگشت (Back Buttons) ---
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showScreen('main-menu');
    });
});

// --- منطق ورود (Login Logic) ---
const btnLogin = document.getElementById('btn-login');
const loginIdInput = document.getElementById('login-id');
const loginPassInput = document.getElementById('login-pass');

btnLogin.addEventListener('click', () => {
    const id = loginIdInput.value.trim();
    const pass = loginPassInput.value.trim();

    if (id.length < 1 || pass.length < 8) {
        alert("لطفاً آیدی را وارد کرده و رمز عبور حداقل ۸ کاراکتر باشد.");
        return;
    }

    // شبیه‌سازی ورود (در پروژه واقعی این بخش با دیتابیس وصل می‌شود)
    userProfile.id = id;
    userProfile.username = id; 
    userProfile.pass = pass;
    
    // تست برای ادمین
    if(id === "ebitiem") {
        userProfile.isCreator = true;
        document.getElementById('admin-panel').style.display = 'block';
    }

    updateProfileUI();
    showScreen('main-menu');
});

// --- به‌روزرسانی رابط کاربری پروفایل ---
function updateProfileUI() {
    document.getElementById('display-username').innerText = userProfile.username;
    document.getElementById('user-avatar').src = userProfile.avatar;
    
    // کنترل نمایش اشتراک
    if (userProfile.hasChangedID && !userProfile.hasSubscription) {
        document.getElementById('subscription-msg').style.display = 'block';
        document.getElementById('btn-buy-sub').style.display = 'inline-block';
    }
}

// --- دکمه تغییر پروفایل (با محدودیت تغییر آیدی) ---
document.getElementById('btn-change-profile').addEventListener('click', () => {
    if (userProfile.hasChangedID && !userProfile.hasSubscription) {
        alert("شما قبلاً آیدی خود را تغییر داده‌اید. برای تغییر مجدد نیاز به اشتراک دارید.");
        return;
    }

    const newId = prompt("آیدی جدید را وارد کنید:");
    if (newId && newId.length >= 3) {
        userProfile.username = newId;
        userProfile.hasChangedID = true;
        updateProfileUI();
        alert("آیدی با موفقیت تغییر یافت.");
    }
});

// --- مدیریت خطا در ورود (قفل ۳۰ دقیقه‌ای) ---
let failedAttempts = 0;
let lockUntil = 0;

// این بخش در نسخه نهایی با سرور مدیریت می‌شود، اینجا شبیه‌سازی است
function checkLoginFailure() {
    const now = Date.now();
    if (now < lockUntil) {
        const remaining = Math.ceil((lockUntil - now) / 60000);
        alert(`شما به دلیل ۳ بار ورود اشتباه، ${remaining} دقیقه مسدود هستید.`);
        return true;
    }
    return false;
}

// --- مدیریت بخش بازی‌ها (لیست اتاق‌ها) ---
function renderRooms() {
    const roomList = document.getElementById('room-list');
    roomList.innerHTML = ""; // پاک کردن لیست قبلی

    // شبیه‌سازی چند اتاق
    const dummyRooms = [
        { host: "Ali", avatar: "https://via.placeholder.com/40", players: 3 },
        { host: "Sara", avatar: "https://via.placeholder.com/40", players: 8 },
        { host: "Reza", avatar: "https://via.placeholder.com/40", players: 0 }
    ];

    dummyRooms.forEach(room => {
        const roomEl = document.createElement('div');
        roomEl.className = "menu-card"; // استفاده از استایل مشابه منو برای زیبایی
        roomEl.innerHTML = `
            <img src="${room.avatar}" style="width:40px; height:40px; border-radius:50%;">
            <div style="text-align:right">
                <div style="font-weight:bold">${room.host}</div>
                <div style="font-size:12px; color:#8a9ba8">${room.players}/10 بازیکن</div>
            </div>
            <div class="dots-container">
                ${Array(10).fill(0).map((_, i) => 
                    `<span style="color: ${i < room.players ? '#2ea6ff' : '#22344f'}; margin-right:2px">●</span>`
                ).join('')}
            </div>
        `;
        roomList.appendChild(roomEl);
    });
}

// اجرای اولیه
document.getElementById('menu-games').addEventListener('click', renderRooms);

// مدیریت فراموشی رمز عبور
document.getElementById('forgot-pass').addEventListener('click', () => {
    alert("برای بازیابی رمز عبور با پشتیبانی تماس بگیرید: 09991990035");
});

// مدیریت پنل ادمین
document.getElementById('btn-reset-user-pass').addEventListener('click', () => {
    const targetId = document.getElementById('admin-target-id').value;
    if(targetId) {
        alert(`رمز عبور کاربر ${targetId} با موفقیت ریست شد.`);
        document.getElementById('admin-target-id').value = "";
    }
});
        
