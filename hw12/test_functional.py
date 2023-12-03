# test_functional.py
import unittest
from unittest.mock import patch
import producer
import consumer

class TestFunctional(unittest.TestCase):
    @patch('builtins.print')
    def test_functional(self, mock_print):
        # Генерируем сообщение
        producer.produce_message("Functional test message")

        # Запускаем consumer с мокированной функцией print
        consumer.run_consumer()

        # Проверяем, что мокированная функция print была вызвана с ожидаемым сообщением
        mock_print.assert_called_once_with("Received: Functional test message")

if __name__ == '__main__':
    unittest.main()
