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


def _add_column_if_missing(table_name, column_name, column_type):
    """Add a column when missing. Works for SQLite and PostgreSQL."""
    from sqlalchemy import inspect, text

    inspector = inspect(db.engine)
    if table_name not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns(table_name)}
    if column_name in columns:
        return

    dialect = db.engine.dialect.name
    if dialect == "postgresql":
        statement = text(
            f"ALTER TABLE {table_name} "
            f"ADD COLUMN IF NOT EXISTS {column_name} {column_type}"
        )
    else:
        statement = text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")

    db.session.execute(statement)
    db.session.commit()


def _migrate_teacher_columns():
    """Add new teacher profile columns to existing databases."""
    _add_column_if_missing("teachers", "designation", "VARCHAR(100)")


def _migrate_learning_material_columns():
    """Add video_url column to existing learning_materials tables."""
    _add_column_if_missing("learning_materials", "video_url", "VARCHAR(500)")


def _migrate_assignment_file_columns():
    """Add attachment columns to existing assignments tables."""
    for column_name, column_type in {
        "file_name": "VARCHAR(255)",
        "stored_name": "VARCHAR(255)",
        "file_size": "INTEGER",
        "mime_type": "VARCHAR(100)",
    }.items():
        _add_column_if_missing("assignments", column_name, column_type)


def _migrate_submission_file_columns():
    """Add uploaded file columns to existing submissions tables."""
    for column_name, column_type in {
        "file_name": "VARCHAR(255)",
        "stored_name": "VARCHAR(255)",
        "file_size": "INTEGER",
        "mime_type": "VARCHAR(100)",
    }.items():
        _add_column_if_missing("submissions", column_name, column_type)
