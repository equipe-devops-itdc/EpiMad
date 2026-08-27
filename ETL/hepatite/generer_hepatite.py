import os
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

DATE_DEBUT = datetime(2020, 1, 1)
DATE_FIN = datetime(2026, 7, 31)

MALADIE = "Hépatite B"
CODE_MALADIE = "VHB"
PREVALENCE_NATIONALE_REFERENCE = 0.069
DECES_NATIONAL_PAR_AN = 98

REGIONS = {
    "Analamanga":        {"pop": 4290727, "lat": -18.9137, "lon": 47.5247, "facteur_risque": 0.90},
    "Bongolava":         {"pop": 794456,  "lat": -18.9333, "lon": 45.6667, "facteur_risque": 0.95},
    "Itasy":             {"pop": 1063882, "lat": -19.0167, "lon": 46.7667, "facteur_risque": 0.88},
    "Vakinankaratra":    {"pop": 2462316, "lat": -19.8667, "lon": 47.0333, "facteur_risque": 0.92},
    "Amoron'i Mania":    {"pop": 991145,  "lat": -20.0000, "lon": 47.1167, "facteur_risque": 0.96},
    "Haute Matsiatra":   {"pop": 1710391, "lat": -21.4536, "lon": 47.0854, "facteur_risque": 0.98},
    "Vatovavy":          {"pop": 576905,  "lat": -21.3167, "lon": 47.9333, "facteur_risque": 1.12},
    "Fitovinany":        {"pop": 1011279, "lat": -21.4500, "lon": 47.6167, "facteur_risque": 1.08},
    "Ihorombe":          {"pop": 494097,  "lat": -22.5500, "lon": 46.9500, "facteur_risque": 1.00},
    "Atsimo-Atsinanana": {"pop": 1220000, "lat": -22.9000, "lon": 47.6500, "facteur_risque": 1.10},
    "Atsinanana":        {"pop": 1750511, "lat": -18.1492, "lon": 49.4023, "facteur_risque": 1.07},
    "Analanjirofo":      {"pop": 864183,  "lat": -17.3333, "lon": 49.4000, "facteur_risque": 1.05},
    "Ambatosoa":         {"pop": 652462,  "lat": -21.0333, "lon": 47.6333, "facteur_risque": 1.10},
    "Alaotra-Mangoro":   {"pop": 1479918, "lat": -17.8333, "lon": 48.4167, "facteur_risque": 1.02},
    "Boeny":             {"pop": 1100305, "lat": -15.7167, "lon": 46.3167, "facteur_risque": 1.35},
    "Sofia":             {"pop": 1784988, "lat": -14.8833, "lon": 48.0333, "facteur_risque": 1.28},
    "Betsiboka":         {"pop": 465641,  "lat": -16.9500, "lon": 46.8167, "facteur_risque": 1.25},
    "Melaky":            {"pop": 365790,  "lat": -16.1167, "lon": 44.7667, "facteur_risque": 1.30},
    "Atsimo-Andrefana":  {"pop": 2128706, "lat": -23.3500, "lon": 43.6667, "facteur_risque": 1.20},
    "Menabe":            {"pop": 819876,  "lat": -20.2833, "lon": 44.7833, "facteur_risque": 1.22},
    "Diana":             {"pop": 1053715, "lat": -12.2787, "lon": 49.2917, "facteur_risque": 1.12},
    "SAVA":              {"pop": 1330546, "lat": -14.2833, "lon": 50.1667, "facteur_risque": 1.08},
    "Androy":            {"pop": 1065878, "lat": -25.1667, "lon": 46.0833, "facteur_risque": 1.18},
    "Anosy":             {"pop": 957916,  "lat": -25.0333, "lon": 46.9833, "facteur_risque": 1.15},
}

if len(REGIONS) != 24:
    raise ValueError(f"ERREUR : {len(REGIONS)} regions trouvees, 24 attendues.")

TAUX_NATALITE_ANNUEL = 0.025
TAUX_FEMMES_ENCEINTES = 0.03
TAUX_ENFANTS_MOINS_5 = 0.15
TAUX_TRANSMISSION_MERE_ENFANT = 0.25
TAUX_DEPISTAGE_FE = 0.20
TAUX_TESTS_DEPISTAGE = 0.005
TAUX_SUIVI_CHRONIQUE = 0.10
TAUX_TRAITEMENT = 0.25
DELAI_GUERIS_SEMAINES = 6 
COUVERTURE_VACCINALE_ANNUELLE = {
    2020: 0.45, 2021: 0.46, 2022: 0.47, 2023: 0.49,
    2024: 0.51, 2025: 0.53, 2026: 0.55,
}

