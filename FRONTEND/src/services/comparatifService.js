const API_BASE_URL = "http://127.0.0.1:8000/api";

export const getComparatifRegions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/comparatif/regions`);
    if (!response.ok) throw new Error("Erreur API Comparatif");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(" Erreur:", error);
    throw error;
  }
};