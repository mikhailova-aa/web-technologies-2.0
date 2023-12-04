# test_integration.py
import unittest
from unittest.mock import patch, Mock
import producer
import consumer
import pika

class TestIntegration(unittest.TestCase):
    @patch('pika.BlockingConnection', Mock)
    @patch('pika.ConnectionParameters', Mock)
    def test_integration(self):
        # Создаем mock-объект для канала
        mock_channel = Mock()
        
        # Подменяем реальные функции на mock-функции
        producer.pika.BlockingConnection.return_value.channel.return_value = mock_channel
        consumer.pika.BlockingConnection.return_value.channel.return_value = mock_channel

        # Генерируем и отправляем сообщение
        producer.produce_message("Integration test message")

        # Проверяем, что сообщение было отправлено в очередь
        mock_channel.basic_publish.assert_called_once()

        # Запускаем consumer
        consumer.run_consumer()

        # Проверяем, что сообщение было получено из очереди
        mock_channel.basic_consume.assert_called_once()

if __name__ == '__main__':
    unittest.main()
