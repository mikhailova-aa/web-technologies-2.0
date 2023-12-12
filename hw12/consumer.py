# -*- coding: utf-8 -*-

import pika
import message_pb2  # Импортируем скомпилированный protobuf-модуль

def callback(ch, method, properties, body):
    # Десериализуем байты в protobuf-сообщение
    received_message = message_pb2.MyMessage()
    received_message.ParseFromString(body)
    print("Получено: {}".format(received_message.text))

# Устанавливаем соединение с RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Объявляем очередь
channel.queue_declare(queue='my_queue')

# Устанавливаем callback-функцию для обработки сообщений
channel.basic_consume(queue='my_queue', on_message_callback=callback, auto_ack=True)

print('Ожидание сообщений. Для выхода нажмите Ctrl+C')
channel.start_consuming()