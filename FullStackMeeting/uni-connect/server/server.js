require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 4000;

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const rooms = {}; // { roomId: Set<socketId> }
const socketIdToName = {}; // { socketId: displayName }

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('join-room', ({ roomId, displayName }) => {
        console.log(`${displayName || socket.id} joining ${roomId}`);

        socketIdToName[socket.id] = displayName;
        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = new Set();
        const peers = rooms[roomId];

        // send list of existing peers to the joining socket
        const others = Array.from(peers).map(id => ({ id, displayName: socketIdToName[id] }));
        socket.emit('joined', { you: socket.id, others });

        // notify existing peers about the new peer
        socket.to(roomId).emit('new-peer', { peerId: socket.id, displayName });

        peers.add(socket.id);
    });

    socket.on('signal', ({ to, from, data }) => {
        io.to(to).emit('signal', { from, data });
    });

    socket.on('chat-message', ({ roomId, message, from }) => {
        io.to(roomId).emit('chat-message', { message, from, ts: Date.now() });
    });

    const leaveAllRooms = () => {
        for (const roomId of Object.keys(rooms)) {
            if (rooms[roomId].has(socket.id)) {
                rooms[roomId].delete(socket.id);
                socket.to(roomId).emit('peer-left', { peerId: socket.id });
                if (rooms[roomId].size === 0) delete rooms[roomId];
            }
        }
        delete socketIdToName[socket.id];
    };

    socket.on('leave-room', ({ roomId }) => {
        if (rooms[roomId]) {
            rooms[roomId].delete(socket.id);
            socket.to(roomId).emit('peer-left', { peerId: socket.id });
            if (rooms[roomId].size === 0) delete rooms[roomId];
        }
        delete socketIdToName[socket.id];
        socket.leave(roomId);
    });

    socket.on('disconnect', () => {
        console.log('socket disconnect', socket.id);
        leaveAllRooms();
    });
});

httpServer.listen(PORT, () => console.log(`Signaling server running on :${PORT}`));
