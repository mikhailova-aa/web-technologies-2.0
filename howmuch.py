import redis

# Подключаемся к серверу Redis
redis_conn = redis.StrictRedis(host='localhost', port=6379, db=0)

# Имя сервиса и текущая дата (пример)
service_name = "counter"
current_date = "2023-10-15"

# Формируем ключ
key = f'requests:{current_date}:{service_name}'

# Получаем значение счетчика
counter_value = redis_conn.get(key)

if counter_value is not None:
    print(f"За {current_date} сервис {service_name} сделал {int(counter_value)} запросов.")
else:
    print(f"За {current_date} сервис {service_name} не делал запросов.")
