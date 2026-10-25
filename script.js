let scene, camera, renderer;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let playerHealth = 100;
let weaponModel;
let micActive = false;
let isShooting = false;

// متغیرهای چرخش دوربین (Aiming / Look)
let touchStartX = 0, touchStartY = 0;
let cameraRotationY = 0, cameraRotationX = 0;

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

    // ۳. نورپردازی محیطی
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // ۴. ساخت محیط جنگی
    createBattlefield();

    // ۵. اضافه کردن تفنگ دقیق و مجهز
    addDetailedWeaponModel();

    // ۶. تنظیم کنترل‌های لمسی (جوی استیک چپ و لمس راست برای چرخش/شلیک)
    setupControls();

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

    // دیوارهای موانع نظامی
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.5 });
    for (let i = 0; i < 25; i++) {
        const size = Math.random() * 3 + 1.5;
        const boxGeo = new THREE.BoxGeometry(size, size, size);
        const box = new THREE.Mesh(boxGeo, boxMat);
        
        box.position.x = (Math.random() - 0.5) * 70;
        box.position.y = size / 2;
        box.position.z = (Math.random() - 0.5) * 70;
        scene.add(box);
    }
}

function addDetailedWeaponModel() {
    const weaponGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, metalness: 0.85, roughness: 0.25 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9, roughness: 0.2 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    // بدنه اصلی تفنگ
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.8), bodyMat);
    receiver.position.set(0, 0, 0);
    weaponGroup.add(receiver);

    // لوله تفنگ
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7), metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, -0.65);
    weaponGroup.add(barrel);

    // خشاب
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.18), metalMat);
    mag.rotation.x = -0.2;
    mag.position.set(0, -0.22, -0.15);
    weaponGroup.add(mag);

    // دسته تفنگ
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.12), gripMat);
    grip.rotation.x = 0.3;
    grip.position.set(0, -0.2, 0.25);
    weaponGroup.add(grip);

    // مگسک
    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), metalMat);
    sight.position.set(0, 0.15, -0.4);
    weaponGroup.add(sight);

    weaponGroup.position.set(0.32, -0.32, -0.55);
    camera.add(weaponGroup);
    scene.add(camera);
    
    weaponModel = weaponGroup;
}

function shootWeapon() {
    // لگد تفنگ و دوربین هنگام شلیک
    cameraRotationX -= 0.02;
    
    if (weaponModel) {
        weaponModel.position.z += 0.09;
        setTimeout(() => {
            weaponModel.position.z -= 0.09;
        }, 70);
    }

    // ایجاد افکت فلش شلیک موقت روی صفحه
    const flashOverlay = document.getElementById('damage-overlay');
    flashOverlay.style.background = 'radial-gradient(circle, rgba(255,200,0,0.4) 0%, rgba(0,0,0,0) 70%)';
    flashOverlay.style.opacity = '1';
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
        flashOverlay.style.background = 'rgba(255, 0, 0, 0.3)'; // بازگشت به حالت آسیب
    }, 50);
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

function setupControls() {
    // ۱. جوی‌استیک حرکت (سمت چپ صفحه)
    const joystickBase = document.getElementById('joystick-base');
    const joystickStick = document.getElementById('joystick-stick');
    let isDraggingJoystick = false;
    let joystickCenter = { x: 0, y: 0 };

    joystickBase.addEventListener('touchstart', (e) => {
        isDraggingJoystick = true;
        const rect = joystickBase.getBoundingClientRect();
        joystickCenter.x = rect.left + rect.width / 2;
        joystickCenter.y = rect.top + rect.height / 2;
    });

    // ۲. کنترل چرخش دوربین و شلیک (نیمه راست صفحه)
    window.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        if (touch.clientX > window.innerWidth / 2 && !isDraggingJoystick) {
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    });

    window.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];

        // حرکت جوی‌استیک
        if (isDraggingJoystick) {
            const dx = touch.clientX - joystickCenter.x;
            const dy = touch.clientY - joystickCenter.y;
            const distance = Math.min(40, Math.sqrt(dx * dx + dy * dy));
            const angle = Math.atan2(dy, dx);

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            joystickStick.style.transform = `translate(${x}px, ${y}px)`;

            moveForward = y < -10;
            moveBackward = y > 10;
            moveLeft = x < -10;
            moveRight = x > 10;
        } 
        // چرخش دوربین با لمس سمت راست
        else if (touch.clientX > window.innerWidth / 2) {
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            cameraRotationY -= deltaX * 0.003;
            cameraRotationX -= deltaY * 0.003;

            // محدود کردن زاویه نگاه به بالا و پایین
            cameraRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotationX));

            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    });

    window.addEventListener('touchend', (e) => {
        isDraggingJoystick = false;
        joystickStick.style.transform = `translate(0px, 0px)`;
        moveForward = moveBackward = moveLeft = moveRight = false;
    });

    // دکمه شلیک اختصاصی
    const fireBtn = document.getElementById('fire-btn');
    if (fireBtn) {
        fireBtn.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            shootWeapon();
        });
    }
}

function animate() {
    requestAnimationFrame(animate);

    // اعمال چرخش دوربین
    camera.rotation.y = cameraRotationY;
    camera.rotation.x = cameraRotationX;

    // حرکت بازیکن بر اساس جهت دوربین
    const speed = 0.08;
    const direction = new THREE.Vector3();
    
    if (moveForward) {
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, speed);
    }
    if (moveBackward) {
        camera.getWorldDirection(direction);
        camera.position.addScaledVector(direction, -speed);
    }
    if (moveLeft) {
        const sideDir = new THREE.Vector3(-Math.sin(cameraRotationY), 0, -Math.cos(cameraRotationY));
        camera.position.addScaledVector(sideDir, speed);
    }
    if (moveRight) {
        const sideDir = new THREE.Vector3(Math.sin(cameraRotationY), 0, Math.cos(cameraRotationY));
        camera.position.addScaledVector(sideDir, speed);
    }

    // ثابت نگه داشتن ارتفاع بازیکن روی زمین
    camera.position.y = 1.6;

    // انیمیشن تنفس و تکان سلاح
    if (weaponModel) {
        const time = Date.now() * 0.003;
        const isMoving = moveForward || moveBackward || moveLeft || moveRight;
        
        if (isMoving) {
            weaponModel.position.y = -0.32 + Math.sin(time * 6) * 0.025;
            weaponModel.position.x = 0.32 + Math.cos(time * 3) * 0.025;
        } else {
            weaponModel.position.y = -0.32 + Math.sin(time) * 0.006;
            weaponModel.position.x = 0.32;
        }
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
                }
        
