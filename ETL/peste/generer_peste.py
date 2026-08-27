import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

np.random.seed(42)

print("=" * 70)
print("GENERATION DES DONNEES PESTE - MADAGASCAR")
print("=" * 70)

CAS_PAR_ANNEE = {
    2020: 0,
    2021: 139,
    2022: 0,
    2023: 0,
    2024: 0,
    2025: 2,
    2026: 0
}

DECES_PAR_ANNEE = {
    2020: 0,
    2021: 32,
    2022: 0,
    2023: 0,
    2024: 0,
    2025: 0,
    2026: 0
}

REPARTITION_2021 = {
    'Itasy': 0.75,
    'Analamanga': 0.15,
    'Vakinankaratra': 0.10
}


REPARTITION_2025 = {
    'Analamanga': 1.0
}

PROBABILITES_FORME = {
    "bubonique": 0.80,
    "pulmonaire": 0.18,
    "septique": 0.02
}

TAUX_LETALITE_FORME = {
    "bubonique": 0.05,
    "pulmonaire": 0.45,
    "septique": 0.75
}

# ============================================================================
# DONNEES REGIONALES - INSTAT Madagascar
# ============================================================================
REGIONS = {
    "Analamanga":        {"pop": 4290727, "lat": -18.9137, "lon": 47.5247, "risque": "eleve"},
    "Vakinankaratra":    {"pop": 2462316, "lat": -19.8667, "lon": 47.0333, "risque": "eleve"},
    "Itasy":             {"pop": 1063882, "lat": -19.0167, "lon": 46.7667, "risque": "eleve"},
    "Amoron'i Mania":    {"pop": 991145,  "lat": -20.0000, "lon": 47.1167, "risque": "eleve"},
    "Haute Matsiatra":   {"pop": 1710391, "lat": -21.4536, "lon": 47.0854, "risque": "eleve"},
    "Bongolava":         {"pop": 794456,  "lat": -18.9333, "lon": 45.6667, "risque": "moyen"},
    "Alaotra-Mangoro":   {"pop": 1479918, "lat": -17.8333, "lon": 48.4167, "risque": "moyen"},
    "Atsinanana":        {"pop": 1750511, "lat": -18.1492, "lon": 49.4023, "risque": "moyen"},
    "Boeny":             {"pop": 1100305, "lat": -15.7167, "lon": 46.3167, "risque": "faible"},
    "SAVA":              {"pop": 1330546, "lat": -14.2833, "lon": 50.1667, "risque": "faible"},
    "Sofia":             {"pop": 1784988, "lat": -14.8833, "lon": 48.0333, "risque": "faible"},
    "Diana":             {"pop": 1053715, "lat": -12.2787, "lon": 49.2917, "risque": "faible"},
    "Atsimo-Atsinanana": {"pop": 1220000, "lat": -22.9000, "lon": 47.6500, "risque": "faible"},
    "Fitovinany":        {"pop": 1011279, "lat": -21.4500, "lon": 47.6167, "risque": "faible"},
    "Ihorombe":          {"pop": 494097,  "lat": -22.5500, "lon": 46.9500, "risque": "faible"},
    "Betsiboka":         {"pop": 465641,  "lat": -16.9500, "lon": 46.8167, "risque": "faible"},
    "Melaky":            {"pop": 365790,  "lat": -16.1167, "lon": 44.7667, "risque": "faible"},
    "Ambatosoa":         {"pop": 652462,  "lat": -21.0333, "lon": 47.6333, "risque": "faible"},
    "Analanjirofo":      {"pop": 864183,  "lat": -17.3333, "lon": 49.4000, "risque": "faible"},
    "Androy":            {"pop": 1065878, "lat": -25.1667, "lon": 46.0833, "risque": "faible"},
    "Anosy":             {"pop": 957916,  "lat": -25.0333, "lon": 46.9833, "risque": "faible"},
    "Atsimo-Andrefana":  {"pop": 2128706, "lat": -23.3500, "lon": 43.6667, "risque": "faible"},
    "Menabe":            {"pop": 819876,  "lat": -20.2833, "lon": 44.7833, "risque": "faible"},
    "Vatovavy":          {"pop": 576905,  "lat": -21.3167, "lon": 47.9333, "risque": "faible"}
}

