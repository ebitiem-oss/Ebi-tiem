let scene, camera, renderer;
let socket;
let selfId = null;
let currentTargetSocketId = null;
const otherPlayers = new Map();

let moveForward = 0, moveSideways = 0;
let playerPos = { x: 0, y: 1.6, z: 0 };
let playerYaw = 0, playerPitch = 0;
let currentAmmo = 30;
let maxAmmo = 90;
let isReloading = false;
let currentWeapon = "Rifle";
let failedPasswordAttempts = 0;

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// صدای پیشرفته شلیک با توجه به نوع اسلحه
function playGunshotSound() {
  initAudio();
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  if (currentWeapon === "Rifle") {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
  } else if (currentWeapon === "Pistol") {
    osc.type = 'square';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  } else { // چاقو / ضربه
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
  }

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
}

// صدای مکانیکی خشاب‌گذاری
function playReloadSound() {
  initAudio();
  if (!audioCtx) return;
  
  setTimeout(() => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  }, 200);
}

// صدای قدم‌زدن هنگام حرکت
let stepTimer = 0;
function playFootstepSound() {
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

function init() {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e1420);
  scene.fog = new THREE.FogExp2(0x0e1420, 0.025);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(20, 40, 20);
  scene.add(dirLight);

  buildMap();
  initSocket();
  setupControls();
  setupUIEvents();

  window.addEventListener('resize', onWindowResize);
  animate();
}

function buildMap() {
  const floorGeo = new THREE.PlaneGeometry(120, 120);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.8 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(120, 60, 0x34495e, 0x111827);
  grid.position.y = 0.01;
  scene.add(grid);

  const boxMat = new THREE.MeshStandardMaterial({ color: 0x3a424c, roughness: 0.5 });
  for (let i = 0; i < 20; i++) {
    const w = 2 + Math.random() * 4;
    const h = 3 + Math.random() * 4;
    const d = 2 + Math.random() * 4;
    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(
      (Math.random() - 0.5) * 80,
      h / 2,
      (Math.random() - 0.5) * 80
    );
    scene.add(box);
  }
}

