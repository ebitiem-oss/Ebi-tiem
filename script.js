let scene, camera, renderer;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let playerHealth = 100;
let weaponModel;
let micActive = false;

// راه‌اندازی اولیه بازی
init3DGame();
animate();

function init3DGame() {
    // ۱. ساخت صحنه و دوربین
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.FogExp2(0x1a1a2e, 0.05);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    // ۲. رندرر
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // ۳. نورپردازی محیطی و خورشید
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // ۴. ساخت محیط جنگی (زمین و موانع)
    createBattlefield();

    // ۵. اضافه کردن مدل تفنگ به دست بازیکن
    addWeaponModel();

    // ۶. تنظیم کنترل‌های لمسی جو استیک
    setupJoystickControls();

    // تغییر سایز صفحه
    window.addEventListener('resize', onWindowResize);
}

function createBattlefield() {
    // زمین بازی
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // دیوارهای موانع نظامی (باکس‌های مختلف)
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x4a5568 });
    for (let i = 0; i < 15; i++) {
        const size = Math.random() * 3 + 1;
        const boxGeo = new THREE.BoxGeometry(size, size, size);
        const box = new THREE.Mesh(boxGeo, boxMat);
        
        box.position.x = (Math.random() - 0.5) * 60;
        box.position.y = size / 2;
        box.position.z = (Math.random() - 0.5) * 60;
        scene.add(box);
    }
}

function addWeaponModel() {
    const weaponGroup = new THREE.Group();
    
    // بدنه تفنگ
    const gunBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.25, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 })
    );
    weaponGroup.add(gunBody);

    // لوله تفنگ
    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, -0.6);
    weaponGroup.add(barrel);

    // جایگاه تفنگ روی دوربین (پایین سمت راست دید بازیکن)
    weaponGroup.position.set(0.35, -0.35, -0.6);
    camera.add(weaponGroup);
    scene.add(camera);
    weaponModel = weaponGroup;
}

function shootWeapon() {
    // افکت لرزش دوربین هنگام شلیک (Recoil)
    camera.rotation.x += 0.03;
    
    // شبیه‌سازی ضربه خوردن تصادفی دشمن یا کم شدن خشاب
    console.log("تیر شلیک شد!");
}

function takeDamage(amount) {
    playerHealth -= amount;
    if (playerHealth < 0) playerHealth = 0;

    document.getElementById('health-bar').style.width = playerHealth + "%";
    document.getElementById('hp-val').innerText = playerHealth;

    // افکت قرمز شدن صفحه
    const flash = document.getElementById('damage-overlay');
    flash.style.animation = 'none';
    flash.offsetHeight; 
    flash.style.animation = 'flash-animation 0.3s ease-out';
}

function toggleMic() {
    micActive = !micActive;
    const btn = document.getElementById('mic-btn');
    if (micActive) {
        btn.innerText = "🎙️ مایک: روشن";
        btn.style.borderColor = "#00ff00";
    } else {
        btn.innerText = "🎙️ مایک: خاموش";
        btn.style.borderColor = "#555";
    }
}

function setupJoystickControls() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickStick = document.getElementById('joystick-stick');
    let isDragging = false;
    let center = { x: 0, y: 0 };

    joystickBase.addEventListener('touchstart', (e) => {
        isDragging = true;
        const rect = joystickBase.getBoundingClientRect();
        center.x = rect.left + rect.width / 2;
        center.y = rect.top + rect.height / 2;
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const dx = touch.clientX - center.x;
        const dy = touch.clientY - center.y;
        const distance = Math.min(40, Math.sqrt(dx * dx + dy * dy));
        const angle = Math.atan2(dy, dx);

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        joystickStick.style.transform = `translate(${x}px, ${y}px)`;

        // تعیین جهت حرکت بر اساس جو استیک
        moveForward = y < -10;
        moveBackward = y > 10;
        moveLeft = x < -10;
        moveRight = x > 10;
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
        joystickStick.style.transform = `translate(0px, 0px)`;
        moveForward = moveBackward = moveLeft = moveRight = false;
    });
}

function animate() {
    requestAnimationFrame(animate);

    // حرکت بازیکن در محیط
    const speed = 0.08;
    if (moveForward) camera.translateZ(-speed);
    if (moveBackward) camera.translateZ(speed);
    if (moveLeft) camera.translateX(-speed);
    if (moveRight) camera.translateX(speed);

    // انیمیشن تنفس و تکان خوردن طبیعی سلاح (Idle & Walking Motion)
    if (weaponModel) {
        const time = Date.now() * 0.003;
        const isMoving = moveForward || moveBackward || moveLeft || moveRight;
        
        if (isMoving) {
            weaponModel.position.y = -0.35 + Math.sin(time * 5) * 0.02;
            weaponModel.position.x = 0.35 + Math.cos(time * 2.5) * 0.02;
        } else {
            weaponModel.position.y = -0.35 + Math.sin(time) * 0.005;
            weaponModel.position.x = 0.35;
        }
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
