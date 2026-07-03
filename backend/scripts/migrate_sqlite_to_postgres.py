#!/usr/bin/env python3
"""
Copy all data from the local SQLite database into PostgreSQL (Supabase).

Usage:
  cd backend
  source venv/bin/activate
  export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
  python scripts/migrate_sqlite_to_postgres.py

Optional:
  SQLITE_PATH=/path/to/sansu_lms.db python scripts/migrate_sqlite_to_postgres.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from sqlalchemy import MetaData, create_engine, inspect, text
from sqlalchemy.engine import Engine

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app  # noqa: E402
from app.config.settings import LOCAL_SQLITE_PATH, normalize_database_url  # noqa: E402

TABLE_COPY_ORDER = [
    "users",
    "teachers",
    "students",
    "parents",
    "parent_students",
    "courses",
    "enrollments",
    "assignments",
    "submissions",
    "attendance",
    "fees",
    "learning_materials",
    "grades",
    "quizzes",
    "questions",
    "quiz_attempts",
    "quiz_answers",
]


def _resolve_sqlite_path() -> Path:
    configured = os.getenv("SQLITE_PATH", "").strip()
    if configured:
        return Path(configured).expanduser().resolve()
    return LOCAL_SQLITE_PATH


def _resolve_target_url() -> str:
    target_url = os.getenv("DATABASE_URL", "").strip()
    if not target_url:
        raise SystemExit(
            "DATABASE_URL is required.\n"
            "Example:\n"
            "  export DATABASE_URL='postgresql://postgres.[ref]:[password]"
            "@aws-0-[region].pooler.supabase.com:6543/postgres'"
        )
    return normalize_database_url(target_url)


def _reset_postgres_sequences(engine: Engine) -> None:
    if engine.dialect.name != "postgresql":
        return

    inspector = inspect(engine)
    with engine.begin() as connection:
        for table_name in TABLE_COPY_ORDER:
            if table_name not in inspector.get_table_names():
                continue
            columns = {column["name"] for column in inspector.get_columns(table_name)}
            if "id" not in columns:
                continue
            connection.execute(
                text(
                    f"""
                    SELECT setval(
                        pg_get_serial_sequence('{table_name}', 'id'),
                        COALESCE((SELECT MAX(id) FROM {table_name}), 1),
                        COALESCE((SELECT MAX(id) FROM {table_name}), 0) > 0
                    )
                    """
                )
            )


def migrate() -> None:
    sqlite_path = _resolve_sqlite_path()
    if not sqlite_path.is_file():
        raise SystemExit(f"SQLite database not found: {sqlite_path}")

    target_url = _resolve_target_url()
    if target_url.startswith("sqlite"):
        raise SystemExit("DATABASE_URL must point to PostgreSQL, not SQLite.")

    print(f"Source SQLite: {sqlite_path}")
    print(f"Target PostgreSQL: {target_url.split('@')[-1]}")

    source_engine = create_engine(f"sqlite:///{sqlite_path}")
    target_engine = create_engine(target_url)

    app = create_app()
    with app.app_context():
        print("PostgreSQL schema ready (Alembic migrations applied).")

        source_metadata = MetaData()
        source_metadata.reflect(bind=source_engine)
        target_metadata = MetaData()
        target_metadata.reflect(bind=target_engine)

        with source_engine.connect() as source_conn, target_engine.begin() as target_conn:
            if target_engine.dialect.name == "postgresql":
                existing_tables = [
                    table_name
                    for table_name in reversed(TABLE_COPY_ORDER)
                    if table_name in target_metadata.tables
                ]
                if existing_tables:
                    table_list = ", ".join(existing_tables)
                    target_conn.execute(
                        text(f"TRUNCATE TABLE {table_list} RESTART IDENTITY CASCADE")
                    )

            for table_name in TABLE_COPY_ORDER:
                if table_name not in source_metadata.tables:
                    print(f"  skip {table_name} (not in SQLite)")
                    continue
                if table_name not in target_metadata.tables:
                    print(f"  skip {table_name} (not in PostgreSQL)")
                    continue

                source_table = source_metadata.tables[table_name]
                target_table = target_metadata.tables[table_name]
                rows = source_conn.execute(source_table.select()).mappings().all()

                if rows:
                    target_conn.execute(target_table.insert(), [dict(row) for row in rows])

                print(f"  copied {table_name}: {len(rows)} rows")

        print("Resetting PostgreSQL ID sequences...")
        _reset_postgres_sequences(target_engine)

        from app.services.auth_service import seed_admin_user

        seed_admin_user()

    print("Migration complete.")


if __name__ == "__main__":
    migrate()
