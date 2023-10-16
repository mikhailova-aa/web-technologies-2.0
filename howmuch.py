import redis

# Подключаемся к серверу Redis
redis_conn = redis.StrictRedis(host='localhost', port=6379, db=0)

# Имя сервиса
service_name = "counter"

# Формируем ключ
key = f'requests:{service_name}'
# Время жизни
if not redis_conn.exists(key):
    # Если ключ не существует, устанавливаем его значение и время жизни
    redis_conn.set(key, 0)
    redis_conn.expire(key, 24 * 3600)

# Получаем значение счетчика
counter_value = redis_conn.get(key)

if counter_value is not None:
    print(f"Сервис {service_name} сделал {int(counter_value)} запросов.")
else:
    print(f"Сервис {service_name} не делал запросов.")
