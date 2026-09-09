import pandas as pd
from database import engine

print("="*80)
print(" INSPECTION DES DONNÉES PAR MALADIE")
print("="*80)

# Voir les statistiques par maladie
query = """
    SELECT 
        m.id as maladie_id,
        m.nom_officiel,
        COUNT(c.id) as nb_observations,
        MIN(c.cas_nouveaux) as min_cas,
        MAX(c.cas_nouveaux) as max_cas,
        AVG(c.cas_nouveaux) as moyenne_cas,
        SUM(c.cas_nouveaux) as total_cas
    FROM maladies m
    LEFT JOIN cas_epidemiques c ON m.id = c.maladie_id
    GROUP BY m.id, m.nom_officiel
    ORDER BY m.id;
"""

df = pd.read_sql(query, con=engine)
print(df.to_string(index=False))

print("\n" + "="*80)
print(" EXEMPLE DE DONNÉES BRUTES POUR MALADIE 2 (10 premières lignes)")
print("="*80)

query_maladie2 = """
    SELECT date_observation, region_id, cas_nouveaux, cas_cumules
    FROM cas_epidemiques
    WHERE maladie_id = 2
    ORDER BY date_observation
    LIMIT 10;
"""

df_m2 = pd.read_sql(query_maladie2, con=engine)
print(df_m2.to_string(index=False))

print("\n" + "="*80)
print(" Y A-T-IL DES VALEURS NON-NULLES ?")
print("="*80)

query_check = """
    SELECT 
        COUNT(*) as total_lignes,
        COUNT(CASE WHEN cas_nouveaux > 0 THEN 1 END) as lignes_avec_cas,
        COUNT(CASE WHEN cas_nouveaux = 0 THEN 1 END) as lignes_a_zero
    FROM cas_epidemiques
    WHERE maladie_id = 2;
"""

df_check = pd.read_sql(query_check, con=engine)
print(df_check.to_string(index=False))