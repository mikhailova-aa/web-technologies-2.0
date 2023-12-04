# test_unit.py
import unittest
from producer import create_message

class TestUnit(unittest.TestCase):
    def test_create_message(self):
        text = "Test text"
        message = create_message(text)
        self.assertEqual(message.text, text)

if __name__ == '__main__':
    unittest.main()
