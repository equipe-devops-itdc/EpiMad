import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

np.random.seed(42)

print("=" * 70)
print("GENERATION DES DONNEES ROUGEOLE - MADAGASCAR")
print("=" * 70)

# ============================================================================
# CONTRAINTES OFFICIELLES
# ============================================================================
CAS_PAR_ANNEE = {
    2020: 0,
    2021: 0,
    2022: 27,
    2023: 0,
    2024: 0,
    2025: 10294,
    2026: 7044
}

DECES_TOTAL = 120
NB_REGIONS_MIN_AVEC_DECES = 20

COUVERTURE_VACCINALE_PAR_ANNEE = {
    2020: 0.30,
    2021: 0.42,
    2022: 0.50,
    2023: 0.55,
    2024: 0.60,
    2025: 0.65,
    2026: 0.65
}

TAUX_CONFIRMATION_LNR = 0.20
DELAI_GUERIS_SEMAINES = 2

PROBABILITES_AGE = {
    "0-4_ans": 0.65,
    "5-9_ans": 0.20,
    "10-14_ans": 0.08,
    "15-19_ans": 0.04,
    "20+_ans": 0.03
}

PROBABILITES_SEXE = {"M": 0.52, "F": 0.48}

STATUT_VACCINAL = {
    "non_vaccine": 0.45,
    "statut_inconnu": 0.10,
    "1_dose": 0.30,
    "2_doses": 0.15
}

# ============================================================================
# DONNEES REGIONALES - INSTAT Madagascar
# ============================================================================
REGIONS = {
    "Analamanga":        {"pop": 4290727, "lat": -18.9137, "lon": 47.5247},
    "Vakinankaratra":    {"pop": 2462316, "lat": -19.8667, "lon": 47.0333},
    "Itasy":             {"pop": 1063882, "lat": -19.0167, "lon": 46.7667},
    "Bongolava":         {"pop": 794456,  "lat": -18.9333, "lon": 45.6667},
    "Haute Matsiatra":   {"pop": 1710391, "lat": -21.4536, "lon": 47.0854},
    "Fitovinany":        {"pop": 1011279, "lat": -21.4500, "lon": 47.6167},
    "Amoron'i Mania":    {"pop": 991145,  "lat": -20.0000, "lon": 47.1167},
    "Vatovavy":          {"pop": 576905,  "lat": -21.3167, "lon": 47.9333},
    "Atsimo-Atsinanana": {"pop": 1220000, "lat": -22.9000, "lon": 47.6500},
    "Ihorombe":          {"pop": 494097,  "lat": -22.5500, "lon": 46.9500},
    "Atsinanana":        {"pop": 1750511, "lat": -18.1492, "lon": 49.4023},
    "Ambatosoa":         {"pop": 652462,  "lat": -21.0333, "lon": 47.6333},
    "Alaotra-Mangoro":   {"pop": 1479918, "lat": -17.8333, "lon": 48.4167},
    "Analanjirofo":      {"pop": 864183,  "lat": -17.3333, "lon": 49.4000},
    "Sofia":             {"pop": 1784988, "lat": -14.8833, "lon": 48.0333},
    "Boeny":             {"pop": 1100305, "lat": -15.7167, "lon": 46.3167},
    "Betsiboka":         {"pop": 465641,  "lat": -16.9500, "lon": 46.8167},
    "Melaky":            {"pop": 365790,  "lat": -16.1167, "lon": 44.7667},
    "SAVA":              {"pop": 1330546, "lat": -14.2833, "lon": 50.1667},
    "Diana":             {"pop": 1053715, "lat": -12.2787, "lon": 49.2917},
    "Atsimo-Andrefana":  {"pop": 2128706, "lat": -23.3500, "lon": 43.6667},
    "Androy":            {"pop": 1065878, "lat": -25.1667, "lon": 46.0833},
    "Anosy":             {"pop": 957916,  "lat": -25.0333, "lon": 46.9833},
    "Menabe":            {"pop": 819876,  "lat": -20.2833, "lon": 44.7833},
}

FACTEUR_FLAMBEE = {
    "Analamanga": 9.0,
    "Boeny": 3.0,
    "Vakinankaratra": 2.0,
    "Ihorombe": 0.1,
    "Anosy": 0.1,
}

regions_list = list(REGIONS.keys())
for region in regions_list:
    if region not in FACTEUR_FLAMBEE:
        FACTEUR_FLAMBEE[region] = 0.3

poids_flambee = {}
somme_flambee = 0
for region in regions_list:
    pop = REGIONS[region]["pop"]
    poids = pop * FACTEUR_FLAMBEE[region]
    poids_flambee[region] = poids
    somme_flambee += poids
