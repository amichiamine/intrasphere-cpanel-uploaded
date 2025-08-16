🚀 Guide complet de déploiement IntraSphere
📁 Structure finale visée
text
votre-domaine.com/
└── public_html/
    └── intrasphere/                          # Dossier principal
        ├── intrasphere-backend/              # Backend PHP
        │   ├── api/                          # Code source
        │   ├── public/
        │   │   ├── index.php                 # Point d'entrée API
        │   │   ├── uploads/
        │   │   └── .htaccess
        │   ├── database/
        │   ├── logs/
        │   └── .env
        ├── intrasphere-frontend/             # Frontend React compilé
        │   ├── static/
        │   ├── index.html
        │   └── .htaccess
        └── .htaccess                         # Configuration racine
📋 ÉTAPE 1 : Préparation de l'environnement local
1.1 Créer la structure de travail locale
bash
# Sur votre machine locale, créez la structure
mkdir intrasphere-deploy
cd intrasphere-deploy

# Créer les dossiers de travail
mkdir deploy-scripts
mkdir intrasphere-backend
mkdir intrasphere-frontend-source
mkdir intrasphere-frontend-build
mkdir final-deploy
1.2 Copier le backend
bash
# Copiez votre dossier intrasphere-php existant vers intrasphere-backend
cp -r /chemin/vers/votre/intrasphere-php/* intrasphere-backend/
📋 ÉTAPE 2 : Scripts de déploiement
2.1 Créer deploy-scripts/extract_frontend.php
php
<?php
/**
 * Script d'extraction du frontend React depuis GitHub
 * Usage: php extract_frontend.php
 */

echo "🚀 Extraction du frontend IntraSphere React...\n\n";

$repoUrl = 'https://github.com/amichiamine/inrasphere-react-blackbox.git';
$tempDir = __DIR__ . '/../temp-react-repo';
$frontendSourceDir = __DIR__ . '/../intrasphere-frontend-source';

// 1. Nettoyer les anciens dossiers
if (is_dir($tempDir)) {
    echo "🗑️  Nettoyage du dossier temporaire...\n";
    exec("rm -rf " . escapeshellarg($tempDir));
}
if (is_dir($frontendSourceDir)) {
    echo "🗑️  Nettoyage de l'ancien frontend...\n";
    exec("rm -rf " . escapeshellarg($frontendSourceDir));
}

// 2. Clone du repository
echo "📥 Clone du repository GitHub...\n";
$cmd = "git clone " . escapeshellarg($repoUrl) . " " . escapeshellarg($tempDir);
exec($cmd, $output, $returnCode);

if ($returnCode !== 0) {
    die("❌ Erreur lors du clone. Vérifiez votre connexion Internet.\n");
}

if (!is_dir($tempDir)) {
    die("❌ Dossier temporaire non créé\n");
}

// 3. Création du dossier frontend source
mkdir($frontendSourceDir, 0755, true);
echo "📂 Dossier frontend créé\n";

// 4. Copie des fichiers React essentiels
$filesToCopy = [
    'src'                => 'src',
    'public'             => 'public-react',
    'package.json'       => 'package.json',
    'package-lock.json'  => 'package-lock.json',
    '.env.example'       => '.env.example',
    'README.md'          => 'README_FRONTEND.md'
];

echo "📁 Copie des fichiers React...\n";
foreach ($filesToCopy as $source => $dest) {
    $srcPath = "$tempDir/$source";
    $destPath = "$frontendSourceDir/$dest";
    
    if (file_exists($srcPath)) {
        if (is_dir($srcPath)) {
            exec("cp -r " . escapeshellarg($srcPath) . " " . escapeshellarg($destPath));
        } else {
            copy($srcPath, $destPath);
        }
        echo "  ✅ $source -> $dest\n";
    } else {
        echo "  ⚠️  $source non trouvé\n";
    }
}

// 5. Configuration .env pour production
$envContent = "# Configuration IntraSphere Frontend\n";
$envContent .= "REACT_APP_API_URL=/intrasphere/api\n";
$envContent .= "REACT_APP_APP_NAME=IntraSphere\n";
$envContent .= "GENERATE_SOURCEMAP=false\n";
$envContent .= "PUBLIC_URL=/intrasphere/\n";
$envContent .= "BUILD_PATH=../intrasphere-frontend-build\n";

file_put_contents("$frontendSourceDir/.env.production", $envContent);
echo "📝 Configuration .env.production créée\n";

// 6. Créer package.json pour build
$packageJsonPath = "$frontendSourceDir/package.json";
if (file_exists($packageJsonPath)) {
    $packageData = json_decode(file_get_contents($packageJsonPath), true);
    $packageData['homepage'] = "/intrasphere/";
    file_put_contents($packageJsonPath, json_encode($packageData, JSON_PRETTY_PRINT));
    echo "📦 package.json mis à jour avec homepage\n";
}

// 7. Nettoyage du dossier temporaire
exec("rm -rf " . escapeshellarg($tempDir));

echo "\n✅ Frontend extrait avec succès!\n";
echo "📁 Frontend source dans: $frontendSourceDir\n\n";

