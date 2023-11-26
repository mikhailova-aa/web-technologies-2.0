const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

let clients = [];

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'offer') {
      // Принимаем предложение и создаем ответ
      const otherClient = clients.find(client => client !== ws);
      if (otherClient) {
        otherClient.send(JSON.stringify({ type: 'offer', offer: parsedMessage.offer, userId: parsedMessage.userId }));
      }
    } else if (parsedMessage.type === 'answer') {
      // Пересылаем ответ другому клиенту
      const otherClient = clients.find(client => client !== ws);
      if (otherClient) {
        otherClient.send(JSON.stringify({ type: 'answer', answer: parsedMessage.answer, userId: parsedMessage.userId }));
      }
    } else if (parsedMessage.type === 'iceCandidate') {
      // Пересылаем кандидата другому клиенту
      const otherClient = clients.find(client => client !== ws);
      if (otherClient) {
        otherClient.send(JSON.stringify({ type: 'iceCandidate', iceCandidate: parsedMessage.iceCandidate, userId: parsedMessage.userId }));
      }
    } else if (parsedMessage.type === 'startVideoChat') {
      // Здесь вы можете добавить логику для начала видеочата, если необходимо
      console.log(`Received startVideoChat request from ${parsedMessage.userId} to ${parsedMessage.partnerUserId}`);
      const partner = clients.find(client => client.userId === parsedMessage.partnerUserId);
      if (partner) {
        // Отправляем запрос на начало видеочата партнеру
        partner.send(JSON.stringify({ type: 'startVideoChat', partnerUserId: parsedMessage.userId }));
      } else {
        console.error(`Partner not found for ${parsedMessage.partnerUserId}`);
      }
    } else if (parsedMessage.type === 'userId') {
      // Сохраняем userId в объекте клиента
      ws.userId = parsedMessage.userId;
      clients.push(ws);
    }
  });

  ws.on('close', () => {
    // Удаляем закрытое соединение из списка клиентов
    clients = clients.filter(client => client !== ws);
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
