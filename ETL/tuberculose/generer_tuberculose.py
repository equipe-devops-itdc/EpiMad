import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

np.random.seed(42)

print("=" * 70)
print("GENERATEUR TUBERCULOSE - EPIMAD")
print("=" * 70)

REGIONS = {
    "Analanjirofo":      {"pop": 864183,  "lat": -17.3333, "lon": 49.4000, "incidence": 280, "tb_mr_risque": "eleve"},
    "Analamanga":        {"pop": 4290727, "lat": -18.9137, "lon": 47.5247, "incidence": 260, "tb_mr_risque": "moyen"},
    "Atsinanana":        {"pop": 1750511, "lat": -18.1492, "lon": 49.4023, "incidence": 255, "tb_mr_risque": "moyen"},
    "Sofia":             {"pop": 1784988, "lat": -14.8833, "lon": 48.0333, "incidence": 250, "tb_mr_risque": "faible"},
    "Vakinankaratra":    {"pop": 2462316, "lat": -19.8667, "lon": 47.0333, "incidence": 230, "tb_mr_risque": "faible"},
    "Haute Matsiatra":   {"pop": 1710391, "lat": -21.4536, "lon": 47.0854, "incidence": 225, "tb_mr_risque": "faible"},
    "Boeny":             {"pop": 1100305, "lat": -15.7167, "lon": 46.3167, "incidence": 220, "tb_mr_risque": "faible"},
    "Alaotra-Mangoro":   {"pop": 1479918, "lat": -17.8333, "lon": 48.4167, "incidence": 215, "tb_mr_risque": "faible"},
    "SAVA":              {"pop": 1330546, "lat": -14.2833, "lon": 50.1667, "incidence": 210, "tb_mr_risque": "faible"},
    "Atsimo-Andrefana":  {"pop": 2128706, "lat": -23.3500, "lon": 43.6667, "incidence": 205, "tb_mr_risque": "faible"},
    "Itasy":             {"pop": 1063882, "lat": -19.0167, "lon": 46.7667, "incidence": 190, "tb_mr_risque": "faible"},
    "Bongolava":         {"pop": 794456,  "lat": -18.9333, "lon": 45.6667, "incidence": 185, "tb_mr_risque": "faible"},
    "Diana":             {"pop": 1053715, "lat": -12.2787, "lon": 49.2917, "incidence": 180, "tb_mr_risque": "faible"},
    "Amoron'i Mania":    {"pop": 991145,  "lat": -20.0000, "lon": 47.1167, "incidence": 175, "tb_mr_risque": "faible"},
    "Atsimo-Atsinanana": {"pop": 1220000, "lat": -22.9000, "lon": 47.6500, "incidence": 170, "tb_mr_risque": "faible"},
    "Fitovinany":        {"pop": 1011279, "lat": -21.4500, "lon": 47.6167, "incidence": 165, "tb_mr_risque": "faible"},
    "Ihorombe":          {"pop": 494097,  "lat": -22.5500, "lon": 46.9500, "incidence": 160, "tb_mr_risque": "faible"},
    "Betsiboka":         {"pop": 465641,  "lat": -16.9500, "lon": 46.8167, "incidence": 155, "tb_mr_risque": "faible"},
    "Melaky":            {"pop": 365790,  "lat": -16.1167, "lon": 44.7667, "incidence": 150, "tb_mr_risque": "faible"},
    "Ambatosoa":         {"pop": 652462,  "lat": -21.0333, "lon": 47.6333, "incidence": 150, "tb_mr_risque": "faible"},
    "Androy":            {"pop": 1065878, "lat": -25.1667, "lon": 46.0833, "incidence": 145, "tb_mr_risque": "faible"},
    "Anosy":             {"pop": 957916,  "lat": -25.0333, "lon": 46.9833, "incidence": 140, "tb_mr_risque": "faible"},
    "Menabe":            {"pop": 819876,  "lat": -20.2833, "lon": 44.7833, "incidence": 135, "tb_mr_risque": "faible"},
    "Vatovavy":          {"pop": 576905,  "lat": -21.3167, "lon": 47.9333, "incidence": 130, "tb_mr_risque": "faible"},
}

