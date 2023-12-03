# test_integration.py
import unittest
from unittest.mock import patch
import producer
import consumer
import time

class TestIntegration(unittest.TestCase):
    def test_integration(self):
        # Запускаем consumer в отдельном потоке или процессе
        # ...

        # Ждем, пока consumer будет готов
        time.sleep(2)

        # Мокируем функцию print для захвата вывода
        with patch('builtins.print') as mock_print:
            # Генерируем сообщение
            producer.produce_message("Integration test message")

            # Ждем, пока сообщение будет обработано
            time.sleep(2)

            # Проверяем, что ожидаемый вывод был напечатан
            mock_print.assert_called_once_with("Received: Integration test message")

if __name__ == '__main__':
    unittest.main()
