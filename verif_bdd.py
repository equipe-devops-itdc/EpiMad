from entrainement_modele.database import engine
from sqlalchemy import text

print(" Vérification des données BDD")
print("=" * 60)

conn = engine.connect()
result = conn.execute(text("""
    SELECT 
        to_char(date_observation, 'YYYY-"W"IW') AS semaine, 
        cas_nouveaux 
    FROM cas_epidemiques 
    WHERE region_id = 1 AND maladie_id = 4 
    ORDER BY date_observation DESC 
    LIMIT 10
"""))

print(f"{'Semaine':<15} | {'Cas nouveaux':>12}")
print("-" * 30)
for row in result:
    print(f"{row.semaine:<15} | {row.cas_nouveaux:>12,}")

conn.close()
print("\n Fin de la vérification")