proportion_flambee = {r: poids_flambee[r] / somme_flambee for r in regions_list}

somme_pop = sum(r["pop"] for r in REGIONS.values())
proportion_pop = {r: REGIONS[r]["pop"] / somme_pop for r in regions_list}

FACTEUR_SAISON = {
    1: 0.8, 2: 0.7, 3: 0.6, 4: 0.5, 5: 0.6, 6: 0.8,
    7: 1.2, 8: 1.8, 9: 2.2, 10: 2.5, 11: 2.0, 12: 1.2
}

def calculer_semaine_epidemio(date):
    iso_year, iso_week, _ = date.isocalendar()
    return f"{iso_year}-W{iso_week:02d}"

# ============================================================================
# GENERATION HEBDOMADAIRE
# ============================================================================
date_debut = datetime(2020, 1, 6)
date_fin = datetime(2026, 8, 9)
toutes_semaines = pd.date_range(date_debut, date_fin, freq='W-MON')
liste_semaines = list(toutes_semaines)

# ============================================================================
# 1 - Calcul des cas par semaine, pour toutes les regions
# ============================================================================
cas_par_region = {}
total_cas_par_region = {}

for region in regions_list:
    cas_par_semaine_region = {}
    for annee, total_annee in CAS_PAR_ANNEE.items():
        if total_annee == 0:
            continue

        part = proportion_flambee[region] if annee in (2025, 2026) else proportion_pop[region]
        cas_region_annee = total_annee * part
        semaines_annee = [s for s in toutes_semaines if s.year == annee]
        if not semaines_annee:
            continue

        poids_saison = np.array([FACTEUR_SAISON[s.month] for s in semaines_annee])
        bruit = np.random.uniform(0.85, 1.15, size=len(semaines_annee))
        poids_saison = poids_saison * bruit
        poids_saison = poids_saison / poids_saison.sum()

        cas_sem = np.round(cas_region_annee * poids_saison).astype(int)
        diff = int(round(cas_region_annee) - cas_sem.sum())
        if diff != 0 and len(cas_sem) > 0:
            idx_ordre = np.argsort(-poids_saison)
            pas = 1 if diff > 0 else -1
            for k in range(abs(diff)):
                idx = idx_ordre[k % len(idx_ordre)]
                cas_sem[idx] += pas
                cas_sem[idx] = max(0, cas_sem[idx])

        for i, s in enumerate(semaines_annee):
            cas_par_semaine_region[s] = cas_par_semaine_region.get(s, 0) + int(cas_sem[i])

    cas_par_region[region] = cas_par_semaine_region
    total_cas_par_region[region] = sum(cas_par_semaine_region.values())

# ============================================================================
# 2 - Repartition des 120 deces sur au moins 20 regions
# ============================================================================
BONUS_DECES_VAKINANKARATRA = 6

regions_avec_cas = [r for r in regions_list if total_cas_par_region[r] > 0]
regions_triees = sorted(regions_avec_cas, key=lambda r: total_cas_par_region[r], reverse=True)

nb_regions_cible = min(NB_REGIONS_MIN_AVEC_DECES, len(regions_avec_cas))
regions_retenues = regions_triees[:nb_regions_cible]

poids_deces = {r: total_cas_par_region[r] for r in regions_retenues}
somme_poids_deces = sum(poids_deces.values())

deces_restant_a_repartir = DECES_TOTAL - BONUS_DECES_VAKINANKARATRA
deces_region = {r: 0 for r in regions_list}
deces_region["Vakinankaratra"] = BONUS_DECES_VAKINANKARATRA

deces_flottants = {}
for r in regions_retenues:
    if r == "Vakinankaratra":
        continue
    part = poids_deces[r] / somme_poids_deces
    deces_flottants[r] = deces_restant_a_repartir * part

for r, valeur in deces_flottants.items():
    deces_region[r] += int(valeur)

deja_attribues = sum(deces_region.values())
reste = DECES_TOTAL - deja_attribues
if reste > 0:
    restes_tries = sorted(deces_flottants.items(), key=lambda x: x[1] - int(x[1]), reverse=True)
    for i in range(reste):
        r = restes_tries[i % len(restes_tries)][0]
        deces_region[r] += 1

for r in regions_retenues:
    if deces_region[r] == 0:
        donneur = max(deces_region, key=lambda x: deces_region[x])
        if deces_region[donneur] > 1:
            deces_region[donneur] -= 1
            deces_region[r] += 1

print(f"\nREPARTITION DES {DECES_TOTAL} DECES SUR {sum(1 for v in deces_region.values() if v > 0)} REGIONS :")
for region, d in sorted(deces_region.items(), key=lambda x: x[1], reverse=True):
    if d > 0:
        print(f"   {region:<20} {d} deces")

