import unittest
from unittest.mock import patch, Mock
import producer
import threading
import time

class TestE2E(unittest.TestCase):
    @patch('pika.BlockingConnection', Mock)
    @patch('pika.ConnectionParameters', Mock)
    def test_e2e(self):
        # Запускаем consumer в отдельном потоке
        consumer_thread = threading.Thread(target=producer.run_consumer)
        consumer_thread.start()

        # Ждем, пока consumer будет готов
        time.sleep(2)

        # Генерируем тестовое сообщение и отправляем его
        test_message = "E2E test message"
        producer.produce_message(test_message)

        # Ждем обработки сообщения
        time.sleep(2)

        # Останавливаем consumer
        producer.stop_consumer()

        # Ждем завершения consumer_thread
        consumer_thread.join()

if __name__ == '__main__':
    unittest.main()
