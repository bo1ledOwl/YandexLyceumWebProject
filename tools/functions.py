from datetime import datetime, timedelta

from flask import make_response, jsonify
from flask_restful import abort
import jwt

from db_data import db_session
from tools.secretkey_generator import create_secret_key

JWT_SECRET_KEY = create_secret_key(128)


def abort_if_not_found(entity, entity_id):
    session = db_session.create_session()
    news = session.query(entity).get(entity_id)
    if not news:
        abort(404, message=f"Entity {type(entity)} by id {entity_id} not found")


def make_resp(message, status):
    response = make_response(message, status)
    response.headers['content-type'] = 'application/json; charset=utf-s'
    return response


def make_jwt_resp(user):
    token = {'token': jwt.encode(
        {'iat': datetime.now(), 'exp': datetime.now() + timedelta(days=7), 'id': user.id, 'name': user.name},
        JWT_SECRET_KEY, algorithm='HS256')}
    return make_resp(jsonify(token), 200)
