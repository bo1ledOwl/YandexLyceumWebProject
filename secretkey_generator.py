import random
from datetime import datetime


def create_secret_key(length):
    res = ''
    seed = list(str(datetime.now().second) + str(datetime.now().hour) + str(datetime.now().minute))
    random.shuffle(seed)
    random.seed(int(''.join(seed)))
    symbols = list('qwertyuiopasdfghjklzxcvbnm0123456789@#$%^&*')
    random.shuffle(symbols)
    for _ in range(length):
        res += random.choice(symbols)
    return res
