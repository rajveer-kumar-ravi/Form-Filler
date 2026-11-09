import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./formflow.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_migrations():
    """Safely apply schema additions to existing SQLite tables without losing data."""
    if not DATABASE_URL.startswith("sqlite"):
        return

    with engine.connect() as conn:
        try:
            # Check and add columns to 'forms'
            form_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(forms)").fetchall()]
            if form_cols:
                if "settings" not in form_cols:
                    conn.exec_driver_sql("ALTER TABLE forms ADD COLUMN settings JSON DEFAULT '{}'")
                if "logic_rules" not in form_cols:
                    conn.exec_driver_sql("ALTER TABLE forms ADD COLUMN logic_rules JSON DEFAULT '[]'")

            # Check and add columns to 'questions'
            q_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(questions)").fetchall()]
            if q_cols:
                if "logic_rules" not in q_cols:
                    conn.exec_driver_sql("ALTER TABLE questions ADD COLUMN logic_rules JSON DEFAULT '[]'")

            # Check and add columns to 'responses'
            resp_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(responses)").fetchall()]
            if resp_cols:
                if "session_id" not in resp_cols:
                    conn.exec_driver_sql("ALTER TABLE responses ADD COLUMN session_id VARCHAR(128)")
                if "started_at" not in resp_cols:
                    conn.exec_driver_sql("ALTER TABLE responses ADD COLUMN started_at DATETIME")
                if "last_activity_at" not in resp_cols:
                    conn.exec_driver_sql("ALTER TABLE responses ADD COLUMN last_activity_at DATETIME")
                if "time_spent_seconds" not in resp_cols:
                    conn.exec_driver_sql("ALTER TABLE responses ADD COLUMN time_spent_seconds INTEGER DEFAULT 0")
                if "last_question_id" not in resp_cols:
                    conn.exec_driver_sql("ALTER TABLE responses ADD COLUMN last_question_id INTEGER")
            conn.commit()
        except Exception as e:
            # Table might not exist yet before create_all
            pass

# Ensure safe migrations run on module load if DB exists
try:
    run_migrations()
except Exception:
    pass

