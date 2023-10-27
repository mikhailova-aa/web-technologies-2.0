const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  // Обработка HTTP-запросов
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket Server');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Клиент подключился');

  // Обработка сообщений от клиента
  ws.on('message', (message) => {
    console.log(`Получено сообщение: ${message}`);

    // Отправка сообщения  клиенту
    ws.send('На твой телефон пришло новое сообщение, посмотри вдруг там что-то важное ' );
  });

  // Обработчик события при отключении клиента
  ws.on('close', () => {
    console.log('Клиент отключился');
  });
});

server.listen(3000, () => {
  console.log('Сервер WebSocket запущен на порту 3000');
});
