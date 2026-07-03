#!/usr/bin/env python3
"""
Initialize PostgreSQL schema on Supabase (tables + default admin).

Usage:
  cd backend
  source venv/bin/activate
  export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
  python scripts/init_postgres.py
"""

from __future__ import annotations

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app import create_app  # noqa: E402
from app.database.connection import db  # noqa: E402


def main() -> None:
    app = create_app()
    with app.app_context():
        dialect = db.engine.dialect.name
        if dialect != "postgresql":
            raise SystemExit(
                f"Expected PostgreSQL, got {dialect}. Set DATABASE_URL to your Supabase URI."
            )

        print(f"PostgreSQL schema ready ({dialect}).")
        print("Default admin: admin@gmail.com / admin123")


if __name__ == "__main__":
    main()
