-- Schéma de base de données PostgreSQL pour SaaS Idea-to-Launch
-- Ce fichier contient la structure de base pour stocker les utilisateurs et projets

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
    api_usage_count INTEGER DEFAULT 0,
    api_limit INTEGER DEFAULT 100 -- Limite d'API calls par mois
);

-- Table des projets
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, completed, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Données générées (stockage JSON)
    trends_analysis JSONB,
    discovered_products JSONB,
    generated_offer JSONB,
    generated_ads JSONB,
    
    -- Métadonnées
    ai_model_used VARCHAR(100),
    generation_cost DECIMAL(10, 4), -- Coût en USD
    generation_time INTEGER -- Temps en secondes
);

-- Table des sessions utilisateur
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Table des API calls (pour le tracking et les limites)
CREATE TABLE IF NOT EXISTS api_calls (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER, -- Temps de réponse en millisecondes
    tokens_used INTEGER, -- Tokens OpenAI utilisés
    cost DECIMAL(10, 4), -- Coût en USD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Table des templates d'offres sauvegardés
CREATE TABLE IF NOT EXISTS offer_templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL, -- saas_launch, info_product, service_offer
    template_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des campagnes publicitaires
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- facebook, google, linkedin, etc.
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, completed
    budget_daily DECIMAL(10, 2),
    budget_total DECIMAL(10, 2),
    target_audience JSONB,
    ad_creative JSONB,
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    launched_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_topic ON projects(topic);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_api_calls_user_id ON api_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_api_calls_created_at ON api_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_api_calls_endpoint ON api_calls(endpoint);

CREATE INDEX IF NOT EXISTS idx_offer_templates_user_id ON offer_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_templates_type ON offer_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_offer_templates_public ON offer_templates(is_public);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user_id ON ad_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_project_id ON ad_campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_platform ON ad_campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offer_templates_updated_at BEFORE UPDATE ON offer_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vues utiles pour les requêtes courantes
CREATE OR REPLACE VIEW user_project_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    COUNT(p.id) as total_projects,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_projects,
    COUNT(CASE WHEN p.status = 'in_progress' THEN 1 END) as active_projects,
    SUM(COALESCE(p.generation_cost, 0)) as total_generation_cost,
    MAX(p.created_at) as last_project_created
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
GROUP BY u.id, u.username, u.email;

CREATE OR REPLACE VIEW api_usage_stats AS
SELECT 
    u.id as user_id,
    u.username,
    DATE_TRUNC('month', ac.created_at) as usage_month,
    COUNT(ac.id) as api_calls_count,
    SUM(COALESCE(ac.cost, 0)) as total_cost,
    SUM(COALESCE(ac.tokens_used, 0)) as total_tokens
FROM users u
LEFT JOIN api_calls ac ON u.id = ac.user_id
GROUP BY u.id, u.username, DATE_TRUNC('month', ac.created_at);

-- Données de test (optionnel - à supprimer en production)
INSERT INTO users (email, username, password_hash, first_name, last_name, is_verified, subscription_plan)
VALUES 
    ('test@example.com', 'testuser', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2fX4z8K5aG', 'Test', 'User', TRUE, 'pro'),
    ('demo@example.com', 'demouser', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2fX4z8K5aG', 'Demo', 'User', TRUE, 'free')
ON CONFLICT (email) DO NOTHING;

-- Commentaires sur les tables
COMMENT ON TABLE users IS 'Table des utilisateurs de la plateforme';
COMMENT ON TABLE projects IS 'Table des projets de génération d''idées';
COMMENT ON TABLE user_sessions IS 'Table des sessions utilisateur actives';
COMMENT ON TABLE api_calls IS 'Table de tracking des appels API';
COMMENT ON TABLE offer_templates IS 'Table des templates d''offres sauvegardés';
COMMENT ON TABLE ad_campaigns IS 'Table des campagnes publicitaires créées';