echo "📋 PROCHAINES ÉTAPES:\n";
echo "1. cd intrasphere-frontend-source\n";
echo "2. npm install\n";
echo "3. npm run build\n";
echo "4. Puis exécutez: php deploy-scripts/combine_deploy.php\n\n";
?>
2.2 Créer deploy-scripts/combine_deploy.php
php
<?php
/**
 * Script de combinaison Backend + Frontend pour déploiement
 * Usage: php combine_deploy.php
 */

echo "🌟 Création du package de déploiement IntraSphere...\n\n";

$rootDir = __DIR__ . '/..';
$backendDir = "$rootDir/intrasphere-backend";
$frontendBuildDir = "$rootDir/intrasphere-frontend-build";
$deployDir = "$rootDir/final-deploy";

// 1. Vérifications
echo "🔍 Vérifications préalables...\n";

if (!is_dir($backendDir)) {
    die("❌ Backend introuvable: $backendDir\n");
}
echo "  ✅ Backend trouvé\n";

if (!is_dir($frontendBuildDir)) {
    die("❌ Frontend build introuvable: $frontendBuildDir\n   Compilez d'abord avec 'npm run build'\n");
}
echo "  ✅ Frontend build trouvé\n";

// 2. Création de la structure de déploiement
echo "\n📂 Création de la structure finale...\n";
if (is_dir($deployDir)) {
    exec("rm -rf " . escapeshellarg($deployDir));
}
mkdir($deployDir, 0755, true);
mkdir("$deployDir/intrasphere", 0755, true);

// 3. Copie du backend
echo "📋 Copie du backend...\n";
exec("cp -r $backendDir $deployDir/intrasphere/intrasphere-backend");
echo "  ✅ Backend copié\n";

// 4. Copie du frontend
echo "🎨 Copie du frontend...\n";
exec("cp -r $frontendBuildDir $deployDir/intrasphere/intrasphere-frontend");
echo "  ✅ Frontend copié\n";

// 5. Configuration .htaccess racine (/intrasphere/.htaccess)
echo "⚙️  Configuration du routage...\n";
$intraHtaccess = "# IntraSphere - Configuration principale
RewriteEngine On
RewriteBase /intrasphere/

# API - Redirection vers backend
RewriteRule ^api/(.*)$ intrasphere-backend/public/index.php [L,QSA]

# Uploads - Redirection vers backend
RewriteRule ^uploads/(.*)$ intrasphere-backend/public/uploads/$1 [L]

# Frontend - Routes React (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/intrasphere/api/
RewriteCond %{REQUEST_URI} !^/intrasphere/uploads/
RewriteCond %{REQUEST_URI} !^/intrasphere/intrasphere-backend/
RewriteRule ^(.*)$ intrasphere-frontend/index.html [L]

# Sécurité
<Files \".env*\">
    Require all denied
</Files>
";

file_put_contents("$deployDir/intrasphere/.htaccess", $intraHtaccess);
echo "  ✅ .htaccess principal créé\n";

// 6. Configuration .htaccess frontend
$frontendHtaccess = "# IntraSphere Frontend - Routes React
RewriteEngine On
RewriteBase /intrasphere/

# Routes React Router
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /intrasphere/index.html [L]

# Cache des assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css \"access plus 1 year\"
    ExpiresByType application/javascript \"access plus 1 year\"
    ExpiresByType image/png \"access plus 1 year\"
    ExpiresByType image/jpg \"access plus 1 year\"
    ExpiresByType image/jpeg \"access plus 1 year\"
</IfModule>
";

file_put_contents("$deployDir/intrasphere/intrasphere-frontend/.htaccess", $frontendHtaccess);
echo "  ✅ .htaccess frontend créé\n";

// 7. Création d'un .env d'exemple pour le backend
$envExample = file_get_contents("$deployDir/intrasphere/intrasphere-backend/.env.example");
file_put_contents("$deployDir/intrasphere/intrasphere-backend/.env", $envExample);
echo "  ✅ .env backend créé (à configurer)\n";

// 8. Instructions de configuration
$configInstructions = "# Configuration IntraSphere

## 1. Base de données
Éditez intrasphere-backend/.env :
DB_HOST=localhost
DB_DATABASE=votre_base_intrasphere
DB_USERNAME=votre_username
DB_PASSWORD=votre_password
APP_URL=https://votre-domaine.com/intrasphere

text

## 2. Importation de la base
mysql -u username -p database_name < intrasphere-backend/database/schema.sql

text

## 3. Permissions
chmod 755 intrasphere-backend/public/uploads/ -R
chmod 700 intrasphere-backend/logs/ -R

text

## 4. Tests
- Frontend: https://votre-domaine.com/intrasphere/
- API: https://votre-domaine.com/intrasphere/api/health
- Uploads: https://votre-domaine.com/intrasphere/uploads/
";

file_put_contents("$deployDir/CONFIG_SERVEUR.md", $configInstructions);

// 9. Création du ZIP final
echo "\n📦 Création du package ZIP...\n";
$zipFile = "$rootDir/intrasphere-deploy-" . date('Ymd-His') . ".zip";
exec("cd " . escapeshellarg($deployDir) . " && zip -r " . escapeshellarg($zipFile) . " .");

