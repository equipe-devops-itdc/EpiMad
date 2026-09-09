const API_BASE_URL = "http://127.0.0.1:8000/api";

export const getMaladies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/maladies`);
    if (!response.ok) throw new Error("Erreur lors du chargement des maladies");
    return await response.json();
  } catch (error) {
    console.error("Erreur API Maladies:", error);
    throw error;
  }
};

export const uploadData = async (file, maladieNom) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("maladie_nom", maladieNom);

    const response = await fetch(`${API_BASE_URL}/import/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Erreur lors de l'import");
    }
    return data;
  } catch (error) {
    console.error(" Erreur API Import:", error);
    throw error;
  }
};