# 🚀 Guide de Déploiement - SaaS Idea-to-Launch

Ce guide vous explique comment déployer votre application SaaS Idea-to-Launch sur Vercel (frontend) et une plateforme cloud pour le backend.

## 📋 Prérequis

- Compte GitHub
- Compte Vercel (gratuit)
- Compte Railway ou Render (pour le backend)
- Clé API OpenAI

## 🔑 Configuration de l'API OpenAI

### 1. Obtenir votre clé API

1. Allez sur [platform.openai.com](https://platform.openai.com)
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys" → "Create new secret key"
4. Copiez la clé générée (commence par `sk-`)

### 2. Configuration locale

```bash
# Créer le fichier .env
cp env.example .env

# Éditer le fichier .env et ajouter votre clé
nano .env
```

Dans le fichier `.env` :
```bash
OPENAI_API_KEY=sk-votre-clé-openai-ici
```

## 🌐 Déploiement du Frontend sur Vercel

### 1. Préparation du projet

```bash
# Installer les dépendances
cd frontend
npm install

# Tester la build
npm run build
```

### 2. Configuration Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project"
4. Importez votre repository GitHub
5. Sélectionnez le dossier `frontend`

### 3. Variables d'environnement Vercel

Dans les paramètres du projet Vercel, ajoutez :

```
NEXT_PUBLIC_API_URL=https://votre-backend-url.railway.app
NODE_ENV=production
```

### 4. Configuration automatique

Créez un fichier `vercel.json` dans le dossier frontend :

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  }
}
```

## ⚙️ Déploiement du Backend

### Option 1: Railway (Recommandé)

#### 1. Préparation

```bash
cd backend

# Créer un fichier railway.json
cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port \$PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
EOF
```

#### 2. Déploiement sur Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Sélectionnez votre repository
5. Railway détecte automatiquement le dossier `backend`

#### 3. Variables d'environnement Railway

Dans les paramètres Railway, ajoutez :

```
OPENAI_API_KEY=sk-votre-clé-openai
DATABASE_URL=postgresql://user:pass@host:port/db
ENVIRONMENT=production
PORT=8000
```

### Option 2: Render

#### 1. Configuration Render

1. Allez sur [render.com](https://render.com)
2. "New" → "Web Service"
3. Connectez votre repository GitHub
4. Configuration :
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### 2. Variables d'environnement Render

```
OPENAI_API_KEY=sk-votre-clé-openai
ENVIRONMENT=production
```

## 🗄️ Base de données (Optionnel)

### Railway PostgreSQL

1. Dans Railway, ajoutez un service PostgreSQL
2. Railway génère automatiquement `DATABASE_URL`
3. Importez le schéma :

```bash
# Via Railway CLI
railway connect
railway run psql $DATABASE_URL -f app/db_schema.sql
```

### Render PostgreSQL

1. Dans Render, créez un service PostgreSQL
2. Copiez la connection string dans `DATABASE_URL`
3. Importez le schéma via l'interface Render

## 🔧 Configuration finale

### 1. Mettre à jour l'URL du backend

Une fois le backend déployé, mettez à jour l'URL dans Vercel :

```
NEXT_PUBLIC_API_URL=https://votre-backend-url.railway.app
```

### 2. Redéployer le frontend

Vercel redéploie automatiquement quand vous poussez sur GitHub.

## 🧪 Test du déploiement

### 1. Tester le backend

```bash
# Vérifier que l'API répond
curl https://votre-backend-url.railway.app/health

# Tester un endpoint
curl https://votre-backend-url.railway.app/api/topics/search?topic=test
```

### 2. Tester le frontend

1. Allez sur votre URL Vercel
2. Entrez une thématique
3. Vérifiez que l'analyse fonctionne

## 📊 Monitoring et Logs

### Vercel Analytics
- Activez Vercel Analytics pour surveiller les performances
- Consultez les logs dans le dashboard Vercel

### Railway/Render Logs
- Consultez les logs en temps réel dans le dashboard
- Configurez des alertes pour les erreurs

## 🔒 Sécurité

### Variables d'environnement
- ✅ Ne jamais commiter les clés API
- ✅ Utiliser les variables d'environnement des plateformes
- ✅ Limiter les permissions des clés API

### CORS
Le backend est configuré pour accepter les requêtes depuis Vercel.

## 🚀 Déploiement automatique

### GitHub Actions (Optionnel)

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 🆘 Dépannage

### Erreurs communes

1. **Backend ne répond pas**
   - Vérifiez les logs Railway/Render
   - Vérifiez les variables d'environnement

2. **Erreur CORS**
   - Vérifiez que `NEXT_PUBLIC_API_URL` est correcte
   - Vérifiez la configuration CORS dans `main.py`

3. **Erreur OpenAI**
   - Vérifiez que `OPENAI_API_KEY` est définie
   - Vérifiez que la clé est valide

### Support

- Vercel : [vercel.com/docs](https://vercel.com/docs)
- Railway : [docs.railway.app](https://docs.railway.app)
- Render : [render.com/docs](https://render.com/docs)

## 💰 Coûts estimés

### Vercel (Frontend)
- ✅ Gratuit pour les projets personnels
- Limite : 100GB bandwidth/mois

### Railway (Backend)
- ✅ Plan gratuit : $5/mois de crédit
- Base de données PostgreSQL incluse

### OpenAI API
- Pay-per-use : ~$0.002 par requête
- Estimation : $10-50/mois selon l'usage

---

🎉 **Félicitations !** Votre SaaS Idea-to-Launch est maintenant déployé et prêt à être utilisé !
