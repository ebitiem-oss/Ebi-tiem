let scene, camera, renderer, player;
let enemies = [];
let bullets = [];
let scoreT = 0, scoreCT = 0;
let playerTeam = 'CT';
let playerCoins = 5000;
let playerWeapon = 'M4A1 تاکتیکی';

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
    initThreeJS();
}

function exitGame() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
    if (renderer) {
        document.getElementById('canvas-container').innerHTML = '';
    }
}

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

function openBuyMenu() {
    openShop();
}

function initThreeJS() {
    const container = document.getElementById('canvas-container');
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111115);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // نورپردازی
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // زمین (نقشه بازی)
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // جعبه‌ها و موانع (شبیه Dust2)
    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    for (let i = 0; i < 5; i++) {
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set((Math.random() - 0.5) * 30, 1, (Math.random() - 0.5) * 30);
        scene.add(box);
    }

    // ساخت بات‌های دشمن
    createEnemies();

    // حلقه رندر
    animate();
}

function createEnemies() {
    const enemyGeo = new THREE.BoxGeometry(1, 2, 1);
    const enemyMat = new THREE.MeshStandardMaterial({ color: playerTeam === 'CT' ? 0xff3333 : 0x3388ff });
    
    for (let i = 0; i < 4; i++) {
        const enemy = new THREE.Mesh(enemyGeo, enemyMat);
        enemy.position.set((Math.random() - 0.5) * 20, 1, -10 - Math.random() * 10);
        scene.add(enemy);
        enemies.push(enemy);
    }
}

function playerShoot() {
    // شلیک به جلو
    if (enemies.length > 0) {
        const target = enemies[0];
        scene.remove(target);
        enemies.shift();
        scoreCT += 100;
        document.querySelector('.score-board').innerText = `تیم T: ${scoreT} | تیم CT: ${scoreCT}`;
        
        if (enemies.length === 0) {
            setTimeout(() => {
                alert('تبریک! برنده این راند شدید!');
                createEnemies();
            }, 500);
        }
    }
}

function playerJump() {
    if (camera.position.y <= 2) {
        camera.position.y += 1.5;
        setTimeout(() => { camera.position.y = 2; }, 300);
    }
}

function playerReload() {
    alert('خشاب‌گذاری مجدد سلاح ' + playerWeapon + '...');
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
