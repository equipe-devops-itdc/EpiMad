from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

### Schemas pour les regions
class RegionBase(BaseModel):
    code_region: str
    nom_region: str
    population_totale: int
    
class RegionRead(RegionBase):
    id: int
    latitude: float
    longitude: float
    
    model_config = ConfigDict(from_attributes=True)
    
###  Schemas pour les maladies
class MaladieBase(BaseModel):
    code_maladie: str
    nom_officiel: str

class MaladieRead(MaladieBase):
    id: int
    agent_pathogene: Optional[str] = None
    type_maladie: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

### Schemas pour les cas épidémiques
class CasEpidemiqueBase(BaseModel):
    date_observation: date
    semaine_epidemio: str
    cas_nouveaux: int = 0
    deces: int = 0
    hospitalisations: float= 0
    taux_incidence: float = 0.0
    taux_letalite: float = 0.0
    niveau_alerte: str
    
class CasEpidemiqueRead(CasEpidemiqueBase):
    id: int
    region_id: int
    maladie_id: int
    donnees_specifiques: Optional[dict] = None
    region: "RegionRead"
    maladie: "MaladieRead"
    
    model_config = ConfigDict(from_attributes=True)
