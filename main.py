from secretkey_generator import create_secret_key

from flask import Flask, request, redirect, jsonify, make_response
from flask_login import LoginManager, login_user, logout_user

from db_data import db_session
from db_data.models import *

app = Flask(__name__)
app.config['SECRET_KEY'] = create_secret_key(64)


@app.route('/')
@app.route('/login/')
def index():
    return app.send_static_file("html/main.html")


@app.route('/api/register/', methods=['POST'])
def register_user():
    pass


@app.route('/api/login/', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('email', '')
    password = data.get('password', '')
    if email and password:
        db_sess = db_session.create_session()
        user = db_sess.query(User).filter(User.email == email).first()
        if user is not None and user.check_password(password):
            login_user(user, remember=True)
            return redirect('/')
    return make_response(jsonify({'error': 'wrong-data', 'email': email}), 400)


if __name__ == '__main__':
    db_session.global_init("db/db.sqlite")
    login_manager = LoginManager(app)


    @login_manager.user_loader
    def load_user(user_id):
        sess = db_session.create_session()
        return sess.query(User).get(user_id)


    app.run(host="127.0.0.1", port=8080)
