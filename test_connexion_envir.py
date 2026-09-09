"""
Script de test pour vérifier la connexion Python - PostgreSQL (Docker).
"""

from ETL.commun.database import engine
from sqlalchemy import text

print("Tentative de connexion à la base de données...")

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database(), current_user;"))
        db_name, user = result.fetchone()
        
        print(f"SUCCÈS !")
        print(f"  Utilisateur connecté : {user}")
        print(f"  Base de données active : {db_name}")
        
        count_result = connection.execute(text("SELECT COUNT(*) FROM regions;"))
        nb_regions = count_result.fetchone()[0]
        print(f"  Nombre de Regions trouvées : {nb_regions}")

except Exception as e:
    print(f"ÉCHEC DE LA CONNEXION !")
    print(f"   Erreur : {e}")