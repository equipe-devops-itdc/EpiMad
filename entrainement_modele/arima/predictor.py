import os
import sys
import pandas as pd
import joblib
import traceback

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')


def charger_modele(region_id: int, maladie_id: int):
    """Charge un modèle ARIMA sauvegardé depuis le dossier 'models'."""
    nom_fichier = f"arima_r{region_id}_m{maladie_id}.pkl"
    chemin = os.path.join(MODELS_DIR, nom_fichier)
    
    print(f"   -> Recherche du fichier : {chemin}")
    if not os.path.exists(chemin):
        raise FileNotFoundError(f"Modele introuvable : {chemin}. Avez-vous lance l'entrainement ?")
        
    print(f"   -> Chargement en cours...")
    modele = joblib.load(chemin)
    print(f"   -> Modele charge avec succes !")
    return modele


def generer_previsions(region_id: int, maladie_id: int, horizon: int = 4):
    """Génère les prévisions pour un couple Région/Maladie."""
    print(f"[\u25B6] Generation des previsions pour Region {region_id}, Maladie {maladie_id} (Horizon: {horizon} semaines)...")
    
    
    modele = charger_modele(region_id, maladie_id)
    
    print("   -> Calcul des previsions en cours...")
    previsions, intervalles = modele.predict(n_periods=horizon, return_conf_int=True)
    
    
    date_debut = pd.Timestamp.now() + pd.Timedelta(weeks=1)
    dates_futures = pd.date_range(start=date_debut, periods=horizon, freq='W')
    
   
    df_resultat = pd.DataFrame({
        'date_previson': dates_futures.strftime('%Y-%m-%d'),
        'cas_prevus': [int(round(x)) for x in previsions],
        'intervalle_confiance_min': [int(round(x)) for x in intervalles[:, 0]],
        'intervalle_confiance_max': [int(round(x)) for x in intervalles[:, 1]]
    })
    
    return df_resultat

# BLOC DE TEST

if __name__ == "__main__":
    print("="*60)
    print(" TEST DU PREDICTOR ARIMA")
    print("="*60)
    
    try:
        print("1. Lancement du test...")
        resultats = generer_previsions(region_id=2, maladie_id=2, horizon=4)
        
        print("2. Succes !\n")
        print("="*60)
        print(" RESULTATS DES PREVISIONS :")
        print("="*60)
        print(resultats.to_string(index=False))
        print("="*60)
        
    except Exception as e:
        print(f"\n ERREUR CRITIQUE : {e}")
        print("\n--- Details techniques de l'erreur : ---")
        traceback.print_exc()