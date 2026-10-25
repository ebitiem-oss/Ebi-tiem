let scene, camera, renderer;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let weaponModel;
let micActive = false;

let touchStartX = 0, touchStartY = 0;
let cameraRotationY = 0, cameraRotationX = 0;

let peer, conn;
let myPeerId = '';
let remotePlayers = {}; 
let bullets = [];

let playerHP = 100;
let playerScore = 0;
let gameStarted = false;

function startMatchmaking() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    if (!renderer) {
        init3DGame();
        initOnlineMultiplayer();
        animate();
    }
    gameStarted = true;
}

function returnToMenu() {
    gameStarted = false;
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

function init3DGame() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    createDaylightBattlefield();
    addDetailedWeaponModel();
    setupControls();

    window.addEventListener('resize', onWindowResize);
}

function createDaylightBattlefield() {
    const floorGeo = new THREE.PlaneGeometry(150, 150);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x557a46, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const boxMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 });
    for (let i = 0; i < 35; i++) {
        const size = Math.random() * 3 + 1.5;
        const boxGeo = new THREE.BoxGeometry(size, size, size);
        const box = new THREE.Mesh(boxGeo, boxMat);
        
        box.position.x = (Math.random() - 0.5) * 100;
        box.position.y = size / 2;
        box.position.z = (Math.random() - 0.5) * 100;
        scene.add(box);
    }
}

function addDetailedWeaponModel() {
    const weaponGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, metalness: 0.8, roughness: 0.3 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.2 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.75), bodyMat);
    weaponGroup.add(receiver);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65), metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, -0.6);
    weaponGroup.add(barrel);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.16), metalMat);
    mag.rotation.x = -0.2;
    mag.position.set(0, -0.2, -0.1);
    weaponGroup.add(mag);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.4), woodMat);
    stock.position.set(0, -0.05, 0.45);
    weaponGroup.add(stock);

    weaponGroup.position.set(0.3, -0.3, -0.5);
    camera.add(weaponGroup);
    scene.add(camera);
    
    weaponModel = weaponGroup;
}

function initOnlineMultiplayer() {
    peer = new Peer({ host: 'peerjs.com', port: 443, secure: true });

    peer.on('open', (id) => {
        myPeerId = id;
        const elem = document.getElementById('room-id-display');
        if (elem) elem.innerText = myPeerId;
    });

    peer.on('connection', (incomingConn) => {
        setupConnection(incomingConn);
    });
}

function connectToRoom(friendId) {
    if (!friendId) return;
    const outgoingConn = peer.connect(friendId);
    setupConnection(outgoingConn);
}

function setupConnection(connection) {
    conn = connection;
    conn.on('open', () => console.log('متصل شد به:', conn.peer));
    conn.on('data', (data) => {
        if (data.type === 'pos') {
            updateRemotePlayer(data.id, data.x, data.y, data.z, data.rotY, data.color);
        } else if (data.type === 'shoot') {
            triggerRemoteShootEffect(data.id);
        } else if (data.type === 'hit' && data.targetId === myPeerId) {
            applyDamage(15);
        }
    });
}

function updateRemotePlayer(id, x, y, z, rotY, playerColor) {
    if (!remotePlayers[id]) {
        const playerGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        const colors = [0xff3333, 0xffcc00, 0x33cc33];
        const assignedColor = playerColor || colors[Object.keys(remotePlayers).length % colors.length];
        const playerMat = new THREE.MeshStandardMaterial({ color: assignedColor });
        const mesh = new THREE.Mesh(playerGeo, playerMat);
        scene.add(mesh);
        remotePlayers[id] = { mesh: mesh, color: assignedColor };
    }
    remotePlayers[id].mesh.position.set(x, y, z);
    remotePlayers[id].mesh.rotation.y = rotY;
}

function shootWeapon() {
    if (weaponModel) {
        weaponModel.position.z += 0.08;
        setTimeout(() => { weaponModel.position.z -= 0.08; }, 60);
    }

    createBullet();

    if (conn && conn.open) {
        conn.send({ type: 'shoot', id: myPeerId });
    }
}

function createBullet() {
    const bulletGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const bullet = new THREE.Mesh(bulletGeo, bulletMat);

    bullet.position.copy(camera.position);
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    bullet.velocity = direction.multiplyScalar(1.2);
    bullet.life = 100;

    scene.add(bullet);
    bullets.push(bullet);
}

function triggerRemoteShootEffect(id) {
    if (remotePlayers[id]) {
        const pMesh = remotePlayers[id].mesh;
        pMesh.scale.set(1, 1.1, 1);
        setTimeout(() => { pMesh.scale.set(1, 1, 1); }, 100);
    }
}

