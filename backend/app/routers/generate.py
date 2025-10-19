"""
Router pour la génération d'offres et d'annonces publicitaires
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
import logging

from app.ai_engine import ai_engine

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Création du router
router = APIRouter()

class GenerateOfferRequest(BaseModel):
    """Modèle pour les requêtes de génération d'offres"""
    topic: str
    product: Dict[str, Any]
    target_audience: Optional[str] = None
    tone: Optional[str] = "professional"  # professional, casual, urgent, friendly
    include_landing_page: bool = True
    include_email_sequence: bool = True

class GenerateOfferResponse(BaseModel):
    """Modèle pour les réponses de génération d'offres"""
    topic: str
    product: Dict[str, Any]
    offer: Dict[str, Any]
    status: str

class GenerateAdsRequest(BaseModel):
    """Modèle pour les requêtes de génération d'annonces"""
    topic: str
    offer: Dict[str, Any]
    platforms: List[str] = ["facebook", "google", "linkedin", "twitter", "tiktok"]
    budget_range: Optional[str] = "medium"  # low, medium, high
    target_audience: Optional[str] = None

class GenerateAdsResponse(BaseModel):
    """Modèle pour les réponses de génération d'annonces"""
    topic: str
    offer: Dict[str, Any]
    ads: List[Dict[str, Any]]
    status: str

@router.post("/offer")
async def generate_offer(request: GenerateOfferRequest) -> GenerateOfferResponse:
    """
    Génère une offre complète (titre, promesse, bullets, landing page, email)
    
    Args:
        request: Paramètres de génération d'offre
        
    Returns:
        Offre complète générée
    """
    try:
        logger.info(f"Génération d'offre pour le topic: {request.topic}")
        
        # Génération de l'offre via IA
        offer = await ai_engine.generate_offer(request.topic, request.product)
        
        # Enrichissement avec les paramètres spécifiés
        enriched_offer = _enrich_offer_with_parameters(offer, request)
        
        return GenerateOfferResponse(
            topic=request.topic,
            product=request.product,
            offer=enriched_offer,
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération d'offre pour {request.topic}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération d'offre: {str(e)}"
        )

@router.post("/ads")
async def generate_ads(request: GenerateAdsRequest) -> GenerateAdsResponse:
    """
    Génère des drafts d'annonces publicitaires pour différentes plateformes
    
    Args:
        request: Paramètres de génération d'annonces
        
    Returns:
        Liste d'annonces générées
    """
    try:
        logger.info(f"Génération d'annonces pour le topic: {request.topic}")
        
        # Génération des annonces via IA
        ads = await ai_engine.generate_ads(request.topic, request.offer)
        
        # Filtrage selon les plateformes demandées
        filtered_ads = _filter_ads_by_platforms(ads, request.platforms)
        
        # Enrichissement avec les paramètres spécifiés
        enriched_ads = _enrich_ads_with_parameters(filtered_ads, request)
        
        return GenerateAdsResponse(
            topic=request.topic,
            offer=request.offer,
            ads=enriched_ads,
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération d'annonces pour {request.topic}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération d'annonces: {str(e)}"
        )

@router.get("/offer/templates")
async def get_offer_templates() -> Dict[str, Any]:
    """
    Retourne des templates d'offres disponibles
    
    Returns:
        Templates d'offres avec leurs caractéristiques
    """
    templates = {
        "saas_launch": {
            "name": "SaaS Launch Template",
            "description": "Template pour le lancement d'un produit SaaS",
            "structure": {
                "title": "Hook + Benefit + Urgency",
                "value_proposition": "Problem + Solution + Outcome",
                "benefits": ["Quantified benefit 1", "Quantified benefit 2", "Quantified benefit 3"],
                "landing_page": "Problem-focused + Social proof + Clear CTA",
                "email": "Welcome + Value + Next steps"
            },
            "best_for": ["SaaS products", "Software tools", "Digital platforms"]
        },
        "info_product": {
            "name": "Information Product Template",
            "description": "Template pour les produits d'information",
            "structure": {
                "title": "Transformation + Specific outcome",
                "value_proposition": "Current state + Desired state + How",
                "benefits": ["Specific result 1", "Specific result 2", "Specific result 3"],
                "landing_page": "Story + Authority + Guarantee + CTA",
                "email": "Personal story + Value preview + Purchase link"
            },
            "best_for": ["Online courses", "Ebooks", "Video tutorials", "Coaching programs"]
        },
        "service_offer": {
            "name": "Service Offer Template",
            "description": "Template pour les offres de service",
            "structure": {
                "title": "Outcome + Timeframe + Guarantee",
                "value_proposition": "Challenge + Expertise + Result",
                "benefits": ["Deliverable 1", "Deliverable 2", "Deliverable 3"],
                "landing_page": "Case study + Process + Investment + CTA",
                "email": "Consultation offer + Portfolio + Next steps"
            },
            "best_for": ["Consulting", "Agency services", "Custom development", "Coaching"]
        }
    }
    
    return {
        "templates": templates,
        "total_templates": len(templates),
        "usage_notes": "Ces templates peuvent être utilisés comme base pour la génération automatique d'offres"
    }

