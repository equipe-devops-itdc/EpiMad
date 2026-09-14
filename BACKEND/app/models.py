from sqlalchemy import Column, Integer, String, Date, Numeric, JSON, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

# Base commune de modèles
Base = declarative_base()

class Region(Base):
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True, index=True)
    code_region = Column(String(10), unique=True, index=True)
    nom_region = Column(String(100), unique=True, index=True)
    population_totale = Column(Integer)
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    
class Maladie(Base):
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

class User(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="En_attente", nullable=False) 
    est_verifie = Column(Boolean, default=False)
    email_confirme = Column(Boolean, default=False)
    
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
    derniere_connexion = Column(DateTime(timezone=True), nullable=True)

class HistoriqueImport(Base):
    __tablename__ = "historique_imports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)
    
    nom_donnees = Column(String, nullable=False)
    maladie_nom = Column(String, nullable=False)
    type_import = Column(String, nullable=False)
    
    
    donnees_brutes = Column(JSONB, nullable=True) 
    
    statut = Column(String, default="Brouillon")
    
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
    date_verification = Column(DateTime(timezone=True), nullable=True)
    date_import_etl = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")