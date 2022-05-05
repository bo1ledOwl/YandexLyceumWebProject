import secrets

JWT_SECRET_KEY = secrets.token_urlsafe(64)
SECRET_KEY = secrets.token_hex()
