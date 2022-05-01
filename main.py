from api.users import RegisterResource, LoginResource

from flask import Flask
from flask_restful import Api

from db_data import db_session

app = Flask(__name__)
api = Api(app)


@app.route('/')
@app.route('/login/')
@app.route('/register/')
def index():
    return app.send_static_file("html/main.html")


if __name__ == '__main__':
    db_session.global_init("db/db.sqlite")
    api.add_resource(RegisterResource, '/api/register/')
    api.add_resource(LoginResource, '/api/login/')
    app.run(host="127.0.0.1", port=8080)