# ============================================================================
#3 - Repartition des deces regionaux sur les semaines
# ============================================================================
deces_par_region_semaine = {}
for region in regions_list:
    deces_par_region_semaine[region] = {}
    total_deces_region = deces_region[region]
    total_cas_region = total_cas_par_region.get(region, 0)
    if total_deces_region == 0 or total_cas_region == 0:
        continue

    cas_semaine_region = cas_par_region[region]
    deces_flottants_sem = {}
    for s, cas_s in cas_semaine_region.items():
        if cas_s > 0:
            deces_flottants_sem[s] = total_deces_region * (cas_s / total_cas_region)

    for s, v in deces_flottants_sem.items():
        deces_par_region_semaine[region][s] = int(v)

    deja = sum(deces_par_region_semaine[region].values())
    reste = total_deces_region - deja
    if reste > 0 and deces_flottants_sem:
        restes_tries = sorted(deces_flottants_sem.items(), key=lambda x: x[1] - int(x[1]), reverse=True)
        for i in range(reste):
            s = restes_tries[i % len(restes_tries)][0]
            deces_par_region_semaine[region][s] = deces_par_region_semaine[region].get(s, 0) + 1

    for s in deces_par_region_semaine[region]:
        cas_s = cas_semaine_region.get(s, 1)
        if deces_par_region_semaine[region][s] > cas_s:
            deces_par_region_semaine[region][s] = cas_s

# ============================================================================
# 4 - Construction finale, avec gueris
# ============================================================================
donnees = []

for region in regions_list:
    pop = REGIONS[region]["pop"]
    lat = REGIONS[region]["lat"]
    lon = REGIONS[region]["lon"]
    pop_cible = int(pop * 0.04)
    cas_par_semaine_region = cas_par_region[region]
    deces_par_semaine_region = deces_par_region_semaine.get(region, {})

    gueris_par_semaine_region = {s: 0 for s in toutes_semaines}
    for i, s in enumerate(liste_semaines):
        cas_s = cas_par_semaine_region.get(s, 0)
        deces_s = deces_par_semaine_region.get(s, 0)
        gueris_potentiels = max(0, cas_s - deces_s)
        idx_gueris = i + DELAI_GUERIS_SEMAINES
        if idx_gueris < len(liste_semaines):
            gueris_par_semaine_region[liste_semaines[idx_gueris]] += gueris_potentiels

    gueris_cumul = 0
    for s in toutes_semaines:
        annee = s.year
        mois = s.month
        cas_signales = cas_par_semaine_region.get(s, 0)
        couverture_vaccinale = COUVERTURE_VACCINALE_PAR_ANNEE.get(annee, 0.5)
        gueris_nouv = gueris_par_semaine_region.get(s, 0)
        gueris_cumul += gueris_nouv
        deces = deces_par_semaine_region.get(s, 0)

        if cas_signales == 0:
            donnees.append({
                "date": s.strftime("%Y-%m-%d"),
                "annee": annee,
                "mois": mois,
                "semaine_epidemio": calculer_semaine_epidemio(s),
                "region": region,
                "latitude_region": lat,
                "longitude_region": lon,
                "population_region": pop,
                "population_cible_vaccination": pop_cible,
                "cas_signalés": 0,
                "cas_suspects": 0,
                "cas_confirmes_lnr": 0,
                "deces": 0,
                "new_recoveries": gueris_nouv,
                "total_recoveries": gueris_cumul,
                "cas_0_4_ans": 0,
                "cas_5_9_ans": 0,
                "cas_10_14_ans": 0,
                "cas_15_19_ans": 0,
                "cas_20_plus_ans": 0,
                "cas_masculins": 0,
                "cas_feminins": 0,
                "cas_non_vaccines": 0,
                "cas_statut_inconnu": 0,
                "cas_1_dose": 0,
                "cas_2_doses": 0,
                "enfants_vaccines_1_dose": int(pop_cible * couverture_vaccinale * 0.85),
                "enfants_vaccines_2_doses": int(pop_cible * couverture_vaccinale * 0.45),
                "couverture_vaccinale_pct": round(couverture_vaccinale * 100, 2),
                "taux_incidence": 0.0,
                "taux_letalite": 0.0,
                "periode_epidemique": "2025" if annee in (2025, 2026) else "2020-2024"
            })
            continue

        cas_confirmes_lnr = int(cas_signales * TAUX_CONFIRMATION_LNR)
        cas_suspects = cas_signales - cas_confirmes_lnr

        cas_0_4 = int(cas_signales * PROBABILITES_AGE["0-4_ans"])
        cas_5_9 = int(cas_signales * PROBABILITES_AGE["5-9_ans"])
        cas_10_14 = int(cas_signales * PROBABILITES_AGE["10-14_ans"])
        cas_15_19 = int(cas_signales * PROBABILITES_AGE["15-19_ans"])
        cas_20_plus = max(0, cas_signales - cas_0_4 - cas_5_9 - cas_10_14 - cas_15_19)

        cas_masculins = int(cas_signales * PROBABILITES_SEXE["M"])
        cas_feminins = cas_signales - cas_masculins

        cas_non_vaccines = int(cas_signales * STATUT_VACCINAL["non_vaccine"])
        cas_statut_inconnu = int(cas_signales * STATUT_VACCINAL["statut_inconnu"])
        cas_1_dose = int(cas_signales * STATUT_VACCINAL["1_dose"])
        cas_2_doses = max(0, cas_signales - cas_non_vaccines - cas_statut_inconnu - cas_1_dose)

        enfants_vaccines_1_dose = int(pop_cible * couverture_vaccinale * 0.85)
        enfants_vaccines_2_doses = int(pop_cible * couverture_vaccinale * 0.45)

        taux_incidence = round((cas_signales / pop) * 100000, 4)
        taux_letalite = round((deces / cas_signales) * 100, 2) if cas_signales > 0 else 0

        donnees.append({
            "date": s.strftime("%Y-%m-%d"),
            "annee": annee,
            "mois": mois,
            "semaine_epidemio": calculer_semaine_epidemio(s),
            "region": region,
            "latitude_region": lat,
            "longitude_region": lon,
            "population_region": pop,
            "population_cible_vaccination": pop_cible,
            "cas_signalés": cas_signales,
            "cas_suspects": cas_suspects,
            "cas_confirmes_lnr": cas_confirmes_lnr,
            "deces": deces,
            "new_recoveries": gueris_nouv,
            "total_recoveries": gueris_cumul,
            "cas_0_4_ans": cas_0_4,
            "cas_5_9_ans": cas_5_9,
            "cas_10_14_ans": cas_10_14,
            "cas_15_19_ans": cas_15_19,
            "cas_20_plus_ans": cas_20_plus,
            "cas_masculins": cas_masculins,
            "cas_feminins": cas_feminins,
            "cas_non_vaccines": cas_non_vaccines,
            "cas_statut_inconnu": cas_statut_inconnu,
            "cas_1_dose": cas_1_dose,
            "cas_2_doses": cas_2_doses,
            "enfants_vaccines_1_dose": enfants_vaccines_1_dose,
            "enfants_vaccines_2_doses": enfants_vaccines_2_doses,
            "couverture_vaccinale_pct": round(couverture_vaccinale * 100, 2),
            "taux_incidence": taux_incidence,
            "taux_letalite": taux_letalite,
            "periode_epidemique": "2025" if annee in (2025, 2026) else "2020-2024"
        })

