import unittest
from subprocess import Popen, PIPE
import time

class TestE2E(unittest.TestCase):
    def test_e2e(self):
        with open('e2e_test_output.txt', 'w') as f:
            consumer_process = self._test_e2e(f)

        # Останавливаем consumer
        consumer_process.terminate()

    def _test_e2e(self, file):
        # Отправляем тестовое сообщение
        test_text = "E2E test message\n"
        producer_process = Popen(['python', 'producer.py'], stdin=PIPE, text=True)
        producer_process.stdin.write(test_text)
        producer_process.stdin.close()
        producer_process.communicate()

        # Дождемся завершения процесса producer
        producer_process.wait()

        # Ждем, чтобы consumer обработал сообщение
        time.sleep(2)

        # Возвращаем consumer_process
        return Popen(['python', 'consumer.py'], stdout=file, text=True)

if __name__ == '__main__':
    unittest.main()