FACTEUR_SAISON = {
    1: 1.0, 2: 1.0, 3: 0.8, 4: 0.5, 5: 0.1, 6: 0.0,
    7: 0.0, 8: 0.0, 9: 0.3, 10: 0.9, 11: 1.0, 12: 1.0
}

def calculer_semaine_epidemio(date):
    iso_year, iso_week, _ = date.isocalendar()
    return f"{iso_year}-W{iso_week:02d}"

# ============================================================================
# GENERATION HEBDOMADAIRE
# ============================================================================
date_debut = datetime(2020, 1, 6)
date_fin = datetime(2026, 7, 31)
toutes_semaines = pd.date_range(date_debut, date_fin, freq='W-MON')

donnees = []

for region, data in REGIONS.items():
    pop = data["pop"]

    cas_journaliers_annee = {}
    for annee, total_annee in CAS_PAR_ANNEE.items():
        if total_annee == 0:
            continue

        if annee == 2021:
            part = REPARTITION_2021.get(region, 0.0)
        elif annee == 2025:
            part = REPARTITION_2025.get(region, 0.0)
        else:
            part = 0.0

        if part == 0.0:
            continue

        cas_region_annee = total_annee * part
        semaines_annee = [s for s in toutes_semaines if s.year == annee]
        if not semaines_annee:
            continue

        poids_saison = np.array([FACTEUR_SAISON[s.month] for s in semaines_annee])
        if poids_saison.sum() == 0:
            poids_saison = np.ones(len(semaines_annee))
        poids_saison = poids_saison / poids_saison.sum()

        cas_par_semaine = np.round(cas_region_annee * poids_saison).astype(int)
        diff = int(round(cas_region_annee) - cas_par_semaine.sum())
        if diff != 0 and len(cas_par_semaine) > 0:
            idx_max = np.argmax(poids_saison)
            cas_par_semaine[idx_max] += diff
            cas_par_semaine[idx_max] = max(0, cas_par_semaine[idx_max])

        for i, s in enumerate(semaines_annee):
            cas_journaliers_annee[s] = int(cas_par_semaine[i])

    for s in toutes_semaines:
        annee = s.year
        mois = s.month
        cas_totaux = cas_journaliers_annee.get(s, 0)

        if cas_totaux == 0:
            donnees.append({
                "date": s.strftime("%Y-%m-%d"),
                "annee": annee,
                "mois": mois,
                "semaine_epidemio": calculer_semaine_epidemio(s),
                "region": region,
                "latitude_region": data["lat"],
                "longitude_region": data["lon"],
                "niveau_risque": data["risque"],
                "population_region": pop,
                "cas_buboniques": 0,
                "cas_pulmonaires": 0,
                "cas_septiques": 0,
                "cas_totaux": 0,
                "cas_graves": 0,
                "deces": 0,
                "contacts_suivis": 0,
                "prophylaxie_administree": 0,
                "taux_incidence": 0.0,
                "taux_letalite": 0.0,
                "taux_contamination": 0.0
            })
            continue

        cas_buboniques = int(cas_totaux * PROBABILITES_FORME["bubonique"])
        cas_pulmonaires = int(cas_totaux * PROBABILITES_FORME["pulmonaire"])
        cas_septiques = max(0, cas_totaux - cas_buboniques - cas_pulmonaires)

        deces_totaux_annee = DECES_PAR_ANNEE.get(annee, 0)
        if annee == 2021 and CAS_PAR_ANNEE[2021] > 0:
            part_region_deces = cas_totaux / CAS_PAR_ANNEE[2021]
            deces_semaine = round(deces_totaux_annee * part_region_deces)
        else:
            deces_semaine = 0
        deces_semaine = min(deces_semaine, cas_totaux)

        cas_graves = cas_pulmonaires + cas_septiques + int(cas_buboniques * 0.1)
        contacts_suivis = int(cas_pulmonaires * np.random.uniform(5, 10))
        prophylaxie = int(contacts_suivis * np.random.uniform(0.7, 0.95))

        taux_incidence = round((cas_totaux / pop) * 100000, 4)
        taux_letalite = round((deces_semaine / cas_totaux) * 100, 2) if cas_totaux > 0 else 0
        taux_contamination = round((cas_pulmonaires / cas_totaux) * 100, 2) if cas_totaux > 0 else 0

        donnees.append({
            "date": s.strftime("%Y-%m-%d"),
            "annee": annee,
            "mois": mois,
            "semaine_epidemio": calculer_semaine_epidemio(s),
            "region": region,
            "latitude_region": data["lat"],
            "longitude_region": data["lon"],
            "niveau_risque": data["risque"],
            "population_region": pop,
            "cas_buboniques": cas_buboniques,
            "cas_pulmonaires": cas_pulmonaires,
            "cas_septiques": cas_septiques,
            "cas_totaux": cas_totaux,
            "cas_graves": cas_graves,
            "deces": deces_semaine,
            "contacts_suivis": contacts_suivis,
            "prophylaxie_administree": prophylaxie,
            "taux_incidence": taux_incidence,
            "taux_letalite": taux_letalite,
            "taux_contamination": taux_contamination
        })

