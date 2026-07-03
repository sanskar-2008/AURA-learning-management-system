import os
from pathlib import Path

from flask_migrate import Migrate, stamp, upgrade
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text

db = SQLAlchemy()
migrate = Migrate()

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent.parent / "migrations"


def init_db():
    """Apply schema migrations and seed required bootstrap data."""
    if os.getenv("SKIP_DB_INIT") == "1":
        return

    import app.models  # noqa: F401 — register all models with SQLAlchemy

    inspector = inspect(db.engine)
    table_names = inspector.get_table_names()
    has_schema = "users" in table_names
    alembic_revision = None
    if "alembic_version" in table_names:
        alembic_revision = db.session.execute(
            text("SELECT version_num FROM alembic_version LIMIT 1")
        ).scalar()

    if MIGRATIONS_DIR.is_dir():
        if has_schema and not alembic_revision:
            stamp(revision="head")
        else:
            upgrade()
    elif not has_schema:
        db.create_all()

    from app.services.auth_service import seed_admin_user

    seed_admin_user()
