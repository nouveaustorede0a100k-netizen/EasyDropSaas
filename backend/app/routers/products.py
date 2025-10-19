"""
Router pour la découverte et l'analyse de produits digitaux
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging

from app.ai_engine import ai_engine

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Création du router
router = APIRouter()

class ProductSearchRequest(BaseModel):
    """Modèle pour les requêtes de recherche de produits"""
    topic: str
    trends: List[str] = []
    product_types: List[str] = ["saas", "info", "service"]
    min_difficulty: int = 1
    max_difficulty: int = 10
    revenue_potential: str = "any"  # "low", "medium", "high", "any"

class ProductSearchResponse(BaseModel):
    """Modèle pour les réponses de recherche de produits"""
    topic: str
    products: List[Dict[str, Any]]
    search_parameters: Dict[str, Any]
    status: str

@router.get("/search")
async def search_products(
    topic: str = Query(..., description="Thématique pour la recherche de produits", min_length=2, max_length=100),
    trends: Optional[str] = Query(None, description="Tendances séparées par virgules"),
    product_types: Optional[str] = Query("saas,info,service", description="Types de produits séparés par virgules"),
    min_difficulty: int = Query(1, description="Difficulté minimale (1-10)", ge=1, le=10),
    max_difficulty: int = Query(10, description="Difficulté maximale (1-10)", ge=1, le=10),
    revenue_potential: str = Query("any", description="Potentiel de revenus (low/medium/high/any)")
) -> ProductSearchResponse:
    """
    Recherche des produits digitaux "gagnants" basés sur une thématique
    
    Args:
        topic: La thématique principale
        trends: Tendances associées (optionnel)
        product_types: Types de produits à inclure
        min_difficulty: Difficulté minimale de création
        max_difficulty: Difficulté maximale de création
        revenue_potential: Potentiel de revenus souhaité
    
    Returns:
        Liste de produits digitaux recommandés
    """
    try:
        logger.info(f"Recherche de produits pour le topic: {topic}")
        
        # Parsing des paramètres
        trends_list = trends.split(",") if trends else []
        types_list = product_types.split(",") if product_types else ["saas", "info", "service"]
        
        # Génération des produits via IA
        products = await ai_engine.discover_digital_products(topic, trends_list)
        
        # Filtrage des produits selon les critères
        filtered_products = _filter_products(products, {
            "product_types": types_list,
            "min_difficulty": min_difficulty,
            "max_difficulty": max_difficulty,
            "revenue_potential": revenue_potential
        })
        
        # Enrichissement avec des données supplémentaires
        enriched_products = await _enrich_products_data(filtered_products, topic)
        
        return ProductSearchResponse(
            topic=topic,
            products=enriched_products,
            search_parameters={
                "trends": trends_list,
                "product_types": types_list,
                "difficulty_range": [min_difficulty, max_difficulty],
                "revenue_potential": revenue_potential
            },
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Erreur lors de la recherche de produits pour {topic}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la recherche de produits: {str(e)}"
        )

@router.post("/search")
async def search_products_post(request: ProductSearchRequest) -> ProductSearchResponse:
    """
    Version POST pour la recherche de produits avec un body JSON
    
    Args:
        request: Objet contenant les paramètres de recherche
        
    Returns:
        Liste de produits digitaux recommandés
    """
    try:
        logger.info(f"Recherche POST de produits pour le topic: {request.topic}")
        
        # Génération des produits via IA
        products = await ai_engine.discover_digital_products(request.topic, request.trends)
        
        # Filtrage selon les critères
        filtered_products = _filter_products(products, {
            "product_types": request.product_types,
            "min_difficulty": request.min_difficulty,
            "max_difficulty": request.max_difficulty,
            "revenue_potential": request.revenue_potential
        })
        
        # Enrichissement avec des données supplémentaires
        enriched_products = await _enrich_products_data(filtered_products, request.topic)
        
        return ProductSearchResponse(
            topic=request.topic,
            products=enriched_products,
            search_parameters={
                "trends": request.trends,
                "product_types": request.product_types,
                "difficulty_range": [request.min_difficulty, request.max_difficulty],
                "revenue_potential": request.revenue_potential
            },
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Erreur lors de la recherche POST de produits: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la recherche de produits: {str(e)}"
        )

@router.get("/categories")
async def get_product_categories() -> Dict[str, Any]:
    """
    Retourne les catégories de produits disponibles
    
    Returns:
        Liste des catégories avec leurs descriptions
    """
    categories = {
        "saas": {
            "name": "Software as a Service",
            "description": "Applications web/logiciels en ligne avec abonnement récurrent",
            "examples": ["CRM", "Project Management", "Analytics Tools"],
            "typical_pricing": "$29-299/mois",
            "development_time": "3-12 mois",
            "revenue_model": "Subscription"
        },
        "info": {
            "name": "Produits d'Information",
            "description": "Cours, ebooks, guides, formations en ligne",
            "examples": ["Online Courses", "Ebooks", "Video Tutorials"],
            "typical_pricing": "$49-497",
            "development_time": "1-3 mois",
            "revenue_model": "One-time sale"
        },
        "service": {
            "name": "Services Digitaux",
            "description": "Services automatisés ou semi-automatisés",
            "examples": ["Consulting", "Automation", "Content Creation"],
            "typical_pricing": "$500-5000/projet",
            "development_time": "1-6 mois",
            "revenue_model": "Project-based"
        }
    }
    
    return {
        "categories": categories,
        "total_categories": len(categories)
    }

@router.get("/trending")
async def get_trending_products(
    category: Optional[str] = Query(None, description="Catégorie de produits"),
    limit: int = Query(10, description="Nombre de produits à retourner", ge=1, le=50)
) -> Dict[str, Any]:
    """
    Retourne les produits digitaux les plus trending
    
    Args:
        category: Catégorie de produits à filtrer (optionnel)
        limit: Nombre maximum de produits à retourner
    
    Returns:
        Liste des produits trending
    """
    try:
        # Simulation de données trending (en production, cela viendrait d'une vraie API)
        trending_products = [
            {
                "name": "AI Content Generator Pro",
                "type": "saas",
                "category": "Content Creation",
                "trend_score": 95,
                "market_size": "Large",
                "competition": "Medium",
                "monthly_searches": 45000
            },
            {
                "name": "Remote Team Builder Course",
                "type": "info",
                "category": "Business Training",
                "trend_score": 88,
                "market_size": "Medium",
                "competition": "Low",
                "monthly_searches": 12000
            },
            {
                "name": "No-Code App Development Service",
                "type": "service",
                "category": "Development",
                "trend_score": 82,
                "market_size": "Large",
                "competition": "Medium",
                "monthly_searches": 28000
            },
            {
                "name": "Sustainable Business Analytics",
                "type": "saas",
                "category": "Analytics",
                "trend_score": 78,
                "market_size": "Medium",
                "competition": "Low",
                "monthly_searches": 8500
            },
            {
                "name": "Digital Wellness Coaching Program",
                "type": "info",
                "category": "Health & Wellness",
                "trend_score": 75,
                "market_size": "Medium",
                "competition": "Medium",
                "monthly_searches": 15000
            }
        ]
        
        # Filtrage par catégorie si spécifiée
        if category:
            trending_products = [p for p in trending_products if p["type"] == category]
        
        return {
            "trending_products": trending_products[:limit],
            "category": category,
            "last_updated": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des produits trending: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la récupération des produits trending"
        )

def _filter_products(
    products: List[Dict[str, Any]], 
    criteria: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Filtre les produits selon les critères spécifiés
    
    Args:
        products: Liste des produits à filtrer
        criteria: Critères de filtrage
    
    Returns:
        Liste des produits filtrés
    """
    filtered = []
    
    for product in products:
        # Filtrage par type
        if criteria["product_types"] and product.get("type") not in criteria["product_types"]:
            continue
        
        # Filtrage par difficulté
        difficulty = product.get("difficulty", 5)
        if difficulty < criteria["min_difficulty"] or difficulty > criteria["max_difficulty"]:
            continue
        
        # Filtrage par potentiel de revenus
        if criteria["revenue_potential"] != "any":
            revenue_potential = product.get("revenue_potential", "medium").lower()
            if revenue_potential != criteria["revenue_potential"].lower():
                continue
        
        filtered.append(product)
    
    return filtered