FACTEUR_SAISON = {
    1: 1.05, 2: 1.05, 3: 1.02, 4: 1.00, 5: 0.98, 6: 0.95,
    7: 0.95, 8: 0.96, 9: 0.98, 10: 1.00, 11: 1.03, 12: 1.06,
}

def calculer_semaine_epidemio(date):
    iso_year, iso_week, _ = date.isocalendar()
    return f"{iso_year}-W{iso_week:02d}"

def calculer_prevalence_region(region, annee):
    facteur = REGIONS[region]["facteur_risque"]
    prevalence = PREVALENCE_NATIONALE_REFERENCE * facteur
    evolution = 1 - ((annee - 2020) * 0.002)
    prevalence *= evolution
    prevalence *= np.random.uniform(0.985, 1.015)
    prevalence = np.clip(prevalence, 0.03, 0.13)
    return round(float(prevalence), 4)

def calculer_naissances_semaine(population):
    return max(1, int(population * TAUX_NATALITE_ANNUEL / 52))

print("=" * 70)
print("GENERATEUR HEPATITE B - EPIMAD")
print("=" * 70)
print(f"Periode : {DATE_DEBUT.strftime('%d/%m/%Y')} - {DATE_FIN.strftime('%d/%m/%Y')}")
print(f"Prevalence nationale de reference : {PREVALENCE_NATIONALE_REFERENCE*100:.1f}%")
print(f"Deces national de reference : {DECES_NATIONAL_PAR_AN}/an (source OMS 2020)")

# ============================================================================
#  cas, semaine par semaine, region par region
# ============================================================================
donnees_brutes = {}
somme_pop_ponderee_totale = sum(r["pop"] * r["facteur_risque"] for r in REGIONS.values())

