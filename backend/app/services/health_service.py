from app.config.settings import DEFAULT_DB_PATH


def get_health_status():
    """Return application health metadata."""
    return {
        "status": "healthy",
        "service": "aura-course-api",
        "database": "sqlite",
        "database_path": str(DEFAULT_DB_PATH),
    }