df = pd.DataFrame(donnees)

# ============================================================================
# VALIDATION FINALE
# ============================================================================
print(f"\n{'=' * 70}")
print("VALIDATION FINALE")
print(f"{'=' * 70}")

cas_verif = df['cas_signalés'].sum()
deces_verif = df['deces'].sum()
gueris_verif = df['new_recoveries'].sum()
nb_regions_avec_deces = (df.groupby('region')['deces'].sum() > 0).sum()

print(f"\nTOTAUX VERIFIES :")
print(f"   Cas signales : {cas_verif:,} (cible: {sum(CAS_PAR_ANNEE.values()):,})")
print(f"   Deces : {deces_verif:,} (cible: {DECES_TOTAL:,})")
print(f"   Guerisons calculees : {gueris_verif:,}")
print(f"   Regions avec au moins 1 deces : {nb_regions_avec_deces} / 24")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
chemin_sortie = os.path.join(PROJECT_ROOT, "ETL", "rougeole", "data", "raw", "rougeole_madagascar_raw.csv")
os.makedirs(os.path.dirname(chemin_sortie), exist_ok=True)
df.to_csv(chemin_sortie, index=False, encoding="utf-8")

print(f"\nFICHIER GENERE : {chemin_sortie}")
print(f"   Nombre de lignes : {len(df):,}")
print(f"\nNOTE METHODOLOGIQUE : les cas suivent les vraies contraintes OMS")
print("(2022: 27 cas IgM+, 2025: 10 294 cas confirmes/lies, 2026: 7 044 cas")
print("partiels). Les 120 deces sont une estimation, repartis sur au moins")
print("20 regions proportionnellement a leur charge de cas, avec un evenement")
print("confirme de 6 deces a Vakinankaratra (district Antsirabe II, 4-5 aout")
print("2026, source Anadolu Ajansi).")
print(f"{'=' * 70}\n")