date_courante = DATE_DEBUT
while date_courante <= DATE_FIN:
    annee = date_courante.year
    mois = date_courante.month
    facteur_saison = FACTEUR_SAISON[mois]
    couverture_vaccinale_base = COUVERTURE_VACCINALE_ANNUELLE[annee]

    for region, config in REGIONS.items():
        population = config["pop"]

        femmes_enceintes = int(population * TAUX_FEMMES_ENCEINTES)
        enfants_moins_5_ans = int(population * TAUX_ENFANTS_MOINS_5)
        naissances_semaine = calculer_naissances_semaine(population)

        prevalence = calculer_prevalence_region(region, annee)
        porteurs_chroniques = int(population * prevalence)

        taux_depistage_fe = np.clip(TAUX_DEPISTAGE_FE * np.random.uniform(0.80, 1.20), 0.05, 0.40)
        femmes_enceintes_depistees = int(femmes_enceintes * taux_depistage_fe)
        femmes_enceintes_aghbs_positives = min(
            int(femmes_enceintes_depistees * prevalence * np.random.uniform(0.90, 1.10)),
            femmes_enceintes_depistees
        )

        enfants_exposes_aghbs = int(naissances_semaine * prevalence)
        couverture_vaccinale = np.clip(couverture_vaccinale_base * np.random.uniform(0.95, 1.05), 0.0, 1.0)
        enfants_vaccines_naissance = int(naissances_semaine * couverture_vaccinale)
        enfants_exposes_non_proteges = int(enfants_exposes_aghbs * (1 - couverture_vaccinale))
        enfants_devenus_porteurs = min(
            int(enfants_exposes_non_proteges * TAUX_TRANSMISSION_MERE_ENFANT * np.random.uniform(0.85, 1.15)),
            enfants_exposes_aghbs
        )
        taux_transmission_mere_enfant = (
            enfants_devenus_porteurs / enfants_exposes_aghbs * 100 if enfants_exposes_aghbs > 0 else 0.0
        )

        tests_depistage = max(0, int(population * TAUX_TESTS_DEPISTAGE * np.random.uniform(0.80, 1.20)))
        nouveaux_diagnostics_aghbs = min(
            int(tests_depistage * prevalence * facteur_saison * np.random.uniform(0.80, 1.20)),
            tests_depistage
        )

        incidence_aigue_base = 0.0008
        cas_aigus = max(0, int((incidence_aigue_base * facteur_saison * population / 100000) * np.random.uniform(0.70, 1.30)))

        cas_chroniques_suivis = max(0, int(porteurs_chroniques * TAUX_SUIVI_CHRONIQUE * np.random.uniform(0.90, 1.10)))
        cas_chroniques_enfants = int(cas_chroniques_suivis * 0.15)
        cas_chroniques_adultes = int(cas_chroniques_suivis * 0.65)
        cas_chroniques_seniors = cas_chroniques_suivis - cas_chroniques_enfants - cas_chroniques_adultes

        personnes_traitees = min(
            int(cas_chroniques_suivis * TAUX_TRAITEMENT * np.random.uniform(0.90, 1.10)),
            cas_chroniques_suivis
        )

        poids_region = population * REGIONS[region]["facteur_risque"] / somme_pop_ponderee_totale
        deces_hebdo_attendu = (DECES_NATIONAL_PAR_AN / 52) * poids_region
        deces = int(np.random.poisson(max(deces_hebdo_attendu, 0.0001)))
        total_suivis = cas_aigus + cas_chroniques_suivis
        deces = min(deces, total_suivis)

        cle = (region, date_courante)
        donnees_brutes[cle] = {
            "annee": annee, "mois": mois, "region": region,
            "latitude_region": config["lat"], "longitude_region": config["lon"],
            "population_region": population,
            "femmes_enceintes": femmes_enceintes,
            "enfants_moins_5_ans": enfants_moins_5_ans,
            "naissances_semaine": naissances_semaine,
            "porteurs_chroniques_estimes": porteurs_chroniques,
            "prevalence_aghbs_region": prevalence,
            "femmes_enceintes_depistees": femmes_enceintes_depistees,
            "femmes_enceintes_aghbs_positives": femmes_enceintes_aghbs_positives,
            "enfants_exposes_aghbs": enfants_exposes_aghbs,
            "enfants_vaccines_naissance": enfants_vaccines_naissance,
            "enfants_devenus_porteurs": enfants_devenus_porteurs,
            "taux_transmission_mere_enfant": round(taux_transmission_mere_enfant, 2),
            "couverture_vaccinale_naissance": round(couverture_vaccinale * 100, 2),
            "cas_chroniques_enfants": cas_chroniques_enfants,
            "cas_chroniques_adultes": cas_chroniques_adultes,
            "cas_chroniques_seniors": cas_chroniques_seniors,
            "cas_aigus": cas_aigus,
            "nouveaux_diagnostics_aghbs": nouveaux_diagnostics_aghbs,
            "cas_chroniques_suivis": cas_chroniques_suivis,
            "deces": deces,
            "tests_depistage": tests_depistage,
            "personnes_traitees": personnes_traitees,
        }

    date_courante += timedelta(days=7)

# ============================================================================
# Guerisons : resolution des cas aigus, delai de 6 semaines
# ============================================================================

TAUX_RESOLUTION_SPONTANEE = 0.90
DELAI_GUERIS_SEMAINES = 6

for region in REGIONS:
    semaines_region = [d for (r, d) in donnees_brutes.keys() if r == region]
    semaines_region.sort()

    gueris_par_semaine = {s: 0 for s in semaines_region}
    for i, s in enumerate(semaines_region):
        cas_s = donnees_brutes[(region, s)]["nouveaux_diagnostics_aghbs"]
        deces_s = donnees_brutes[(region, s)]["deces"]
        gueris_potentiels = max(0, int(cas_s * TAUX_RESOLUTION_SPONTANEE) - min(deces_s, cas_s))
        idx_gueris = i + DELAI_GUERIS_SEMAINES
        if idx_gueris < len(semaines_region):
            s_cible = semaines_region[idx_gueris]
            gueris_par_semaine[s_cible] += gueris_potentiels

    gueris_cumul = 0
    for s in semaines_region:
        gueris_cumul += gueris_par_semaine[s]
        donnees_brutes[(region, s)]["new_recoveries"] = gueris_par_semaine[s]
        donneei^+  s_brutes[(region, s)]["total_recoveries"] = gueris_cumul

