class WebSocketApi {
    constructor() {
        this.events = {};
    }

    send(data) {
        const { event, payload } = data;

        // Отправляем событие и данные подписчикам этого события
        this.events[event].forEach(cb => cb(payload));
    }

    on(event, cb) {
        // Добавляем подписчика для определенного события
        if (!this.events[event]) this.events[event] = [];

        this.events[event].push(cb);
    }
}