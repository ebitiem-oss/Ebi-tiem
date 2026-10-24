// --- وضعیت کاربر ---
let userProfile = {
    id: "",
    username: "",
    avatar: "https://via.placeholder.com/80",
    pass: "",
    isCreator: false,
    hasChangedID: false,
    hasSubscription: false
};

// --- مدیریت تب‌ها در منوی اصلی ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        const targetTabId = this.getAttribute('data-target');
        
        // تغییر دکمه فعال در ناوبری
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // نمایش تب مربوطه
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(targetTabId).classList.add('active');

        // تغییر عنوان هدر بر اساس تب
        const titles = {
            'tab-games': 'بازی‌های اونو',
            'tab-messenger': 'پیام‌رسان (چت خصوصی)',
            'tab-settings': 'تنظیمات و پروفایل'
        };
        document.getElementById('header-title').innerText = titles[targetTabId];

        // اگر تب بازی‌ها انتخاب شد، لیست اتاق‌ها بارگذاری شود
        if(targetTabId === 'tab-games') {
            renderRooms();
        }
    });
});

// --- منطق ورود ---
document.getElementById('btn-login').addEventListener('click', () => {
    const id = document.getElementById('login-id').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (id.length < 1 || pass.length < 8) {
        alert("لطفاً آیدی را وارد کرده و رمز عبور حداقل ۸ کاراکتر باشد.");
        return;
    }

    userProfile.id = id;
    userProfile.username = id;
    userProfile.pass = pass;
    
    // فعال‌سازی پنل ادمین برای سازنده
    if(id === "ebitiem") {
        userProfile.isCreator = true;
        document.getElementById('admin-panel').style.display = 'block';
    }

    updateProfileUI();
    renderRooms();

    // سوئیچ به صفحه اصلی
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
});

// --- به‌روزرسانی رابط کاربری پروفایل ---
function updateProfileUI() {
    document.getElementById('display-username').innerText = userProfile.username;
    document.getElementById('user-avatar').src = userProfile.avatar;
    
    if (userProfile.hasChangedID && !userProfile.hasSubscription) {
        document.getElementById('subscription-msg').style.display = 'block';
        document.getElementById('btn-buy-sub').style.display = 'inline-block';
    }
}

// --- تغییر آیدی ---
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

// --- نمایش لیست اتاق‌ها (لابی اونو) ---
function renderRooms() {
    const roomList = document.getElementById('room-list');
    roomList.innerHTML = "";

    const dummyRooms = [
        { host: "علی", avatar: "https://via.placeholder.com/40", players: 3 },
        { host: "سارا", avatar: "https://via.placeholder.com/40", players: 8 },
        { host: "رضا", avatar: "https://via.placeholder.com/40", players: 10 }
    ];

    dummyRooms.forEach(room => {
        const roomEl = document.createElement('div');
        roomEl.className = "room-card";
        roomEl.innerHTML = `
            <img src="${room.avatar}" alt="میزبان">
            <div class="room-info">
                <div class="host-name">${room.host}</div>
                <div style="font-size:12px; color:#8a9ba8">${room.players}/10 بازیکن</div>
            </div>
            <div class="dots-container">
                ${Array(10).fill(0).map((_, i) => 
                    `<span style="color: ${i < room.players ? '#2ea6ff' : '#22344f'}; font-size:14px;">●</span>`
                ).join('')}
            </div>
        `;
        roomList.appendChild(roomEl);
    });
}

// --- فراموشی رمز عبور ---
document.getElementById('forgot-pass').addEventListener('click', () => {
    alert("برای بازیابی رمز عبور با پشتیبانی تماس بگیرید: 09991990035");
});

// --- ریست رمز توسط سازنده ---
document.getElementById('btn-reset-user-pass').addEventListener('click', () => {
    const targetId = document.getElementById('admin-target-id').value.trim();
    if(targetId) {
        alert(`رمز عبور کاربر ${targetId} با موفقیت ریست شد.`);
        document.getElementById('admin-target-id').value = "";
    } else {
        alert("لطفاً آیدی کاربر را وارد کنید.");
    }
});
