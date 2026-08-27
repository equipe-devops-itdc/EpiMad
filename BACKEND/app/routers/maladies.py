import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Maladie
from app.schemas import MaladieRead

router = APIRouter()

@router.get("/maladies", response_model=List[MaladieRead], tags=["Maladies"])
def get_all_maladies(db: Session = Depends(get_db)):
    """
    Récupère toutes les maladies.
    """
    maladies = db.query(Maladie).order_by(Maladie.nom_officiel).all()
    if not maladies:
        raise HTTPException(status_code=404, detail="Aucune maladie trouvée.")
    return maladies