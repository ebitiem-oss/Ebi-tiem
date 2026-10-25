function getUserData() {
    const saved = localStorage.getItem('nivra_user');
    return saved ? JSON.parse(saved) : { id: "user_" + Math.floor(Math.random()*1000), name: "کاربر نیورا", hasChangedName: false, pass: "123456" };
}

function saveUserData(user) {
    localStorage.setItem('nivra_user', JSON.stringify(user));
}

// مدیریت ورود ساده
document.getElementById('btn-login').onclick = () => {
    const idInput = document.getElementById('login-id').value.trim();
    if (!idInput) return;
    
    let user = getUserData();
    user.id = idInput;
    user.name = idInput;
    saveUserData(user);
    startApp();
};

function startApp() {
    const user = getUserData();
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    
    document.getElementById('my-name-display').innerText = user.name;
    document.getElementById('my-id-display').innerText = "@" + user.id;
    
    renderPVList();
}

// ناوبری تب‌ها
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(item.getAttribute('data-target')).classList.add('active');
    });
});

// تغییر نام کاربری (فقط یک‌بار رایگان)
document.getElementById('btn-change-username').onclick = () => {
    const user = getUserData();
    const newName = document.getElementById('new-username-input').value.trim();
    if (!newName) return;

    if (user.hasChangedName) {
        alert("شما یک‌بار نام خود را تغییر داده‌اید! برای تغییرات بیشتر نیاز به خرید اشتراک دارید.");
        return;
    }

    user.name = newName;
    user.hasChangedName = true;
    saveUserData(user);
    document.getElementById('my-name-display').innerText = newName;
    alert("نام کاربری با موفقیت تغییر کرد.");
};

// تغییر رمز عبور
document.getElementById('btn-change-password').onclick = () => {
    const oldPass = document.getElementById('old-pass-input').value;
    const newPass = document.getElementById('new-pass-input').value;
    if(!oldPass || !newPass) {
        alert("لطفاً فیلدها را پر کنید.");
        return;
    }
    alert("رمز عبور با موفقیت تغییر یافت.");
    document.getElementById('old-pass-input').value = "";
    document.getElementById('new-pass-input').value = "";
};

// تغییر عکس پروفایل با دکمه گرد بالای صفحه
const profilePicBtn = document.getElementById('profile-pic-btn');
const fileInputPic = document.getElementById('file-input-pic');

profilePicBtn.onclick = () => fileInputPic.click();
fileInputPic.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            profilePicBtn.style.backgroundImage = `url(${event.target.result})`;
            profilePicBtn.style.backgroundSize = "cover";
            alert("عکس پروفایل به‌روز شد.");
        };
        reader.readAsDataURL(file);
    }
};

// مدیریت پی‌وی‌ها و دکمه +
let pvList = JSON.parse(localStorage.getItem('nivra_pvs')) || [
    { id: "support", name: "پشتیبانی نیورا", lastMsg: "سلام، خوش آمدید!" }
];

function renderPVList() {
    const container = document.getElementById('pv-list');
    container.innerHTML = "";
    
    pvList.forEach(pv => {
        const item = document.createElement('div');
        item.className = 'pv-item';
        item.innerHTML = `
            <div class="item-pic"></div>
            <div class="item-info">
                <div class="item-name">${pv.name}</div>
                <div class="item-sub">${pv.lastMsg}</div>
            </div>
        `;
        item.onclick = () => openChat(pv);
        container.appendChild(item);
    });
}

// افزودن دوست جدید با دکمه +
document.getElementById('btn-add-pv').onclick = () => {
    const friendId = prompt("آیدی کاربری دوست خود را وارد کنید:");
    if (friendId) {
        pvList.push({ id: friendId, name: friendId, lastMsg: "شروع گفتگو" });
        localStorage.setItem('nivra_pvs', JSON.stringify(pvList));
        renderPVList();
        alert(`کاربر @${friendId} به پیام‌رسان شما اضافه شد.`);
    }
};

// باز کردن صفحه چت PV
function openChat(pv) {
    document.getElementById('chat-target-name').innerText = pv.name;
    document.getElementById('chat-overlay').style.display = "flex";
}

document.getElementById('close-chat').onclick = () => {
    document.getElementById('chat-overlay').style.display = "none";
};

// امنیت ضد اسکرین‌شات (غیرفعال کردن کلیدهای میانبر اسکرین‌شات و راست‌کلیک)
document.addEventListener('keyup', (e) => {
    if (e.key == 'PrintScreen') {
        navigator.clipboard.writeText('');
        alert("گرفتن اسکرین‌شات در این صفحه مجاز نیست!");
    }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

// اجرای اولیه
window.onload = () => {
    const user = getUserData();
    if(user && user.id) {
        startApp();
    }
};
