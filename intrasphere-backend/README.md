IntraSphere PHP Backend
🎉 Adaptateur PHP 100% fonctionnel remplaçant le backend Node.js d’IntraSphere pour hébergement mutualisé.

📋 Vue d’ensemble
Ce projet est un adaptateur PHP complet qui reproduit toutes les fonctionnalités du backend Node.js d’IntraSphere, optimisé pour les hébergements mutualisés (cPanel, Plesk, etc.).

✅ Compatibilité
100% des routes API couvertes (115 routes)

Frontend React fonctionne sans modification

Base de données MySQL compatible

Hébergement mutualisé supporté

🏗️ Structure du projet
text
intrasphere-php/
├── api/
│   ├── Controllers/           # 23 contrôleurs
│   ├── Models/                # 25 modèles
│   ├── Services/              # 4 services
│   ├── Middleware/            # 3 middlewares
│   ├── Config/                # Database, Response, Router, migrations.sql
│   └── routes.php             # 115 routes définies
├── public/
│   ├── uploads/
│   │   ├── avatars/
│   │   ├── documents/
│   │   └── images/
│   ├── index.php              # Point d’entrée API
│   └── .htaccess              # Config Apache public
├── database/
│   ├── schema.sql             # 25 tables
│   └── sample_data.sql        # Données tests
├── scripts/
│   ├── install.php            # Installation auto
│   ├── create_package.php     # Générateur ZIP
│   └── deploy.php             # Déploiement auto
├── logs/
├── .env.example               # Template variables
├── .htaccess                  # Config Apache racine
├── composer.json              # Dépendances & autoload
└── README.md                  # Cette documentation
🚀 Installation rapide
1. Générer le package
bash
cd intrasphere-php/
php scripts/create_package.php
2. Upload sur serveur
Uploadez l’archive ZIP générée

Extrayez dans le répertoire racine de votre site

Configurez les permissions :

public/uploads/ → 755

logs/ → 700

3. Configuration
bash
cp .env.example .env
# Éditez .env avec vos paramètres
4. Base de données
bash
mysql -u username -p database_name < database/schema.sql
5. Test
Accédez à : https://votre-domaine.com/public/api/health
Réponse attendue :

json
{ "status":"ok", "adapter":"php", "version":"1.0.0" }
🛠️ Scripts disponibles
bash
php scripts/install.php          # Installation auto
php scripts/create_package.php   # Générateur de package
php scripts/deploy.php [env]     # Déploiement auto
🔧 Configuration avancée
Éditez .env pour :

Base de données (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD)

APP_URL

JWT_SECRET, SESSION_LIFETIME, BCRYPT_ROUNDS

MAX_FILE_SIZE, ALLOWED_EXTENSIONS

MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS

🔐 Sécurité
Utilisez HTTPS en production

Configurez un certificat SSL

Changez les mots de passe par défaut

Restreignez l’accès aux logs (logs/)

Mettez à jour PHP et les dépendances régulièrement

🆘 Dépannage
Erreur 500 → Vérifiez logs/error.log

API inaccessible → Contrôlez .htaccess et mod_rewrite

Upload impossible → Vérifiez permissions public/uploads/

Base de données → Testez connexion dans install.php