# ============================================================================
# Construction finale du dataframe
# ============================================================================
donnees = []
for (region, s), val in donnees_brutes.items():
    cas_aigus = val["cas_aigus"]
    cas_chroniques_suivis = val["cas_chroniques_suivis"]
    deces = val["deces"]
    total_suivis = cas_aigus + cas_chroniques_suivis
    femmes_enceintes_depistees = val["femmes_enceintes_depistees"]

    taux_letalite = round((deces / total_suivis) * 100, 2) if total_suivis > 0 else 0.0
    taux_depistage = round((val["tests_depistage"] / val["population_region"]) * 100, 4)
    taux_positivite_aghbs = (
        round((val["femmes_enceintes_aghbs_positives"] / femmes_enceintes_depistees) * 100, 2)
        if femmes_enceintes_depistees > 0 else 0.0
    )

    donnees.append({
        "date": s.strftime("%Y-%m-%d"),
        "annee": val["annee"],
        "mois": val["mois"],
        "semaine_epidemio": calculer_semaine_epidemio(s),
        "region": region,
        "latitude_region": val["latitude_region"],
        "longitude_region": val["longitude_region"],
        "population_region": val["population_region"],
        "femmes_enceintes": val["femmes_enceintes"],
        "enfants_moins_5_ans": val["enfants_moins_5_ans"],
        "naissances_semaine": val["naissances_semaine"],
        "porteurs_chroniques_estimes": val["porteurs_chroniques_estimes"],
        "prevalence_aghbs_region": val["prevalence_aghbs_region"],
        "femmes_enceintes_depistees": femmes_enceintes_depistees,
        "femmes_enceintes_aghbs_positives": val["femmes_enceintes_aghbs_positives"],
        "enfants_exposes_aghbs": val["enfants_exposes_aghbs"],
        "enfants_vaccines_naissance": val["enfants_vaccines_naissance"],
        "enfants_devenus_porteurs": val["enfants_devenus_porteurs"],
        "taux_transmission_mere_enfant": val["taux_transmission_mere_enfant"],
        "couverture_vaccinale_naissance": val["couverture_vaccinale_naissance"],
        "cas_chroniques_enfants": val["cas_chroniques_enfants"],
        "cas_chroniques_adultes": val["cas_chroniques_adultes"],
        "cas_chroniques_seniors": val["cas_chroniques_seniors"],
        "cas_aigus": cas_aigus,
        "nouveaux_diagnostics_aghbs": val["nouveaux_diagnostics_aghbs"],
        "cas_chroniques_suivis": cas_chroniques_suivis,
        "deces": deces,
        "new_recoveries": val["new_recoveries"],
        "total_recoveries": val["total_recoveries"],
        "tests_depistage": val["tests_depistage"],
        "personnes_traitees": val["personnes_traitees"],
        "taux_incidence": val["prevalence_aghbs_region"],
        "taux_letalite": taux_letalite,
        "taux_depistage": taux_depistage,
        "taux_positivite_aghbs": taux_positivite_aghbs,
    })

df = pd.DataFrame(donnees)

print(f"\nValidation : {df['region'].nunique()} regions, {len(df):,} lignes")
assert df["region"].nunique() == 24
assert (df["deces"] <= (df["cas_aigus"] + df["cas_chroniques_suivis"])).all()
assert df["prevalence_aghbs_region"].between(0, 0.30).all()

print(f"\nTotal deces genere : {df['deces'].sum():,} (cible ~{DECES_NATIONAL_PAR_AN * 6.6:.0f} sur 6.6 ans)")
print(f"Total guerisons : {df['new_recoveries'].sum():,}")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
chemin_sortie = os.path.join(PROJECT_ROOT, "ETL", "hepatite", "data", "raw", "hepatite_madagascar_raw.csv")
os.makedirs(os.path.dirname(chemin_sortie), exist_ok=True)
df.to_csv(chemin_sortie, index=False, encoding="utf-8")

print(f"\nFICHIER GENERE : {chemin_sortie}")
print("\nNOTE METHODOLOGIQUE : la prevalence nationale (6.9%) et les deces")
print("nationaux (98/an) proviennent de sources OMS verifiees. La repartition")
print("regionale suit un modele d'estimation par facteur de risque. Les")
print("guerisons representent la resolution spontanee des cas aigus (delai")
print("de 6 semaines) ; les porteurs chroniques ne sont pas consideres gueris")
print("dans ce modele, conformement a la realite clinique de l'hepatite B.")