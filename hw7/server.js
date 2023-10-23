const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const redis = require('redis');
const app = express();
app.use(cors());

const client = redis.createClient({
  host: '127.0.0.1',
  port: 6379
});

client.on('connect', () => {
  console.log('Подключение к Redis установлено');
});

client.on('error', (err) => {
  console.error('Ошибка подключения к Redis:', err);
});

const publicKey = 'BAv-qPvotxVD3urcHOE7CKVY1PElPr75pZBY-vNz_c7B8LBepNpYONkCx4Xo1V19b8RcAofi976gROqngnot65c';
const privateKey = 'r8HnLpaKhxsMu-m38_8D8koYYtdINgHHTbbVwUPBJnE';

webpush.setVapidDetails('mailto:youremail@example.com', publicKey, privateKey);

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// Middleware для CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const subscriptions = [];

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);

  const payload = JSON.stringify({
    title: 'У тебя новое сообщение, скорее прочти его',
    body: 'Вдруг там что-то важное',
  });
  const options = {
    TTL: 3600
  };

  Promise.all(subscriptions.map(sub => {
    return webpush.sendNotification(sub, payload, options);
  }))
    .then(() => {
      console.log('Send welcome push notification');
      res.status(200).send('Thanks for subscribing to my page');
    })
    .catch(err => {
      console.error('Unable to send welcome push notification', err);
      res.status(500).send('subscription not possible');
    });
});

app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
