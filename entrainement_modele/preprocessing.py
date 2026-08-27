import re
import numpy as np
import pandas as pd

# ============================================================
# CONFIGURATION
# ============================================================

TARGET_COLUMN = "cas_nouveaux"
GROUP_COLUMNS = ["region_id", "maladie_id"]
LAG_PERIODS = [1, 2, 4, 8]

XGBOOST_FEATURES = [
    "region_id", "maladie_id", "annee", "mois", "semaine", "trimestre",
    
    "mois_sin", "mois_cos", "semaine_sin", "semaine_cos",
    
    "cas_lag_1", "cas_lag_2", "cas_lag_4", "cas_lag_8",
    
    "moyenne_4sem", "moyenne_8sem", "var_moyenne_4sem", "var_moyenne_8sem",
    
    "tendance", "tendance_normalisee",
    
    "est_pic", "mois_region",
    
    "spec_saison_pluies", "spec_saison_seche",
    
    "spec_precipitation_lag_2", "spec_precipitation_lag_4",
    
    "spec_temperature_lag_2", "spec_humidite_lag_2",
]

LEAKAGE_COLUMNS = [
    "cas_nouveaux", "cas_cumules", "deces", "hospitalisations",
    "taux_incidence", "taux_letalite", "gueris"
]

# ============================================================
# FONCTIONS DE PRÉTRAITEMENT
# ============================================================

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [re.sub(r"\s+", "_", str(c).strip()) for c in df.columns]
    df = df.dropna(axis=1, how="all")
    return df.reset_index(drop=True)

def prepare_temporal_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    # Extraction année/mois/semaine depuis date_observation
    if "date_observation" in df.columns:
        dates = pd.to_datetime(df["date_observation"], errors="coerce")
        df["annee"] = dates.dt.year
        df["mois"] = dates.dt.month
        df["semaine"] = dates.dt.isocalendar().week.astype(float)
    
    df["trimestre"] = ((df["mois"] - 1) // 3) + 1
    
    for col in ["annee", "mois", "semaine", "trimestre"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    
    return df

def sort_temporal_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    sort_cols = [c for c in ["region_id", "maladie_id", "annee", "semaine"] if c in df.columns]
    return df.sort_values(sort_cols, kind="stable").reset_index(drop=True)

def create_case_lag_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    grouped = df.groupby(GROUP_COLUMNS, sort=False, dropna=False)
    
    for lag in LAG_PERIODS:
        df[f"cas_lag_{lag}"] = grouped[TARGET_COLUMN].shift(lag)
    
    return df

def create_environment_lag_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    grouped = df.groupby(GROUP_COLUMNS, sort=False, dropna=False)
    
    for col in ["spec_temperature", "spec_humidite", "spec_precipitation"]:
        if col in df.columns:
            for lag in [2, 4]:
                df[f"{col}_lag_{lag}"] = grouped[col].shift(lag)
    
    return df

def create_advanced_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
   
    if "mois" in df.columns:
        df["mois_sin"] = np.sin(2 * np.pi * df["mois"] / 12)
        df["mois_cos"] = np.cos(2 * np.pi * df["mois"] / 12)
    
    if "semaine" in df.columns:
        df["semaine_sin"] = np.sin(2 * np.pi * df["semaine"] / 52)
        df["semaine_cos"] = np.cos(2 * np.pi * df["semaine"] / 52)
    
    if "cas_lag_1" in df.columns and "region_id" in df.columns:
        for window, suffix in [(4, "4sem"), (8, "8sem")]:
            df[f"moyenne_{suffix}"] = (
                df.groupby(GROUP_COLUMNS)["cas_lag_1"]
                .rolling(window=window, min_periods=1)
                .mean()
                .reset_index(level=[0, 1], drop=True)
            )
            
            df[f"var_moyenne_{suffix}"] = (
                df.groupby(GROUP_COLUMNS)["cas_lag_1"]
                .rolling(window=window, min_periods=1)
                .var()
                .fillna(0)
                .reset_index(level=[0, 1], drop=True)
            )
    
    # Tendance
    if "annee" in df.columns and "semaine" in df.columns:
        df["tendance"] = df["annee"] * 52 + df["semaine"]
        min_t, max_t = df["tendance"].min(), df["tendance"].max()
        df["tendance_normalisee"] = (df["tendance"] - min_t) / (max_t - min_t) if max_t != min_t else 0.0
    
    # Détection de pic
    if "moyenne_8sem" in df.columns and "cas_lag_1" in df.columns:
        df["est_pic"] = (df["cas_lag_1"] > (df["moyenne_8sem"] * 1.5)).astype(int)
    
    # Interaction région × mois
    if "region_id" in df.columns and "mois" in df.columns:
        df["mois_region"] = (df["region_id"] * 100) + df["mois"]
    
    return df

def create_season_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    if "mois" in df.columns:
        mois = pd.to_numeric(df["mois"], errors="coerce")
        df["spec_saison_pluies"] = mois.isin([1, 2, 3, 4, 11, 12]).astype(int)
        df["spec_saison_seche"] = mois.isin([5, 6, 7, 8, 9, 10]).astype(int)
    
    return df

def create_categorical_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    cat_cols = [c for c in ["maladie"] if c in df.columns]
    
    if cat_cols:
        df = pd.get_dummies(df, columns=cat_cols, prefix="spec", dtype=int)
    
    return df

# ============================================================
# PIPELINE PRINCIPAL
# ============================================================

def prepare_for_xgboost(df: pd.DataFrame, create_lags: bool = True, remove_first_lag_rows: bool = True) -> pd.DataFrame:
    if df is None or df.empty:
        raise ValueError("Le DataFrame fourni est vide.")
    
    df = clean_dataframe(df)
    df = prepare_temporal_columns(df)
    df = sort_temporal_data(df)
    
    if create_lags:
        df = create_case_lag_features(df)
        df = create_environment_lag_features(df)
    
    df = create_advanced_features(df)
    df = create_season_features(df)
    df = create_categorical_features(df)
    
    # Supprimer les lignes sans historique complet
    if create_lags and remove_first_lag_rows and "cas_lag_8" in df.columns:
        df = df.dropna(subset=["cas_lag_8"])
    
    df = df.fillna(0)
    
    # Convertir booléens en entiers
    for col in df.select_dtypes(include=["bool"]).columns:
        df[col] = df[col].astype(int)
    
    return df.reset_index(drop=True)

def split_features_target(df: pd.DataFrame, target: str = TARGET_COLUMN):
    if df is None or df.empty:
        raise ValueError("Le DataFrame est vide.")
    if target not in df.columns:
        raise ValueError(f"Colonne cible absente : {target}")
    
    # Filtrer les features qui existent
    features = [c for c in XGBOOST_FEATURES if c in df.columns]
    
    if not features:
        raise ValueError("Aucune variable explicative disponible.")
    
    X = df[features].copy()
    y = pd.to_numeric(df[target], errors="coerce")
    
    valid = y.notna()
    X = X.loc[valid].reset_index(drop=True)
    y = y.loc[valid].reset_index(drop=True)
    
    if X.empty or len(X) != len(y):
        raise ValueError("Incohérence après séparation X / y.")
    
    return X, y

def check_data_leakage(X: pd.DataFrame) -> dict:
    leakage_found = [c for c in LEAKAGE_COLUMNS if c in X.columns]
    return {"fuite_detectee": len(leakage_found) > 0, "variables_fuite": leakage_found}