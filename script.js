console.log("Nivra SFG2 Edition Loaded");

let scene, camera, renderer;
let coins = 5000;

function openTeamSelect() {
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('team-screen').classList.remove('hidden');
}

function closeTeamSelect() {
    document.getElementById('team-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
}

function openShop() {
    document.getElementById('shop-modal').classList.remove('hidden');
}

function closeShop() {
    document.getElementById('shop-modal').classList.add('hidden');
}

function buyItem(item, price) {
    if (coins >= price) {
        coins -= price;
        document.getElementById('player-coins').innerText = `💰 ${coins}`;
        alert(`موفقیت‌آمیز! ${item} خریداری شد.`);
        closeShop();
    } else {
        alert("سکه کافی نداری!");
    }
}

function startGame(team) {
    document.getElementById('team-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    init3DGame();
}

function exitGame() {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
    if (renderer) {
        document.getElementById('canvas-container').innerHTML = '';
    }
}

function init3DGame() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222233);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // نورپردازی
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x555555));

    // زمین بازی
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // جعبه‌های مانع (شبیه نقشه‌های کانتر)
    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x883333 });
    for (let i = 0; i < 5; i++) {
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set((Math.random() - 0.5) * 20, 1, (Math.random() - 0.5) * 20);
        scene.add(box);
    }

    camera.position.set(0, 3, 10);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

function playerShoot() {
    alert("بنگ! شلیک شد 💥");
}

function playerJump() {
    console.log("پریدن!");
}

function playerReload() {
    console.log("خشاب‌گذاری...");
}

function openProfile() { alert("پروفایل بازیکن نیورا #NEV-7482"); }
function openSettings() { alert("تنظیمات بازی"); }
function openFriends() { alert("سیستم دوستان و دعوت"); }
