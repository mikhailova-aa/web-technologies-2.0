import unittest
from unittest.mock import patch
import producer
import subprocess
import time
import pika

class TestIntegration(unittest.TestCase):
    @patch('pika.BlockingConnection', autospec=True)
    @patch('pika.ConnectionParameters', autospec=True)
    def test_integration(self, mock_connection_params, mock_blocking_connection):
        # Мокаем реальный метод channel объекта BlockingConnection
        mock_channel = mock_blocking_connection.return_value.channel.return_value

        # Запускаем consumer в отдельном процессе
        consumer_process = subprocess.Popen(['python', 'consumer.py'])

        # Ждем, пока consumer будет готов
        time.sleep(2)

        # Генерируем тестовое сообщение и отправляем его
        test_text = "Integration test message"
        producer.produce_message(test_text)

        # Ждем обработки сообщения
        time.sleep(2)

        # Останавливаем consumer
        consumer_process.terminate()

        # Проверяем, что сообщение было обработано
        self.assertTrue(mock_channel.basic_publish.called)

        # Ждем завершения consumer_process
        consumer_process.wait()

if __name__ == '__main__':
    unittest.main()
