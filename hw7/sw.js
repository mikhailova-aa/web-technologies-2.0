self.addEventListener('push', event => {
    console.log('Получено новое уведомление', event);
  
    const options = {
      body: event.data.text(Приветики),
  
    };
  
    event.waitUntil(
      self.registration.showNotification('Уведомление от сервера', options)
    );
  });
  
  self.addEventListener('notificationclick', event => {
    event.notification.close();
  });