FACTEUR_SAISON = {
    1: 0.95, 2: 0.95, 3: 1.00, 4: 1.05, 5: 1.10, 6: 1.15,
    7: 1.15, 8: 1.10, 9: 1.05, 10: 1.00, 11: 0.95, 12: 0.90
}

PROBABILITES_FORME = {
    "pulmonaire_bacillifere": 0.55,
    "pulmonaire_non_bacillifere": 0.25,
    "extra_pulmonaire": 0.18,
    "tb_multiresistante": 0.02
}

TAUX_COINFECTION_VIH = 0.25
TAUX_SUCCES_THERAPEUTIQUE = 0.78
COUVERTURE_DEPISTAGE = 0.65

def calculer_semaine_epidemio(date):
    iso_year, iso_week, _ = date.isocalendar()
    return f"{iso_year}-W{iso_week:02d}"

print(f"Regions : {len(REGIONS)}")
print("Incidence nationale de reference : 213/100 000 hab (OMS, coherent avec")
print("37 000 diagnostics 2019 / couverture depistage 65%)")

donnees = []
date_debut = datetime(2020, 1, 6)
date_fin = datetime(2026, 7, 31)
date_courante = date_debut

total_nouveaux_cas = 0
total_deces = 0
total_tb_mr = 0

while date_courante <= date_fin:
    mois = date_courante.month
    annee = date_courante.year
    facteur_saison = FACTEUR_SAISON[mois]
    amelioration_depistage = 1.0 + (annee - 2020) * 0.02

    for region, data in REGIONS.items():
        pop = data["pop"]
        incidence_region = data["incidence"]
        tb_mr_risque = data["tb_mr_risque"]

        incidence_annuelle = (incidence_region / 100000) * pop
        incidence_hebdomadaire = incidence_annuelle / 52

        nouveaux_cas = max(0, int(
            incidence_hebdomadaire * facteur_saison * amelioration_depistage
            * np.random.uniform(0.85, 1.15)
        ))

        cas_pulmonaire_bacillifere = int(nouveaux_cas * PROBABILITES_FORME["pulmonaire_bacillifere"])
        cas_pulmonaire_non_bacillifere = int(nouveaux_cas * PROBABILITES_FORME["pulmonaire_non_bacillifere"])
        cas_extra_pulmonaire = int(nouveaux_cas * PROBABILITES_FORME["extra_pulmonaire"])

        if region == "Analanjirofo":
            tb_mr_prob = 0.03
        elif tb_mr_risque == "eleve":
            tb_mr_prob = 0.025
        elif tb_mr_risque == "moyen":
            tb_mr_prob = 0.015
        else:
            tb_mr_prob = 0.005
        cas_tb_mr = int(nouveaux_cas * tb_mr_prob)

        cas_coinfection_vih = int(nouveaux_cas * TAUX_COINFECTION_VIH)
        deces_coinfection_vih = int(cas_coinfection_vih * 0.08)

        enfants_moins_15_ans = int(nouveaux_cas * 0.12)
        adultes_15_54_ans = int(nouveaux_cas * 0.65)
        seniors_55_plus = nouveaux_cas - enfants_moins_15_ans - adultes_15_54_ans

        tests_geneXpert_realises = int(nouveaux_cas * 0.70)
        tests_microscopie_realises = int(nouveaux_cas * 0.25)
        tests_lam_realises = int(cas_coinfection_vih * 0.30)
        cas_non_diagnostiques = int(nouveaux_cas * (1 - COUVERTURE_DEPISTAGE))

        patients_sous_traitement = int(nouveaux_cas * 0.85)
        patients_gueris = int(patients_sous_traitement * TAUX_SUCCES_THERAPEUTIQUE)
        patients_abandon = int(patients_sous_traitement * 0.12)
        patients_echec = int(patients_sous_traitement * 0.10)

        taux_letalite_base = 0.244
        deces = max(0, int(nouveaux_cas * taux_letalite_base * np.random.uniform(0.9, 1.1)))

        if region == "Analanjirofo" and np.random.random() < 0.1:
            cas_prison = int(np.random.uniform(5, 15))
        else:
            cas_prison = 0

        taux_letalite_calcule = round((deces / nouveaux_cas) * 100, 2) if nouveaux_cas > 0 else 0

        donnees.append({
            "date": date_courante.strftime("%Y-%m-%d"),
            "annee": annee,
            "mois": mois,
            "semaine_epidemio": calculer_semaine_epidemio(date_courante),
            "region": region,
            "latitude_region": data["lat"],
            "longitude_region": data["lon"],
            "population_region": pop,
            "incidence_regionale_annuelle": incidence_region,
            "cas_pulmonaire_bacillifere": cas_pulmonaire_bacillifere,
            "cas_pulmonaire_non_bacillifere": cas_pulmonaire_non_bacillifere,
            "cas_extra_pulmonaire": cas_extra_pulmonaire,
            "cas_tb_multiresistante": cas_tb_mr,
            "nouveaux_cas": nouveaux_cas,
            "cas_coinfection_vih": cas_coinfection_vih,
            "deces_coinfection_vih": deces_coinfection_vih,
            "cas_enfants_moins_15_ans": enfants_moins_15_ans,
            "cas_adultes_15_54_ans": adultes_15_54_ans,
            "cas_seniors_55_plus": seniors_55_plus,
            "tests_geneXpert_realises": tests_geneXpert_realises,
            "tests_microscopie_realises": tests_microscopie_realises,
            "tests_lam_realises": tests_lam_realises,
            "cas_non_diagnostiques": cas_non_diagnostiques,
            "patients_sous_traitement": patients_sous_traitement,
            "patients_gueris": patients_gueris,
            "patients_abandon": patients_abandon,
            "patients_echec": patients_echec,
            "deces": deces,
            "cas_detectes_prison": cas_prison,
            "taux_incidence": incidence_region,
            "taux_incidence_annuel": incidence_region,
            "taux_letalite": taux_letalite_calcule,
            "taux_depistage": round(COUVERTURE_DEPISTAGE * 100, 2),
            "taux_succes_therapeutique": round(TAUX_SUCCES_THERAPEUTIQUE * 100, 2),
        })

        total_nouveaux_cas += nouveaux_cas
        total_deces += deces
        total_tb_mr += cas_tb_mr

    date_courante += timedelta(days=7)

df = pd.DataFrame(donnees)

print(f"\nTotal nouveaux cas : {total_nouveaux_cas:,}")
print(f"Total deces : {total_deces:,}")
print(f"Total TB-MR : {total_tb_mr:,}")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
chemin_sortie = os.path.join(PROJECT_ROOT, "ETL", "tuberculose", "data", "raw", "tuberculose_madagascar_raw.csv")
os.makedirs(os.path.dirname(chemin_sortie), exist_ok=True)
df.to_csv(chemin_sortie, index=False, encoding="utf-8")

print(f"\nFICHIER GENERE : {chemin_sortie}")
print(f"Nombre de lignes : {len(df):,}")
print(f"\nNOTE METHODOLOGIQUE : l'incidence nationale de reference (213/100 000)")
print("est coherente avec les 37 000 diagnostics rapportes en 2019 (OMS, 2021),")
print("ajustee pour une couverture de depistage de 65%. La colonne taux_incidence")
print("reprend directement incidence_regionale_annuelle, l'indicateur principal")
print("d'alerte pour cette maladie, deja exprime a la bonne echelle (pour 100 000")
print("habitants/an) conformement a seuils_alerte.json.")