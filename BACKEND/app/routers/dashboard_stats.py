from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.database import get_db
from app.models import CasEpidemique, Maladie, Region
from app.routers.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/kpi")
def get_kpi_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les KPI principaux pour l'année 2026 uniquement."""
    
    # Filtrer uniquement les données de 2026
    year_2026_start = datetime(2026, 1, 1)
    year_2026_end = datetime(2026, 12, 31)
    
    # Total des cas (2026 uniquement)
    total_cas = db.query(func.sum(CasEpidemique.cas_nouveaux)).filter(
        CasEpidemique.date_observation >= year_2026_start,
        CasEpidemique.date_observation <= year_2026_end
    ).scalar() or 0
    
    # Total des décès (2026 uniquement)
    total_deces = db.query(func.sum(CasEpidemique.deces)).filter(
        CasEpidemique.date_observation >= year_2026_start,
        CasEpidemique.date_observation <= year_2026_end
    ).scalar() or 0
    
    # Total des guérisons (2026 uniquement)
    total_gueris = db.query(func.sum(CasEpidemique.gueris)).filter(
        CasEpidemique.date_observation >= year_2026_start,
        CasEpidemique.date_observation <= year_2026_end
    ).scalar() or 0
    
    # Nombre de régions
    total_regions = db.query(func.count(Region.id)).scalar() or 0
    
    # Régions en alerte (2026 uniquement)
    regions_alerte = db.query(
        func.count(func.distinct(CasEpidemique.region_id))
    ).filter(
        CasEpidemique.date_observation >= year_2026_start,
        CasEpidemique.date_observation <= year_2026_end,
        CasEpidemique.cas_nouveaux > 500
    ).scalar() or 0
    
    # Taux de létalité
    taux_letalite = (total_deces / total_cas * 100) if total_cas > 0 else 0
    
    # Taux de guérison
    taux_guerison = (total_gueris / total_cas * 100) if total_cas > 0 else 0
    
    return {
        "total_cas": int(total_cas),
        "total_deces": int(total_deces),
        "total_gueris": int(total_gueris),
        "total_regions": int(total_regions),
        "regions_alerte": int(regions_alerte),
        "taux_letalite": round(taux_letalite, 2),
        "taux_guerison": round(taux_guerison, 2)
    }

@router.get("/evolution-cas")
def get_evolution_cas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Évolution des cas par mois pour l'année 2026 uniquement."""
    
    year_2026_start = datetime(2026, 1, 1)
    year_2026_end = datetime(2026, 12, 31)
    
    results = db.query(
        func.date_trunc('month', CasEpidemique.date_observation).label('mois'),
        func.sum(CasEpidemique.cas_nouveaux).label('total_cas'),
        func.sum(CasEpidemique.deces).label('total_deces')
    ).filter(
        CasEpidemique.date_observation >= year_2026_start,
        CasEpidemique.date_observation <= year_2026_end
    ).group_by(
        func.date_trunc('month', CasEpidemique.date_observation)
    ).order_by(
        func.date_trunc('month', CasEpidemique.date_observation)
    ).all()
    
    data = []
    for row in results:
        data.append({
            "mois": row.mois.strftime("%Y-%m"),
            "cas": int(row.total_cas),
            "deces": int(row.total_deces)
        })
    
    return data

@router.get("/repartition-maladies")
def get_repartition_maladies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Répartition des cas par maladie."""
    
    results = db.query(
        Maladie.nom_officiel,
        func.sum(CasEpidemique.cas_nouveaux).label('total')
    ).join(
        CasEpidemique, CasEpidemique.maladie_id == Maladie.id
    ).group_by(
        Maladie.nom_officiel
    ).order_by(
        desc('total')
    ).all()
    
    return [{"name": r.nom_officiel, "value": int(r.total)} for r in results]

@router.get("/top-regions")
def get_top_regions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Top 10 régions avec le plus de cas."""
    
    results = db.query(
        Region.nom_region,
        func.sum(CasEpidemique.cas_nouveaux).label('total_cas'),
        func.sum(CasEpidemique.deces).label('total_deces')
    ).join(
        CasEpidemique, CasEpidemique.region_id == Region.id
    ).group_by(
        Region.nom_region
    ).order_by(
        desc('total_cas')
    ).limit(10).all()
    
    return [
        {
            "region": r.nom_region,
            "cas": int(r.total_cas),
            "deces": int(r.total_deces)
        } for r in results
    ]

@router.get("/comparatif-regions")
def get_comparatif_regions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Comparatif décès vs guérisons par région."""
    
    results = db.query(
        Region.nom_region,
        func.sum(CasEpidemique.deces).label('deces'),
        func.sum(CasEpidemique.gueris).label('gueris')
    ).join(
        CasEpidemique, CasEpidemique.region_id == Region.id
    ).group_by(
        Region.nom_region
    ).order_by(
        desc('deces')
    ).limit(8).all()
    
    return [
        {
            "region": r.nom_region,
            "deces": int(r.deces),
            "gueris": int(r.gueris)
        } for r in results
    ]