import pandas as pd
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.parent
MODELS_DIR = BASE_DIR / "entrainement_modele" / "arima" / "models"

def charger_et_predire(region_id: int, maladie_id: int, horizon: int = 4):
    """Charge le modèle ARIMA et génère les prévisions."""
    nom_fichier = f"arima_r{region_id}_m{maladie_id}.pkl"
    chemin_modele = MODELS_DIR / nom_fichier
    
    if not chemin_modele.exists():
        raise FileNotFoundError(f"Aucun modèle trouvé pour la Région {region_id} et la Maladie {maladie_id} dans {MODELS_DIR}.")
    
    modele = joblib.load(chemin_modele)
    
    # Générer les prévisions et créer la feature
    previsions, intervalles = modele.predict(n_periods=horizon, return_conf_int=True)
    date_debut = pd.Timestamp.now() + pd.Timedelta(weeks=1)
    dates_futures = pd.date_range(start=date_debut, periods=horizon, freq='W')
    
    resultats = []
    
    liste_previsions = previsions.tolist()
    liste_min = intervalles[:, 0].tolist()
    liste_max = intervalles[:, 1].tolist()
    
    for i in range(horizon):
        resultats.append({
            "date": dates_futures[i].strftime("%Y-%m-%d"),
            "cas_prevus": int(round(previsions[i])),
            "min_confiance": int(round(max(0, intervalles[i][0]))), # max(0) pour éviter les négatifs
            "max_confiance": int(round(max(0, intervalles[i][1])))
        })
        
    return resultats