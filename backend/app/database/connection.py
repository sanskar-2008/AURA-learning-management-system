from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def init_db():
    """Create database tables if they do not exist."""
    import app.models  # noqa: F401 — register all models with SQLAlchemy

    db.create_all()
    _migrate_teacher_columns()
    _migrate_learning_material_columns()
    _migrate_assignment_file_columns()
    _migrate_submission_file_columns()

    from app.services.auth_service import seed_admin_user

    seed_admin_user()


def _migrate_teacher_columns():
    """Add new teacher profile columns to existing SQLite databases."""
    from sqlalchemy import inspect, text

    inspector = inspect(db.engine)
    if "teachers" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("teachers")}
    if "designation" not in columns:
        db.session.execute(text("ALTER TABLE teachers ADD COLUMN designation VARCHAR(100)"))
        db.session.commit()


def _migrate_learning_material_columns():
    """Add video_url column to existing learning_materials tables."""
    from sqlalchemy import inspect, text

    inspector = inspect(db.engine)
    if "learning_materials" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("learning_materials")}
    if "video_url" not in columns:
        db.session.execute(text("ALTER TABLE learning_materials ADD COLUMN video_url VARCHAR(500)"))
        db.session.commit()


def _migrate_assignment_file_columns():
    """Add attachment columns to existing assignments tables."""
    from sqlalchemy import inspect, text

    inspector = inspect(db.engine)
    if "assignments" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("assignments")}
    additions = {
        "file_name": "VARCHAR(255)",
        "stored_name": "VARCHAR(255)",
        "file_size": "INTEGER",
        "mime_type": "VARCHAR(100)",
    }
    for column_name, column_type in additions.items():
        if column_name not in columns:
            db.session.execute(text(f"ALTER TABLE assignments ADD COLUMN {column_name} {column_type}"))
    db.session.commit()


def _migrate_submission_file_columns():
    """Add uploaded file columns to existing submissions tables."""
    from sqlalchemy import inspect, text

    inspector = inspect(db.engine)
    if "submissions" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("submissions")}
    additions = {
        "file_name": "VARCHAR(255)",
        "stored_name": "VARCHAR(255)",
        "file_size": "INTEGER",
        "mime_type": "VARCHAR(100)",
    }
    for column_name, column_type in additions.items():
        if column_name not in columns:
            db.session.execute(text(f"ALTER TABLE submissions ADD COLUMN {column_name} {column_type}"))
    db.session.commit()
