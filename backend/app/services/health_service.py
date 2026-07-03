from flask import current_app

from app.config.settings import LOCAL_SQLITE_PATH


def get_health_status():
    """Return application health metadata."""
    database_url = current_app.config.get("SQLALCHEMY_DATABASE_URI", "")

    if database_url.startswith("sqlite"):
        return {
            "status": "healthy",
            "service": "aura-course-api",
            "database": "sqlite",
            "database_path": str(LOCAL_SQLITE_PATH),
        }

    if database_url.startswith("postgresql"):
        return {
            "status": "healthy",
            "service": "aura-course-api",
            "database": "postgresql",
        }

    return {
        "status": "healthy",
        "service": "aura-course-api",
        "database": "unknown",
    }
