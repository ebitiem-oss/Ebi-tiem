// داده‌های نمونه برای تست
const currentUser = { id: "ebitiem", name: "Nivra Creator", isCreator: true };

// ۱. مدیریت صفحات (تب‌ها)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        item.classList.add('active');
        document.getElementById(item.getAttribute('data-target')).classList.add('active');
    });
});

// ۲. سیستم ورود ساده
document.getElementById('btn-login').addEventListener('click', () => {
    const id = document.getElementById('login-id').value;
    const pass = document.getElementById('login-pass').value;

    if(id && pass.length >= 8) {
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('main-screen').classList.add('active');
        setupApp(id);
    } else {
        alert("آیدی یا رمز عبور اشتباه است (رمز باید ۸ کاراکتر باشد)");
    }
});

// ۳. راه‌اندازی اپلیکیشن پس از ورود
function setupApp(userId) {
    // نمایش نام کاربر در پروفایل
    document.getElementById('my-id').innerText = "@" + userId;
    document.getElementById('my-name').innerText = userId;

    // اگر کاربر سازنده بود، دکمه ادمین را نشان بده
    if(userId === "ebitiem") {
        document.getElementById('btn-admin').style.display = "block";
    }

    renderRooms();
}

// ۴. رندر کردن لیست اتاق‌ها (استایل تلگرامی)
function renderRooms() {
    const roomList = document.getElementById('room-list');
    roomList.innerHTML = ""; // پاک کردن لیست قبلی

    // ساخت ۳ اتاق نمونه برای تست
    for(let i=1; i<=5; i++) {
        const room = document.createElement('div');
        room.className = 'room-item';
        room.innerHTML = `
            <div class="item-pic"></div>
            <div class="item-info">
                <div class="item-name">میزبان شماره ${i}</div>
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

// ۵. باز کردن اتاق
function openRoom(hostName) {
    const overlay = document.getElementById('room-overlay');
    document.getElementById('room-host-name').innerText = hostName;
    overlay.style.display = "flex";
    
    // رندر کردن صندلی‌ها (۱۰ صندلی)
    const seatsContainer = document.getElementById('seats-container');
    seatsContainer.innerHTML = "";
    
    for(let i=1; i<=10; i++) {
        const seat = document.createElement('div');
        seat.className = 'room-item';
        if(i <= 3) { // ۳ نفر اول نشسته باشند
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

// ۶. بستن اتاق
document.getElementById('close-room').onclick = () => {
    document.getElementById('room-overlay').style.display = "none";
};

// ۷. مدیریت فراموشی رمز عبور
document.getElementById('btn-forgot').onclick = () => {
    alert("برای بازیابی رمز عبور با شماره 09991990035 تماس بگیرید.");
};
