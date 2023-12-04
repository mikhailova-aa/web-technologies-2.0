# producer.py

import pika
import message_pb2

def create_message(text):
    message = message_pb2.MyMessage()
    message.text = text
    return message

def produce_message(text):
    # Установите соединение с RabbitMQ
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    # Объявляем очередь
    channel.queue_declare(queue='my_queue')

    # Создаем сообщение
    message = create_message(text)

    # Сериализуем protobuf-сообщение в байты
    message_bytes = message.SerializeToString()

    # Отправляем сообщение в очередь
    channel.basic_publish(exchange='',
                          routing_key='my_queue',
                          body=message_bytes)

    print(f"Отправлено: {message.text}")

    # Закрываем соединение
    connection.close()

# Если этот файл используется как исполняемый, то пример использования функции
if __name__ == '__main__':
    text = input("Введите текст сообщения: ")
    produce_message(text)
