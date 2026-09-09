from arima.trainer import entrainer_modele

# Le Paludisme (Maladie 2) pour la Région 1
print("Test sur Paludisme (Maladie 2) - Région 1")
entrainer_modele(region_id=1, maladie_id=2, horizon=4)