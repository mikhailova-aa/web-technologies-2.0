import pika
import message_pb2  # Импортируем скомпилированный protobuf-модуль

# Установите соединение с RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Объявляем очередь
channel.queue_declare(queue='my_queue')

# Создаем и отправляем сообщение
message = message_pb2.MyMessage()
message.text = "Ya domashka №5"

# Сериализуем protobuf-сообщение в байты
message_bytes = message.SerializeToString()

# Отправляем сообщение в очередь
channel.basic_publish(exchange='',
                      routing_key='my_queue',
                      body=message_bytes)

print(f"Отправлено: {message.text}")

# Закрываем соединение
connection.close()