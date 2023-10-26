const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://127.0.0.1:5500', // Здесь укажите свой клиентский домен и порт
    methods: ['GET', 'POST']
  }
});

// Обработчик события при подключении клиента
io.on('connection', (socket) => {
  console.log('Клиент подключился');

  // Обработка события от клиента к серверу (C->S)
  socket.on('clientToServer', (data) => {
    console.log('Сообщение от клиента: ', data);

    // Отправка сообщения от сервера к клиенту (S->C)
    socket.emit('serverToClient', 'Привет клиент');
  });


  // Обработчик события при отключении клиента
  socket.on('disconnect', () => {
    console.log('Клиент отключился');
  });
});

// Запуск сервера на порту 3000
server.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