async def _enrich_products_data(products: List[Dict[str, Any]], topic: str) -> List[Dict[str, Any]]:
    """
    Enrichit les données des produits avec des informations supplémentaires
    
    Args:
        products: Liste des produits à enrichir
        topic: Le sujet principal
    
    Returns:
        Liste des produits enrichis
    """
    enriched = []
    
    for product in products:
        # Ajout d'informations supplémentaires
        enriched_product = product.copy()
        enriched_product.update({
            "market_research": {
                "competitor_count": _get_competitor_count(product.get("type", "saas")),
                "market_maturity": _get_market_maturity(product.get("type", "saas")),
                "customer_acquisition_cost": _get_cac_estimate(product.get("type", "saas"))
            },
            "success_metrics": {
                "break_even_time": _get_break_even_estimate(product),
                "success_probability": _get_success_probability(product),
                "scalability_score": _get_scalability_score(product)
            },
            "recommendations": _get_product_recommendations(product, topic)
        })
        
        enriched.append(enriched_product)
    
    return enriched

def _get_competitor_count(product_type: str) -> str:
    """Retourne une estimation du nombre de concurrents"""
    competitors = {
        "saas": "High (500+)",
        "info": "Medium (100-500)",
        "service": "Low (10-100)"
    }
    return competitors.get(product_type, "Unknown")

