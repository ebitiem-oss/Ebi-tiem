// --- تنظیمات اولیه و داده‌های کاربر ---
const ADMIN_ID = "ebitiem"; // آیدی سازنده برای دسترسی به پنل ادمین

// تابع برای دریافت اطلاعات کاربر از حافظه گوشی
function getUserData() {
    const savedData = localStorage.getItem('nivra_user');
    return savedData ? JSON.parse(savedData) : null;
}

// تابع برای ذخیره اطلاعات کاربر در حافظه گوشی
function saveUserData(data) {
    localStorage.setItem('nivra_user', JSON.stringify(data));
}

// --- مدیریت صفحه ورود ---
document.getElementById('btn-login').addEventListener('click', () => {
    const idInput = document.getElementById('login-id').value.trim();
    const passInput = document.getElementById('login-pass').value.trim();

    if (idInput.length === 0 || passInput.length < 8) {
        alert("لطفاً آیدی را وارد کرده و رمز عبور را (حداقل ۸ کاراکتر) بنویسید.");
        return;
    }

    // در اینجا ما فرض می‌کنیم کاربر وارد شده است (در آینده با دیتابیس واقعی وصل می‌شود)
    // برای تست، کاربر را در حافظه ذخیره می‌کنیم
    const newUser = {
        id: idInput,
        name: idInput,
        password: passInput,
        hasChangedName: false, // آیا نام را تغییر داده؟
        isSubscribed: false,    // آیا اشتراک دارد؟
        isCreator: (idInput === ADMIN_ID)
    };

    saveUserData(newUser);
    startApp();
});

// --- شروع اصلی اپلیکیشن ---
function startApp() {
    const user = getUserData();
    if (!user) return;

    // مخفی کردن صفحه ورود و نمایش صفحه اصلی
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');

    // تنظیم اطلاعات پروفایل در ظاهر
    document.getElementById('my-id').innerText = "@" + user.id;
    document.getElementById('my-name').innerText = user.name;

    // اگر سازنده بود، دکمه ادمین را نشان بده
    if (user.isCreator) {
        document.getElementById('btn-admin').style.display = "block";
    }

    // نمایش لیست اتاق‌ها
    renderRooms();
}

// --- مدیریت تب‌ها (ناوبری پایین) ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// --- سیستم تغییر پروفایل ---
document.getElementById('btn-edit-profile').addEventListener('click', () => {
    const user = getUserData();
    
    if (user.hasChangedName) {
        alert("شما قبلاً نام خود را تغییر داده‌اید. برای تغییر مجدد نیاز به خرید اشتراک دارید.");
        // اینجا می‌توانیم دکمه خرید اشتراک را فعال کنیم
        return;
    }

    const newName = prompt("نام جدید خود را وارد کنید:");
    if (newName && newName.trim().length > 2) {
        user.name = newName.trim();
        user.hasChangedName = true; // علامت‌گذاری که نام تغییر کرده
        saveUserData(user);
        
        // بروزرسانی ظاهر
        document.getElementById('my-name').innerText = user.name;
        alert("نام شما با موفقیت تغییر کرد.");
    }
});

// --- سیستم اتاق‌ها (مشابه نسخه قبل برای تست) ---
function renderRooms() {
    const roomList = document.getElementById('room-list');
    roomList.innerHTML = ""; 

    for(let i=1; i<=5; i++) {
        const room = document.createElement('div');
        room.className = 'room-item';
        room.innerHTML = `
            <div class="item-pic"></div>
            <div class="item-info">
                <div class="item-name">میزبان ${i}</div>
                <div class="item-sub">در حال بازی...</div>
                <div class="dots-indicator">
                    ${Array(10).fill('<div class="dot active"></div>').join('')}
                </div>
            </div>
        `;
        room.onclick = () => openRoom(`میزبان ${i}`);
        roomList.appendChild(room);
    }
}

function openRoom(hostName) {
    document.getElementById('room-host-name').innerText = hostName;
    document.getElementById('room-overlay').style.display = "flex";
    
    const seatsContainer = document.getElementById('seats-container');
    seatsContainer.innerHTML = "";
    
    for(let i=1; i<=10; i++) {
        const seat = document.createElement('div');
        seat.className = 'room-item';
        if(i <= 3) {
            seat.innerHTML = `
                <div class="item-pic"></div>
                <div class="item-info">
                    <div class="item-name">بازیکن ${i}</div>
                    <div class="item-sub">آماده ✅</div>
                </div>
            `;
        } else {
            seat.innerHTML = `<div class="item-sub" style="margin-right:50px;">اینجا خالی است</div>`;
        }
        seatsContainer.appendChild(seat);
    }
}

document.getElementById('close-room').onclick = () => {
    document.getElementById('room-overlay').style.display = "none";
};

// --- دکمه فراموشی رمز عبور ---
document.getElementById('btn-forgot').onclick = () => {
    alert("برای بازیابی رمز عبور با شماره 09991990035 تماس بگیرید.");
};

// --- پنل ادمین (فقط برای سازنده) ---
document.getElementById('btn-admin').onclick = () => {
    const targetId = prompt("آیدی کاربری که می‌خواهید رمز عبورش ریست شود را وارد کنید:");
    if(targetId) {
        alert("درخواست شما برای ریست کردن رمز " + targetId + " ثبت شد (در نسخه اصلی به دیتابیس ارسال می‌شود).");
    }
};

// در پایان، اگر از قبل کاربری در حافظه بود، مستقیماً وارد شود
window.onload = () => {
    const user = getUserData();
    if(user) {
        // برای تست، اگر می‌خواهی همیشه صفحه ورود را ببینی، خط زیر را کامنت کن
        startApp();
    }
};
