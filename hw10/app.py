from flask import Flask, jsonify
import redis

app = Flask(__name__)
db = redis.StrictRedis(host='redis', port=6379, db=0, decode_responses=True)

@app.route('/')
def home():
    return 'Hello, this is the home page!'

@app.route('/books')
def get_books():
    books = db.lrange('books', 0, -1)
    return jsonify({'books': books})

@app.route('/heartbeat')
def heartbeat():
    return 'OK'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
