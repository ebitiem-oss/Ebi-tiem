let scene, camera, renderer, playerBox;
let moveDirection = { x: 0, z: 0 };
let isMicActive = false;
let localStream = null;
let peer = null;

// دکمه ورود
document.getElementById('btn-login').onclick = () => {
    const id = document.getElementById('login-id').value.trim();
    if (!id) {
        alert("لطفاً نام یا آیدی خود را وارد کنید.");
        return;
    }
    localStorage.setItem('nivra_username', id);
    document.getElementById('welcome-user').innerText = `سرباز: ${id}`;
    
    // انتقال به منوی انتخاب حالت
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
};

// شروع حالت بازی
function startGameMode(mode) {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    const modeNames = { 'solo': 'مبارزه تکی', '4player': 'نبرد ۴ نفره', '8player': 'جنگ ۸ نفره' };
    document.getElementById('room-info').innerText = `حالت: ${modeNames[mode]}`;

    // راه‌اندازی موتور گرافیکی سه‌بعدی
    init3DGame();
    
    // راه‌اندازی ارتباط صوتی رایگان
    initVoiceChat();
}

// ساخت محیط سه‌بعدی جنگی (Three.js)
function init3DGame() {
    const container = document.getElementById('canvas-container');
    container.innerHTML = "";

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e14);
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.05);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // نورپردازی محیط نظامی
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffaa00, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // ساخت زمین میدان نبرد
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x151b26, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // ساخت موانع (صندوق‌ها و دیوارهای نظامی)
    const boxGeo = new THREE.BoxGeometry(3, 3, 3);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x2b374e });
    
    for (let i = 0; i < 15; i++) {
        const obstacle = new THREE.Mesh(boxGeo, boxMat);
        obstacle.position.x = (Math.random() - 0.5) * 60;
        obstacle.position.z = (Math.random() - 0.5) * 60;
        obstacle.position.y = 1.5;
        scene.add(obstacle);
    }

    // بازیکن (دوربین اول شخص)
    camera.position.set(0, 2, 10);

    animate();
}

// حلقه رندر گرافیک
function animate() {
    requestAnimationFrame(animate);

    // حرکت بازیکن بر اساس دکمه‌های لمسی
    camera.position.x += moveDirection.x * 0.1;
    camera.position.z += moveDirection.z * 0.1;

    renderer.render(scene, camera);
}

// کنترل‌های حرکتی
function movePlayer(dir) {
    if (dir === 'forward') moveDirection.z = -1;
    if (dir === 'backward') moveDirection.z = 1;
    if (dir === 'left') moveDirection.x = -1;
    if (dir === 'right') moveDirection.x = 1;
}

function stopPlayer() {
    moveDirection.x = 0;
    moveDirection.z = 0;
}

// دکمه شلیک
function shootWeapon() {
    // افکت ساده شلیک (تغییر رنگ زمین یا فلاش دوربین)
    scene.background = new THREE.Color(0x331100);
    setTimeout(() => {
        scene.background = new THREE.Color(0x0b0e14);
    }, 100);
}

// مکالمه صوتی رایگان (مایک) با استفاده از مرورگر و WebRTC
async function initVoiceChat() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        console.log("میکروفون فعال شد.");
    } catch (err) {
        console.warn("دسترسی به میکروفون رد شد یا پشتیبانی نمی‌شود.", err);
    }
}

function toggleMic() {
    if (!localStream) {
        alert("دسترسی به میکروفون فراهم نیست یا مرورگر اجازه نداد.");
        return;
    }
    isMicActive = !isMicActive;
    localStream.getAudioTracks()[0].enabled = isMicActive;
    
    const btn = document.getElementById('btn-mic');
    const status = document.getElementById('mic-status');
    
    if (isMicActive) {
        btn.innerText = "🎤 مایک روشن";
        btn.classList.add('active');
        status.innerText = "وضعیت صدا: در حال ارسال";
    } else {
        btn.innerText = "🎤 قطع مایک";
        btn.classList.remove('active');
        status.innerText = "وضعیت صدا: خاموش";
    }
}
