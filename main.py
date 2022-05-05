from flask import Flask
from flask_restful import Api

from api.posts import PostResource, PostListResource, PostCreationResource
from api.users import RegisterResource, LoginResource, UserResource

from db_data import db_session

app = Flask(__name__)
api = Api(app)

INCLUDED_PATHS = ('', 'login', 'register', 'user', 'posts')


# необходимо, чтобы любой путь обрабатывался и выдавал один и тот же результат в силу реализации отображения
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>/')
def index(path):
    if not path.startswith('api/') and path.split('/')[0] in INCLUDED_PATHS:
        return app.send_static_file("html/main.html")


if __name__ == '__main__':
    db_session.global_init("db/db.sqlite")
    api.add_resource(RegisterResource, '/api/register/')
    api.add_resource(LoginResource, '/api/login/')
    api.add_resource(UserResource, '/api/user/<int:user_id>/')
    api.add_resource(PostResource, '/api/post/<int:post_id>/')
    api.add_resource(PostListResource, '/api/posts/<int:user_id>/<int:from_number>/<int:amount>/')
    api.add_resource(PostCreationResource, '/api/posts/create_post/')
    app.run(host="https://yl-posty.herokuapp.com/", port=80)
