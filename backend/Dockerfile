# Dockerfile pour le backend FastAPI
FROM python:3.11-slim

# Définition des variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Création du répertoire de travail
WORKDIR /app

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copie des fichiers de dépendances
COPY requirements.txt .

# Installation des dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source
COPY app/ ./app/

# Création d'un utilisateur non-root pour la sécurité
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Exposition du port
EXPOSE 8000

# Variables d'environnement par défaut
ENV HOST=0.0.0.0 \
    PORT=8000 \
    ENVIRONMENT=production

# Commande de démarrage
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
