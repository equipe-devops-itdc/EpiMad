import json
import sys
import unicodedata
from pathlib import Path
ML_ROOT = Path(__file__).resolve().parent.parent

if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))
    
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt # type: ignore
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from database import get_epidemic_data
from preprocessing import prepare_for_xgboost, split_features_target

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
TEST_SIZE = 0.20

MODEL_DIR = Path(__file__).resolve().parent.parent / "xgboost" / "models"
RESULTS_DIR = Path(__file__).resolve().parent.parent / "xgboost" / "results"
MODEL_PATH = MODEL_DIR / f"xgboost_{normalize_disease_name(DISEASE)}.joblib"
PLOT_PATH = RESULTS_DIR / f"xgboost_evaluation_plot_{normalize_disease_name(DISEASE)}.png"

# ============================================================
# 1. CHARGEMENT ET PREPARATION
# ============================================================
print("=" * 70)
print(f"EVALUATION DU MODÈLE XGBOOST - {DISEASE}")
print("=" * 70)

df = get_epidemic_data()
df_disease = df[df["maladie"] == DISEASE].copy()

df_ml = prepare_for_xgboost(df_disease, create_lags=True, remove_first_lag_rows=True)
X, y = split_features_target(df_ml, target="cas_nouveaux")

split_index = int(len(X) * (1 - TEST_SIZE))
X_test, y_test = X.iloc[split_index:], y.iloc[split_index:]

print(f" Données chargées. Set de test : {len(X_test)} observations.")

# ============================================================
# 2. CHARGEMENT DU MODÈLE
# ============================================================
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Modèle introuvable : {MODEL_PATH}")

model = joblib.load(MODEL_PATH)
print(f"✓ Modèle chargé : {MODEL_PATH.name}")

# ============================================================
# 3. PREDICTION ET METRIQUES
# ============================================================
y_pred_log = model.predict(X_test)
y_pred = np.maximum(np.expm1(y_pred_log), 0)
y_test_real = y_test.copy()

mae = mean_absolute_error(y_test_real, y_pred)
rmse = np.sqrt(mean_squared_error(y_test_real, y_pred))
r2 = r2_score(y_test_real, y_pred)

non_zero = y_test_real > 0
mape = np.mean(np.abs((y_test_real[non_zero] - y_pred[non_zero]) / y_test_real[non_zero])) * 100 if non_zero.any() else 0.0

print("\n RESULTATS DE L'EVALUATION")
print("-" * 40)
print(f"MAE  : {mae:.2f} cas")
print(f"RMSE : {rmse:.2f} cas")
print(f"R²   : {r2:.4f}")
print(f"MAPE : {mape:.2f}%")

# ============================================================
# 4. VISUALISATION
# ============================================================
plt.figure(figsize=(14, 6))
n_plot = min(100, len(y_test))
plt.plot(range(n_plot), y_test_real.iloc[-n_plot:].values, label="Cas Réels", color="#2E86C1", linewidth=2)
plt.plot(range(n_plot), y_pred[-n_plot:], label="Prédictions XGBoost", color="#E74C3C", linewidth=2, linestyle="--")

plt.title(f"Evaluation XGBoost : {DISEASE} (Dernières {n_plot} semaines)", fontsize=14)
plt.xlabel("Semaines", fontsize=12)
plt.ylabel("Cas nouveaux", fontsize=12)
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()

PLOT_PATH = RESULTS_DIR / "xgboost_evaluation_plot.png"
plt.savefig(PLOT_PATH, dpi=300, bbox_inches='tight')
print(f"\n Graphique sauvegardé : {PLOT_PATH}")
plt.show()