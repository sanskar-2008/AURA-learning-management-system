from flask import Flask
from flask_cors import CORS

from app.config.settings import get_config
from app.database.connection import db, init_db, migrate
from app.middleware.error_handlers import register_error_handlers
from app.routes import register_routes


def create_app(config_name=None):
    """Application factory for creating Flask app instances."""
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))

    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
        supports_credentials=True,
        allow_headers=["Content-Type"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    db.init_app(app)
    migrate.init_app(app, db)
    register_error_handlers(app)
    register_routes(app)

    with app.app_context():
        app.config["UPLOAD_FOLDER"].mkdir(parents=True, exist_ok=True)
        app.config["UPLOAD_ASSIGNMENTS_FOLDER"].mkdir(parents=True, exist_ok=True)
        app.config["UPLOAD_SUBMISSIONS_FOLDER"].mkdir(parents=True, exist_ok=True)
        init_db()

    return app
