from flask_restful import Resource, abort, reqparse

from db_data import db_session
from db_data.models import User
from tools.functions import make_jwt_resp, verify_data


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
        if not filter(lambda data, datatype: verify_data(data, datatype),
                      ((name, 'username'), (email, 'email'), (password, 'password'))):
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
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email', required=True, type=str)
        parser.add_argument('password', required=True, type=str)
        args = parser.parse_args()
        email = args['email']
        password = args['password']
        if not filter(lambda data, datatype: verify_data(data, datatype), ((email, 'email'), (password, 'password'))):
            sess = db_session.create_session()
            user = sess.query(User).filter(User.email == email).first()
            if user is not None and user.check_password(args['password']):
                return make_jwt_resp(user)
            abort(400, message='user with such data was not found')
        abort(400, message='invalid data')
