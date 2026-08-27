"""
Module de connexion à la base de données PostgreSQL.
Ce fichier est partagé par tous les scripts ETL.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

from pathlib import Path
ENV_PATH = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=ENV_PATH)


DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB")


DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL, 
    echo=False,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Génère une session de base de données."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()