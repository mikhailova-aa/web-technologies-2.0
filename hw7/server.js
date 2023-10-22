const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

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

app.post('/subscribe', function (req, res) {
  const subscription = {
    endpoint: req.body.endpoint,
    keys: {
      p256dh: req.body.keys.p256dh,
      auth: req.body.keys.auth
    }
  };
  
  const payload = JSON.stringify({
    title: 'Welcome',
    body: 'Thank you for enabling push notifications',
  });
  const options = {
    TTL: 3600 
  };
  webpush.sendNotification(
    subscription, 
    payload,
    options
  ).then(function() {
    console.log('Send welcome push notification');
    res.status(200).send('Thanks for subscribe my page');
    return;
  }).catch(err => {
    console.error('Unable to send welcome push notification', err );
    res.status(500).send('subscription not possible');
    return;
  });
});

app.listen(5500, () => {
  console.log('Сервер запущен на порту 5500');
});
