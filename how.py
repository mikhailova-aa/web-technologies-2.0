import redis

redis_conn = redis.StrictRedis(host='localhost', port=6379, db=0)

service_name = "counter"

key = f'requests:{service_name}'

ttl_seconds = redis_conn.ttl(key)

print ({ttl_seconds})
