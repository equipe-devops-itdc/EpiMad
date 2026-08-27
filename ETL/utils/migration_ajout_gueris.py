import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from ETL.commun.database import engine

with engine.connect() as connection:
    connection.execute(text(
        "ALTER TABLE cas_epidemiques ADD COLUMN IF NOT EXISTS gueris INTEGER DEFAULT 0"
    ))
    connection.commit()

print("Colonne 'gueris' ajoutee avec succes.")