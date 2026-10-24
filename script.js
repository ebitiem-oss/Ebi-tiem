// ۱. تعریف متغیرهای اصلی برای دسترسی راحت
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginBtn = document.getElementById('btn-login');
const navItems = document.querySelectorAll('.nav-item');
const tabs = document.querySelectorAll('.tab-content');

// ۲. تابع ورود به بازی
loginBtn.onclick = function() {
    const idInput = document.getElementById('login-id').value;
    const passInput = document.getElementById('login-pass').value;

    if (idInput.length > 0 && passInput.length >= 8) {
        console.log("ورود موفقیت‌آمیز بود");
        loginScreen.classList.remove('active');
        mainScreen.classList.add('active');
        // در اینجا می‌توانیم اطلاعات کاربر را ذخیره کنیم
    } else {
        alert("لطفاً آیدی را وارد کنید و رمز عبور حداقل ۸ کاراکتر باشد.");
    }
};

// ۳. تابع تعویض تب‌ها (بخش‌های پایین صفحه)
navItems.forEach(item => {
    item.onclick = function() {
        // پیدا کردن هدف (مثلاً tab-games)
        const targetId = this.getAttribute('data-target');

        // حذف کلاس active از همه دکمه‌های پایین
        navItems.forEach(nav => nav.classList.remove('active'));
        // اضافه کردن کلاس active به دکمه‌ای که کلیک شده
        this.classList.add('active');

        // مخفی کردن همه تب‌ها
        tabs.forEach(tab => tab.classList.remove('active'));
        // نمایش تب مورد نظر
        const targetTab = document.getElementById(targetId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    };
});

// ۴. یک تست ساده برای اطمینان از اینکه فایل لود شده
console.log("فایل اسکریپت با موفقیت لود شد!");