def _get_market_maturity(product_type: str) -> str:
    """Retourne le niveau de maturité du marché"""
    maturity = {
        "saas": "Mature",
        "info": "Growing",
        "service": "Emerging"
    }
    return maturity.get(product_type, "Unknown")

def _get_cac_estimate(product_type: str) -> str:
    """Retourne une estimation du coût d'acquisition client"""
    cac = {
        "saas": "$50-200",
        "info": "$10-50",
        "service": "$100-500"
    }
    return cac.get(product_type, "Unknown")

def _get_break_even_estimate(product: Dict[str, Any]) -> str:
    """Estime le temps de break-even"""
    difficulty = product.get("difficulty", 5)
    revenue_potential = product.get("revenue_potential", "medium")
    
    if revenue_potential == "high" and difficulty <= 6:
        return "3-6 mois"
    elif revenue_potential == "medium":
        return "6-12 mois"
    else:
        return "12+ mois"

def _get_success_probability(product: Dict[str, Any]) -> str:
    """Estime la probabilité de succès"""
    difficulty = product.get("difficulty", 5)
    revenue_potential = product.get("revenue_potential", "medium")
    
    if revenue_potential == "high" and difficulty <= 5:
        return "High (70-80%)"
    elif revenue_potential == "medium" and difficulty <= 7:
        return "Medium (50-70%)"
    else:
        return "Low (20-50%)"

def _get_scalability_score(product: Dict[str, Any]) -> str:
    """Calcule un score de scalabilité"""
    product_type = product.get("type", "saas")
    
    if product_type == "saas":
        return "High (9/10)"
    elif product_type == "info":
        return "Medium (6/10)"
    else:
        return "Low (4/10)"

def _get_product_recommendations(product: Dict[str, Any], topic: str) -> List[str]:
    """Génère des recommandations pour le produit"""
    recommendations = [
        f"Focus sur la différenciation dans le domaine {topic}",
        "Développer un MVP rapidement pour valider le marché",
        "Investir dans le marketing digital dès le lancement"
    ]
    
    if product.get("difficulty", 5) > 7:
        recommendations.append("Considérer un partenariat technique")
    
    if product.get("revenue_potential") == "high":
        recommendations.append("Prévoir un budget marketing important")
    
    return recommendations
