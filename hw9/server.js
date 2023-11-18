// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidV4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// Словарь для отслеживания соединений клиентов в комнатах
const rooms = {};

// WebSocket handling
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Обработка сообщений от клиентов
    const data = JSON.parse(message);
    const { type, roomId, userId } = data;

    if (type === 'join-room') {
      // Присоединение клиента к комнате
      ws.roomId = roomId;
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      rooms[roomId].push(ws);

      // Оповещение других клиентов о подключении нового пользователя
      rooms[roomId].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'user-connected', userId }));
        }
      });

      // Обработка закрытия соединения клиента
      ws.on('close', () => {
        rooms[roomId] = rooms[roomId].filter((client) => client !== ws);

        rooms[roomId].forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'user-disconnected', userId }));
          }
        });
      });
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
