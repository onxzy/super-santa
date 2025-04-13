# Super Santa

Un système de tirage au sort pour Secret Santa, avec gestion de groupes et de participants.

## Prérequis

- Docker et Docker Compose
- Go 1.21+ (pour le développement local)
- Node.js 18+ (pour le développement local)

## Démarrage rapide

### Avec Docker (recommandé)

Pour démarrer l'application avec Docker :

```bash
# Cloner le dépôt
git clone https://github.com/onxzy/super-santa.git
cd super-santa

# Copier et configurer le fichier d'environnement pour le serveur
cp server/.env.example server/.env
# Éditer server/.env avec vos informations

# Personnaliser la configuration du serveur (optionnel)
# Éditer server/config.yaml selon vos besoins

# Démarrer l'application
docker-compose up -d
```

L'application sera disponible aux adresses :
- Frontend (client) : http://localhost:3000
- API (serveur) : http://localhost:8080

### Sans Docker (développement)

#### Démarrer le serveur

```bash
cd server
cp .env.example .env
# Éditer .env avec vos informations

# Installer les dépendances et démarrer le serveur
go mod download
go run main.go
```

#### Démarrer le client

```bash
cd client
npm install
# Pour le développement
npm run dev
# OU pour la production
npm run build
npm start
```

## Configuration

### Configuration du serveur

Le serveur peut être configuré via le fichier `server/config.yaml` :

```yaml
host:
  app_url: http://localhost:3000  # URL du frontend
  api_url: http://localhost:8080  # URL de l'API
  listen: 0.0.0.0                 # Adresse d'écoute
  port: 8080                      # Port d'écoute

auth:
  jwt:
    expire: 86400                 # Durée de validité du token (24h)
    expire_group: 86400           # Durée de validité du token de groupe

cors:
  allow_origins: ["*"]            # Origines autorisées pour CORS

log:
  level: "debug"                  # Niveau de log (debug, info, warn, error, fatal, panic)

db:
  sqlitepath: "./data.db"         # Chemin de la base de données SQLite

mail:
  enabled: false                  # Activer/désactiver l'envoi d'emails
  templates_dir: "./templates/emails"  # Dossier des templates d'emails
```

Pour les variables sensibles, utilisez le fichier `.env` :

```ini
# JWT Configuration
SSS_JWT_SECRET=votre-clé-secrète

# Configuration SMTP (pour l'envoi d'emails)
SSS_SMTP_HOST=smtp.example.com
SSS_SMTP_PORT=587
SSS_SMTP_USERNAME=votre-nom-utilisateur
SSS_SMTP_PASSWORD=votre-mot-de-passe
SSS_SMTP_FROM_EMAIL=secret-santa@example.com
SSS_SMTP_FROM_NAME=Secret Santa
```

### Configuration du client

Pour le client, la variable d'environnement principale est l'URL de l'API :

```ini
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Dans le déploiement Docker, cette configuration est automatiquement gérée.

## Volumes Docker

Le docker-compose.yaml définit les volumes suivants :
- Base de données : `./server/data.db:/app/data/data.db`
- Configuration : `./server/config.yaml:/app/config.yaml`

Ces volumes permettent de conserver les données entre les redémarrages de l'application.

