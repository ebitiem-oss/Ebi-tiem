const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log(`بازیکن متصل شد: ${socket.id}`);
    
    socket.on('join_game', (userData) => {
        console.log(`کاربر وارد لابی شد:`, userData);
        socket.broadcast.emit('player_joined', { id: socket.id, ...userData });
    });

    socket.on('disconnect', () => {
        console.log(`بازیکن خارج شد: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`سرور نیورا روی پورت ${PORT} روشن است: http://localhost:${PORT}`);
});

