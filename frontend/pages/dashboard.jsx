/**
 * Dashboard - Page de résultats et de gestion des projets
 * Affiche les résultats de l'analyse et permet de générer du contenu supplémentaire
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  LightBulbIcon,
  SparklesIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  ShareIcon,
  DownloadIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { generateAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [additionalContent, setAdditionalContent] = useState({
    templates: null,
    platforms: null,
  });

  // Chargement des résultats depuis l'URL
  useEffect(() => {
    if (router.query.results) {
      try {
        const parsedResults = JSON.parse(router.query.results);
        setResults(parsedResults);
      } catch (error) {
        console.error('Erreur lors du parsing des résultats:', error);
        toast.error('Erreur lors du chargement des résultats');
      }
    }
  }, [router.query.results]);

  // Chargement des templates et plateformes
  useEffect(() => {
    const loadAdditionalData = async () => {
      try {
        const [templates, platforms] = await Promise.all([
          generateAPI.getOfferTemplates(),
          generateAPI.getAdPlatforms(),
        ]);
        setAdditionalContent({ templates, platforms });
      } catch (error) {
        console.error('Erreur lors du chargement des données supplémentaires:', error);
      }
    };

    loadAdditionalData();
  }, []);

  // Gestion de la génération de contenu supplémentaire
  const handleGenerateMore = async (type) => {
    if (!results) return;

    setIsGenerating(true);
    try {
      let newContent;
      
      if (type === 'more-ads') {
        newContent = await generateAPI.generateAds({
          topic: results.topic,
          offer: results.offer.offer,
          platforms: ['twitter', 'tiktok', 'instagram'],
          budget_range: 'high',
        });
        toast.success('Annonces supplémentaires générées!');
      } else if (type === 'complete-campaign') {
        newContent = await generateAPI.generateCompleteCampaign(
          results.topic,
          results.products.products[0],
          ['facebook', 'google', 'linkedin', 'twitter', 'tiktok'],
          'high'
        );
        toast.success('Campagne complète générée!');
      }

      // Mise à jour des résultats
      setResults(prev => ({
        ...prev,
        [type]: newContent,
      }));
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast.error('Erreur lors de la génération de contenu supplémentaire');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export des résultats
  const handleExport = (format = 'json') => {
    if (!results) return;

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saas-ideas-${results.topic}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Résultats exportés avec succès!');
  };

  if (!results) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: ChartBarIcon },
    { id: 'trends', name: 'Tendances', icon: ChartBarIcon },
    { id: 'products', name: 'Produits', icon: LightBulbIcon },
    { id: 'offer', name: 'Offre', icon: SparklesIcon },
    { id: 'ads', name: 'Annonces', icon: RocketLaunchIcon },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - {results.topic} | SaaS Idea-to-Launch</title>
        <meta name="description" content={`Résultats d'analyse pour ${results.topic}`} />
      </Head>

      <div className="min-h-screen bg-secondary-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-secondary-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="text-secondary-600 hover:text-secondary-900"
                >
                  ← Retour
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-secondary-900">
                    Dashboard - {results.topic}
                  </h1>
                  <p className="text-secondary-600">
                    Généré le {new Date(results.generatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleExport('json')}
                  className="btn-secondary btn-sm flex items-center space-x-2"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span>Exporter</span>
                </button>
                <button className="btn-primary btn-sm flex items-center space-x-2">
                  <ShareIcon className="h-4 w-4" />
                  <span>Partager</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Navigation par onglets */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 mb-8">
            <nav className="flex space-x-8 px-6 py-4 border-b border-secondary-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>

            {/* Contenu des onglets */}
            <div className="p-6">
              {/* Vue d'ensemble */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="card p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <ChartBarIcon className="h-8 w-8 text-primary-600" />
                        <h3 className="text-lg font-semibold">Tendances identifiées</h3>
                      </div>
                      <p className="text-3xl font-bold text-primary-600 mb-2">
                        {results.trends?.trends_analysis?.trending_topics?.length || 0}
                      </p>
                      <p className="text-secondary-600">
                        Opportunités de marché découvertes
                      </p>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <LightBulbIcon className="h-8 w-8 text-success-600" />
                        <h3 className="text-lg font-semibold">Produits recommandés</h3>
                      </div>
                      <p className="text-3xl font-bold text-success-600 mb-2">
                        {results.products?.products?.length || 0}
                      </p>
                      <p className="text-secondary-600">
                        Produits digitaux gagnants
                      </p>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <RocketLaunchIcon className="h-8 w-8 text-warning-600" />
                        <h3 className="text-lg font-semibold">Annonces créées</h3>
                      </div>
                      <p className="text-3xl font-bold text-warning-600 mb-2">
                        {results.ads?.ads?.length || 0}
                      </p>
                      <p className="text-secondary-600">
                        Campagnes publicitaires
                      </p>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                      Actions rapides
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleGenerateMore('more-ads')}
                        disabled={isGenerating}
                        className="btn-outline flex items-center justify-center space-x-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Plus d'annonces</span>
                      </button>
                      
                      <button
                        onClick={() => handleGenerateMore('complete-campaign')}
                        disabled={isGenerating}
                        className="btn-primary flex items-center justify-center space-x-2"
                      >
                        <RocketLaunchIcon className="h-4 w-4" />
                        <span>Campagne complète</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('offer')}
                        className="btn-secondary flex items-center justify-center space-x-2"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                        <span>Voir l'offre</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tendances */}
              {activeTab === 'trends' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold text-secondary-900 mb-6">
                    Analyse des tendances - {results.topic}
                  </h3>
                  
                  {results.trends?.trends_analysis && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="card p-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-success-600" />
                          <span>Tendances montantes</span>
                        </h4>
                        <ul className="space-y-2">
                          {results.trends.trends_analysis.trending_topics?.map((trend, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                              <span className="text-secondary-700">{trend}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="card p-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                          <LightBulbIcon className="h-5 w-5 text-warning-600" />
                          <span>Opportunités de marché</span>
                        </h4>
                        <ul className="space-y-2">
                          {results.trends.trends_analysis.market_opportunities?.map((opportunity, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-success-600 rounded-full"></div>
                              <span className="text-secondary-700">{opportunity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="card p-6">
                      <h4 className="text-lg font-semibold mb-4">Niveau de concurrence</h4>
                      <p className="text-2xl font-bold text-secondary-900 capitalize">
                        {results.trends?.trends_analysis?.competition_level || 'N/A'}
                      </p>
                    </div>

                    <div className="card p-6">
                      <h4 className="text-lg font-semibold mb-4">Faisabilité technique</h4>
                      <p className="text-2xl font-bold text-secondary-900">
                        {results.trends?.trends_analysis?.technical_feasibility || 'N/A'}/10
                      </p>
                    </div>

                    <div className="card p-6">
                      <h4 className="text-lg font-semibold mb-4">Potentiel de marché</h4>
                      <p className="text-2xl font-bold text-secondary-900 capitalize">
                        {results.trends?.trends_analysis?.market_potential || 'N/A'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Produits */}
              {activeTab === 'products' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold text-secondary-900 mb-6">
                    Produits digitaux recommandés
                  </h3>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.products?.products?.map((product, index) => (
                      <div key={index} className="card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-semibold text-secondary-900">
                            {product.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.type === 'saas' ? 'bg-primary-100 text-primary-800' :
                            product.type === 'info' ? 'bg-success-100 text-success-800' :
                            'bg-warning-100 text-warning-800'
                          }`}>
                            {product.type}
                          </span>
                        </div>

                        <p className="text-secondary-600 mb-4">{product.description}</p>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-secondary-500">Prix suggéré</span>
                            <span className="font-semibold text-secondary-900">
                              {product.suggested_price}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-secondary-500">Difficulté</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-secondary-200 rounded-full h-2">
                                <div 
                                  className="bg-primary-600 h-2 rounded-full" 
                                  style={{ width: `${product.difficulty * 10}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{product.difficulty}/10</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-secondary-500">Potentiel</span>
                            <span className={`font-semibold ${
                              product.revenue_potential === 'élevé' ? 'text-success-600' :
                              product.revenue_potential === 'moyen' ? 'text-warning-600' :
                              'text-secondary-600'
                            }`}>
                              {product.revenue_potential}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-secondary-200">
                            <p className="text-sm text-secondary-500 mb-2">Technologies</p>
                            <div className="flex flex-wrap gap-1">
                              {product.technologies?.slice(0, 3).map((tech, techIndex) => (
                                <span key={techIndex} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Offre */}
              {activeTab === 'offer' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold text-secondary-900 mb-6">
                    Offre générée
                  </h3>
                  
                  {results.offer?.offer && (
                    <div className="space-y-6">
                      <div className="card p-6">
                        <h4 className="text-2xl font-bold text-secondary-900 mb-4">
                          {results.offer.offer.title}
                        </h4>
                        <p className="text-lg text-secondary-700 mb-6">
                          {results.offer.offer.value_proposition}
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-lg font-semibold mb-3">Bénéfices clés</h5>
                            <ul className="space-y-2">
                              {results.offer.offer.benefits?.map((benefit, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <CheckCircleIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-secondary-700">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="text-lg font-semibold mb-3">Call-to-action</h5>
                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                              <p className="text-primary-800 font-medium">
                                {results.offer.offer.cta_primary}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card p-6">
                        <h4 className="text-lg font-semibold mb-4">Email de bienvenue</h4>
                        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
                          <h5 className="font-medium text-secondary-900 mb-2">
                            Sujet: {results.offer.offer.welcome_email?.subject}
                          </h5>
                          <div className="text-secondary-700 whitespace-pre-wrap">
                            {results.offer.offer.welcome_email?.content}
                          </div>
                        </div>
                      </div>

                      <div className="card p-6">
                        <h4 className="text-lg font-semibold mb-4">Mots-clés SEO</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.offer.offer.seo_keywords?.map((keyword, index) => (
                            <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Annonces */}
              {activeTab === 'ads' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-secondary-900">
                      Annonces publicitaires
                    </h3>
                    <button
                      onClick={() => handleGenerateMore('more-ads')}
                      disabled={isGenerating}
                      className="btn-primary btn-sm flex items-center space-x-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Générer plus</span>
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.ads?.ads?.map((ad, index) => (
                      <div key={index} className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-secondary-900">
                            {ad.platform}
                          </h4>
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                            {ad.suggested_budget}
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium text-secondary-900 mb-2">Titre</h5>
                            <p className="text-secondary-700">{ad.headline}</p>
                          </div>

                          <div>
                            <h5 className="font-medium text-secondary-900 mb-2">Description</h5>
                            <p className="text-secondary-700">{ad.description}</p>
                          </div>

                          <div>
                            <h5 className="font-medium text-secondary-900 mb-2">Call-to-action</h5>
                            <p className="text-secondary-700">{ad.cta}</p>
                          </div>

                          <div>
                            <h5 className="font-medium text-secondary-900 mb-2">Audience cible</h5>
                            <p className="text-secondary-700">{ad.target_audience}</p>
                          </div>

                          <div>
                            <h5 className="font-medium text-secondary-900 mb-2">Mots-clés</h5>
                            <div className="flex flex-wrap gap-1">
                              {ad.keywords?.map((keyword, keywordIndex) => (
                                <span key={keywordIndex} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
