import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

np.random.seed(42)

print("=" * 70)
print("GENERATION DES DONNEES PALUDISME PAR REGION - MADAGASCAR")
print("=" * 70)

# ============================================================================
# CONTRAINTES OFFICIELLES (PMI Madagascar Malaria Profile + OMS World Malaria Report)
# ============================================================================
CAS_PAR_ANNEE = {
    2020: 1950471,
    2021: 2343709,
    2022: 1670773,
    2023: 2843012,
    2024: 3900000,
    2025: 2838000,
    2026: 2260000
}

DECES_PAR_ANNEE = {
    2020: 674,
    2021: 544,
    2022: 282,
    2023: 393,
    2024: 564,
    2025: 420,
    2026: 330
}

PROPORTION_ENFANTS = 0.32
PROPORTION_ENFANTS_DECES = 0.35
PROPORTION_FEMMES_ENCEINTES = 0.05
TAUX_TRAITEMENT_CTA = 0.90
DELAI_GUERIS_SEMAINES = 1

TOTAL_CAS = sum(CAS_PAR_ANNEE.values())
TOTAL_DECES = sum(DECES_PAR_ANNEE.values())

print(f"\nCONTRAINTES OFFICIELLES (PMI / OMS) :")
print(f"   Cas confirmes totaux : {TOTAL_CAS:,}")
print(f"   Deces totaux : {TOTAL_DECES:,}")
for annee in sorted(CAS_PAR_ANNEE):
    print(f"   {annee} : {CAS_PAR_ANNEE[annee]:,} cas | {DECES_PAR_ANNEE[annee]:,} deces")

# ============================================================================
# DONNEES REGIONALES - INSTAT Madagascar
# ============================================================================
regions_data = {
    'Analamanga':        {'population': 4290727, 'acces_soins': 85, 'lat': -18.9137, 'lng': 47.5247},
    'Vakinankaratra':    {'population': 2462316, 'acces_soins': 65, 'lat': -19.8667, 'lng': 47.0333},
    'Itasy':             {'population': 1063882, 'acces_soins': 55, 'lat': -19.0167, 'lng': 46.7667},
    'Bongolava':         {'population': 794456,  'acces_soins': 40, 'lat': -18.9333, 'lng': 45.6667},
    'Haute Matsiatra':   {'population': 1710391, 'acces_soins': 50, 'lat': -21.4536, 'lng': 47.0854},
    'Fitovinany':        {'population': 1011279, 'acces_soins': 35, 'lat': -21.4500, 'lng': 47.6167},
    "Amoron'i Mania":    {'population': 991145,  'acces_soins': 45, 'lat': -20.0000, 'lng': 47.1167},
    'Vatovavy':          {'population': 576905,  'acces_soins': 35, 'lat': -21.3167, 'lng': 47.9333},
    'Atsimo-Atsinanana': {'population': 1220000, 'acces_soins': 40, 'lat': -22.9000, 'lng': 47.6500},
    'Ihorombe':          {'population': 494097,  'acces_soins': 40, 'lat': -22.5500, 'lng': 46.9500},
    'Atsinanana':        {'population': 1750511, 'acces_soins': 55, 'lat': -18.1492, 'lng': 49.4023},
    'Ambatosoa':         {'population': 652462,  'acces_soins': 40, 'lat': -21.0333, 'lng': 47.6333},
    'Alaotra-Mangoro':   {'population': 1479918, 'acces_soins': 50, 'lat': -17.8333, 'lng': 48.4167},
    'Analanjirofo':      {'population': 864183,  'acces_soins': 45, 'lat': -17.3333, 'lng': 49.4000},
    'Sofia':             {'population': 1784988, 'acces_soins': 40, 'lat': -14.8833, 'lng': 48.0333},
    'Boeny':             {'population': 1100305, 'acces_soins': 60, 'lat': -15.7167, 'lng': 46.3167},
    'Betsiboka':         {'population': 465641,  'acces_soins': 35, 'lat': -16.9500, 'lng': 46.8167},
    'Melaky':            {'population': 365790,  'acces_soins': 30, 'lat': -16.1167, 'lng': 44.7667},
    'SAVA':              {'population': 1330546, 'acces_soins': 45, 'lat': -14.2833, 'lng': 50.1667},
    'Diana':             {'population': 1053715, 'acces_soins': 50, 'lat': -12.2787, 'lng': 49.2917},
    'Atsimo-Andrefana':  {'population': 2128706, 'acces_soins': 40, 'lat': -23.3500, 'lng': 43.6667},
    'Androy':            {'population': 1065878, 'acces_soins': 30, 'lat': -25.1667, 'lng': 46.0833},
    'Anosy':             {'population': 957916,  'acces_soins': 35, 'lat': -25.0333, 'lng': 46.9833},
    'Menabe':            {'population': 819876,  'acces_soins': 35, 'lat': -20.2833, 'lng': 44.7833},
}

