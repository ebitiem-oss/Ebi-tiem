const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(__dirname));

const players = {};

io.on('connection', (socket) => {
    console.log('کاربر متصل شد:', socket.id);

    players[socket.id] = {
        id: socket.id,
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
        team: 'T',
        health: 100
    };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('playerMovement', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].z = data.z;
            players[socket.id].rotation = data.rotation;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('fire', (data) => {
        socket.broadcast.emit('playerFired', {
            id: socket.id,
            ...data
        });
    });

    socket.on('disconnect', () => {
        console.log('کاربر خارج شد:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 سرور روی پورت ${PORT} اجرا شد`);
});