@router.get("/ads/platforms")
async def get_ad_platforms() -> Dict[str, Any]:
    """
    Retourne les plateformes publicitaires supportées
    
    Returns:
        Plateformes avec leurs spécifications
    """
    platforms = {
        "facebook": {
            "name": "Facebook & Instagram",
            "ad_types": ["Feed", "Stories", "Reels", "Carousel"],
            "character_limits": {
                "headline": 40,
                "description": 125,
                "cta": 20
            },
            "best_for": ["B2C", "E-commerce", "Lead generation"],
            "budget_range": "$5-500/day"
        },
        "google": {
            "name": "Google Ads",
            "ad_types": ["Search", "Display", "Video", "Shopping"],
            "character_limits": {
                "headline": 30,
                "description": 90,
                "cta": 25
            },
            "best_for": ["B2B", "High-intent traffic", "Lead generation"],
            "budget_range": "$10-1000/day"
        },
        "linkedin": {
            "name": "LinkedIn Ads",
            "ad_types": ["Sponsored Content", "Message Ads", "Dynamic Ads"],
            "character_limits": {
                "headline": 70,
                "description": 600,
                "cta": 25
            },
            "best_for": ["B2B", "Professional services", "Recruitment"],
            "budget_range": "$20-2000/day"
        },
        "twitter": {
            "name": "Twitter/X Ads",
            "ad_types": ["Promoted Tweets", "Promoted Accounts", "Promoted Trends"],
            "character_limits": {
                "headline": 280,
                "description": "N/A",
                "cta": 280
            },
            "best_for": ["Real-time engagement", "News", "Community building"],
            "budget_range": "$10-500/day"
        },
        "tiktok": {
            "name": "TikTok Ads",
            "ad_types": ["In-Feed", "Brand Takeover", "Hashtag Challenge"],
            "character_limits": {
                "headline": 100,
                "description": 220,
                "cta": 30
            },
            "best_for": ["Gen Z", "Viral content", "Brand awareness"],
            "budget_range": "$20-1000/day"
        }
    }
    
    return {
        "platforms": platforms,
        "total_platforms": len(platforms),
        "recommendations": {
            "b2b": ["linkedin", "google"],
            "b2c": ["facebook", "tiktok", "twitter"],
            "ecommerce": ["facebook", "google"],
            "services": ["linkedin", "google", "facebook"]
        }
    }

def _enrich_offer_with_parameters(offer: Dict[str, Any], request: GenerateOfferRequest) -> Dict[str, Any]:
    """Enrichit l'offre avec les paramètres spécifiés"""
    enriched = offer.copy()
    
    # Ajout des paramètres de génération
    enriched["generation_parameters"] = {
        "target_audience": request.target_audience,
        "tone": request.tone,
        "include_landing_page": request.include_landing_page,
        "include_email_sequence": request.include_email_sequence
    }
    
    # Adaptation du ton si spécifié
    if request.tone != "professional":
        enriched["tone_adaptation"] = f"Adapté pour un ton {request.tone}"
    
    # Ajout de métadonnées
    enriched["metadata"] = {
        "generated_at": "2024-01-01T00:00:00Z",
        "version": "1.0",
        "ai_model": "gpt-3.5-turbo"
    }
    
    return enriched

def _enrich_ads_with_parameters(ads: List[Dict[str, Any]], request: GenerateAdsRequest) -> List[Dict[str, Any]]:
    """Enrichit les annonces avec les paramètres spécifiés"""
    enriched_ads = []
    
    for ad in ads:
        enriched_ad = ad.copy()
        
        # Adaptation du budget selon la gamme spécifiée
        budget_multiplier = {
            "low": 0.5,
            "medium": 1.0,
            "high": 2.0
        }.get(request.budget_range, 1.0)
        
        if "suggested_budget" in enriched_ad:
            # Parse et ajuste le budget
            budget_str = enriched_ad["suggested_budget"]
            if "$" in budget_str and "/jour" in budget_str:
                try:
                    amount = float(budget_str.split("$")[1].split("/")[0])
                    new_amount = amount * budget_multiplier
                    enriched_ad["suggested_budget"] = f"${new_amount:.0f}/jour"
                except:
                    pass
        
        # Ajout des paramètres de génération
        enriched_ad["generation_parameters"] = {
            "target_audience": request.target_audience,
            "budget_range": request.budget_range,
            "platforms": request.platforms
        }
        
        enriched_ads.append(enriched_ad)
    
    return enriched_ads

def _filter_ads_by_platforms(ads: List[Dict[str, Any]], platforms: List[str]) -> List[Dict[str, Any]]:
    """Filtre les annonces selon les plateformes demandées"""
    platform_mapping = {
        "facebook": "Facebook",
        "google": "Google Ads",
        "linkedin": "LinkedIn",
        "twitter": "Twitter",
        "tiktok": "TikTok"
    }
    
    target_platforms = [platform_mapping.get(p.lower(), p) for p in platforms]
    
    filtered_ads = []
    for ad in ads:
        if ad.get("platform") in target_platforms:
            filtered_ads.append(ad)
    
    return filtered_ads