# ============================================================================
# NIVEAU DE VULNERABILITE PAR REGION
# ============================================================================
VULNERABILITE = {
    'Atsimo-Andrefana':  'tres_elevee',
    'Menabe':            'tres_elevee',
    'Boeny':             'tres_elevee',
    'Melaky':            'tres_elevee',

    'Atsinanana':        'elevee',
    'Fitovinany':        'elevee',
    'Vatovavy':          'elevee',
    'SAVA':              'elevee',
    'Analanjirofo':      'elevee',
    'Diana':             'elevee',
    'Atsimo-Atsinanana': 'elevee',

    'Betsiboka':         'moyenne',
    'Sofia':             'moyenne',
    'Alaotra-Mangoro':   'moyenne',
    'Ihorombe':          'moyenne',
    'Bongolava':         'moyenne',
    'Ambatosoa':         'moyenne',
    'Anosy':             'moyenne',

    'Analamanga':        'faible',
    'Vakinankaratra':    'faible',
    "Amoron'i Mania":    'faible',
    'Haute Matsiatra':   'faible',
    'Itasy':             'faible',
    'Androy':            'faible',
}

FACTEUR_VULNERABILITE = {
    'tres_elevee': 3.0,
    'elevee': 1.8,
    'moyenne': 1.0,
    'faible': 0.35
}

TYPE_ZONE = {
    'tres_elevee': 'cotier',
    'elevee': 'cotier',
    'moyenne': 'transition',
    'faible': 'hauts_plateaux'
}

# ============================================================================
# CALCUL DES POIDS REGIONAUX
# ============================================================================
regions_list = list(regions_data.keys())
poids_calcules = {}
somme_ponderee = 0

for region in regions_list:
    pop = regions_data[region]['population']
    facteur = FACTEUR_VULNERABILITE[VULNERABILITE[region]]
    poids = pop * facteur
    poids_calcules[region] = poids
    somme_ponderee += poids

proportion_region = {r: poids_calcules[r] / somme_ponderee for r in regions_list}

print(f"\nREPARTITION PAR NIVEAU DE VULNERABILITE (part du total national) :")
for region, p in sorted(proportion_region.items(), key=lambda x: x[1], reverse=True):
    print(f"   {region:<20} [{VULNERABILITE[region]:<12}] {p*100:>6.2f}%")

# ============================================================================
# SAISONNALITE - Transmission maximale Novembre a Avril, pic mi-février
# ============================================================================
def repartition_saisonniere_madagascar(dates_annee):
    """
    Répartition saisonnière réaliste pour le paludisme à Madagascar.
    
    Saison des pluies (transmission élevée) : novembre à avril
    Saison sèche (transmission faible mais non nulle) : mai à octobre
    
    Pic principal : février-mars
    Pic secondaire : novembre-décembre
    """
    jours = np.array([d.timetuple().tm_yday for d in dates_annee])
    annee = dates_annee[0].year
    
    # Pic principal (février-mars)
    pic_principal = 60
    largeur_pic = 45
    
    # Pic secondaire (novembre-décembre)
    pic_secondaire = 340
    largeur_secondaire = 30
    
    # Saison sèche (mai-octobre)
    transmission_seche = 0.20
    
    # Calcul des poids
    poids = np.zeros(len(jours))
    
    for i, jour in enumerate(jours):
        poids_pic = np.exp(-0.5 * ((jour - pic_principal) / largeur_pic) ** 2)
    
        jour_adjuste = jour if jour < 180 else jour - 365
        poids_sec = np.exp(-0.5 * ((jour_adjuste - (pic_secondaire - 365)) / largeur_secondaire) ** 2)
    
        poids[i] = max(poids_pic, poids_sec * 0.6) + transmission_seche * 0.3
    
    return poids / poids.sum()

TRANCHES_AGE = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"]
PROBA_TRANCHES = [0.18, 0.20, 0.17, 0.13, 0.10, 0.08, 0.06, 0.05, 0.03]

# ============================================================================
# HEBDOMADAIRE
# ============================================================================
date_debut = datetime(2020, 1, 6)
date_fin = datetime(2026, 7, 31)
toutes_semaines = pd.date_range(date_debut, date_fin, freq='W-MON')
liste_semaines = list(toutes_semaines)

