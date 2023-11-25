import tornado.web
import asyncio
import sys
import redis
import datetime

class RequestCounterHandler(tornado.web.RequestHandler):

    def initialize(self):
        self.redis_cli = redis.Redis(host='redis', port=6379, decode_responses=True)
        

    def get(self):
        if not self.redis_cli.exists('counter'):
            self.redis_cli.set('counter', 0)
            self.redis_cli.expire('counter', expiration_time())
        num = self.redis_cli.incr('counter')
        self.write(f"Порядковый номер запроса: {num}")

class HeartbeatHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Heartbeat is running")


def expiration_time():
    current_time = datetime.datetime.now()
    tomorrow = current_time + datetime.timedelta(days=1)
    return (datetime.datetime.combine(tomorrow, datetime.time.min) - current_time).seconds

async def make_app():
    app = tornado.web.Application([
        (r"/request_number", RequestCounterHandler),
        (r"/heartbeat", HeartbeatHandler),
        (r"/hw/(.*)", tornado.web.StaticFileHandler, {"path":"../hw1-2/", "default_filename": "index.html"}),
    ])

    app.listen(sys.argv[1])
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(make_app())