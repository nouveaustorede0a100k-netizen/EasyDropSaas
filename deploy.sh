#!/bin/bash

# Script de déploiement automatisé pour SaaS Idea-to-Launch
# Supporte Vercel (frontend) + Railway/Render (backend)

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Déploiement SaaS Idea-to-Launch${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    print_message "Vérification des prérequis..."
    
    # Vérifier Git
    if ! command -v git &> /dev/null; then
        print_error "Git n'est pas installé"
        exit 1
    fi
    
    # Vérifier Node.js pour Vercel
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier si le repo est initialisé
    if [ ! -d ".git" ]; then
        print_warning "Repository Git non initialisé. Initialisation..."
        git init
        git add .
        git commit -m "Initial commit"
    fi
    
    print_message "Prérequis vérifiés ✓"
}

# Fonction pour configurer Git
setup_git() {
    print_message "Configuration Git..."
    
    # Vérifier si remote origin existe
    if ! git remote get-url origin &> /dev/null; then
        print_warning "Pas de remote origin configuré"
        echo "Veuillez ajouter votre repository GitHub :"
        echo "git remote add origin https://github.com/votre-username/votre-repo.git"
        echo "git push -u origin main"
        read -p "Appuyez sur Entrée quand c'est fait..."
    fi
    
    # Push vers GitHub
    print_message "Push vers GitHub..."
    git add .
    git commit -m "Deploy: $(date)" || true
    git push origin main
    
    print_message "Git configuré ✓"
}

# Fonction pour déployer le frontend sur Vercel
deploy_frontend() {
    print_message "Déploiement du frontend sur Vercel..."
    
    cd frontend
    
    # Installer Vercel CLI si nécessaire
    if ! command -v vercel &> /dev/null; then
        print_message "Installation de Vercel CLI..."
        npm install -g vercel
    fi
    
    # Login Vercel
    print_message "Connexion à Vercel..."
    vercel login
    
    # Déploiement
    print_message "Déploiement en cours..."
    vercel --prod
    
    cd ..
    print_message "Frontend déployé sur Vercel ✓"
}

# Fonction pour déployer le backend sur Railway
deploy_backend_railway() {
    print_message "Déploiement du backend sur Railway..."
    
    # Installer Railway CLI si nécessaire
    if ! command -v railway &> /dev/null; then
        print_message "Installation de Railway CLI..."
        curl -fsSL https://railway.app/install.sh | sh
    fi
    
    # Login Railway
    print_message "Connexion à Railway..."
    railway login
    
    cd backend
    
    # Déploiement
    print_message "Déploiement en cours..."
    railway up
    
    cd ..
    print_message "Backend déployé sur Railway ✓"
}

# Fonction pour configurer les variables d'environnement
setup_environment() {
    print_message "Configuration des variables d'environnement..."
    
    # Vérifier OpenAI API Key
    if [ -z "$OPENAI_API_KEY" ]; then
        print_warning "OPENAI_API_KEY non définie"
        echo "Veuillez définir votre clé API OpenAI :"
        echo "export OPENAI_API_KEY='sk-votre-clé-ici'"
        read -p "Appuyez sur Entrée quand c'est fait..."
    fi
    
    print_message "Variables d'environnement configurées ✓"
}

# Fonction pour afficher les URLs
show_urls() {
    print_message "🎉 Déploiement terminé !"
    echo
    echo -e "${BLUE}📱 Frontend Vercel:${NC} https://votre-projet.vercel.app"
    echo -e "${BLUE}🔧 Backend Railway:${NC} https://votre-projet.railway.app"
    echo
    print_message "N'oubliez pas de configurer NEXT_PUBLIC_API_URL dans Vercel avec l'URL de votre backend !"
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  frontend     Déployer seulement le frontend sur Vercel"
    echo "  backend      Déployer seulement le backend sur Railway"
    echo "  full         Déployer frontend + backend (défaut)"
    echo "  help         Afficher cette aide"
    echo
    echo "Prérequis:"
    echo "  - Compte GitHub avec repository"
    echo "  - Compte Vercel"
    echo "  - Compte Railway"
    echo "  - OPENAI_API_KEY définie"
    echo
}

# Fonction principale
main() {
    print_header
    
    case "${1:-full}" in
        "frontend")
            check_prerequisites
            setup_git
            deploy_frontend
            ;;
        "backend")
            check_prerequisites
            setup_git
            setup_environment
            deploy_backend_railway
            ;;
        "full")
            check_prerequisites
            setup_git
            setup_environment
            deploy_backend_railway
            deploy_frontend
            show_urls
            ;;
        "help")
            show_help
            ;;
        *)
            print_error "Commande inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
