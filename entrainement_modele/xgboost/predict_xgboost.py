from pathlib import Path
import sys
ML_ROOT = Path(__file__).resolve().parent.parent

if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))
    
import unicodedata
import joblib
import numpy as np
import pandas as pd

from database import get_epidemic_data
from preprocessing import prepare_for_xgboost, XGBOOST_FEATURES

# ============================================================
# CONFIGURATION
# ============================================================
DISEASE_INPUT = sys.argv[1] if len(sys.argv) > 1 else "Paludisme"

DISEASE_MAPPING = {
    "paludisme": "Paludisme",
    "palu": "Paludisme",
    "tuberculose": "Tuberculose",
    "tbc": "Tuberculose",
    "rougeole": "Rougeole",
    "hepatite": "Hépatite virale",
    "hep": "Hépatite virale",
    "hepatite_virale": "Hépatite virale",
    "covid": "COVID-19",
    "covid19": "COVID-19",
    "covid-19": "COVID-19",
    "peste": "Peste",
}

def normalize_disease_name(name):
    """Normalise un nom de maladie (minuscule, sans accents, sans espace)."""
    name_lower = name.lower()
    name_normalized = unicodedata.normalize('NFKD', name_lower).encode('ASCII', 'ignore').decode('ASCII')
    return name_normalized.replace(" ", "_").replace("-", "_")

DISEASE = None
input_normalized = normalize_disease_name(DISEASE_INPUT)

for alias, full_name in DISEASE_MAPPING.items():
    if normalize_disease_name(alias) == input_normalized:
        DISEASE = full_name
        break

if DISEASE is None:
    DISEASE = DISEASE_INPUT

print(f"Entrée: '{DISEASE_INPUT}' -> Maladie ciblée: '{DISEASE}'")

HORIZON = 4
MIN_CASES_THRESHOLD = 1000

MODEL_DIR = Path(__file__).resolve().parent.parent /"xgboost" / "models"
RESULTS_DIR = Path(__file__).resolve().parent.parent / "xgboost" / "results"

MODEL_PATH = MODEL_DIR / f"xgboost_{normalize_disease_name(DISEASE)}.joblib"
METADATA_PATH = MODEL_DIR / f"xgboost_{normalize_disease_name(DISEASE)}_metadata.json"
OUTPUT_PATH = RESULTS_DIR / f"predictions_futures_{normalize_disease_name(DISEASE)}_4_semaines.csv" 

# ============================================================
# 1. CHARGEMENT
# ============================================================
print("=" * 70)
print(f"PREDICTION XGBOOST - {DISEASE} (Horizon : {HORIZON} semaines)")
print("=" * 70)

df = get_epidemic_data()
df_disease = df[df["maladie"] == DISEASE].copy()
df_ml = prepare_for_xgboost(df_disease, create_lags=True, remove_first_lag_rows=True)

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Modèle introuvable : {MODEL_PATH}")

model = joblib.load(MODEL_PATH)
print(" Modèle chargé.")

# ============================================================
# 2. RECHERCHE DE LA DERNIÈRE SEMAINE "VALIDE"
# ============================================================
print("\n Recherche de la dernière semaine avec activité épidémique significative...")

weekly_totals = df_ml.groupby(["annee", "semaine"])["cas_nouveaux"].sum()

valid_weeks = weekly_totals[weekly_totals >= MIN_CASES_THRESHOLD]

if valid_weeks.empty:
    print(f" Aucune semaine avec >= {MIN_CASES_THRESHOLD} cas. Utilisation de la dernière semaine disponible.")
    last_valid_week = weekly_totals.index[-1]
else:
    last_valid_week = valid_weeks.index[-1]
    print(f" Dernière semaine valide : Année {last_valid_week[0]}, Semaine {last_valid_week[1]}")
    print(f" Total cas cette semaine : {valid_weeks.iloc[-1]:,}")

