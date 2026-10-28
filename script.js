let scene, camera, renderer;
let enemies = [];
let playerTeam = 'CT';
let playerCoins = 5000;
let playerWeapon = 'M4A1 تاکتیکی';
let scoreT = 0, scoreCT = 0;

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let shootInterval = null;
let touchStartX = 0, touchStartY = 0;
let cameraRotationX = 0, cameraRotationY = 0;
let cameraSensitivity = 0.005;

function setMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function openTeamSelect() {
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('team-screen').classList.remove('hidden');
}

function closeTeamSelect() {
    document.getElementById('team-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
}

function startGame(team) {
    playerTeam = team;
    document.getElementById('team-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    setTimeout(() => {
        initThreeJS();
        initControls();
    }, 100);
}

function exitGame() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('settings-modal').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
    if (renderer) {
        document.getElementById('canvas-container').innerHTML = '';
    }
}

function openSettings() { document.getElementById('settings-modal').classList.remove('hidden'); }
function closeSettings() { document.getElementById('settings-modal').classList.add('hidden'); }
function updateVolume(val) { console.log('Volume:', val); }
function updateSensitivity(val) { cameraSensitivity = val * 0.001; }

function openShop() { document.getElementById('shop-modal').classList.remove('hidden'); }
function closeShop() { document.getElementById('shop-modal').classList.add('hidden'); }

function buyItem(name, price) {
    if (playerCoins >= price) {
        playerCoins -= price;
        playerWeapon = name;
        document.getElementById('player-coins').innerText = '💰 ' + playerCoins;
        alert(name + ' با موفقیت خریداری شد!');
        closeShop();
    } else {
        alert('سکه کافی نداری!');
    }
}

function initThreeJS() {
    const container = document.getElementById('canvas-container');
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a24);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(15, 30, 15);
    scene.add(dirLight);

    // زمین بازی
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2b2b36, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // موانع محیطی
    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x8c6239 });
    for (let i = 0; i < 8; i++) {
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set((Math.random() - 0.5) * 40, 1, (Math.random() - 0.5) * 40);
        scene.add(box);
    }

    createEnemies();
    animate();
}

function createEnemies() {
    enemies.forEach(e => scene.remove(e));
    enemies = [];
    const enemyGeo = new THREE.BoxGeometry(1, 2, 1);
    const enemyMat = new THREE.MeshStandardMaterial({ color: playerTeam === 'CT' ? 0xff3b30 : 0x007aff });
    
    for (let i = 0; i < 4; i++) {
        const enemy = new THREE.Mesh(enemyGeo, enemyMat);
        enemy.position.set((Math.random() - 0.5) * 25, 1, -10 - Math.random() * 15);
        scene.add(enemy);
        enemies.push(enemy);
    }
}

function initControls() {
    const container = document.getElementById('canvas-container');

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    container.addEventListener('touchmove', (e) => {
        if (!camera) return;
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        cameraRotationY -= deltaX * cameraSensitivity;
        cameraRotationX -= deltaY * cameraSensitivity;
        cameraRotationX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, cameraRotationX));

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
}

function playerShootOnce() {
    if (enemies.length > 0) {
        cameraRotationX += 0.04; // لگد سلاح
        const target = enemies[0];
        scene.remove(target);
        enemies.shift();
        scoreCT += 100;
        document.querySelector('.score-board').innerText = `تیم T: ${scoreT} | تیم CT: ${scoreCT}`;
        
        if (enemies.length === 0) {
            setTimeout(() => {
                alert('راند برنده شدید!');
                createEnemies();
            }, 500);
        }
    }
}

function startShooting() {
    playerShootOnce();
    if (!shootInterval) {
        shootInterval = setInterval(() => {
            playerShootOnce();
        }, 150);
    }
}

function stopShooting() {
    if (shootInterval) {
        clearInterval(shootInterval);
        shootInterval = null;
    }
}

function playerJump() {
    if (camera && camera.position.y <= 2) {
        camera.position.y += 1.8;
        setTimeout(() => { if(camera) camera.position.y = 2; }, 350);
    }
}

function playerReload() {
    alert('خشاب‌گذاری مجدد ' + playerWeapon + '...');
}

function animate() {
    requestAnimationFrame(animate);

    if (camera) {
        const euler = new THREE.Euler(cameraRotationX, cameraRotationY, 0, 'YXZ');
        camera.quaternion.setFromEuler(euler);

        const speed = 0.1;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();

        if (moveForward) camera.position.addScaledVector(dir, speed);
        if (moveBackward) camera.position.addScaledVector(dir, -speed);
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
