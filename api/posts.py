import jwt
from flask import jsonify
from flask_restful import Resource, abort, reqparse

from config import JWT_SECRET_KEY
from db_data import db_session
from db_data.models import Post
from tools.functions import verify_data, abort_if_not_found, make_resp, verify_token


class PostResource(Resource):
    def get(self, post_id):
        abort_if_not_found(Post, post_id, 'post')
        sess = db_session.create_session()
        post = sess.query(Post).get(post_id)
        return make_resp(jsonify(post.to_dict()), 200)

    def delete(self, post_id):
        abort_if_not_found(Post, post_id, 'post')
        sess = db_session.create_session()
        post = sess.query(Post).get(post_id)
        sess.delete(post)
        sess.commit()
        return make_resp(jsonify({'message': 'ok'}), 200)


class PostListResource(Resource):
    def get(self, user_id=None, from_number=None, amount=None):
        if user_id is not None and from_number is not None and amount is not None:
            sess = db_session.create_session()
            if not user_id:  # посты указанного пользователя
                data = sess.query(Post).order_by(Post.creation_date.desc()).limit(from_number + amount)[from_number:]
            else:  # все посты
                data = sess.query(Post).filter(Post.user_id == user_id).order_by(Post.creation_date.desc()).limit(
                    from_number + amount)[from_number:]
            res = [post.to_dict() for post in data]
            return make_resp(jsonify(res), 200)
        abort(400, message='not enough data')


class PostCreationResource(Resource):
    def post(self):
        token = verify_token()
        if token:  # создание поста возможно только зарегистрированными пользователями
            parser = reqparse.RequestParser()
            parser.add_argument('content', required=True, type=str)
            parser.add_argument('Authentication', required=True, location='headers')
            args = parser.parse_args()
            content = args['content']
            if verify_data(content, 'post'):
                sess = db_session.create_session()
                post = Post()
                post.content = content
                post.user_id = token['id']
                sess.add(post)
                sess.commit()
                return make_resp(jsonify({'message': 'ok'}), 200)
            abort(400, message='invalid data')
        abort(401, message='unauthorized')
