# test_e2e.py
import unittest
import producer
import consumer
import time

class TestE2E(unittest.TestCase):
    def test_e2e(self):
        # Генерируем сообщение
        producer.produce_message("E2E test message")

        # Ждем обработки сообщения
        time.sleep(5)



if __name__ == '__main__':
    unittest.main()
