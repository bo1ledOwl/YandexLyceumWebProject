from flask import jsonify
from flask_restful import Resource, abort, reqparse

from db_data import db_session
from db_data.models import User
from tools.functions import make_jwt_resp, verify_data, abort_if_not_found, make_resp, verify_token


class RegisterResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True, type=str)
        parser.add_argument('email', required=True, type=str)
        parser.add_argument('password', required=True, type=str)
        args = parser.parse_args()
        name = args['username']
        email = args['email']
        password = args['password']
        if list(map(lambda data: verify_data(data[0], data[1]),  # проверка присланных полей
                    ((name, 'username'), (email, 'email'), (password, 'password')))):
            sess = db_session.create_session()
            if sess.query(User).filter(User.email == email).first() is not None:
                abort(400, message='user with this email already exists')
            user = User()
            user.name = name
            user.email = email
            user.set_password(password)
            sess.add(user)
            sess.commit()
            return make_jwt_resp(user)
        abort(400, message='invalid data')


class LoginResource(Resource):
    def get(self):  # при первом входе на страницу пользователь проверяет, действителен ли его токен
        token = verify_token()
        if token:
            sess = db_session.create_session()
            if sess.query(User).get(token['id']):
                return make_resp(jsonify({'message': 'token is verified'}), 200)
            return make_resp(jsonify({'message': 'user not found'}), 400)
        return make_resp(jsonify({'message': 'invalid token'}), 400)

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email', required=True, type=str)
        parser.add_argument('password', required=True, type=str)
        args = parser.parse_args()
        email = args['email']
        password = args['password']
        # проверка присланных данных
        if list(map(lambda data: verify_data(data[0], data[1]), ((email, 'email'), (password, 'password')))):
            sess = db_session.create_session()
            user = sess.query(User).filter(User.email == email).first()
            if user is not None and user.check_password(args['password']):
                return make_jwt_resp(user)
            abort(400, message='user with such data was not found')
        abort(400, message='invalid data')


class UserResource(Resource):
    def get(self, user_id):
        abort_if_not_found(User, user_id, 'user')
        sess = db_session.create_session()
        user = sess.query(User).get(user_id)
        return make_resp(jsonify(user.to_dict()), 200)