df_ml_valid = df_ml[
    (df_ml["annee"] < last_valid_week[0]) | 
    ((df_ml["annee"] == last_valid_week[0]) & (df_ml["semaine"] <= last_valid_week[1]))
].copy()

current_state = df_ml_valid.groupby("region_id").last().reset_index()
print(f" Etat initial récupéré pour {len(current_state)} régions.")

# ============================================================
# 3. BOUCLE DE PREDICTION RECURSIVE
# ============================================================
all_predictions = []

print(f"\n Calcul des prédictions pour les {HORIZON} prochaines semaines...")

# Construction des features pour T+step et decalage des lags
for step in range(1, HORIZON + 1):
    df_future = current_state.copy()
    df_future["cas_lag_1"] = current_state["cas_nouveaux"]
    df_future["cas_lag_2"] = current_state["cas_lag_1"]
    df_future["cas_lag_4"] = current_state["cas_lag_3"] if "cas_lag_3" in current_state.columns else current_state["cas_lag_2"]
    df_future["cas_lag_8"] = current_state["cas_lag_7"] if "cas_lag_7" in current_state.columns else current_state["cas_lag_4"]
    
    # Moyennes
    for col in ["moyenne_4sem", "moyenne_8sem", "var_moyenne_4sem", "var_moyenne_8sem"]:
        if col in current_state.columns:
            df_future[col] = current_state[col]
            
    # Mise à jour du temps
    df_future["semaine"] = (current_state["semaine"].astype(int) % 52) + 1
    df_future["mois"] = ((df_future["semaine"] - 1) // 4) + 1
    df_future["trimestre"] = ((df_future["mois"] - 1) // 3) + 1
    df_future["annee"] = current_state["annee"].astype(int) + (current_state["semaine"].astype(int) // 52)
    
    # Features cycliques et indicateurs
    df_future["mois_sin"] = np.sin(2 * np.pi * df_future["mois"] / 12)
    df_future["mois_cos"] = np.cos(2 * np.pi * df_future["mois"] / 12)
    df_future["semaine_sin"] = np.sin(2 * np.pi * df_future["semaine"] / 52)
    df_future["semaine_cos"] = np.cos(2 * np.pi * df_future["semaine"] / 52)
    df_future["tendance"] = df_future["annee"] * 52 + df_future["semaine"]
    df_future["est_pic"] = (df_future["cas_lag_1"] > (df_future["moyenne_8sem"] * 1.5)).astype(int)

    # Inférence
    features_to_use = [f for f in XGBOOST_FEATURES if f in df_future.columns]
    X_future = df_future[features_to_use].fillna(0)
    
    y_pred_log = model.predict(X_future)
    y_pred = np.maximum(np.expm1(y_pred_log), 0).astype(int)
    
    # Mise à jour de l'état pour la prochaine itération
    current_state["cas_nouveaux"] = y_pred
    current_state["cas_lag_1"] = y_pred
    current_state["semaine"] = df_future["semaine"]
    current_state["annee"] = df_future["annee"]
    current_state["mois"] = df_future["mois"]
    
   
    step_results = current_state[["region_id", "annee", "semaine"]].copy()
    step_results["horizon_semaine"] = f"T+{step}"
    step_results["cas_predits"] = y_pred
    step_results["maladie"] = DISEASE
    
    all_predictions.append(step_results)
    print(f"Semaine T+{step} prédite.")

# ============================================================
# 4. SAUVEGARDE
# ============================================================
df_final = pd.concat(all_predictions, ignore_index=True)
cols_order = ["maladie", "region_id", "annee", "semaine", "horizon_semaine", "cas_predits"]
df_final = df_final[cols_order]
df_final.to_csv(OUTPUT_PATH, index=False, sep=";")

print(f"\n PREDICTIONS FUTURE FAITES")
print(f"   Fichier : {OUTPUT_PATH}")
print(f"\n Aperçu des prédictions (Régions 1 à 5) :")
print(df_final[df_final["region_id"] <= 5].to_string(index=False))
print("=" * 70)