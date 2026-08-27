from sqlalchemy import Column, Integer, String, Date, Numeric, JSON, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

## Base commune de modeles
Base = declarative_base()

class Region(Base):
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True, index=True)
    code_region = Column(String(10), unique=True, index=True)
    nom_region = Column(String(100), unique=True, index=True)
    population_totale = Column(Integer)
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    
    
class Maladie (Base) :
    __tablename__ = "maladies"
    
    id = Column(Integer, primary_key=True, index=True)
    code_maladie = Column(String(50), unique=True, index=True)
    nom_officiel = Column(String(100))
    agent_pathogene = Column(String(100))
    type_maladie = Column(String(50))
    
class CasEpidemique(Base):
    __tablename__ = "cas_epidemiques"
    
    id = Column(Integer, primary_key=True, index=True)
    date_observation = Column(Date, index=True)
    semaine_epidemio = Column(String(10))
    
    region_id = Column(Integer, ForeignKey("regions.id"))
    maladie_id = Column(Integer, ForeignKey("maladies.id"))
    
    cas_nouveaux = Column(Integer, default=0)
    deces = Column(Integer, default=0)
    gueris = Column(Integer, default=0)
    hospitalisations = Column(Integer, default=0)
    taux_incidence = Column(Numeric(10, 4))
    taux_letalite = Column(Numeric(6, 2))
    niveau_alerte = Column(String(20))
    donnees_specifiques = Column(JSON)
    
    region = relationship("Region")
    maladie = relationship("Maladie")