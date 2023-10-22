self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
  };

  event.waitUntil(
    self.registration.showNotification('Уведомление от сервера', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
});