lignes = []

for region in regions_list:
    part_region = proportion_region[region]
    pop_region = regions_data[region]['population']
    pop_moins5 = round(pop_region * 0.15)
    pop_femmes_enceintes = round(pop_region * 0.03)
    niveau = VULNERABILITE[region]
    type_zone = TYPE_ZONE[niveau]
    acces_soins = regions_data[region]['acces_soins']
    lat = regions_data[region]['lat']
    lng = regions_data[region]['lng']

    cas_cumul = 0
    deces_cumul = 0
    gueris_cumul = 0

    cas_par_semaine = {}
    deces_par_semaine = {}

    for annee in CAS_PAR_ANNEE:
        semaines_annee = [s for s in toutes_semaines if s.year == annee]
        if not semaines_annee:
            continue

        cas_annee_region = CAS_PAR_ANNEE[annee] * part_region
        deces_annee_region = DECES_PAR_ANNEE[annee] * part_region

        poids_semaines = repartition_saisonniere_madagascar(semaines_annee)
        bruit = np.random.uniform(0.85, 1.15, size=len(semaines_annee))
        poids_semaines = poids_semaines * bruit
        poids_semaines = poids_semaines / poids_semaines.sum()

        cas_sem = np.round(cas_annee_region * poids_semaines).astype(int)
        diff = round(cas_annee_region) - cas_sem.sum()
        if len(cas_sem) > 0:
            cas_sem[-1] += diff

        deces_sem = np.round(deces_annee_region * poids_semaines).astype(int)
        diff_d = round(deces_annee_region) - deces_sem.sum()
        if len(deces_sem) > 0:
            deces_sem[-1] += diff_d

        for i, s in enumerate(semaines_annee):
            cas_par_semaine[s] = max(0, int(cas_sem[i]))
            deces_par_semaine[s] = min(max(0, int(deces_sem[i])), cas_par_semaine[s])

    gueris_par_semaine = {s: 0 for s in toutes_semaines}
    for i, s in enumerate(liste_semaines):
        cas_s = cas_par_semaine.get(s, 0)
        deces_s = deces_par_semaine.get(s, 0)
        gueris_potentiels = max(0, cas_s - deces_s)
        idx_gueris = i + DELAI_GUERIS_SEMAINES
        if idx_gueris < len(liste_semaines):
            gueris_par_semaine[liste_semaines[idx_gueris]] += gueris_potentiels

    for s in toutes_semaines:
        annee = s.year
        mois = s.month
        semaine_iso = s.isocalendar()
        semaine_epi = f"{semaine_iso[0]}-W{semaine_iso[1]:02d}"
        saison = "pluies" if mois in [11, 12, 1, 2, 3, 4] else "seche"

        cas_confirmes = cas_par_semaine.get(s, 0)
        deces = deces_par_semaine.get(s, 0)
        gueris_nouv = gueris_par_semaine.get(s, 0)

        cas_cumul += cas_confirmes
        deces_cumul += deces
        gueris_cumul += gueris_nouv

        cas_graves = max(0, cas_cumul - deces_cumul - gueris_cumul)

        taux_positivite = round(np.random.uniform(38, 55), 1)
        cas_suspects = round(cas_confirmes / (taux_positivite / 100)) if cas_confirmes > 0 else 0
        tests_rapides_realises = cas_suspects

        cas_enfants = round(cas_confirmes * PROPORTION_ENFANTS)
        cas_femmes_enceintes = round(cas_confirmes * PROPORTION_FEMMES_ENCEINTES)
        deces_enfants = min(round(deces * PROPORTION_ENFANTS_DECES), deces)
        traitements_cta = round(cas_confirmes * TAUX_TRAITEMENT_CTA)

        if saison == "pluies":
            temperature = round(np.random.uniform(25, 30), 1)
            humidite = round(np.random.uniform(70, 85), 1)
            precipitation = round(np.random.uniform(80, 250), 1)
        else:
            temperature = round(np.random.uniform(18, 24), 1)
            humidite = round(np.random.uniform(45, 60), 1)
            precipitation = round(np.random.uniform(0, 40), 1)

        tranche_age = np.random.choice(TRANCHES_AGE, p=PROBA_TRANCHES)

        taux_incidence = (cas_confirmes / pop_region) * 1000 if pop_region > 0 else 0
        taux_letalite = (deces_cumul / cas_cumul * 100) if cas_cumul > 0 else 0
        incidence_enfants = (cas_enfants / pop_moins5) * 1000 if pop_moins5 > 0 else 0
        proportion_grave = (cas_graves / cas_confirmes * 100) if cas_confirmes > 0 else 0

        if taux_incidence >= 60:
            niveau_alerte = "Rouge"
        elif taux_incidence >= 30:
            niveau_alerte = "Orange"
        elif taux_incidence >= 10:
            niveau_alerte = "Jaune"
        else:
            niveau_alerte = "Vert"

        if incidence_enfants > 50:
            ordre = ["Vert", "Jaune", "Orange", "Rouge"]
            idx = min(ordre.index(niveau_alerte) + 1, len(ordre) - 1)
            niveau_alerte = ordre[idx]

        lignes.append({
            'date': s.strftime('%Y-%m-%d'),
            'annee': annee,
            'mois': mois,
            'semaine_epidemio': semaine_epi,
            'region': region,
            'latitude_region': lat,
            'longitude_region': lng,
            'type_zone': type_zone,
            'population_region': pop_region,
            'population_moins_5_ans': pop_moins5,
            'population_femmes_enceintes': pop_femmes_enceintes,
            'cas_suspects': cas_suspects,
            'cas_confirmes': cas_confirmes,
            'cas_graves': cas_graves,
            'cas_enfants_moins_5_ans': cas_enfants,
            'cas_femmes_enceintes': cas_femmes_enceintes,
            'deces': deces,
            'deces_enfants_moins_5_ans': deces_enfants,
            'new_recoveries': gueris_nouv,
            'total_recoveries': gueris_cumul,
            'type_plasmodium': 'P. falciparum',
            'tests_rapides_realises': tests_rapides_realises,
            'traitements_CTA_administres': traitements_cta,
            'temperature': temperature,
            'humidite': humidite,
            'precipitation': precipitation,
            'saison': saison,
            'acces_soins': acces_soins,
            'tranche_age': tranche_age,
            'taux_incidence': round(taux_incidence, 4),
            'taux_letalite': round(taux_letalite, 2),
            'taux_positivite': taux_positivite,
            'incidence_enfants_5_ans': round(incidence_enfants, 4),
            'proportion_grave': round(proportion_grave, 2),
            'niveau_alerte': niveau_alerte
        })

