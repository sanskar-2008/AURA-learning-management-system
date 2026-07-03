import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
INSTANCE_DIR = BASE_DIR / "instance"
load_dotenv(BASE_DIR / ".env")

INSTANCE_DIR.mkdir(exist_ok=True)
LOCAL_SQLITE_PATH = INSTANCE_DIR / "sansu_lms.db"
DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173,"
    "https://aura-learning-management-system.vercel.app"
)


def normalize_database_url(url: str) -> str:
    """Normalize DATABASE_URL for SQLAlchemy and Supabase/Render PostgreSQL."""
    normalized = url.strip()

    if normalized.startswith("postgres://"):
        normalized = normalized.replace("postgres://", "postgresql://", 1)

    if normalized.startswith("postgresql://") and "+psycopg" not in normalized:
        normalized = normalized.replace("postgresql://", "postgresql+psycopg://", 1)

    if "supabase.co" in normalized and "sslmode=" not in normalized:
        separator = "&" if "?" in normalized else "?"
        normalized = f"{normalized}{separator}sslmode=require"

    return normalized


def local_sqlite_url() -> str:
    """SQLite URL used only for local development when DATABASE_URL is unset."""
    return f"sqlite:///{LOCAL_SQLITE_PATH}"


def is_deployed_environment() -> bool:
    """True when the API runs on a hosted platform (Render, etc.), not local dev."""
    if os.getenv("FLASK_ENV", "").strip().lower() == "production":
        return True

    if os.getenv("RENDER", "").strip().lower() in {"true", "1", "yes"}:
        return True

    configured_db = os.getenv("DATABASE_URL", "").strip()
    return configured_db.startswith(("postgres://", "postgresql://"))


def resolve_database_url(*, require_postgres: bool = False) -> str:
    """
    Resolve the database connection string.

    - Production (require_postgres=True): DATABASE_URL must be set.
    - Development: falls back to local SQLite when DATABASE_URL is unset.
    """
    configured = os.getenv("DATABASE_URL", "").strip()
    if configured:
        return normalize_database_url(configured)

    if require_postgres:
        raise RuntimeError(
            "DATABASE_URL environment variable is required in production. "
            "Set it to your Supabase PostgreSQL connection string."
        )

    return local_sqlite_url()


def database_engine_options(database_url: str) -> dict:
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


def _build_config(database_url: str):
    """Attach resolved database settings to a config class."""
    engine_options = database_engine_options(database_url)

    class _DatabaseConfig:
        SQLALCHEMY_DATABASE_URI = database_url
        SQLALCHEMY_ENGINE_OPTIONS = engine_options

    return _DatabaseConfig


class Config:
    """Base application configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
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
    """Development environment configuration (SQLite fallback allowed)."""

    DEBUG = True
    ENV = "development"


class ProductionConfig(Config):
    """Production environment configuration (PostgreSQL required)."""

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
    deployed = is_deployed_environment()
    env = config_name or os.getenv("FLASK_ENV", "production" if deployed else "development")
    base_config = config_by_name.get(env, DevelopmentConfig)
    if deployed and base_config is DevelopmentConfig:
        base_config = ProductionConfig

    database_url = resolve_database_url(require_postgres=deployed)
    db_config = _build_config(database_url)

    config_class = type(
        f"{base_config.__name__}WithDatabase",
        (db_config, base_config),
        {},
    )

    if deployed:
        # Vercel (frontend) and Render (API) are different sites; cookies need SameSite=None.
        config_class.SESSION_COOKIE_SECURE = True
        config_class.SESSION_COOKIE_SAMESITE = "None"
        config_class.DEBUG = False

    return config_class
