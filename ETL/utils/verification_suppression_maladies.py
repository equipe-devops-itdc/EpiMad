import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from ETL.commun.database import engine

with engine.connect() as connection:
    resultat = connection.execute(text("""
        DELETE FROM cas_epidemiques
        WHERE maladie_id = (SELECT id FROM maladies WHERE code_maladie = 'paludisme')
    """))
    connection.commit()
    print(f"Lignes supprimees : {resultat.rowcount}")