df = pd.DataFrame(lignes)

# ============================================================================
# VALIDATION FINALE
# ============================================================================
print(f"\n{'=' * 70}")
print("VALIDATION FINALE")
print(f"{'=' * 70}")

cas_verif = df['cas_confirmes'].sum()
deces_verif = df['deces'].sum()
gueris_verif = df['new_recoveries'].sum()

print(f"\nTOTAUX VERIFIES :")
print(f"   Cas confirmes : {cas_verif:,} (cible: {TOTAL_CAS:,})")
print(f"   Deces : {deces_verif:,} (cible: {TOTAL_DECES:,})")
print(f"   Guerisons calculees : {gueris_verif:,}")

for annee in CAS_PAR_ANNEE:
    cas_annee = df[df['annee'] == annee]['cas_confirmes'].sum()
    print(f"   Annee {annee} : {cas_annee:,} cas (cible: {CAS_PAR_ANNEE[annee]:,})")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
chemin_sortie = os.path.join(PROJECT_ROOT, "ETL", "paludisme", "data", "processed", "paludisme_madagascar_enrichi.csv")
os.makedirs(os.path.dirname(chemin_sortie), exist_ok=True)
df.to_csv(chemin_sortie, index=False)

print(f"\nFICHIER GENERE : {chemin_sortie}")
print(f"   Nombre de lignes : {len(df):,}")
print(f"   Periode : {date_debut.strftime('%Y-%m-%d')} a {date_fin.strftime('%Y-%m-%d')}")
print(f"   Regions : {len(regions_data)}")
print(f"\nNOTE METHODOLOGIQUE : les totaux annuels nationaux 2020-2024 proviennent")
print("du PMI Madagascar Malaria Profile et du World Malaria Report OMS.")
print("Les valeurs 2025-2026 sont des estimations basees sur des donnees partielles.")
print("La repartition regionale suit un modele de vulnerabilite epidemiologique")
print("(population x facteur de risque climatique), non des donnees officielles")
print("par region qui ne sont pas publiquement disponibles a ce niveau de detail.")
print("La relation cas = deces + gueris + cas_graves(actifs) est respectee")
print("a chaque semaine, avec un delai de guerison d'une semaine apres diagnostic.")
print(f"{'=' * 70}\n")