function applyDamage(amount) {
    playerHP -= amount;
    const hpElem = document.getElementById('player-hp');
    if (hpElem) hpElem.innerText = Math.max(0, playerHP);

    const overlay = document.getElementById('damage-overlay');
    if (overlay) {
        overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
        setTimeout(() => {
            overlay.style.backgroundColor = 'transparent';
        }, 200);
    }

    if (playerHP <= 0) {
        alert('باختی! مجدد تلاش کن.');
        playerHP = 100;
        if (hpElem) hpElem.innerText = playerHP;
        camera.position.set(0, 1.6, 5);
    }
}

function toggleMic() {
    micActive = !micActive;
    const btn = document.getElementById('mic-btn');
    if (btn) {
        btn.innerText = micActive ? "🎙️ مایک: روشن" : "🎙️ مایک: خاموش";
        btn.style.borderColor = micActive ? "#00ff00" : "#555";
    }
}

function setupControls() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickStick = document.getElementById('joystick-stick');
    let isDraggingJoystick = false;
    let joystickCenter = { x: 0, y: 0 };

    if (joystickBase) {
        joystickBase.addEventListener('touchstart', (e) => {
            isDraggingJoystick = true;
            const rect = joystickBase.getBoundingClientRect();
            joystickCenter.x = rect.left + rect.width / 2;
            joystickCenter.y = rect.top + rect.height / 2;
        });
    }

    window.addEventListener('touchstart', (e) => {
        if (!gameStarted) return;
        const touch = e.touches[0];
        if (touch.clientX > window.innerWidth / 2 && !isDraggingJoystick) {
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (!gameStarted) return;
        const touch = e.touches[0];

        if (isDraggingJoystick) {
            const dx = touch.clientX - joystickCenter.x;
            const dy = touch.clientY - joystickCenter.y;
            const distance = Math.min(35, Math.sqrt(dx * dx + dy * dy));
            const angle = Math.atan2(dy, dx);

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            joystickStick.style.transform = `translate(${x}px, ${y}px)`;

            moveForward = y < -8;
            moveBackward = y > 8;
            moveLeft = x < -8;
            moveRight = x > 8;
        } 
        else if (touch.clientX > window.innerWidth / 2) {
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;

            cameraRotationY -= deltaX * 0.003;
            cameraRotationX -= deltaY * 0.003;
            cameraRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotationX));

            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    });

    window.addEventListener('touchend', () => {
        isDraggingJoystick = false;
        if (joystickStick) joystickStick.style.transform = `translate(0px, 0px)`;
        moveForward = moveBackward = moveLeft = moveRight = false;
    });

    const fireBtn = document.getElementById('fire-btn');
    if (fireBtn) {
        fireBtn.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            shootWeapon();
        });
    }
}

let lastNetworkSend = 0;
function animate() {
    requestAnimationFrame(animate);
    if (!gameStarted) return;

    camera.rotation.y = cameraRotationY;
    camera.rotation.x = cameraRotationX;

    const speed = 0.07;
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

    camera.position.y = 1.6;

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.position.add(b.velocity);
        b.life--;
        
        for (let id in remotePlayers) {
            const pMesh = remotePlayers[id].mesh;
            if (b.position.distanceTo(pMesh.position) < 1.0) {
                playerScore += 10;
                document.getElementById('player-score').innerText = playerScore;
                
                if (conn && conn.open) {
                    conn.send({ type: 'hit', targetId: id });
                }

                scene.remove(b);
                bullets.splice(i, 1);
                break;
            }
        }

        if (b && b.life <= 0) {
            scene.remove(b);
            bullets.splice(i, 1);
        }
    }

    if (conn && conn.open && Date.now() - lastNetworkSend > 50) {
        conn.send({
            type: 'pos',
            id: myPeerId,
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
            rotY: cameraRotationY,
            color: 0xffcc00
        });
        lastNetworkSend = Date.now();
    }

    drawMinimap();
    renderer.render(scene, camera);
}

function drawMinimap() {
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 70, 70);

    ctx.fillStyle = 'rgba(0, 40, 0, 0.7)';
    ctx.fillRect(0, 0, 70, 70);

    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(35, 35, 3, 0, Math.PI * 2);
    ctx.fill();

    for (let id in remotePlayers) {
        const p = remotePlayers[id].mesh.position;
        const rx = 35 + (p.x - camera.position.x);
        const rz = 35 + (p.z - camera.position.z);
        if (rx >= 0 && rx <= 70 && rz >= 0 && rz <= 70) {
            ctx.fillStyle = remotePlayers[id].color || '#ff3333';
            ctx.beginPath();
            ctx.arc(rx, rz, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function onWindowResize() {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
            }
        
