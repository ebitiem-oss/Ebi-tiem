// متغیرهای جدید برای مکانیک‌های CoD
let playerHealth = 100;
let weaponModel;
let isReloading = false;

// در تابع init3DGame این‌ها را اضافه کنید:

function addWeaponModel() {
    // ساخت یک مدل ساده برای تفنگ (در مرحله بعد مدل واقعی .glb اضافه می‌کنیم)
    const weaponGroup = new THREE.Group();
    const gunBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.3, 1),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    weaponGroup.add(gunBody);
    
    // قرار دادن تفنگ در زاویه درست (پایین سمت راست دوربین)
    weaponGroup.position.set(0.4, -0.4, -0.8); 
    camera.add(weaponGroup);
    scene.add(camera); // دوربین باید به صحنه اضافه شود تا فرزندانش دیده شوند
    weaponModel = weaponGroup;
}

function shootWeapon() {
    if (isReloading) return;

    // ۱. افکت لرزش دوربین (Recoil)
    camera.rotation.x += 0.05;

    // ۲. افکت بصری شلیک
    console.log("Bang! Shot fired.");
    
    // ۳. اینجا منطق برخورد (Raycasting) برای پیدا کردن دشمن اضافه می‌شود
    checkHit();
}

function checkHit() {
    // شبیه‌سازی برخورد با دشمن (برای تست)
    // در نسخه اصلی، این بخش چک می‌کند آیا تیر به دشمن برخورد کرده یا خیر
}

function takeDamage(amount) {
    playerHealth -= amount;
    if (playerHealth < 0) playerHealth = 0;
    
    // به‌روزرسانی UI
    document.getElementById('health-bar').style.width = playerHealth + "%";
    document.getElementById('hp-val').innerText = playerHealth;

    // افکت لرزش قرمز صفحه
    const flash = document.getElementById('damage-overlay');
    flash.style.animation = 'none';
    flash.offsetHeight; /* trigger reflow */
    flash.style.animation = 'flash-animation 0.3s ease-out';
}

// در تابع animate، تکان‌های طبیعی تفنگ (Idle Animation) را اضافه می‌کنیم
function animateWeapon() {
    if (weaponModel) {
        const time = Date.now() * 0.002;
        weaponModel.position.y = -0.4 + Math.sin(time) * 0.01;
        weaponModel.position.x = 0.4 + Math.cos(time) * 0.01;
    }
}
