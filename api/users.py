from flask_restful import Resource, abort, reqparse

from db_data import db_session
from db_data.models import User
from tools.functions import make_jwt_resp, make_resp


class RegisterResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True, type=str)
        parser.add_argument('email', required=True, type=str)
        parser.add_argument('password', required=True, type=str)
        args = parser.parse_args()
        user = User()
        user.name = args['username']
        user.email = args['email']
        user.set_password(args['password'])
        sess = db_session.create_session()
        if sess.query(User).filter(User.email == user.email).first() is not None:
            abort(400, message='user with this email already exists')
        sess.add(user)
        sess.commit()
        return make_jwt_resp(user)


class LoginResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email', required=True, type=str)
        parser.add_argument('password', required=True, type=str)
        args = parser.parse_args()
        user = User()
        sess = db_session.create_session()
        user = sess.query(User).filter(User.email == args['email']).first()
        if user is not None and user.check_password(args['password']):
            return make_jwt_resp(user)
        return abort(400, message='user with such data was not found')