echo "\n🎉 DÉPLOIEMENT PRÊT!\n";
echo "📁 Dossier: $deployDir\n";
echo "📦 Archive: $zipFile\n\n";

echo "📋 INSTRUCTIONS FINALES:\n";
echo "1. Uploadez le contenu de final-deploy/ vers public_html/\n";
echo "2. Ou uploadez et extrayez intrasphere-deploy-*.zip\n";
echo "3. Configurez intrasphere/intrasphere-backend/.env\n";
echo "4. Importez la base de données\n";
echo "5. Définissez les permissions\n";
echo "6. Testez: https://votre-domaine.com/intrasphere/\n\n";
?>
📋 ÉTAPE 3 : Compilation locale du frontend (sans Node.js sur serveur)
3.1 Sur votre machine locale avec Node.js
bash
# 1. Exécuter le script d'extraction
cd intrasphere-deploy
php deploy-scripts/extract_frontend.php

# 2. Aller dans le dossier source du frontend
cd intrasphere-frontend-source

# 3. Installer les dépendances
npm install
# ou si vous utilisez yarn :
# yarn install

# 4. Compiler pour production
npm run build
# ou avec yarn :
# yarn build

# Le build sera créé dans ../intrasphere-frontend-build/
3.2 Vérification du build
bash
# Vérifier que le build s'est bien créé
ls -la ../intrasphere-frontend-build/
# Vous devez voir : index.html, static/, asset-manifest.json, etc.

# Revenir au dossier principal
cd ..
📋 ÉTAPE 4 : Création du package de déploiement
4.1 Exécution du script de combinaison
bash
# Dans intrasphere-deploy/
php deploy-scripts/combine_deploy.php
4.2 Alternative navigateur
Si vous ne pouvez pas utiliser le terminal, créez deploy-scripts/web_deploy.php :

php
<!DOCTYPE html>
<html>
<head>
    <title>IntraSphere Deploy</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🚀 IntraSphere Deploy</h1>
    
    <?php if ($_GET['action'] === 'extract'): ?>
        <h2>📥 Extraction du frontend</h2>
        <pre><?php include 'extract_frontend.php'; ?></pre>
        <a href="?action=build">▶️ Étape suivante: Création du package</a>
        
    <?php elseif ($_GET['action'] === 'build'): ?>
        <h2>📦 Création du package</h2>
        <pre><?php include 'combine_deploy.php'; ?></pre>
        
    <?php else: ?>
        <h2>Choisissez une action:</h2>
        <a href="?action=extract">📥 1. Extraire le frontend depuis GitHub</a><br><br>
        <a href="?action=build">📦 2. Créer le package de déploiement</a>
        
        <h3>⚠️ Prérequis:</h3>
        <ul>
            <li>Frontend compilé dans intrasphere-frontend-build/</li>
            <li>Backend dans intrasphere-backend/</li>
        </ul>
    <?php endif; ?>
</body>
</html>
Puis accédez à http://localhost/votre-chemin/deploy-scripts/web_deploy.php

📋 ÉTAPE 5 : Upload vers le serveur
5.1 Upload du package
bash
# Via FTP/SFTP, uploadez vers public_html/ :
# - Soit le contenu de final-deploy/
# - Soit l'archive intrasphere-deploy-*.zip (puis extraire)
5.2 Via cPanel File Manager
Connectez-vous à cPanel

Ouvrez File Manager

Allez dans public_html/

Uploadez intrasphere-deploy-*.zip

Clic droit → Extract

Le dossier intrasphere/ sera créé

📋 ÉTAPE 6 : Configuration serveur
6.1 Configuration de la base de données
bash
# Via phpMyAdmin ou terminal :
mysql -u username -p database_name < public_html/intrasphere/intrasphere-backend/database/schema.sql
6.2 Configuration .env
Éditez public_html/intrasphere/intrasphere-backend/.env :

text
DB_HOST=localhost
DB_DATABASE=votre_base
DB_USERNAME=votre_user
DB_PASSWORD=votre_password
APP_URL=https://votre-domaine.com/intrasphere
JWT_SECRET=votre_cle_secrete_complexe
6.3 Permissions
bash
# Via SSH ou File Manager :
chmod 755 public_html/intrasphere/intrasphere-backend/public/uploads/ -R
chmod 700 public_html/intrasphere/intrasphere-backend/logs/ -R
📋 ÉTAPE 7 : Test final
7.1 URLs à tester
Frontend : https://votre-domaine.com/intrasphere/

API Health : https://votre-domaine.com/intrasphere/api/health

Login : https://votre-domaine.com/intrasphere/ (admin / admin123)

7.2 Réponse attendue API Health
json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {
    "status": "ok",
    "adapter": "php", 
    "version": "1.0.0",
    "timestamp": 1724000000
  }
}
🎉 Félicitations !
Vous avez maintenant IntraSphere complètement déployé avec :

✅ Backend PHP fonctionnel

✅ Frontend React compilé

✅ Routage automatique

✅ Structure organisée dans /intrasphere/

✅ Pas de Node.js requis sur le serveur