import unittest
import message_pb2

class TestMessage(unittest.TestCase):
    def test_message_creation(self):
        msg = message_pb2.MyMessage()
        msg.text = "Test text"
        self.assertEqual(msg.text, "Test text")

if __name__ == '__main__':
    unittest.main()