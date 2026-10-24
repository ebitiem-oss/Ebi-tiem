// مدیریت وضعیت کاربر و داده‌های اصلی
let currentUser = {
    id: '',
    pass: '',
    name: '',
    avatar: 'https://via.placeholder.com/80',
    usernameChangedCount: 0,
    hasSubscription: false
};

let failedAttempts = 0;
let isBlocked = false;

// لیست اتاق‌های نمونه برای لابی (بدون نمایش آیدی، فقط نام میزبان و دات‌های صندلی)
let roomsList = [
    { id: 1, hostName: 'سارا', hostAvatar: 'https://via.placeholder.com/50', seatedCount: 4, maxSeats: 10, locked: false },
    { id: 2, hostName: 'رضا', hostAvatar: 'https://via.placeholder.com/50', seatedCount: 2, maxSeats: 10, locked: false },
    { id: 3, hostName: 'الناز', hostAvatar: 'https://via.placeholder.com/50', seatedCount: 7, maxSeats: 10, locked: true }
];

// عملکرد لاگین و بررسی رمز عبور
function handleLogin() {
    if (isBlocked) return;

    const idInput = document.getElementById('login-id').value.trim();
    const passInput = document.getElementById('login-pass').value.trim();

    if (!idInput || !passInput) {
        alert('لطفاً آیدی و رمز عبور را وارد کنید.');
        return;
    }

    if (passInput.length !== 8) {
        alert('رمز عبور باید دقیقاً ۸ کاراکتر باشد.');
        return;
    }

    // بررسی تعداد دفعات اشتباه
    let savedPass = localStorage.getItem('nivra_pass_' + idInput);
    
    if (savedPass && savedPass !== passInput) {
        failedAttempts++;
        if (failedAttempts >= 3) {
            triggerBlockout();
            return;
        }
        alert(`رمز عبور اشتباه است! (${3 - failedAttempts} تلاش باقی‌مانده)`);
        return;
    }

    // اگر اولین بار است، رمز ذخیره شود
    if (!savedPass) {
        localStorage.setItem('nivra_pass_' + idInput, passInput);
    }

    // تنظیم پروفایل کاربر فعلی
    currentUser.id = idInput;
    currentUser.pass = passInput;
    currentUser.name = idInput;
    
    // بررسی دسترسی سازنده (ebitiem)
    if (idInput.toLowerCase() === 'ebitiem') {
        document.getElementById('creator-admin-panel').style.display = 'block';
    }

    // ورود موفق به برنامه اصلی
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-app').style.display = 'flex';
    
    // بارگذاری تنظیمات اولیه پروفایل
    document.getElementById('setting-username').value = currentUser.name;
    document.getElementById('current-avatar').src = currentUser.avatar;
    
    renderRoomsList();
}

// قفل شدن حساب به مدت ۳۰ دقیقه
function triggerBlockout() {
    isBlocked = true;
    document.getElementById('login-form-box').style.display = 'none';
    document.getElementById('block-box').style.display = 'block';

    let timeLeft = 30 * 60; // ۳۰ دقیقه به ثانیه
    const timerInterval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        document.getElementById('countdown-timer').innerText = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isBlocked = false;
            failedAttempts = 0;
            document.getElementById('block-box').style.display = 'none';
            document.getElementById('login-form-box').style.display = 'block';
        }
        timeLeft--;
    }, 1000);
}

function showForgotPass() {
    document.getElementById('login-form-box').style.display = 'none';
    document.getElementById('forgot-box').style.display = 'block';
}

function backToLogin() {
    document.getElementById('forgot-box').style.display = 'none';
    document.getElementById('login-form-box').style.display = 'block';
}

// جابه‌جایی تب‌ها در منوی پایین
function switchTab(tabName, btnElement) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    document.getElementById('tab-' + tabName).classList.add('active');
    btnElement.classList.add('active');
}

// رندر کردن لیست اتاق‌ها در لابی
function renderRoomsList() {
    const container = document.getElementById('rooms-list-container');
    container.innerHTML = '';

    roomsList.forEach(room => {
        let dotsHTML = '';
        for (let i = 1; i <= room.maxSeats; i++) {
            let activeClass = i <= room.seatedCount ? 'active' : '';
            dotsHTML += `<div class="dot ${activeClass}"></div>`;
        }

        const row = document.createElement('div');
        row.className = 'room-row';
        row.onclick = () => joinRoom(room);
        row.innerHTML = `
            <img src="${room.hostAvatar}" class="room-host-avatar" alt="host">
            <div class="room-info">
                <h4>اتاق ${room.hostName} ${room.locked ? '<i class="fa-solid fa-lock"></i>' : ''}</h4>
                <div class="dots-container">${dotsHTML}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

// مدیریت پروفایل و محدودیت تغییر نام
function saveUsername() {
    const newName = document.getElementById('setting-username').value.trim();
    if (!newName) return;

    if (currentUser.usernameChangedCount >= 1 && !currentUser.hasSubscription) {
        alert('شما قبلاً یک‌بار نام خود را تغییر داده‌اید. برای تغییر مجدد نیاز به خرید اشتراک دارید.');
        document.getElementById('subscription-box').style.display = 'block';
        return;
    }

    currentUser.name = newName;
    currentUser.usernameChangedCount++;
    alert('نام کاربری با موفقیت به‌روزرسانی شد.');
    
    if (currentUser.usernameChangedCount >= 1) {
        document.getElementById('username-change-warning').innerText = 'سهمیه تغییر رایگان نام به پایان رسیده است.';
    }
}

function buySubscription() {
    currentUser.hasSubscription = true;
    document.getElementById('subscription-box').style.display = 'none';
    alert('اشتراک با موفقیت خریداری شد! اکنون می‌توانید نام خود را تغییر دهید.');
}

function updateAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentUser.avatar = e.target.result;
            document.getElementById('current-avatar').src = currentUser.avatar;
        };
        reader.readAsDataURL(file);
    }
}

// پنل ادمین سازنده (Ebitiem)
function adminResetPassword() {
    const targetId = document.getElementById('admin-target-id').value.trim();
    if (!targetId) {
        alert('لطفاً آیدی کاربر را وارد کنید.');
        return;
    }
    localStorage.removeItem('nivra_pass_' + targetId);
    alert(`رمز عبور کاربر "${targetId}" با موفقیت پاک/ریست شد.`);
    document.getElementById('admin-target-id').value = '';
}

// ورود به اتاق بازی
let currentRoom = null;

function joinRoom(room) {
    currentRoom = room;
    document.getEl
