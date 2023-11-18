const videoGrid = document.getElementById('video-grid');

// Инициализация Peer для установления WebRTC-соединений
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001',
});

// Создание видео-элемента для текущего пользователя
const myVideo = document.createElement('video');
myVideo.muted = true; // Отключение звука для собственного видео

// Словарь для хранения соединений с другими пользователями
const peers = {};

// Инициализация WebSocket для обмена сообщениями с сервером
const ws = new WebSocket('ws://localhost:3000'); // Замените на ваш URL WebSocket сервера

// Обработчик открытия WebSocket-соединения
ws.addEventListener('open', () => {
  // Отправка информации о подключении к комнате
  ws.send(JSON.stringify({ type: 'join-room', roomId: ROOM_ID, userId: myPeer.id }));
});

// Получение медиапотока (видео и аудио) с помощью WebRTC
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then((stream) => {
  // Добавление видео текущего пользователя на страницу
  addVideoStream(myVideo, stream);

  // Обработчик для вызовов от других пользователей
  myPeer.on('call', (call) => {
    // Ответ на вызов и добавление видео нового пользователя
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });

  // Обработчик входящих сообщений через WebSocket
  ws.addEventListener('message', (message) => {
    const data = JSON.parse(message.data);
    const { type, userId } = data;

    // Обработка событий подключения и отключения пользователей в комнате
    if (type === 'user-connected') {
      connectToNewUser(userId, stream);
    } else if (type === 'user-disconnected') {
      if (peers[userId]) peers[userId].close();
    }
  });
});

// Функция для установки соединения с новым пользователем
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  
  // Обработчик для потока от нового пользователя
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  // Обработчик для закрытия соединения с пользователем
  call.on('close', () => {
    video.remove();
  });

  // Сохранение соединения в словаре
  peers[userId] = call;
}

// Функция для добавления видео-потока на страницу
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}
