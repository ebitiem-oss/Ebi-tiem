const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

const players = new Map();
const usersByUsername = new Map();
let currentGameMode = 'deathmatch';
let currentMaxPlayers = 8; // پیش‌فرض ۸ نفره

io.on('connection', (socket) => {
  console.log(`✅ بازیکن متصل شد: ${socket.id}`);

  const team = Math.random() > 0.5 ? 'CT' : 'T';
  const defaultUsername = `User_${socket.id.substring(0, 4)}`;
  const defaultId = `@ebi_${socket.id.substring(0, 3)}`;

  players.set(socket.id, {
    id: socket.id,
    x: (Math.random() - 0.5) * 20,
    y: 1.6,
    z: (Math.random() - 0.5) * 20,
    yaw: 0,
    pitch: 0,
    team: team,
    username: defaultUsername,
    userId: defaultId,
    coins: 1000,
    vip: false
  });

  usersByUsername.set(defaultId, socket.id);

  socket.emit('welcome', { 
    selfId: socket.id, 
    userId: defaultId, 
    username: defaultUsername, 
    gameMode: currentGameMode,
    maxPlayers: currentMaxPlayers,
    coins: 1000,
    vip: false
  });
  
  const snapshot = Array.from(players.values()).map(p => ({
    id: p.id, x: p.x, y: p.y, z: p.z, yaw: p.yaw, team: p.team
  }));
  socket.emit('snapshot', { players: snapshot });

  socket.broadcast.emit('player_join', { player: players.get(socket.id) });

  socket.on('input', (data) => {
    let p = players.get(socket.id);
    if (p) {
      p.x = data.x;
      p.y = data.y;
      p.z = data.z;
      p.yaw = data.yaw;
      p.pitch = data.pitch;
    }
  });

  socket.on('fire', () => {
    socket.broadcast.emit('fire_fx', { id: socket.id });
  });

  // تنظیم حالت بازی و ظرفیت لابی (تکی، ۴ نفره، ۸ نفره)
  socket.on('set_match_config', (data) => {
    if (data.mode) currentGameMode = data.mode;
    if (data.maxPlayers) currentMaxPlayers = parseInt(data.maxPlayers);
    
    io.emit('match_config_changed', { 
      mode: currentGameMode, 
      maxPlayers: currentMaxPlayers 
    });
  });

  socket.on('buy_item', (data) => {
    let p = players.get(socket.id);
    if (!p) return;

    let cost = data.item === 'vip' ? 500 : 250;
    if (p.coins >= cost) {
      p.coins -= cost;
      if (data.item === 'vip') p.vip = true;
      socket.emit('purchase_result', { success: true, item: data.item, coins: p.coins, vip: p.vip });
    } else {
      socket.emit('purchase_result', { success: false, message: 'سکه‌ شما کافی نیست!' });
    }
  });

  socket.on('update_profile', (data) => {
    let p = players.get(socket.id);
    if (p) {
      if (data.userId && data.userId !== p.userId) {
        usersByUsername.delete(p.userId);
        p.userId = data.userId;
        usersByUsername.set(p.userId, socket.id);
      }
      if (data.username) p.username = data.username;
      socket.emit('profile_updated', { success: true, userId: p.userId, username: p.username });
    }
  });

  socket.on('find_friend', (data) => {
    let targetSocketId = usersByUsername.get(data.friendId);
    if (targetSocketId) {
      socket.emit('friend_found', { success: true, friendId: data.friendId, targetSocketId });
    } else {
      socket.emit('friend_found', { success: false, message: 'کاربری با این آیدی پیدا نشد.' });
    }
  });

  socket.on('secure_message', (data) => {
    if (data.targetId) {
      io.to(data.targetId).emit('receive_secure_message', {
        senderId: socket.id,
        senderUserId: players.get(socket.id)?.userId || '@unknown',
        message: data.message,
        timestamp: Date.now()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ بازیکن خارج شد: ${socket.id}`);
    let p = players.get(socket.id);
    if (p) usersByUsername.delete(p.userId);
    players.delete(socket.id);
    io.emit('player_leave', { id: socket.id });
  });

  // ارسال وضعیت هماهنگ‌شده سرور (20 بار در ثانیه)
  setInterval(() => {
    const states = [];
    players.forEach((p) => {
      states.push([p.id, p.x, p.y, p.z, p.yaw, p.pitch]);
    });
    if (states.length > 0) {
      io.emit('state', { s: states });
    }
  }, 50);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 سرور نیورا روی پورت ${PORT} اجرا شد: http://localhost:${PORT}`);
});