function initSocket() {
  socket = io();

  socket.on("welcome", (data) => {
    selfId = data.selfId;
    document.getElementById('input-userid').value = data.userId;
    document.getElementById('input-username').value = data.username;
  });

  socket.on("snapshot", (data) => {
    data.players.forEach(pData => {
      if (pData.id !== selfId) addOrUpdatePlayer(pData);
    });
  });

  socket.on("player_join", (data) => {
    if (data.player.id !== selfId) addOrUpdatePlayer(data.player);
  });

  socket.on("player_leave", (data) => {
    removePlayer(data.id);
  });

  socket.on("state", (data) => {
    data.s.forEach(([id, x, y, z, yaw, pitch]) => {
      if (id !== selfId) {
        let p = otherPlayers.get(id);
        if (p) {
          p.targetX = x;
          p.targetY = y;
          p.targetZ = z;
          p.targetYaw = yaw;
        } else {
          addOrUpdatePlayer({ id, x, y, z, yaw, pitch });
        }
      }
    });
  });

  socket.on("fire_fx", (data) => {
    const p = otherPlayers.get(data.id);
    if (p) {
      createMuzzleFlash(p.mesh.position);
      playGunshotSound();
    }
  });

  socket.on("friend_found", (data) => {
    const chatBox = document.getElementById('chat-messages-box');
    if (data.success) {
      currentTargetSocketId = data.targetSocketId;
      chatBox.innerHTML += `<div style="color: #2ecc71; margin-bottom: 8px;">✅ به چت خصوصی با ${data.friendId} متصل شدید.</div>`;
    } else {
      chatBox.innerHTML += `<div style="color: #e74c3c; margin-bottom: 8px;">❌ ${data.message}</div>`;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  socket.on("receive_secure_message", (data) => {
    const chatBox = document.getElementById('chat-messages-box');
    currentTargetSocketId = data.senderId;
    chatBox.innerHTML += `<div style="margin-bottom: 8px;"><b style="color: #3498db;">${data.senderUserId}:</b> ${data.message}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

function addOrUpdatePlayer(pData) {
  if (otherPlayers.has(pData.id)) return;
  const geom = new THREE.BoxGeometry(0.8, 1.8, 0.8);
  const mat = new THREE.MeshStandardMaterial({ color: pData.team === 'CT' ? 0x3498db : 0xe74c3c });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(pData.x, pData.y, pData.z);
  scene.add(mesh);

  otherPlayers.set(pData.id, {
    mesh,
    targetX: pData.x,
    targetY: pData.y,
    targetZ: pData.z,
    targetYaw: pData.yaw || 0
  });
}

function removePlayer(id) {
  const p = otherPlayers.get(id);
  if (p) {
    scene.remove(p.mesh);
    otherPlayers.delete(id);
  }
}

let inputSeq = 0;
function sendInput() {
  if (!socket) return;
  inputSeq++;
  socket.emit("input", {
    seq: inputSeq,
    x: playerPos.x,
    y: playerPos.y,
    z: playerPos.z,
    yaw: playerYaw,
    pitch: playerPitch
  });
}

function setupControls() {
  const stick = document.getElementById('joystick-stick');
  const base = document.getElementById('joystick-base');
  let touching = false;
  let baseRect = base.getBoundingClientRect();

  base.addEventListener('touchstart', (e) => {
    touching = true;
    baseRect = base.getBoundingClientRect();
    updateJoystick(e.touches[0]);
  });

  window.addEventListener('touchmove', (e) => {
    if (!touching) return;
    for (let i = 0; i < e.touches.length; i++) {
      updateJoystick(e.touches[i]);
    }
  });

  window.addEventListener('touchend', () => {
    touching = false;
    moveForward = 0;
    moveSideways = 0;
    stick.style.transform = `translate(0px, 0px)`;
  });

  function updateJoystick(touch) {
    const centerX = baseRect.left + baseRect.width / 2;
    const centerY = baseRect.top + baseRect.height / 2;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 40;

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    stick.style.transform = `translate(${dx}px, ${dy}px)`;
    moveSideways = dx / maxDist;
    moveForward = dy / maxDist;
  }

  document.getElementById('btn-fire').addEventListener('click', (e) => {
    e.stopPropagation();
    if (isReloading) return;
    if (currentWeapon === "چاقو") {
      playGunshotSound();
      if (socket) socket.emit("fire");
      return;
    }
    if (currentAmmo > 0) {
      currentAmmo--;
      updateAmmoDisplay();
      playGunshotSound();
      if (socket) socket.emit("fire");
      createMuzzleFlash(camera.position);
    } else {
      triggerReload();
    }
  });

  document.getElementById('btn-reload').addEventListener('click', (e) => {
    e.stopPropagation();
    triggerReload();
  });

  document.getElementById('btn-switch').addEventListener('click', (e) => {
    e.stopPropagation();
    currentWeapon = currentWeapon === "Rifle" ? "Pistol" : "Rifle";
    document.getElementById('weapon-indicator').innerText = currentWeapon === "Rifle" ? "کلاشینکف" : "کلت";
  });

  document.getElementById('btn-knife').addEventListener('click', (e) => {
    e.stopPropagation();
    currentWeapon = "چاقو";
    document.getElementById('weapon-indicator').innerText = "چاقو";
  });

  let isDragging = false;
  let prevX = 0, prevY = 0;

  renderer.domElement.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    prevX = e.clientX;
    prevY = e.clientY;

    playerYaw -= dx * 0.007;
    playerPitch -= dy * 0.007;
    playerPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, playerPitch));
  });

  window.addEventListener('pointerup', () => { isDragging = false; });
}

function setupUIEvents() {
  document.getElementById('btn-open-settings').addEventListener('click', () => {
    document.getElementById('profile-panel').style.display = 'flex';
  });

  document.getElementById('btn-close-profile').addEventListener('click', () => {
    document.getElementById('profile-panel').style.display = 'none';
  });

  document.getElementById('btn-open-messenger').addEventListener('click', () => {
    document.getElementById('messenger-panel').style.display = 'flex';
  });

  document.getElementById('btn-close-messenger').addEventListener('click', () => {
    document.getElementById('messenger-panel').style.display = 'none';
  });

  document.getElementById('btn-open-modes').addEventListener('click', () => {
    document.getElementById('gamemodes-panel').style.display = 'flex';
  });

  document.getElementById('btn-close-modes').addEventListener('click', () => {
    document.getElementById('gamemodes-panel').style.display = 'none';
  });

  document.getElementById('btn-apply-gamemode').addEventListener('click', () => {
    const selectedMode = document.getElementById('select-game-mode').value;
    if (socket) {
      socket.emit('set_gamemode', { mode: selectedMode });
    }
    document.getElementById('gamemodes-panel').style.display = 'none';
  });

  document.getElementById('btn-save-profile').addEventListener('click', () => {
    const passwordInput = document.getElementById('input-password').value;
    const newUsername = document.getElementById('input-username').value;
    const newUserId = document.getElementById('input-userid').value;
    
    if (passwordInput && passwordInput !== "correct123") {
      failedPasswordAttempts++;
      if (failedPasswordAttempts >= 3) {
        document.getElementById('profile-panel').style.display = 'none';
        triggerSecurityLockout();
        return;
      } else {
        alert(`رمز عبور اشتباه است! تعداد تلاش باقیمانده: ${3 - failedPasswordAttempts}`);
        return;
      }
    }

    if (socket) {
      socket.emit('update_profile', { username: newUsername, userId: newUserId });
    }

    alert("تغییرات پروفایل با موفقیت ذخیره شد!");
    failedPasswordAttempts = 0;
    document.getElementById('profile-panel').style.display = 'none';
  });

  document.getElementById('btn-add-friend').addEventListener('click', () => {
    const friendId = document.getElementById('input-friend-id').value.trim();
    if (!friendId) return;
    if (socket) {
      socket.emit('find_friend', { friendId });
    }
  });

  document.getElementById('btn-send-msg').addEventListener('click', () => {
    const msgInput = document.getElementById('input-chat-msg');
    const message = msgInput.value.trim();
    if (!message || !currentTargetSocketId) {
      alert("لطفاً ابتدا با آیدی دوست خود متصل شوید.");
      return;
    }

    if (socket) {
      socket.emit('secure_message', { targetId: currentTargetSocketId, message });
      const chatBox = document.getElementById('chat-messages-box');
      chatBox.innerHTML += `<div style="margin-bottom: 8px;"><b style="color: #2ecc71;">شما:</b> ${message}</div>`;
      chatBox.scrollTop = chatBox.scrollHeight;
      msgInput.value = '';
    }
  });

  if (socket) {
    socket.on('gamemode_changed', (data) => {
      let modeText = "دث‌مچ (Deathmatch)";
      if (data.mode === 'bomb') modeText = "بمب‌گذاری (Bomb Defusal)";
      if (data.mode === 'gun game') modeText, modeText = "گان گیم (Gun Game)";
      document.getElementById('gamemode-display').innerText = modeText;
    });
  }
}

function triggerReload() {
  if (isReloading || maxAmmo <= 0 || currentAmmo === 30) return;
  isReloading = true;
  document.getElementById('ammo-display').innerText = "بارگذاری...";
  playReloadSound();

  setTimeout(() => {
    let needed = 30 - currentAmmo;
    let reloadAmt = Math.min(needed, maxAmmo);
    currentAmmo += reloadAmt;
    maxAmmo -= reloadAmt;
    isReloading = false;
    updateAmmoDisplay();
  }, 1500);
}

function updateAmmoDisplay() {
  document.getElementById('ammo-display').innerText = `${currentAmmo} / ${maxAmmo}`;
}

function createMuzzleFlash(pos) {
  const flashGeo = new THREE.SphereGeometry(0.3, 8, 8);
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.position.copy(pos);
  scene.add(flash);
  setTimeout(() => scene.remove(flash), 50);
}

function triggerSecurityLockout() {
  const lockScreen = document.getElementById('security-lock-screen');
  lockScreen.style.display = 'flex';
  
  let timeLeft = 30 * 60;
  const timerDisplay = document.getElementById('countdown-timer');

  const lockoutInterval = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
      clearInterval(lockoutInterval);
      lockScreen.style.display = 'none';
      failedPasswordAttempts = 0;
    }
    timeLeft--;
  }, 1000);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

let lastSend = 0;
function animate(time) {
  requestAnimationFrame(animate);

  const speed = 0.12;
  const cos = Math.cos(playerYaw);
  const sin = Math.sin(playerYaw);

  let moving = moveForward !== 0 || moveSideways !== 0;
  if (moving) {
    playerPos.x += (moveSideways * cos - moveForward * sin) * speed;
    playerPos.z += (moveSideways * sin + moveForward * cos) * speed;

    // پخش صدای قدم با فاصله زمانی منظم
    stepTimer++;
    if (stepTimer > 25) {
      playFootstepSound();
      stepTimer = 0;
    }
  }

  const cameraDistance = 2.2;
  camera.position.set(
    playerPos.x + Math.sin(playerYaw) * cameraDistance,
    playerPos.y + 0.8,
    playerPos.z + Math.cos(playerYaw) * cameraDistance
  );

  const targetLook = new THREE.Vector3(
    playerPos.x - Math.sin(playerYaw) * 2,
    playerPos.y + 0.4,
    playerPos.z - Math.cos(playerYaw) * 2
  );
  camera.lookAt(targetLook);

  otherPlayers.forEach((p) => {
    p.mesh.position.x += (p.targetX - p.mesh.position.x) * 0.2;
    p.mesh.position.y += (p.targetY - p.mesh.position.y) * 0.2;
    p.mesh.position.z += (p.targetZ - p.mesh.position.z) * 0.2;
  });

  if (time - lastSend > 50) {
    sendInput();
    lastSend = time;
  }

  renderer.render(scene, camera);
}

init();

// رویدادهای فروشگاه
document.getElementById('btn-open-store').addEventListener('click', () => {
  document.getElementById('store-panel').style.display = 'flex';
});

document.getElementById('btn-close-store').addEventListener('click', () => {
  document.getElementById('store-panel').style.display = 'none';
});

function buyItem(itemCode) {
  if (socket) {
    socket.emit('buy_item', { item: itemCode });
  }
}

if (socket) {
  socket.on('purchase_result', (data) => {
    if (data.success) {
      document.getElementById('coin-display').innerText = data.coins;
      if (data.item === 'vip') {
        alert("🎉 تبریک! اشتراک VIP شما فعال شد.");
      } else if (data.item === 'laser_rifle') {
        currentWeapon = "اسلحه لیزری";
        document.getElementById('weapon-indicator').innerText = "اسلحه لیزری";
        alert("⚡ اسلحه لیزری پیشرفته به دست آمد!");
      }
      document.getElementById('store-panel').style.display = 'none';
    } else {
      alert(`❌ خطا: ${data.message}`);
    }
  });
}

document.getElementById('btn-apply-gamemode').addEventListener('click', () => {
  const selectedMode = document.getElementById('select-game-mode').value;
  const selectedMaxPlayers = document.getElementById('select-max-players').value;
  if (socket) {
    socket.emit('set_match_config', { mode: selectedMode, maxPlayers: selectedMaxPlayers });
  }
  document.getElementById('gamemodes-panel').style.display = 'none';
});

if (socket) {
  socket.on('match_config_changed', (data) => {
    let modeText = "دث‌مچ";
    if (data.mode === 'bomb') modeText = "بمب‌گذاری";
    if (data.mode === 'gun game') modeText = "گان گیم";
    
    let capacityText = `${data.maxPlayers} نفره`;
    if (data.maxPlayers == 1) capacityText = "تکی (تمرینی)";

    document.getElementById('gamemode-display').innerText = `${modeText} (${capacityText})`;
  });
}
