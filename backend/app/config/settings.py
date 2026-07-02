import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
INSTANCE_DIR = BASE_DIR / "instance"
load_dotenv(BASE_DIR / ".env")

INSTANCE_DIR.mkdir(exist_ok=True)
DEFAULT_DB_PATH = INSTANCE_DIR / "sansu_lms.db"


class Config:
    """Base application configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or f"sqlite:///{DEFAULT_DB_PATH}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    ]
    UPLOAD_FOLDER = INSTANCE_DIR / "uploads" / "materials"
    UPLOAD_ASSIGNMENTS_FOLDER = INSTANCE_DIR / "uploads" / "assignments"
    UPLOAD_SUBMISSIONS_FOLDER = INSTANCE_DIR / "uploads" / "submissions"
    MAX_MATERIAL_FILE_SIZE = int(os.getenv("MAX_MATERIAL_FILE_SIZE", 100 * 1024 * 1024))
    MAX_ASSIGNMENT_FILE_SIZE = int(os.getenv("MAX_ASSIGNMENT_FILE_SIZE", 25 * 1024 * 1024))
    ALLOWED_VIDEO_EXTENSIONS = {"mp4", "webm", "mov", "avi", "mkv", "m4v", "mpeg", "mpg", "3gp"}
    ALLOWED_PDF_EXTENSIONS = {"pdf"}
    ALLOWED_ASSIGNMENT_EXTENSIONS = {"pdf", "doc", "docx", "txt", "zip", "png", "jpg", "jpeg"}


class DevelopmentConfig(Config):
    """Development environment configuration."""

    DEBUG = True
    ENV = "development"


class ProductionConfig(Config):
    """Production environment configuration."""

    DEBUG = False
    ENV = "production"
    SESSION_COOKIE_SECURE = True


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config(config_name=None):
    """Return the configuration class for the given environment."""
    env = config_name or os.getenv("FLASK_ENV", "development")
    return config_by_name.get(env, DevelopmentConfig)
