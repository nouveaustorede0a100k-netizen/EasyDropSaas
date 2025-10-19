#!/bin/bash

# Script de démarrage local pour le développement
# SaaS Idea-to-Launch MVP

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
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
    echo -e "${BLUE}  SaaS Idea-to-Launch MVP${NC}"
    echo -e "${BLUE}  Script de démarrage local${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    print_message "Vérification des prérequis..."
    
    # Vérifier Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 n'est pas installé. Veuillez l'installer."
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé. Veuillez l'installer."
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé. Veuillez l'installer."
        exit 1
    fi
    
    # Vérifier pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 n'est pas installé. Veuillez l'installer."
        exit 1
    fi
    
    print_message "Tous les prérequis sont installés ✓"
}

# Fonction pour vérifier les variables d'environnement
check_environment() {
    print_message "Vérification des variables d'environnement..."
    
    if [ -z "$OPENAI_API_KEY" ]; then
        print_warning "OPENAI_API_KEY n'est pas définie."
        print_warning "Vous devez définir votre clé API OpenAI pour utiliser les fonctionnalités IA."
        print_warning "Exemple: export OPENAI_API_KEY='votre-clé-ici'"
        echo
    else
        print_message "OPENAI_API_KEY est définie ✓"
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL n'est pas définie."
        print_warning "La base de données sera optionnelle."
        echo
    else
        print_message "DATABASE_URL est définie ✓"
    fi
}

# Fonction pour installer les dépendances backend
install_backend_dependencies() {
    print_message "Installation des dépendances backend..."
    
    cd backend
    
    # Créer un environnement virtuel s'il n'existe pas
    if [ ! -d "venv" ]; then
        print_message "Création de l'environnement virtuel Python..."
        python3 -m venv venv
    fi
    
    # Activer l'environnement virtuel
    source venv/bin/activate
    
    # Installer les dépendances
    print_message "Installation des packages Python..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    cd ..
    print_message "Dépendances backend installées ✓"
}

# Fonction pour installer les dépendances frontend
install_frontend_dependencies() {
    print_message "Installation des dépendances frontend..."
    
    cd frontend
    
    # Installer les dépendances
    print_message "Installation des packages Node.js..."
    npm install
    
    cd ..
    print_message "Dépendances frontend installées ✓"
}

# Fonction pour créer le fichier .env s'il n'existe pas
create_env_file() {
    if [ ! -f ".env" ]; then
        print_message "Création du fichier .env..."
        cat > .env << EOF
# Configuration pour le développement local
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_ideas
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
EOF
        print_warning "Fichier .env créé. Veuillez le modifier avec vos vraies valeurs."
        echo
    fi
}

# Fonction pour démarrer les services
start_services() {
    print_message "Démarrage des services..."
    
    # Démarrer le backend en arrière-plan
    print_message "Démarrage du backend FastAPI..."
    cd backend
    source venv/bin/activate
    nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Attendre que le backend soit prêt
    print_message "Attente du démarrage du backend..."
    sleep 5
    
    # Vérifier que le backend répond
    if curl -s http://localhost:8000/health > /dev/null; then
        print_message "Backend démarré avec succès ✓"
    else
        print_warning "Le backend ne répond pas encore. Il devrait être prêt dans quelques secondes."
    fi
    
    # Démarrer le frontend
    print_message "Démarrage du frontend Next.js..."
    cd frontend
    nohup npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Sauvegarder les PIDs pour pouvoir arrêter les services
    echo $BACKEND_PID > backend.pid
    echo $FRONTEND_PID > frontend.pid
    
    print_message "Services démarrés ✓"
}

# Fonction pour afficher les informations de connexion
show_connection_info() {
    echo
    print_message "🎉 Services démarrés avec succès!"
    echo
    echo -e "${BLUE}📱 Frontend:${NC} http://localhost:3000"
    echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:8000"
    echo -e "${BLUE}📚 Documentation API:${NC} http://localhost:8000/docs"
    echo -e "${BLUE}📖 ReDoc:${NC} http://localhost:8000/redoc"
    echo
    print_message "Logs du backend: tail -f backend.log"
    print_message "Logs du frontend: tail -f frontend.log"
    echo
    print_message "Pour arrêter les services: ./run_local.sh stop"
    echo
}

# Fonction pour arrêter les services
stop_services() {
    print_message "Arrêt des services..."
    
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            print_message "Backend arrêté ✓"
        fi
        rm backend.pid
    fi
    
    if [ -f "frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            print_message "Frontend arrêté ✓"
        fi
        rm frontend.pid
    fi
    
    # Nettoyer les processus Node.js qui pourraient rester
    pkill -f "next-server" 2>/dev/null || true
    pkill -f "uvicorn" 2>/dev/null || true
    
    print_message "Tous les services ont été arrêtés ✓"
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start    Démarrer tous les services (défaut)"
    echo "  stop     Arrêter tous les services"
    echo "  restart  Redémarrer tous les services"
    echo "  logs     Afficher les logs des services"
    echo "  status   Vérifier le statut des services"
    echo "  help     Afficher cette aide"
    echo
    echo "Variables d'environnement:"
    echo "  OPENAI_API_KEY  Clé API OpenAI (requise pour l'IA)"
    echo "  DATABASE_URL    URL de la base de données (optionnelle)"
    echo
}

# Fonction pour afficher les logs
show_logs() {
    if [ -f "backend.log" ]; then
        echo -e "${BLUE}=== Backend Logs ===${NC}"
        tail -f backend.log
    else
        print_warning "Aucun log backend trouvé"
    fi
}

# Fonction pour vérifier le statut
check_status() {
    print_message "Vérification du statut des services..."
    
    # Vérifier le backend
    if curl -s http://localhost:8000/health > /dev/null; then
        print_message "Backend: ✓ En cours d'exécution"
    else
        print_error "Backend: ✗ Non accessible"
    fi
    
    # Vérifier le frontend
    if curl -s http://localhost:3000 > /dev/null; then
        print_message "Frontend: ✓ En cours d'exécution"
    else
        print_error "Frontend: ✗ Non accessible"
    fi
}

# Fonction principale
main() {
    print_header
    
    case "${1:-start}" in
        "start")
            check_prerequisites
            check_environment
            create_env_file
            install_backend_dependencies
            install_frontend_dependencies
            start_services
            show_connection_info
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            main start
            ;;
        "logs")
            show_logs
            ;;
        "status")
            check_status
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

# Gestion des signaux pour un arrêt propre
trap 'print_message "Arrêt en cours..."; stop_services; exit 0' SIGINT SIGTERM

# Exécution du script principal
main "$@"
