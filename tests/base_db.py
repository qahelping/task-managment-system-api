from app.models import User


class UserDB:

    def __init__(self, db):
        self.db_session = db

    def add_user(self, new_user):
        self.db_session.add(new_user)
        self.db_session.commit()

        self.db_session.refresh(new_user)

    def get_user(self, new_user_username):
        return self.db_session.query(User).filter(User.username == new_user_username).first()

    def get_users(self):
        return self.db_session.query(User).all()
