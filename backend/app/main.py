"""
Point d'entrée principal de l'API FastAPI pour le SaaS Idea-to-Launch
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Import des routers
from app.routers import topics, products, generate

# Chargement des variables d'environnement
load_dotenv()

# Configuration de l'application FastAPI
app = FastAPI(
    title="SaaS Idea-to-Launch API",
    description="API pour transformer des idées en produits SaaS rentables",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routers
app.include_router(topics.router, prefix="/api/topics", tags=["topics"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])

@app.get("/")
async def root():
    """
    Endpoint racine pour vérifier que l'API fonctionne
    """
    return {
        "message": "SaaS Idea-to-Launch API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """
    Endpoint de santé pour vérifier l'état de l'API
    """
    # Vérification des variables d'environnement critiques
    openai_key = os.getenv("OPENAI_API_KEY")
    
    return {
        "status": "healthy",
        "openai_configured": bool(openai_key),
        "database_url": bool(os.getenv("DATABASE_URL")),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Gestionnaire global d'exceptions pour retourner des erreurs propres
    """
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if os.getenv("ENVIRONMENT") == "development" else "Something went wrong"
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    # Configuration pour le développement local
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
