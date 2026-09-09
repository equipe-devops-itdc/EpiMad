// FRONTEND/src/services/xgboostService.js

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const getPrevisionsXGBoost = async (nomMaladie, horizon = 4) => {
  try {
    const formattedDisease = encodeURIComponent(nomMaladie);
    
    const response = await fetch(
      `${API_BASE_URL}/predictions/${formattedDisease}?horizon=${horizon}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Erreur lors de la récupération des prévisions XGBoost");
    }
    
    const data = await response.json();
    
    return data.data; 
    
  } catch (error) {
    console.error(" Erreur API XGBoost :", error);
    throw error;
  }
};