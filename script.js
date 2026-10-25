let scene, camera, renderer;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let playerHealth = 100;
let weaponModel;
let micActive = false;

// متغیرهای چرخش دوربین و کنترل
let touchStartX = 0, touchStartY = 0;
let cameraRotationY = 0, cameraRotationX = 0;

// متغیرهای بخش آنلاین (PeerJS)
let peer, conn;
let myPeerId = '';
let remotePlayers = {}; 

// راه‌اندازی اولیه بازی
init3DGame();
initOnlineMultiplayer();
animate();

function init3DGame() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.FogExp2(0x1a1a2e, 0.05);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    createBattlefield();
    addDetailedWeaponModel();
    setupControls();

    window.addEventListener('resize', onWindowResize);
}

function createBattlefield() {
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

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

    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.8), bodyMat);
    receiver.position.set(0, 0, 0);
    weaponGroup.add(receiver);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7), metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, -0.65);
    weaponGroup.add(barrel);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.18), metalMat);
    mag.rotation.x = -0.2;
    mag.position.set(0, -0.22, -0.15);
    weaponGroup.add(mag);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.12), gripMat);
    grip.rotation.x = 0.3;
    grip.position.set(0, -0.2, 0.25);
    weaponGroup.add(grip);

    const sight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.04), metalMat);
    sight.position.set(0, 0.15, -0.4);
    weaponGroup.add(sight);

    weaponGroup.position.set(0.32, -0.32, -0.55);
    camera.add(weaponGroup);
    scene.add(camera);
    
    weaponModel = weaponGroup;
}

function initOnlineMultiplayer() {
    peer = new Peer({
        host: 'peerjs.com',
        port: 443,
        secure: true
    });

    peer.on('open', (id) => {
        myPeerId = id;
        const roomIdElem = document.getElementById('room-id-display');
        if (roomIdElem) roomIdElem.innerText = myPeerId;
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
    conn.on('open', () => {
        console.log('Connected to player:', conn.peer);
    });

    conn.on('data', (data) => {
        updateRemotePlayer(data.id, data.x, data.y, data.z, data.rotY);
    });
}

function updateRemotePlayer(id, x, y, z, rotY) {
    if (!remotePlayers[id]) {
        const playerGeo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
        const playerMat = new THREE.MeshStandardMaterial({ color: 0xff3333 });
        const mesh = new THREE.Mesh(playerGeo, playerMat);
        scene.add(mesh);
        remotePlayers[id] = mesh;
    }
    remotePlayers[id].position.set(x, y, z);
    remotePlayers[id].rotation.y = rotY;
}

function shootWeapon() {
    cameraRotationX -= 0.02;
    if (weaponModel) {
        weaponModel.position.z += 0.09;
        setTimeout(() => { weaponModel.position.z -= 0.09; }, 70);
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
        const touch = e.touches[0];
        if (touch.clientX > window.innerWidth / 2 && !isDraggingJoystick) {
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    });

    window.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];

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

    camera.rotation.y = cameraRotationY;
    camera.rotation.x = cameraRotationX;

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

    camera.position.y = 1.6;

    if (conn && conn.open && Date.now() - lastNetworkSend > 50) {
        conn.send({
            id: myPeerId,
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
            rotY: cameraRotationY
        });
        lastNetworkSend = Date.now();
    }

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
        
