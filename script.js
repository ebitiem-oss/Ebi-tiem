let scene, camera, renderer;
let isGameStarted = false;

// کنترل منوها و مودال‌ها
function openProfile() { document.getElementById('profile-modal').style.display = 'flex'; }
function closeProfile() { document.getElementById('profile-modal').style.display = 'none'; }

function openFriends() { document.getElementById('friends-modal').style.display = 'flex'; }
function closeFriends() { document.getElementById('friends-modal').style.display = 'none'; }

function openWeapons() { document.getElementById('weapons-modal').style.display = 'flex'; }
function closeWeapons() { document.getElementById('weapons-modal').style.display = 'none'; }

function openSkins() { document.getElementById('skins-modal').style.display = 'flex'; }
function closeSkins() { document.getElementById('skins-modal').style.display = 'none'; }

function openSettings() { document.getElementById('settings-modal').style.display = 'flex'; }
function closeSettings() { document.getElementById('settings-modal').style.display = 'none'; }

function selectWeapon(name) {
    document.getElementById('selected-weapon').innerText = name;
    closeWeapons();
}

function selectSkin(name) {
    document.getElementById('selected-skin').innerText = name;
    closeSkins();
}

function addFriend() {
    const tag = document.getElementById('friend-tag-input').value;
    if (!tag) return;
    const list = document.getElementById('friends-list');
    if (list.innerHTML.includes('هنوز دوستی')) list.innerHTML = '';
    list.innerHTML += `<div style="padding: 8px; background: #0b0f19; margin-top: 5px; border-radius: 4px; display: flex; justify-content: space-between;"><span>${tag}</span><span style="color: #22c55e;">آنلاین (آماده دعوت)</span></div>`;
    document.getElementById('friend-tag-input').value = '';
}

function startGame(mode) {
    document.getElementById('top-bar').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    if (!isGameStarted) {
        initGame();
    }
}

function initGame() {
    isGameStarted = true;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 1, -10);
    scene.add(box);

    const socket = io();
    socket.on('connect', () => {
        console.log('متصل به سرور نیورا:', socket.id);
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
