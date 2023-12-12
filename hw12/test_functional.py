import unittest
import producer
import consumer
import threading
import time

class TestFunctional(unittest.TestCase):
    def test_functional(self):
        # Запускаем consumer в отдельном потоке
        consumer_thread = threading.Thread(target=consumer.run_consumer)
        consumer_thread.start()

        # Ждем, пока consumer будет готов
        time.sleep(2)

        # Генерируем сообщение
        test_message = "Functional test message"
        producer.produce_message(test_message)

        # Ждем обработки сообщения
        time.sleep(2)

        # Останавливаем consumer
        consumer.stop_consumer()

        # Проверяем, что сообщение было обработано
        self.assertTrue(consumer.message_processed)

        # Ждем завершения consumer_thread
        consumer_thread.join()

if __name__ == '__main__':
    unittest.main()