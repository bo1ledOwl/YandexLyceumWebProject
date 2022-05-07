from datetime import datetime, timedelta

from flask import make_response, jsonify, request
from flask_restful import abort
import jwt
from jwt import InvalidSignatureError

from config import JWT_SECRET_KEY
from db_data import db_session


def verify_data(data, datatype):  # проверка данных на допустимые символы (как в auth.js)
    symbols = 'qwertyuiopasdfghjklzxcvbnm0123456789_-'
    email_symbols = symbols + '.@'
    password_symbols = symbols + '.@!#$%^&*(),/?'
    username_symbols = symbols + 'йцукенгшщзхъфывапролджжэячсмитьбю'
    posts_symbols = password_symbols + 'йцукенгшщзхъфывапролджжэячсмитьбю'

    data = data.lower()
    if len(data) < 64 and data:
        if datatype == 'email':
            if '@' not in data:
                return False
            for el in data:
                if el not in email_symbols:
                    return False
        elif datatype == 'username':
            for el in data:
                if el not in username_symbols:
                    return False
        elif datatype == 'password':
            for el in data:
                if el not in password_symbols:
                    return False
        elif datatype == 'post':
            for el in data:
                if el not in posts_symbols:
                    return False
        return True
    return False


def abort_if_not_found(entity, entity_id, entity_class_name=''):
    session = db_session.create_session()
    data = session.query(entity).get(entity_id)
    if not data:
        abort(404,
              message=f"Entity{(' ' + entity_class_name + ' ') * bool(entity_class_name)}by id {entity_id} not found")


def make_resp(message, status):  # создание ответов с указанием типа данных
    response = make_response(message, status)
    response.headers['content-type'] = 'application/json; charset=utf-8'
    return response


def make_jwt_resp(user):  # создание jwt-токена для аутентификации
    token = {'token': jwt.encode(
        {'iat': datetime.now(), 'exp': datetime.now() + timedelta(days=7), 'id': user.id, 'name': user.name},
        JWT_SECRET_KEY, algorithm='HS256')}
    return make_resp(jsonify(token), 200)


def verify_token():  # проверка присланного токена и его расшифровка
    token = request.headers['Authentication']
    if not token:
        return False
    try:
        token = jwt.decode(token, JWT_SECRET_KEY, algorithms='HS256')
        return token
    except InvalidSignatureError:
        return False
