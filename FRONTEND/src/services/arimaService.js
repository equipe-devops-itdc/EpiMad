const API_BASE_URL = "http://127.0.0.1:8000/api";

export const getPrevisionsARIMA = async (regionId, maladieId, horizon = 4) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/arima/previsions/${regionId}/${maladieId}?horizon=${horizon}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Erreur lors de la récupération des prévisions");
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erreur API ARIMA :", error);
    throw error;
  }
};

export const getHistorique = async (regionId, maladieId, semaines = 12) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/historique/${regionId}/${maladieId}?semaines=${semaines}`
    );
    
    if (!response.ok) {
      throw new Error("Erreur récupération historique");
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Erreur historique:", error);
    return [];
  }
};

export const getRegions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/regions`);
    if (!response.ok) throw new Error("Erreur régions");
    return await response.json();
  } catch (error) {
    console.error("Erreur régions:", error);
    return [];
  }
};

export const getMaladies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/maladies`);
    if (!response.ok) throw new Error("Erreur maladies");
    return await response.json();
  } catch (error) {
    console.error("Erreur maladies:", error);
    return [];
  }
};