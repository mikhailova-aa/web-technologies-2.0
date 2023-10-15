import redis
import datetime

# Подключаемся к серверу Redis
redis_conn = redis.StrictRedis(host='localhost', port=6379, db=0)


# Функция для увеличения счетчика запросов
def increment_request_counter(service_name):
    # Получаем текущую дату
    current_date = datetime.datetime.now().strftime('%Y-%m-%d')

    # Формируем ключ для хранения счетчика в Redis
    key = f'requests:{current_date}:{service_name}'

    # Увеличиваем счетчик на 1
    redis_conn.incr(key)

service_name = "counter"
increment_request_counter(service_name)
