from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import cas, maladies, regions, stats, predictions

app = FastAPI(
    title="EpiMad API",
    description="API pour la surveillance épidémiologique pour Madagascar",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cas.router)
app.include_router(maladies.router)
app.include_router(regions.router)
app.include_router(stats.router)
app.include_router(predictions.router)

@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Bienvenue sur l'API EpiMad !",
        "docs": "/docs",
        "status": "Opérationnel"
    }