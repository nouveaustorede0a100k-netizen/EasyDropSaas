/**
 * Page d'accueil - Point d'entrée principal de l'application
 * Permet de saisir une thématique et de lancer l'analyse
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  RocketLaunchIcon,
  ChartBarIcon,
  LightBulbIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { topicsAPI, productsAPI, generateAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast.error('Veuillez entrer une thématique');
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      // Étape 1: Recherche des tendances
      toast.loading('Analyse des tendances...', { id: 'trends' });
      const trendsData = await topicsAPI.searchTrends(topic.trim());
      
      // Étape 2: Découverte de produits
      toast.loading('Découverte de produits digitaux...', { id: 'products' });
      const productsData = await productsAPI.searchProducts(topic.trim(), {
        trends: trendsData.trends_analysis.trending_topics || [],
      });

      // Étape 3: Génération d'une offre pour le premier produit
      if (productsData.products && productsData.products.length > 0) {
        toast.loading('Génération d\'une offre...', { id: 'offer' });
        const offerData = await generateAPI.generateOffer({
          topic: topic.trim(),
          product: productsData.products[0],
          tone: 'professional',
        });

        // Étape 4: Génération d'annonces
        toast.loading('Création d\'annonces publicitaires...', { id: 'ads' });
        const adsData = await generateAPI.generateAds({
          topic: topic.trim(),
          offer: offerData.offer,
          platforms: ['facebook', 'google', 'linkedin'],
        });

        // Compilation des résultats
        const completeResults = {
          topic: topic.trim(),
          trends: trendsData,
          products: productsData,
          offer: offerData,
          ads: adsData,
          generatedAt: new Date().toISOString(),
        };

        setResults(completeResults);
        
        // Navigation vers le dashboard avec les résultats
        router.push({
          pathname: '/dashboard',
          query: { 
            topic: topic.trim(),
            results: JSON.stringify(completeResults)
          }
        });

        toast.success('Analyse terminée avec succès!', { id: 'success' });
      } else {
        toast.error('Aucun produit trouvé pour cette thématique');
      }

    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast.error('Erreur lors de l\'analyse. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      // Nettoyage des toasts de chargement
      toast.dismiss('trends');
      toast.dismiss('products');
      toast.dismiss('offer');
      toast.dismiss('ads');
    }
  };

  return (
    <>
      <Head>
        <title>SaaS Idea-to-Launch - Transformez vos idées en succès</title>
        <meta name="description" content="Plateforme complète pour transformer une thématique en produits digitaux rentables avec génération automatique d'offres et d'annonces publicitaires." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-secondary-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gradient">SaaS Idea-to-Launch</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#features" className="text-secondary-600 hover:text-secondary-900">Fonctionnalités</a>
                <a href="#how-it-works" className="text-secondary-600 hover:text-secondary-900">Comment ça marche</a>
                <a href="#pricing" className="text-secondary-600 hover:text-secondary-900">Tarifs</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
              Transformez votre{' '}
              <span className="text-gradient">thématique</span>{' '}
              en succès digital
            </h2>
            
            <p className="text-xl text-secondary-600 mb-8 leading-relaxed">
              Découvrez les tendances, identifiez les produits gagnants, générez des offres 
              percutantes et créez des campagnes publicitaires efficaces - le tout automatisé avec l'IA.
            </p>

            {/* Formulaire principal */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: intelligence artificielle, e-commerce, bien-être digital..."
                    className="w-full px-6 py-4 text-lg border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !topic.trim()}
                  className="btn-primary btn-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      <span>Analyse en cours...</span>
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-5 w-5" />
                      <span>Analyser</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>

            {/* Exemples de thématiques */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <p className="text-secondary-500 mb-4">Exemples de thématiques populaires :</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Intelligence Artificielle', 'E-commerce', 'Bien-être digital', 'Formation en ligne', 'Automatisation', 'Développement durable'].map((example) => (
                  <button
                    key={example}
                    onClick={() => setTopic(example)}
                    className="px-4 py-2 bg-white border border-secondary-200 rounded-full text-sm text-secondary-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.section
            id="features"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h3 className="text-3xl font-bold text-center text-secondary-900 mb-12">
              Tout ce dont vous avez besoin pour réussir
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: ChartBarIcon,
                  title: 'Analyse des tendances',
                  description: 'Découvrez les opportunités émergentes avec l\'analyse IA des tendances Google, Reddit et SERP.',
                },
                {
                  icon: LightBulbIcon,
                  title: 'Produits digitaux gagnants',
                  description: 'Identifiez 3 produits digitaux rentables adaptés à votre thématique.',
                },
                {
                  icon: SparklesIcon,
                  title: 'Génération d\'offres',
                  description: 'Créez automatiquement des titres, promesses et bullets percutants.',
                },
                {
                  icon: RocketLaunchIcon,
                  title: 'Tunnels de conversion',
                  description: 'Générez des landing pages et emails de séquence optimisés.',
                },
                {
                  icon: CurrencyDollarIcon,
                  title: 'Annonces publicitaires',
                  description: 'Créez des drafts d\'annonces pour Facebook, Google, LinkedIn et plus.',
                },
                {
                  icon: MagnifyingGlassIcon,
                  title: 'Optimisation continue',
                  description: 'Analysez les performances et optimisez vos campagnes en continu.',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="card p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-secondary-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-secondary-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* How it works */}
          <motion.section
            id="how-it-works"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="max-w-4xl mx-auto mt-20"
          >
            <h3 className="text-3xl font-bold text-center text-secondary-900 mb-12">
              Comment ça marche ?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Saisissez votre thématique', description: 'Entrez simplement votre domaine d\'expertise ou votre intérêt.' },
                { step: '2', title: 'Analyse automatique', description: 'Notre IA analyse les tendances et découvre les opportunités.' },
                { step: '3', title: 'Génération complète', description: 'Obtenez produits, offres et annonces prêts à lancer.' },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h4 className="text-xl font-semibold text-secondary-900 mb-3">
                    {step.title}
                  </h4>
                  <p className="text-secondary-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="bg-secondary-900 text-white py-12 mt-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <SparklesIcon className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold">SaaS Idea-to-Launch</span>
            </div>
            <p className="text-secondary-400 mb-4">
              Transformez vos idées en succès digital avec l'intelligence artificielle.
            </p>
            <p className="text-secondary-500 text-sm">
              © 2024 SaaS Idea-to-Launch. Tous droits réservés.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
