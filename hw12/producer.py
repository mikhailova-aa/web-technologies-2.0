# -*- coding: utf-8 -*-

import pika
import message_pb2

def add_numbers(a, b):
    return a + b

def create_message(text):
    message = message_pb2.MyMessage()
    if text.isdigit():
        message.number = int(text)
    else:
        message.text = text
    return message

def produce_message(text):
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='my_queue')

    message = create_message(text)

    message_bytes = message.SerializeToString()

    channel.basic_publish(exchange='', routing_key='my_queue', body=message_bytes)

    print("Отправлено: {}".format(message.text))


    connection.close()
