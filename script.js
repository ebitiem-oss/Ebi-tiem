let scene, camera, renderer;
let moveVector = { x: 0, z: 0 };
let lookAngle = 0;
let isMicActive = false;
let localStream = null;

// ورود
document.getElementById('btn-login').onclick = () => {
    const id = document.getElementById('login-id').value.trim();
    if (!id) {
        alert("لطفاً نام یا آیدی خود را وارد کنید.");
        return;
    }
    localStorage.setItem('nivra_username', id);
    document.getElementById('welcome-user').innerText = `سرباز: ${id}`;
    
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
};

function startGameMode(mode) {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    const modeNames = { 'solo': 'تکی', '4player': '۴ نفره', '8player': '۸ نفره' };
    document.getElementById('room-info-badge').innerText = modeNames[mode];

    init3DGame();
    initJoystick();
    initLookTouch();
    initVoiceChat();
}

// موتور گرافیکی Three.js
function init3DGame() {
    const container = document.getElementById('canvas-container');
    container.innerHTML = "";

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e14);
    scene.fog = new THREE.FogExp2(0x0b0e14, 0.04);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // نورپردازی
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffaa00, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // زمین
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x151b26, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // موانع نظامی
    const boxGeo = new THREE.BoxGeometry(3, 3, 3);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x2b374e });
    
    for (let i = 0; i < 20; i++) {
        const obstacle = new THREE.Mesh(boxGeo, boxMat);
        obstacle.position.x = (Math.random() - 0.5) * 50;
        obstacle.position.z = (Math.random() - 0.5) * 50;
        obstacle.position.y = 1.5;
        scene.add(obstacle);
    }

    camera.position.set(0, 2, 8);
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // حرکت بازیکن بر اساس جو استیک چپ
    camera.position.x += moveVector.x * 0.15;
    camera.position.z += moveVector.z * 0.15;

    // چرخش زاویه دید دوربین
    camera.rotation.y = lookAngle;

    renderer.render(scene, camera);
}

// جو استیک حرکتی (سمت چپ)
function initJoystick() {
    const base = document.getElementById('move-joystick');
    const knob = document.getElementById('move-stick');
    let isDragging = false;
    let baseRect, centerX, centerY;

    base.addEventListener('touchstart', (e) => {
        isDragging = true;
        baseRect = base.getBoundingClientRect();
        centerX = baseRect.left + baseRect.width / 2;
        centerY = baseRect.top + baseRect.height / 2;
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 35;

        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        knob.style.transform = `translate(${dx}px, ${dy}px)`;
        moveVector.x = dx / maxDist;
        moveVector.z = dy / maxDist;
    });

    window.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        knob.style.transform = `translate(0px, 0px)`;
        moveVector.x = 0;
        moveVector.z = 0;
    });
}

// چرخش دوربین با لمس صفحه در سمت راست
function initLookTouch() {
    let lastX = 0;
    window.addEventListener('touchstart', (e) => {
        if (e.touches[0].clientX > window.innerWidth / 2) {
            lastX = e.touches[0].clientX;
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches[0].clientX > window.innerWidth / 2) {
            let currentX = e.touches[0].clientX;
            let deltaX = currentX - lastX;
            lookAngle -= deltaX * 0.005;
            lastX = currentX;
        }
    });
}

// شلیک
function shootWeapon() {
    scene.background = new THREE.Color(0x331100);
    setTimeout(() => {
        scene.background = new THREE.Color(0x0b0e14);
    }, 80);
}

// مایک بالا
async function initVoiceChat() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (err) {
        console.warn("میکروفون در دسترس نیست", err);
    }
}

function toggleMic() {
    if (!localStream) {
        alert("دسترسی به میکروفون داده نشده است.");
        return;
    }
    isMicActive = !isMicActive;
    localStream.getAudioTracks()[0].enabled = isMicActive;
    
    const btn = document.getElementById('btn-mic-top');
    if (isMicActive) {
        btn.classList.add('active');
    } else {
        btn.classList.remove('active');
    }
                }
