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

// Генерация и сохранение ключей VAPID в Redis
const vapidKeys = webpush.generateVAPIDKeys();

client.set('publicVAPIDKey', vapidKeys.publicKey, (err) => {
  if (err) {
    console.error('Ошибка при сохранении публичного ключа VAPID в Redis:', err);
  } else {
    console.log('Публичный ключ VAPID сохранен в Redis');
  }
});

client.set('privateVAPIDKey', vapidKeys.privateKey, (err) => {
  if (err) {
    console.error('Ошибка при сохранении приватного ключа VAPID в Redis:', err);
  } else {
    console.log('Приватный ключ VAPID сохранен в Redis');
  }
});

app.use(bodyParser.json());

// Middleware для CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Обработчик GET-запроса для получения publicKey
app.get('/getPublicKey', (req, res) => {
  client.get('publicVAPIDKey', (err, publicVAPIDKey) => {
    if (err) {
      console.error('Ошибка при получении публичного ключа VAPID из Redis:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
    } else {
      res.json({ publicKey: publicVAPIDKey });
    }
  });
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

  // Извлечение ключей VAPID из Redis
  client.get('publicVAPIDKey', (err, publicVAPIDKey) => {
    client.get('privateVAPIDKey', (err, privateVAPIDKey) => {
      if (err) {
        console.error('Ошибка при получении ключей VAPID из Redis:', err);
        res.status(500).send('Ошибка сервера');
      } else {
        webpush.setVapidDetails('mailto:youremail@example.com', publicVAPIDKey, privateVAPIDKey);

        Promise.all(subscriptions.map(sub => {
          return webpush.sendNotification(sub, payload, options);
        }))
          .then(() => {
            console.log('Send welcome push notification');
            res.status(200).send('Thanks for subscribing to my page');
          }).catch(err => {
            console.error('Unable to send welcome push notification:', err);
            res.status(500).send('subscription not possible');
          });
      }
    });
  });
});



app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
