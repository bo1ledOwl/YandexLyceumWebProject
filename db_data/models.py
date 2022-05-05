import datetime
from sqlalchemy import Integer, String, Column, ForeignKey, DateTime, Text
from sqlalchemy.orm import relation
from werkzeug.security import generate_password_hash, check_password_hash
from .db_session import SqlAlchemyBase


class User(SqlAlchemyBase):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, index=True, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    reg_date = Column(DateTime, default=datetime.datetime.now)

    posts = relation("Post", back_populates='user')

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'email': self.email, 'reg_date': self.reg_date}

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)


class Post(SqlAlchemyBase):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    creation_date = Column(DateTime, default=datetime.datetime.now)

    user_id = Column(Integer, ForeignKey('users.id'))
    user = relation('User')

    def to_dict(self):
        return {'id': self.id, 'content': self.content, 'creation_date': self.creation_date, 'user_id': self.user_id,
                'user_name': self.user.name}
