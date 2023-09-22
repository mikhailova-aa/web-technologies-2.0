import tornado.ioloop
import tornado.web
import os

# Глобальная переменная для хранения порядкового номера запроса
request_count = 0

class Homework1Handler(tornado.web.RequestHandler):
    def get(self):
        # Путь к файлу с домашней работой
        homework_file_path = '.\hw1.html'

        # Проверяем существование файла
        if os.path.exists(homework_file_path):
            # Открываем файл и отправляем его содержимое
            with open(homework_file_path, 'rb') as file:
                homework_content = file.read()

            # Устанавливаем заголовок Content-Type для соответствующего типа файла
            self.set_header("Content-Type", "application/html")
            
            # Отправляем содержимое файла в ответе
            self.write(homework_content)
        else:
            self.set_status(404)  # Если файл не найден, устанавливаем статус 404


class Homework2Handler(tornado.web.RequestHandler):
    def get(self):
        # Путь к файлу с домашней работой
        homework_file_path = '.\hw2.css'

        # Проверяем существование файла
        if os.path.exists(homework_file_path):
            # Открываем файл и отправляем его содержимое
            with open(homework_file_path, 'rb') as file:
                homework_content = file.read()

            # Устанавливаем заголовок Content-Type для соответствующего типа файла
            self.set_header("Content-Type", "application/html")
            
            # Отправляем содержимое файла в ответе
            self.write(homework_content)
        else:
            self.set_status(404)  # Если файл не найден, устанавливаем статус 404


class RequestCounterHandler(tornado.web.RequestHandler):
    def get(self):
        global request_count
        request_count += 1
        self.write(f"Порядковый номер запроса: {request_count}")

def make_app():
    # Определяем маршруты для ресурсов
    return tornado.web.Application([
        (r'/hw1', Homework1Handler),
        (r'/hw2', Homework2Handler),
        (r'/request_count', RequestCounterHandler),
    ])

if __name__ == '__main__':
    app = make_app()
    app.listen(8888)
    print('Сервер запущен на порту 8888')
    tornado.ioloop.IOLoop.current().start()