df = pd.DataFrame(donnees)

# ============================================================================
# VALIDATION FINALE
# ============================================================================
print(f"\n{'=' * 70}")
print("VALIDATION FINALE")
print(f"{'=' * 70}")

cas_verif = df['cas_totaux'].sum()
deces_verif = df['deces'].sum()

print(f"\nTOTAUX VERIFIES :")
print(f"   Cas totaux : {cas_verif:,} (cible: {sum(CAS_PAR_ANNEE.values()):,})")
print(f"   Deces : {deces_verif:,} (cible: {sum(DECES_PAR_ANNEE.values()):,})")

for annee in CAS_PAR_ANNEE:
    cas_annee = df[df['annee'] == annee]['cas_totaux'].sum()
    print(f"   Annee {annee} : {cas_annee:,} cas (cible: {CAS_PAR_ANNEE[annee]:,})")

print(f"\nREPARTITION 2021 PAR REGION :")
cas_2021 = df[df['annee'] == 2021].groupby('region')['cas_totaux'].sum()
for region, cas in cas_2021[cas_2021 > 0].sort_values(ascending=False).items():
    print(f"   {region:<20} {cas} cas")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
chemin_sortie = os.path.join(PROJECT_ROOT, "ETL", "peste", "data", "raw", "peste_madagascar_raw.csv")
os.makedirs(os.path.dirname(chemin_sortie), exist_ok=True)
df.to_csv(chemin_sortie, index=False, encoding="utf-8")

print(f"\nFICHIER GENERE : {chemin_sortie}")
print(f"   Nombre de lignes : {len(df):,}")
print(f"   Periode : {date_debut.strftime('%Y-%m-%d')} a {date_fin.strftime('%Y-%m-%d')}")
print(f"\nNOTE METHODOLOGIQUE : seule l'annee 2021 est documentee officiellement")
print("(flambee du district d'Arivonimamo, region Itasy, aout-octobre 2021,")
print("source OMS/MesVaccins). Les autres annees sont fixees a zero cas, sauf")
print("2025 (2 cas isoles a Analamanga). Repartition regionale non-2021/2025")
print("non applicable faute de flambee documentee sur cette periode.")
print(f"{'=' * 70}\n")