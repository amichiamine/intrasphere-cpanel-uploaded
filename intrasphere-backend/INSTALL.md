Guide d’Installation IntraSphere PHP
📋 Prérequis
Serveur
PHP 7.4+ avec extensions :

pdo, pdo_mysql

json, mbstring

fileinfo, zip

MySQL 5.7+ ou MariaDB 10.2+

Apache avec mod_rewrite

HTTPS recommandé

Hébergement
cPanel, Plesk ou équivalent

Accès FTP/SFTP

Gestionnaire de base de données

50 Mo d’espace minimum

🚀 Installation pas à pas
Étape 1 : Préparation
Téléchargez ou clonez le projet dans intrasphere-php/.

Créez une base de données MySQL vide.

Notez vos paramètres de connexion (hôte, nom, utilisateur, mot de passe).

Étape 2 : Upload des fichiers
Via cPanel File Manager
Ouvrez File Manager et naviguez vers public_html/ (ou dossier Web racine).

Uploadez tous les fichiers et dossiers de intrasphere-php/.

Assurez-vous que la structure exacte est reproduite (voir README.md).

Via FTP/SFTP
bash
# Exemple SCP + SSH
scp -r intrasphere-php user@server:/home/user/public_html/
ssh user@server
cd public_html/intrasphere-php
Étape 3 : Configuration
Copiez .env.example vers .env à la racine :

bash
cp .env.example .env
Ouvrez .env et renseignez vos paramètres :

text
DB_HOST=localhost
DB_DATABASE=intrasphere
DB_USERNAME=votre_user
DB_PASSWORD=votre_password
APP_URL=https://votre-domaine.com
JWT_SECRET=votre_cle_complexe
SESSION_LIFETIME=3600
BCRYPT_ROUNDS=12
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx
Enregistrez le fichier.

Étape 4 : Base de données
Via phpMyAdmin
Sélectionnez votre base.

Importez database/schema.sql.

Via ligne de commande
bash
mysql -u username -p database_name < database/schema.sql
Étape 5 : Permissions
Via cPanel
Sélectionnez les dossiers public/uploads et logs.

Clic droit → « Change Permissions » → appliquez 755 pour uploads/ et 700 pour logs/.

Via SSH
bash
chmod -R 755 public/uploads/
chmod -R 700 logs/
Étape 6 : Installation initiale
Exécutez le script d’installation pour vérifier l’environnement :

bash
php scripts/install.php
Étape 7 : Test de santé
Accédez à :

text
https://votre-domaine.com/public/api/health
Vous devez obtenir :

json
{ "status": "ok", "adapter": "php", "version": "1.0.0" }
✅ Vérification post-installation
Tests automatisés
bash
php test_api.php https://votre-domaine.com
Tests manuels
Health Check → /public/api/health

Login → POST /api/auth/login avec identifiants admin / admin123

Upload test → POST /api/upload

Navigation du frontend React

🔧 Configuration avancée
SSL/HTTPS
Activez SSL dans cPanel.

Forcez HTTPS via .htaccess.

Mettez à jour APP_URL dans .env.

Email (optionnel)
text
MAIL_HOST=smtp.votre-serveur.com
MAIL_PORT=587
MAIL_USERNAME=votre_email
MAIL_PASSWORD=mot_de_passe
MAIL_FROM_ADDRESS=noreply@votre-domaine.com
MAIL_FROM_NAME=IntraSphere
Optimisations
Activez la compression GZIP dans Apache.

Utilisez un CDN pour vos assets.

Surveillez régulièrement logs/error.log.

🔐 Sécurité post-installation
Changez le mot de passe admin par défaut.

Utilisez des mots de passe forts.

Restreignez l’accès aux logs.

Mettez à jour PHP et vos dépendances.

🆘 Dépannage
Erreur 500 → logs/error.log

API inaccessible → vérifiez .htaccess et mod_rewrite

Upload impossible → permissions public/uploads/

Erreur BDD → testez la connexion MySQL dans install.php

🔄 Mise à jour
Sauvegardez la version actuelle.

Téléchargez la nouvelle version.

Remplacez les fichiers (sauf .env).

Exécutez vos migrations dans database/migrations.sql.

Testez la nouvelle version.

🎉 Votre installation est maintenant opérationnelle !