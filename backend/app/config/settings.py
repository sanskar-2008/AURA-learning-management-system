import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
INSTANCE_DIR = BASE_DIR / "instance"
load_dotenv(BASE_DIR / ".env")

INSTANCE_DIR.mkdir(exist_ok=True)
DEFAULT_DB_PATH = INSTANCE_DIR / "sansu_lms.db"
DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173,"
    "https://aura-learning-management-system.vercel.app"
)


def normalize_database_url(url):
    """Normalize DATABASE_URL for SQLAlchemy and Supabase/Render PostgreSQL."""
    if not url:
        return f"sqlite:///{DEFAULT_DB_PATH}"

    normalized = url.strip()

    if normalized.startswith("postgres://"):
        normalized = normalized.replace("postgres://", "postgresql://", 1)

    if normalized.startswith("postgresql://") and "+psycopg" not in normalized:
        normalized = normalized.replace("postgresql://", "postgresql+psycopg://", 1)

    if "supabase.co" in normalized and "sslmode=" not in normalized:
        separator = "&" if "?" in normalized else "?"
        normalized = f"{normalized}{separator}sslmode=require"

    return normalized


def database_engine_options(database_url):
    """Connection pool settings for PostgreSQL deployments."""
    if database_url.startswith("sqlite"):
        return {}

    options = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }

    # Supabase pooler (port 6543) works best without prepared statements.
    if "supabase.co" in database_url:
        options["connect_args"] = {"prepare_threshold": None}

    return options


_RESOLVED_DATABASE_URL = normalize_database_url(os.getenv("DATABASE_URL", ""))


class Config:
    """Base application configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = _RESOLVED_DATABASE_URL
    SQLALCHEMY_ENGINE_OPTIONS = database_engine_options(_RESOLVED_DATABASE_URL)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
        if origin.strip()
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
    SESSION_COOKIE_SAMESITE = "None"


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config(config_name=None):
    """Return the configuration class for the given environment."""
    env = config_name or os.getenv("FLASK_ENV", "development")
    return config_by_name.get(env, DevelopmentConfig)
