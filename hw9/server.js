const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

const rooms = new Map();

const MESSAGE_TYPES = {
  JOIN_ROOM: 'join-room',
  USER_CONNECTED: 'user-connected',
  OFFER: 'offer',
  ANSWER: 'answer',
  ICE_CANDIDATE: 'ice-candidate',
  JOINED_ROOM: 'joined-room',
};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const { type, roomId, userId, targetUserId, offer, answer, candidate } = data;

    if (type === MESSAGE_TYPES.JOIN_ROOM) {
      ws.roomId = roomId;
      if (!rooms.has(roomId)) {
        rooms.set(roomId, []);
      }
      rooms.get(roomId).push(ws);

      // Если у клиента нет userId, присвоить новый уникальный userId
      ws.userId = userId || uuidv4();

      rooms.get(roomId).forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: MESSAGE_TYPES.USER_CONNECTED, userId: ws.userId }));
        }
      });

      ws.send(JSON.stringify({ type: MESSAGE_TYPES.joined_room, roomId, userId: ws.userId }));

      ws.on('close', () => {
        if (rooms.has(roomId)) {
          rooms.get(roomId).forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type, userId: ws.userId, roomId, [type]: type === MESSAGE_TYPES.OFFER ? offer : answer }));
            }
          });
        }
      });
    } else if (type === MESSAGE_TYPES.OFFER || type === MESSAGE_TYPES.ANSWER) {
      if (rooms.has(roomId)) {
        rooms.get(roomId).forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type, userId: ws.userId, [type]: type === MESSAGE_TYPES.OFFER ? offer : answer }));
          }
        });
      }
    } else if (type === MESSAGE_TYPES.ICE_CANDIDATE) {
      if (rooms.has(roomId)) {
        rooms.get(roomId).forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: MESSAGE_TYPES.ICE_CANDIDATE, userId: ws.userId, candidate }));
          }
        });
      }
    } 
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
