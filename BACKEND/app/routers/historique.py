import sys
import os
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import text


backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
epimad_dir = os.path.dirname(backend_dir)
entrainement_dir = os.path.join(epimad_dir, 'entrainement_modele')

print(f" DEBUG: Chemin vers entrainement_modele: {entrainement_dir}")


if entrainement_dir not in sys.path:
    sys.path.insert(0, entrainement_dir)


try:
    from database import engine
    print(" DEBUG: Import de database.py depuis entrainement_modele réussi !")
except Exception as e:
    print(f" DEBUG: Échec de l'import: {e}")
    raise

router = APIRouter(prefix="/api/historique", tags=["Historique"])

@router.get("/{region_id}/{maladie_id}")
def get_historique_epidemique(
    region_id: int, 
    maladie_id: int,
    semaines: int = Query(default=52, ge=1, le=365)
):
    query = text("""
        SELECT 
            date_observation,
            cas_nouveaux,
            cas_cumules,
            deces,
            gueris,
            taux_incidence
        FROM cas_epidemiques
        WHERE region_id = :region_id 
          AND maladie_id = :maladie_id
        ORDER BY date_observation DESC
        LIMIT :limit_val;
    """)
    
    try:
        with engine.connect() as connection:
            result = connection.execute(
                query, 
                {
                    "region_id": region_id,
                    "maladie_id": maladie_id,
                    "limit_val": semaines
                }
            )
            
            rows = result.fetchall()
            
            if not rows:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Aucune donnée trouvée pour region_id={region_id}, maladie_id={maladie_id}"
                )
            
            historique = []
            for row in rows:
                historique.append({
                    "date": row.date_observation.strftime("%Y-%m-%d"),
                    "semaine": f"Sem. {row.date_observation.strftime('%Y-W%V')}",
                    "cas_nouveaux": int(row.cas_nouveaux) if row.cas_nouveaux else 0,
                    "cas_cumules": int(row.cas_cumules) if row.cas_cumules else 0,
                    "deces": int(row.deces) if row.deces else 0,
                    "gueris": int(row.gueris) if row.gueris else 0,
                    "taux_incidence": float(row.taux_incidence) if row.taux_incidence else 0.0
                })
                historique.reverse()
            
            return {
                "region_id": region_id,
                "maladie_id": maladie_id,
                "semaines_disponibles": len(historique),
                "data": historique
            }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f" ERREUR SQL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")