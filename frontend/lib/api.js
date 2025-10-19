/**
 * Module API pour communiquer avec le backend FastAPI
 * Gère toutes les requêtes HTTP vers l'API backend
 */

import axios from 'axios';

// Configuration de base d'axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Ajout d'un timestamp pour éviter le cache
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    // Log des requêtes en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    // Log des réponses en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error);
    
    // Gestion des erreurs communes
    if (error.response?.status === 401) {
      // Redirection vers la page de connexion si nécessaire
      console.warn('🔐 Non autorisé - redirection vers la connexion');
    } else if (error.response?.status >= 500) {
      // Erreur serveur
      console.error('🔥 Erreur serveur:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

/**
 * API pour la recherche de tendances
 */
export const topicsAPI = {
  /**
   * Recherche de tendances pour un topic
   * @param {string} topic - Le sujet à analyser
   * @param {Object} options - Options de recherche
   * @returns {Promise<Object>} Analyse des tendances
   */
  searchTrends: async (topic, options = {}) => {
    try {
      const response = await api.get('/api/topics/search', {
        params: {
          topic,
          include_google_trends: options.includeGoogleTrends ?? true,
          include_reddit: options.includeReddit ?? true,
          include_serp: options.includeSerp ?? true,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de tendances:', error);
      throw error;
    }
  },

  /**
   * Recherche POST de tendances avec body JSON
   * @param {Object} request - Objet de requête
   * @returns {Promise<Object>} Analyse des tendances
   */
  searchTrendsPost: async (request) => {
    try {
      const response = await api.post('/api/topics/search', request);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche POST de tendances:', error);
      throw error;
    }
  },

  /**
   * Récupère les topics trending
   * @param {number} limit - Nombre de topics à retourner
   * @returns {Promise<Object>} Liste des topics trending
   */
  getTrendingTopics: async (limit = 10) => {
    try {
      const response = await api.get('/api/topics/trending', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des topics trending:', error);
      throw error;
    }
  },
};

/**
 * API pour la recherche de produits
 */
export const productsAPI = {
  /**
   * Recherche de produits digitaux
   * @param {string} topic - Le sujet principal
   * @param {Object} options - Options de recherche
   * @returns {Promise<Object>} Liste de produits recommandés
   */
  searchProducts: async (topic, options = {}) => {
    try {
      const response = await api.get('/api/products/search', {
        params: {
          topic,
          trends: options.trends?.join(','),
          product_types: options.productTypes?.join(',') || 'saas,info,service',
          min_difficulty: options.minDifficulty || 1,
          max_difficulty: options.maxDifficulty || 10,
          revenue_potential: options.revenuePotential || 'any',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de produits:', error);
      throw error;
    }
  },

  /**
   * Recherche POST de produits avec body JSON
   * @param {Object} request - Objet de requête
   * @returns {Promise<Object>} Liste de produits recommandés
   */
  searchProductsPost: async (request) => {
    try {
      const response = await api.post('/api/products/search', request);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche POST de produits:', error);
      throw error;
    }
  },

  /**
   * Récupère les catégories de produits
   * @returns {Promise<Object>} Catégories disponibles
   */
  getCategories: async () => {
    try {
      const response = await api.get('/api/products/categories');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  },

  /**
   * Récupère les produits trending
   * @param {string} category - Catégorie à filtrer (optionnel)
   * @param {number} limit - Nombre de produits à retourner
   * @returns {Promise<Object>} Liste des produits trending
   */
  getTrendingProducts: async (category = null, limit = 10) => {
    try {
      const response = await api.get('/api/products/trending', {
        params: { category, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits trending:', error);
      throw error;
    }
  },
};

/**
 * API pour la génération de contenu
 */
export const generateAPI = {
  /**
   * Génère une offre complète
   * @param {Object} request - Paramètres de génération d'offre
   * @returns {Promise<Object>} Offre générée
   */
  generateOffer: async (request) => {
    try {
      const response = await api.post('/api/generate/offer', request);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération d\'offre:', error);
      throw error;
    }
  },

  /**
   * Génère des annonces publicitaires
   * @param {Object} request - Paramètres de génération d'annonces
   * @returns {Promise<Object>} Annonces générées
   */
  generateAds: async (request) => {
    try {
      const response = await api.post('/api/generate/ads', request);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération d\'annonces:', error);
      throw error;
    }
  },

  /**
   * Génère une campagne complète
   * @param {string} topic - Le sujet principal
   * @param {Object} product - Les détails du produit
   * @param {Array} platforms - Plateformes publicitaires
   * @param {string} budgetRange - Gamme de budget
   * @returns {Promise<Object>} Campagne complète
   */
  generateCompleteCampaign: async (topic, product, platforms = ['facebook', 'google'], budgetRange = 'medium') => {
    try {
      const response = await api.post('/api/generate/complete', null, {
        params: { topic, platforms: platforms.join(','), budget_range: budgetRange },
        data: product,
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération de campagne complète:', error);
      throw error;
    }
  },

  /**
   * Récupère les templates d'offres
   * @returns {Promise<Object>} Templates disponibles
   */
  getOfferTemplates: async () => {
    try {
      const response = await api.get('/api/generate/offer/templates');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      throw error;
    }
  },

  /**
   * Récupère les plateformes publicitaires
   * @returns {Promise<Object>} Plateformes disponibles
   */
  getAdPlatforms: async () => {
    try {
      const response = await api.get('/api/generate/ads/platforms');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des plateformes:', error);
      throw error;
    }
  },
};

/**
 * API pour la santé et les informations système
 */
export const systemAPI = {
  /**
   * Vérifie l'état de l'API
   * @returns {Promise<Object>} État de l'API
   */
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du health check:', error);
      throw error;
    }
  },

  /**
   * Récupère les informations de l'API
   * @returns {Promise<Object>} Informations de l'API
   */
  getInfo: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des infos:', error);
      throw error;
    }
  },
};

/**
 * Utilitaires pour la gestion des erreurs
 */
export const errorUtils = {
  /**
   * Extrait le message d'erreur d'une réponse API
   * @param {Error} error - Erreur de l'API
   * @returns {string} Message d'erreur
   */
  getErrorMessage: (error) => {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Une erreur inattendue s\'est produite';
  },

  /**
   * Vérifie si une erreur est une erreur réseau
   * @param {Error} error - Erreur à vérifier
   * @returns {boolean} True si c'est une erreur réseau
   */
  isNetworkError: (error) => {
    return !error.response && error.request;
  },

  /**
   * Vérifie si une erreur est une erreur de timeout
   * @param {Error} error - Erreur à vérifier
   * @returns {boolean} True si c'est une erreur de timeout
   */
  isTimeoutError: (error) => {
    return error.code === 'ECONNABORTED' || error.message.includes('timeout');
  },
};

// Export par défaut de l'instance axios configurée
export default api;
