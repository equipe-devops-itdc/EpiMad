import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv

PROJET_ROOT = Path(__file__).resolve().parent.parent.parent
env_path = PROJET_ROOT / ".env"

load_dotenv(dotenv_path=env_path)

DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "postgres")

## Construction de l'URL de connexion
SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print(f" DEBUG: .env chargé depuis : {env_path}")
print(f" DEBUG: Connexion BDD -> {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

## Création du moteur données
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()