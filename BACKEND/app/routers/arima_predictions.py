from fastapi import APIRouter, HTTPException
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../../entrainement_modele"))

from app.services.arima_prediction import charger_et_predire
from entrainement_modele.arima import trainer

router = APIRouter(prefix="/api/arima", tags=["Prévisions ARIMA"])

@router.get("/previsions/{region_id}/{maladie_id}")
def get_previsions_arima(region_id: int, maladie_id: int, horizon: int = 4):
    """
    Génère des prévisions ARIMA pour une région et une maladie donnée.
    Si le modèle n'existe pas, il est entraîné automatiquement à la volée.
    """
    try:
        print(f"▶ Tentative de chargement du modèle pour Région {region_id}, Maladie {maladie_id}...")
        previsions = charger_et_predire(region_id, maladie_id, horizon)
        
        return {
            "status": "success",
            "source": "modele_existant",
            "region_id": region_id,
            "maladie_id": maladie_id,
            "horizon_semaines": horizon,
            "data": previsions
        }
        
    except FileNotFoundError as e:
    
        print(f"⚠️ Modèle non trouvé. Entraînement à la volée...")
        try:

            trainer.entrainer_modele(region_id, maladie_id, horizon)
            print(f"✓ Modèle entraîné avec succès !")
            
            previsions = charger_et_predire(region_id, maladie_id, horizon)
            
            return {
                "status": "success",
                "source": "modele_nouveau_entraine",
                "region_id": region_id,
                "maladie_id": maladie_id,
                "horizon_semaines": horizon,
                "data": previsions,
                "message": "Nouveau modèle ARIMA créé automatiquement"
            }
            
        except Exception as train_error:
            raise HTTPException(
                status_code=500, 
                detail=f"Erreur lors de l'entraînement automatique: {str(train_error)}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne du serveur: {str(e)}")