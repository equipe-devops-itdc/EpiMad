import json
import sys
import unicodedata
from pathlib import Path
ML_ROOT = Path(__file__).resolve().parent.parent

if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))
    
import joblib
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from database import get_epidemic_data
from preprocessing import prepare_for_xgboost, split_features_target, XGBOOST_FEATURES, check_data_leakage

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
print(f"Nom du fichier modèle : xgboost_{normalize_disease_name(DISEASE)}.joblib") # <-- LIGNE DE VÉRIFICATION
    
TEST_SIZE = 0.20
RANDOM_STATE = 42

MODEL_DIR = Path(__file__).resolve().parent.parent / "xgboost" / "models"
RESULTS_DIR = Path(__file__).resolve().parent.parent / "xgboost" / "results"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / f"xgboost_{normalize_disease_name(DISEASE)}.joblib"
METADATA_PATH = MODEL_DIR / f"xgboost_{normalize_disease_name(DISEASE)}_metadata.json"
# ============================================================
# 1. CHARGEMENT DES DONNÉES
# ============================================================

print("=" * 70)
print(f"ENTRAÎNEMENT XGBOOST - {DISEASE}")
print("=" * 70)

df = get_epidemic_data()
print(f"\n✓ Données récupérées : {len(df):,} observations")

df_disease = df[df["maladie"] == DISEASE].copy()
if df_disease.empty:
    raise ValueError(f"Aucune donnée trouvée pour : {DISEASE}")

print(f"✓ Observations {DISEASE} : {len(df_disease):,}")

# ============================================================
# 2. PREPROCESSING
# ============================================================

df_ml = prepare_for_xgboost(df_disease, create_lags=True, remove_first_lag_rows=True)
print(f"✓ Après preprocessing : {len(df_ml):,} observations")

# Vérifier les features
print(f"\n DEBUG : Colonnes disponibles après preprocessing :")
print(f"   Total : {len(df_ml.columns)} colonnes")

features_presentes = [c for c in XGBOOST_FEATURES if c in df_ml.columns]
features_manquantes = [c for c in XGBOOST_FEATURES if c not in df_ml.columns]

print(f"   Features présentes : {len(features_presentes)}")
print(f"   Features manquantes : {len(features_manquantes)}")

if features_manquantes:
    print(f"\n Features manquantes :")
    for feat in features_manquantes:
        print(f"   - {feat}")

# ============================================================
# 3. SÉPARATION X / Y
# ============================================================

X, y = split_features_target(df_ml, target="cas_nouveaux")
print(f"\n✓ Features X : {X.shape[1]} | Observations : {len(X):,}")

# Vérification fuite de données
leakage = check_data_leakage(X)
if leakage["fuite_detectee"]:
    raise ValueError(f"Fuite de données détectée : {leakage['variables_fuite']}")

print(f"✓ Aucune fuite de données détectée")

# Séparation temporelle
split_index = int(len(X) * (1 - TEST_SIZE))
X_train, X_test = X.iloc[:split_index], X.iloc[split_index:]
y_train, y_test = y.iloc[:split_index], y.iloc[split_index:]

print(f"\n Séparation temporelle :")
print(f"   - Train : {len(X_train):,}")
print(f"   - Test  : {len(X_test):,}")

# ============================================================
# 4. ENTRAÎNEMENT DU MODÈLE
# ============================================================

print("\n Entraînement du modèle...")

model = xgb.XGBRegressor(
    n_estimators=1000,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=RANDOM_STATE,
    n_jobs=-1,
    early_stopping_rounds=50
)

# Transformation log1p pour gérer les pics
y_train_log = np.log1p(y_train)
y_test_log = np.log1p(y_test)

model.fit(
    X_train, y_train_log,
    eval_set=[(X_test, y_test_log)],
    verbose=False
)

# ============================================================
# 5. PRÉDICTION ET MÉTRIQUES
# ============================================================

y_pred_log = model.predict(X_test)
y_pred = np.expm1(y_pred_log)
y_test_original = np.expm1(y_test_log)
y_pred = np.maximum(y_pred, 0)

mae = mean_absolute_error(y_test_original, y_pred)
rmse = np.sqrt(mean_squared_error(y_test_original, y_pred))
r2 = r2_score(y_test_original, y_pred)

non_zero = y_test_original > 0
mape = np.mean(np.abs((y_test_original[non_zero] - y_pred[non_zero]) / y_test_original[non_zero])) * 100 if non_zero.any() else 0.0

print(f"\n PERFORMANCES :")
print(f"   - MAE  : {mae:.2f}")
print(f"   - RMSE : {rmse:.2f}")
print(f"   - R²   : {r2:.4f}")
print(f"   - MAPE : {mape:.2f}%")

# ============================================================
# 6. IMPORTANCE DES VARIABLES
# ============================================================

print(f"\n TOP 10 FEATURES :")
importance = model.feature_importances_
feature_importance = sorted(zip(X.columns, importance), key=lambda x: x[1], reverse=True)

for feature, score in feature_importance[:10]:
    print(f"   - {feature:<25} {score:.4f}")

# ============================================================
# 7. SAUVEGARDE
# ============================================================

joblib.dump(model, MODEL_PATH)
print(f"\n✓ Modèle sauvegardé : {MODEL_PATH}")

with open(METADATA_PATH, "w", encoding="utf-8") as f:
    json.dump({"features": X.columns.tolist(), "target": "cas_nouveaux"}, f, indent=4)
print(f"✓ Métadonnées sauvegardées : {METADATA_PATH}")

print("\n" + "=" * 70)
print("✓ ENTRAÎNEMENT TERMINÉ")
print("=" * 70)