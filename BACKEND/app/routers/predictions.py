from fastapi import APIRouter, HTTPException
import sys
import subprocess
import unicodedata
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from entrainement_modele.preprocessing import prepare_for_xgboost, XGBOOST_FEATURES
from entrainement_modele.database import get_epidemic_data

router = APIRouter(prefix="/api", tags=["predictions"])

MODELS_CACHE = {}

def normalize_disease_name(name):
    """Normalise un nom de maladie pour correspondre au nom du fichier .joblib"""
    name_lower = name.lower()
    name_normalized = unicodedata.normalize('NFKD', name_lower).encode('ASCII', 'ignore').decode('ASCII')
    return name_normalized.replace(" ", "_").replace("-", "_")


def get_model_path(disease: str) -> Path:
    """Retourne le chemin attendu du modèle pour une maladie donnée."""
    models_dir = PROJECT_ROOT / "entrainement_modele" / "xgboost" / "models"
    return models_dir / f"xgboost_{normalize_disease_name(disease)}.joblib"


def model_exists(disease: str) -> bool:
    """Vérifie si le modèle existe sur le disque."""
    return get_model_path(disease).exists()


def train_model_for_disease(disease: str) -> bool:
    """
    Lance l'entraînement automatique pour une maladie.
    Retourne True si succès, False sinon.
    """
    print(f"\n[ROBOT] XGBoost: Modele manquant pour '{disease}'. Lancement de l'entrainement automatique...")
    
    train_script = PROJECT_ROOT / "entrainement_modele" / "xgboost" / "train_xgboost.py"
    
    if not train_script.exists():
        print(f"[ERREUR] Script d'entrainement introuvable : {train_script}")
        return False
    
    try:
        import os
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        
        result = subprocess.run(
            [sys.executable, str(train_script), disease],
            capture_output=True,
            text=True,
            encoding='utf-8',
            env=env,
            timeout=300,
            cwd=str(PROJECT_ROOT)
        )
        
        if result.returncode == 0:
            print(f"[SUCCES] Entrainement XGBoost reussi pour '{disease}'")
            for line in result.stdout.strip().split('\n')[-5:]:
                print(f"   {line}")
            return True
        else:
            print(f"[ERREUR] Echec de l'entrainement pour '{disease}'")
            print(f"   STDERR: {result.stderr[-500:] if result.stderr else 'N/A'}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"[TIMEOUT] L'entrainement de '{disease}' a pris trop de temps")
        return False
    except Exception as e:
        print(f"[ERREUR] Erreur lors de l'entrainement de '{disease}': {e}")
        return False


def get_loaded_models():
    """Charge les modèles en mémoire s'ils ne le sont pas déjà."""
    global MODELS_CACHE
    if MODELS_CACHE:
        return MODELS_CACHE
        
    print("\n Chargement des modèles XGBoost en mémoire...")
    models_dir = PROJECT_ROOT / "entrainement_modele" / "xgboost" / "models"
    
    if not models_dir.exists():
        print(" Dossier models/ introuvable")
        return MODELS_CACHE
    
    for model_file in models_dir.glob("xgboost_*.joblib"):
        if "metadata" in model_file.stem:
            continue
            
        disease_name = model_file.stem.replace("xgboost_", "").replace("_", " ").title()
        if "Covid" in disease_name: disease_name = "COVID-19"
        elif "Hepatite" in disease_name: disease_name = "Hépatite virale"
            
        try:
            model = joblib.load(model_file)
            MODELS_CACHE[disease_name] = {
                "model": model,
                "path": model_file.name,
                "loaded_at": pd.Timestamp.now().isoformat()
            }
            print(f"  ✓ {disease_name} chargé")
        except Exception as e:
            print(f"   Erreur chargement {model_file.name}: {e}")
            
    print(f" {len(MODELS_CACHE)} modèles prêts.\n")
    return MODELS_CACHE


def reload_cache():
    """Force le rechargement du cache (après un nouvel entraînement)."""
    global MODELS_CACHE
    MODELS_CACHE = {}
    return get_loaded_models()


def find_disease_in_cache(search_name: str, models: dict) -> str | None:
    search_lower = search_name.lower()
    
    for disease_name in models.keys():
        if disease_name.lower() == search_lower:
            return disease_name
    
    for disease_name in models.keys():
        if search_lower in disease_name.lower():
            return disease_name
    
    aliases = {
        "covid": "COVID-19", "covid19": "COVID-19", "covid-19": "COVID-19",
        "hepatite": "Hépatite virale", "hep": "Hépatite virale",
        "tbc": "Tuberculose", "palu": "Paludisme",
    }
    if search_lower in aliases and aliases[search_lower] in models:
        return aliases[search_lower]
    
    return None


def _predict_disease(disease: str, horizon: int, model):
    """Logique interne de prédiction récursive."""
    df = get_epidemic_data()
    df_disease = df[df["maladie"] == disease].copy()
    if df_disease.empty:
        raise ValueError(f"Aucune donnée trouvée pour: {disease}")
    
    df_ml = prepare_for_xgboost(df_disease, create_lags=True, remove_first_lag_rows=True)
    weekly_totals = df_ml.groupby(["annee", "semaine"])["cas_nouveaux"].sum()
    
    MIN_CASES_THRESHOLD = 100 if disease == "Peste" else 1000
    valid_weeks = weekly_totals[weekly_totals >= MIN_CASES_THRESHOLD]
    last_valid_week = weekly_totals.index[-1] if valid_weeks.empty else valid_weeks.index[-1]
    
    df_ml_valid = df_ml[
        (df_ml["annee"] < last_valid_week[0]) | 
        ((df_ml["annee"] == last_valid_week[0]) & (df_ml["semaine"] <= last_valid_week[1]))
    ].copy()
    
    current_state = df_ml_valid.groupby("region_id").last().reset_index()
    all_predictions = []
    
    for step in range(1, horizon + 1):
        df_future = current_state.copy()
        df_future["cas_lag_1"] = current_state["cas_nouveaux"]
        df_future["cas_lag_2"] = current_state["cas_lag_1"]
        df_future["cas_lag_4"] = current_state["cas_lag_3"] if "cas_lag_3" in current_state.columns else current_state["cas_lag_2"]
        df_future["cas_lag_8"] = current_state["cas_lag_7"] if "cas_lag_7" in current_state.columns else current_state["cas_lag_4"]
        
        for col in ["moyenne_4sem", "moyenne_8sem", "var_moyenne_4sem", "var_moyenne_8sem"]:
            if col in current_state.columns: df_future[col] = current_state[col]
            
        df_future["semaine"] = (current_state["semaine"].astype(int) % 52) + 1
        df_future["mois"] = ((df_future["semaine"] - 1) // 4) + 1
        df_future["trimestre"] = ((df_future["mois"] - 1) // 3) + 1
        df_future["annee"] = current_state["annee"].astype(int) + (current_state["semaine"].astype(int) // 52)
        
        df_future["mois_sin"] = np.sin(2 * np.pi * df_future["mois"] / 12)
        df_future["mois_cos"] = np.cos(2 * np.pi * df_future["mois"] / 12)
        df_future["semaine_sin"] = np.sin(2 * np.pi * df_future["semaine"] / 52)
        df_future["semaine_cos"] = np.cos(2 * np.pi * df_future["semaine"] / 52)
        df_future["tendance"] = df_future["annee"] * 52 + df_future["semaine"]
        df_future["est_pic"] = (df_future["cas_lag_1"] > (df_future["moyenne_8sem"] * 1.5)).astype(int)
        
        features_to_use = [f for f in XGBOOST_FEATURES if f in df_future.columns]
        X_future = df_future[features_to_use].fillna(0)
        
        y_pred_log = model.predict(X_future)
        y_pred = np.maximum(np.expm1(y_pred_log), 0).astype(int)
        
        current_state["cas_nouveaux"] = y_pred
        current_state["cas_lag_1"] = y_pred
        current_state["semaine"] = df_future["semaine"]
        current_state["annee"] = df_future["annee"]
        current_state["mois"] = df_future["mois"]
        
        for _, row in current_state.iterrows():
            all_predictions.append({
                "maladie": disease,
                "region_id": int(row["region_id"]),
                "annee": int(row["annee"]),
                "semaine": int(row["semaine"]),
                "horizon": f"T+{step}",
                "cas_predits": int(y_pred[current_state["region_id"] == row["region_id"]][0])
            })
    return all_predictions

# ENDPOINTS

@router.get("/predictions/all")
async def get_all_predictions(horizon: int = 4):
    """Retourne les prédictions pour toutes les maladies disponibles."""
    if horizon < 1 or horizon > 12:
        raise HTTPException(status_code=400, detail="L'horizon doit être entre 1 et 12 semaines")
    
    models = get_loaded_models()
    results = {}
    for disease, info in models.items():
        try:
            results[disease] = {
                "predictions": _predict_disease(disease, horizon, info["model"]),
                "model_file": info["path"],
                "loaded_at": info["loaded_at"]
            }
        except Exception as e:
            results[disease] = {"error": str(e), "model_file": info["path"]}
            
    return {"status": "success", "horizon": horizon, "total_diseases": len(results), "data": results}


@router.get("/predictions/{disease}")
async def get_disease_predictions(disease: str, horizon: int = 4):
    """
    Retourne les prédictions pour une maladie spécifique.
    Si le modèle n'existe pas, il est entraîné automatiquement.
    """
    if horizon < 1 or horizon > 12:
        raise HTTPException(status_code=400, detail="L'horizon doit être entre 1 et 12 semaines")
    
    search_disease = disease.replace("_", " ").title()
    if "covid" in disease.lower(): search_disease = "COVID-19"
    elif "hepatite" in disease.lower(): search_disease = "Hépatite virale"
    
    models = get_loaded_models()
    
    disease_name = find_disease_in_cache(search_disease, models)
    
    if disease_name is None:
        print(f"\n Modèle '{search_disease}' non trouvé dans le cache.")
        print(f"[] Tentative d'entraînement automatique...")
        
        success = train_model_for_disease(search_disease)
        
        if not success:
            raise HTTPException(
                status_code=404, 
                detail=f"Modèle non trouvé pour '{search_disease}' et l'entraînement automatique a échoué. "
                       f"Vérifiez que des données existent en base pour cette maladie (min. 10 semaines)."
            )
        
        # Recharge le cache avec le nouveau modèle
        print(f"Rechargement du cache après entraînement...")
        models = reload_cache()
        disease_name = find_disease_in_cache(search_disease, models)
        
        if disease_name is None:
            raise HTTPException(
                status_code=500,
                detail=f"Entraînement terminé mais modèle introuvable dans le cache pour '{search_disease}'."
            )
        
        print(f" Modèle '{disease_name}' maintenant disponible !")
    
    # 3. Fait la prédiction
    try:
        predictions = _predict_disease(disease_name, horizon, models[disease_name]["model"])
        return {
            "status": "success",
            "disease": disease_name,
            "horizon": horizon,
            "auto_trained": disease_name not in [d for d in get_loaded_models().keys() if d != disease_name],
            "total_predictions": len(predictions),
            "data": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction: {str(e)}")


@router.get("/models")
async def get_available_models():
    """Retourne la liste des modèles XGBoost chargés."""
    models = get_loaded_models()
    return {
        "status": "success",
        "total_models": len(models),
        "data": {d: {"model_file": i["path"], "loaded_at": i["loaded_at"]} for d, i in models.items()}
    }


@router.post("/train/{disease}")
async def trigger_training(disease: str):
    """
    Endpoint manuel pour forcer l'entraînement d'un modèle.
    Utile après un gros import de données.
    """
    print(f"\n Demande d'entraînement manuel pour '{disease}'")
    
    success = train_model_for_disease(disease)
    
    if success:
        reload_cache()
        return {
            "status": "success",
            "message": f"Modèle pour '{disease}' entraîné avec succès",
            "model_path": str(get_model_path(disease))
        }
    else:
        raise HTTPException(
            status_code=500,
            detail=f"Échec de l'entraînement pour '{disease}'. Vérifiez les logs du backend."
        )