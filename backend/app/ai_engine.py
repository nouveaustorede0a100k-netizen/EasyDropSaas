"""
Module central pour l'intégration OpenAI et la génération de contenu IA
"""

import os
import json
from typing import Dict, List, Optional, Any
from openai import OpenAI
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIEngine:
    """
    Classe principale pour gérer toutes les interactions avec OpenAI
    """
    
    def __init__(self):
        """
        Initialisation du client OpenAI avec la clé API
        """
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-3.5-turbo"  # Modèle par défaut, peut être configuré
    
    async def generate_trends_analysis(self, topic: str) -> Dict[str, Any]:
        """
        Génère une analyse des tendances pour un topic donné
        
        Args:
            topic: Le sujet/thématique à analyser
            
        Returns:
            Dict contenant l'analyse des tendances
        """
        try:
            prompt = f"""
            Analyse les tendances actuelles pour le sujet "{topic}" et fournis:
            1. Les tendances montantes (3-5 points)
            2. Les opportunités de marché
            3. Les défis potentiels
            4. Le niveau de concurrence (faible/moyen/élevé)
            5. La faisabilité technique (1-10)
            
            Format de réponse en JSON:
            {{
                "trending_topics": ["tendance1", "tendance2", ...],
                "market_opportunities": ["opp1", "opp2", ...],
                "challenges": ["défi1", "défi2", ...],
                "competition_level": "faible/moyen/élevé",
                "technical_feasibility": 8,
                "market_potential": "élevé/moyen/faible"
            }}
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Tu es un expert en analyse de marché et tendances digitales."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse de la réponse JSON
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération de l'analyse des tendances: {e}")
            return self._get_fallback_trends(topic)
    
    async def discover_digital_products(self, topic: str, trends: List[str]) -> List[Dict[str, Any]]:
        """
        Découvre 3 produits digitaux "gagnants" basés sur le topic et les tendances
        
        Args:
            topic: Le sujet principal
            trends: Liste des tendances identifiées
            
        Returns:
            Liste de 3 produits digitaux avec leurs caractéristiques
        """
        try:
            trends_str = ", ".join(trends)
            prompt = f"""
            Basé sur le sujet "{topic}" et les tendances "{trends_str}", 
            propose 3 produits digitaux "gagnants" avec:
            
            1. Un produit SaaS (logiciel en ligne)
            2. Un produit d'information (cours, ebook, etc.)
            3. Un produit de service digital
            
            Pour chaque produit, fournis:
            - Nom du produit
            - Description courte
            - Prix suggéré
            - Difficulté de création (1-10)
            - Potentiel de revenus (faible/moyen/élevé)
            - Technologies nécessaires
            - Temps de développement estimé
            
            Format JSON:
            {{
                "products": [
                    {{
                        "name": "Nom du produit",
                        "type": "saas/info/service",
                        "description": "Description",
                        "suggested_price": "99$/mois",
                        "difficulty": 7,
                        "revenue_potential": "élevé",
                        "technologies": ["React", "Node.js", "PostgreSQL"],
                        "development_time": "3-6 mois",
                        "target_audience": "audience cible"
                    }}
                ]
            }}
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Tu es un expert en création de produits digitaux et entrepreneuriat."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            return result.get("products", [])
            
        except Exception as e:
            logger.error(f"Erreur lors de la découverte de produits: {e}")
            return self._get_fallback_products(topic)
    
    async def generate_offer(self, topic: str, product: Dict[str, Any]) -> Dict[str, Any]:
        """
        Génère une offre complète (titre, promesse, bullets, landing page, email)
        
        Args:
            topic: Le sujet principal
            product: Les détails du produit sélectionné
            
        Returns:
            Dict contenant l'offre complète
        """
        try:
            product_info = f"Produit: {product['name']} - {product['description']}"
            
            prompt = f"""
            Crée une offre marketing complète pour le sujet "{topic}" et le produit:
            {product_info}
            
            Génère:
            1. Un titre accrocheur (max 60 caractères)
            2. Une promesse de valeur principale
            3. 5 bullets points de bénéfices
            4. Un texte de landing page (300-500 mots)
            5. Un email de séquence de bienvenue
            6. Un call-to-action principal
            7. Des mots-clés SEO (5-8 mots)
            
            Format JSON:
            {{
                "title": "Titre accrocheur",
                "value_proposition": "Promesse de valeur",
                "benefits": ["bénéfice 1", "bénéfice 2", ...],
                "landing_page_text": "Texte complet de la landing page...",
                "welcome_email": {{
                    "subject": "Sujet de l'email",
                    "content": "Contenu de l'email..."
                }},
                "cta_primary": "Call-to-action principal",
                "seo_keywords": ["mot1", "mot2", ...]
            }}
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Tu es un expert en copywriting et marketing digital."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération de l'offre: {e}")
            return self._get_fallback_offer(topic, product)
    
    async def generate_ads(self, topic: str, offer: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Génère des drafts d'annonces publicitaires pour différentes plateformes
        
        Args:
            topic: Le sujet principal
            offer: L'offre générée précédemment
            
        Returns:
            Liste d'annonces pour différentes plateformes
        """
        try:
            offer_info = f"Titre: {offer.get('title', '')} - Promesse: {offer.get('value_proposition', '')}"
            
            prompt = f"""
            Crée des drafts d'annonces publicitaires pour le sujet "{topic}" et l'offre:
            {offer_info}
            
            Génère des annonces pour:
            1. Facebook/Instagram (format feed)
            2. Google Ads (recherche)
            3. LinkedIn (B2B)
            4. Twitter/X (promoted tweet)
            5. TikTok (créatif court)
            
            Pour chaque plateforme, fournis:
            - Titre/Headline
            - Description/Description text
            - Call-to-action
            - Mots-clés suggérés
            - Audience cible
            - Budget suggéré (quotidien)
            
            Format JSON:
            {{
                "ads": [
                    {{
                        "platform": "Facebook",
                        "headline": "Titre de l'annonce",
                        "description": "Description de l'annonce",
                        "cta": "Call-to-action",
                        "keywords": ["mot1", "mot2"],
                        "target_audience": "audience cible",
                        "suggested_budget": "50$/jour"
                    }}
                ]
            }}
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Tu es un expert en publicité digitale et performance marketing."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            return result.get("ads", [])
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération des annonces: {e}")
            return self._get_fallback_ads(topic, offer)
    
    def _get_fallback_trends(self, topic: str) -> Dict[str, Any]:
        """Retourne des données de tendances par défaut en cas d'erreur"""
        return {
            "trending_topics": [f"Tendance 1 pour {topic}", f"Tendance 2 pour {topic}"],
            "market_opportunities": [f"Opportunité 1 dans {topic}", f"Opportunité 2 dans {topic}"],
            "challenges": ["Concurrence", "Difficulté technique"],
            "competition_level": "moyen",
            "technical_feasibility": 6,
            "market_potential": "moyen"
        }
    
    def _get_fallback_products(self, topic: str) -> List[Dict[str, Any]]:
        """Retourne des produits par défaut en cas d'erreur"""
        return [
            {
                "name": f"SaaS {topic} Pro",
                "type": "saas",
                "description": f"Solution SaaS pour {topic}",
                "suggested_price": "29$/mois",
                "difficulty": 7,
                "revenue_potential": "élevé",
                "technologies": ["React", "Node.js", "PostgreSQL"],
                "development_time": "3-6 mois",
                "target_audience": f"Professionnels de {topic}"
            }
        ]
    
    def _get_fallback_offer(self, topic: str, product: Dict[str, Any]) -> Dict[str, Any]:
        """Retourne une offre par défaut en cas d'erreur"""
        return {
            "title": f"Transformez votre {topic} en succès",
            "value_proposition": f"Solution complète pour {topic}",
            "benefits": ["Bénéfice 1", "Bénéfice 2", "Bénéfice 3"],
            "landing_page_text": f"Texte de landing page pour {topic}...",
            "welcome_email": {
                "subject": f"Bienvenue dans {topic}",
                "content": f"Email de bienvenue pour {topic}..."
            },
            "cta_primary": "Commencer maintenant",
            "seo_keywords": [topic, "solution", "digital"]
        }
    
    def _get_fallback_ads(self, topic: str, offer: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Retourne des annonces par défaut en cas d'erreur"""
        return [
            {
                "platform": "Facebook",
                "headline": f"Découvrez {topic}",
                "description": f"Solution pour {topic}",
                "cta": "En savoir plus",
                "keywords": [topic],
                "target_audience": f"Intéressés par {topic}",
                "suggested_budget": "30$/jour"
            }
        ]

# Instance globale du moteur IA
ai_engine = AIEngine()
