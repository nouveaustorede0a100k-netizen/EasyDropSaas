# SaaS Idea-to-Launch MVP

Un MVP complet pour transformer une compétence/thématique en produits digitaux rentables avec génération automatique d'offres et d'annonces publicitaires.

## 🚀 Fonctionnalités

- **Recherche de tendances** : Analyse des tendances via Google Trends, Reddit, SerpAPI
- **Découverte de produits** : Identification de 3 produits digitaux "gagnants" 
- **Génération d'offres** : Création automatique de titres, promesses et bullets via OpenAI
- **Tunnel de conversion** : Génération de landing pages et emails de séquence
- **Annonces publicitaires** : Création de drafts d'annonces pour différentes plateformes

## 🏗️ Architecture

- **Backend** : Python + FastAPI (`backend/`)
- **Frontend** : Next.js + Tailwind CSS (`frontend/`)
- **Base de données** : PostgreSQL (optionnelle)
- **IA** : OpenAI GPT pour la génération de contenu
- **Containerisation** : Docker + Docker Compose

## 🛠️ Installation et démarrage

### Prérequis

- Python 3.9+
- Node.js 18+
- Docker et Docker Compose (optionnel)
- Clé API OpenAI

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Base de données (optionnel)
DATABASE_URL=postgresql://user:password@localhost:5432/saas_ideas

# Backend
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Démarrage rapide

1. **Cloner et installer les dépendances** :
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd ../frontend
npm install
```

2. **Lancer en mode développement** :
```bash
# Depuis la racine du projet
chmod +x run_local.sh
./run_local.sh
```

Ou manuellement :
```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Démarrage avec Docker

```bash
cd backend
docker-compose up -d
```

## 📁 Structure du projet

```
├── README.md
├── run_local.sh
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── ai_engine.py
│   │   ├── routers/
│   │   │   ├── topics.py
│   │   │   ├── products.py
│   │   │   └── generate.py
│   │   └── db_schema.sql
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/
    ├── package.json
    ├── pages/
    │   ├── index.jsx
    │   └── dashboard.jsx
    ├── lib/
    │   └── api.js
    ├── styles/
    │   └── globals.css
    └── tailwind.config.js
```

## 🔌 API Endpoints

### Backend (http://localhost:8000)

- `GET /api/topics/search` - Recherche de tendances par thématique
- `GET /api/products/search` - Découverte de produits digitaux
- `POST /api/generate/offer` - Génération d'offres complètes
- `POST /api/generate/ads` - Création d'annonces publicitaires

### Documentation API

Une fois le backend lancé, accédez à :
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 🎯 Utilisation

1. **Accédez au frontend** : http://localhost:3000
2. **Entrez une thématique** dans la page d'accueil
3. **Explorez les tendances** et produits suggérés
4. **Générez une offre** personnalisée
5. **Créez des annonces** publicitaires draft

## 🔧 Développement

### Backend

```bash
cd backend
# Activer l'environnement virtuel
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer en mode développement
pip install -r requirements.txt

# Lancer avec hot reload
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📊 Base de données (optionnelle)

Le schéma SQL est fourni dans `backend/app/db_schema.sql`. Pour l'utiliser :

```bash
# Avec Docker
docker-compose up -d postgres

# Ou installer PostgreSQL localement et importer le schéma
psql -U username -d database_name -f backend/app/db_schema.sql
```

## 🚀 Déploiement

### Production avec Docker

```bash
# Backend
cd backend
docker-compose -f docker-compose.prod.yml up -d

# Frontend (build statique)
cd frontend
npm run build
npm run start
```

## 📝 Notes

- Les clés API et secrets ne sont pas inclus dans le code
- Le projet utilise des stubs/mocks pour les APIs externes (Trends, Reddit, SerpAPI)
- La génération IA nécessite une clé OpenAI valide
- Le backend peut fonctionner sans base de données pour les tests

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
# EasyDropSaas
