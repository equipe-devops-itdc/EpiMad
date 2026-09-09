const API_BASE_URL = "http://127.0.0.1:8000/api";

export const getAlertes = async (horizon = 4) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alertes/?horizon=${horizon}`);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des alertes");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(" Erreur API Alertes:", error);
    throw error;
  }
};