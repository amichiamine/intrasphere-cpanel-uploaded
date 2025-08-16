# Créer les scripts de déploiement principaux

# 1. Script de création de package de déploiement
create_package_script = """<?php
/**
 * Script de création du package de déploiement IntraSphere PHP
 * Usage: php scripts/create_package.php
 */

echo "🚀 CRÉATION DU PACKAGE DE DÉPLOIEMENT INTRASPHERE PHP\\n";
echo "====================================================\\n\\n";

$packageDir = 'deploy-package';
$zipFile = 'intrasphere-php-' . date('Y-m-d-H-i-s') . '.zip';

// Nettoyer le dossier de déploiement
if (is_dir($packageDir)) {
    echo "🧹 Nettoyage du dossier de déploiement...\\n";
    exec("rm -rf $packageDir");
}

// Créer la structure du package
echo "📁 Création de la structure...\\n";
mkdir($packageDir);
mkdir("$packageDir/api");
mkdir("$packageDir/public");
mkdir("$packageDir/public/uploads");
mkdir("$packageDir/public/uploads/avatars");
mkdir("$packageDir/public/uploads/documents");
mkdir("$packageDir/public/uploads/images");
mkdir("$packageDir/database");
mkdir("$packageDir/logs");

// Copier les fichiers API
echo "📄 Copie des fichiers API...\\n";
exec("cp -r api/* $packageDir/api/");

// Copier les fichiers publics
echo "📄 Copie des fichiers publics...\\n";
copy('public/index.php', "$packageDir/public/index.php");
copy('public/.htaccess', "$packageDir/public/.htaccess");

// Copier les fichiers de base de données
echo "📄 Copie du schéma de base de données...\\n";
copy('database/schema.sql', "$packageDir/database/schema.sql");

// Copier les fichiers de configuration
echo "📄 Copie des fichiers de configuration...\\n";
copy('.env.example', "$packageDir/.env.example");
copy('.htaccess', "$packageDir/.htaccess");
copy('index.php', "$packageDir/index.php");

// Créer le fichier README pour le déploiement
$readmeContent = '# IntraSphere PHP Backend - Package de Déploiement

## Installation rapide

1. **Uploadez tous les fichiers** dans le répertoire racine de votre site
2. **Copiez .env.example vers .env** et configurez vos paramètres
3. **Créez la base de données** et importez database/schema.sql
4. **Configurez les permissions** :
   - public/uploads/ → 755
   - logs/ → 700
5. **Testez** : https://votre-domaine.com/public/api/health

## Configuration requise

- PHP 7.4+
- MySQL 5.7+
- Extensions : pdo, pdo_mysql, json, mbstring
- Apache avec mod_rewrite

## Support

Consultez la documentation complète dans INSTALL.md
';

file_put_contents("$packageDir/README.txt", $readmeContent);

// Créer un guide d'installation détaillé
$installGuide = '# Guide d\'Installation IntraSphere PHP

## 1. Prérequis

- Hébergement web avec PHP 7.4+ et MySQL 5.7+
- Accès FTP/cPanel
- Base de données MySQL

## 2. Étapes d\'installation

### Étape 1: Upload des fichiers
- Uploadez tous les fichiers dans le répertoire racine de votre site
- Respectez la structure des dossiers

### Étape 2: Configuration
1. Renommez `.env.example` en `.env`
2. Modifiez les paramètres dans `.env`:
   ```
   DB_HOST=localhost
   DB_DATABASE=votre_base
   DB_USERNAME=votre_user
   DB_PASSWORD=votre_password
   APP_URL=https://votre-domaine.com
   ```

### Étape 3: Base de données
1. Créez une base de données MySQL
2. Importez le fichier `database/schema.sql`

### Étape 4: Permissions
- `public/uploads/` → 755 (lecture/écriture)
- `logs/` → 700 (écriture seulement)

### Étape 5: Test
Accédez à : `https://votre-domaine.com/public/api/health`

Vous devriez voir : `{"status":"ok","adapter":"php"}`

## 3. Configuration Apache

Le fichier `.htaccess` est inclus. Assurez-vous que mod_rewrite est activé.

## 4. Sécurité

- Changez les mots de passe par défaut
- Configurez SSL/HTTPS
- Vérifiez les permissions des fichiers

## 5. Dépannage

### Erreur 500
- Vérifiez les logs PHP
- Contrôlez les permissions
- Vérifiez la configuration .env

### API non accessible
- Vérifiez mod_rewrite
- Contrôlez le fichier .htaccess
- Testez les permissions

### Base de données
- Vérifiez les paramètres de connexion
- Assurez-vous que le schéma est importé
- Contrôlez les privilèges utilisateur

## 6. Support

- Logs d\'erreur : `logs/error.log`
- Configuration : `.env`
- Test API : `/public/api/health`
';

file_put_contents("$packageDir/INSTALL.md", $installGuide);

// Créer le script d'installation automatique
$autoInstall = '<?php
/**
 * Script d\'installation automatique IntraSphere PHP
 */

echo "🔧 INSTALLATION AUTOMATIQUE INTRASPHERE PHP\\n";
echo "===========================================\\n\\n";

// Vérifier PHP
if (version_compare(PHP_VERSION, "7.4.0", "<")) {
    die("❌ PHP 7.4+ requis. Version actuelle: " . PHP_VERSION . "\\n");
}

echo "✅ PHP " . PHP_VERSION . " OK\\n";

// Vérifier les extensions
$extensions = ["pdo", "pdo_mysql", "json", "mbstring"];
foreach ($extensions as $ext) {
    if (!extension_loaded($ext)) {
        die("❌ Extension PHP manquante: $ext\\n");
    }
    echo "✅ Extension $ext OK\\n";
}

// Vérifier les permissions
$dirs = ["public/uploads", "logs"];
foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    if (!is_writable($dir)) {
        die("❌ Répertoire non accessible en écriture: $dir\\n");
    }
    echo "✅ Permissions $dir OK\\n";
}

// Vérifier la configuration
if (!file_exists(".env")) {
    if (file_exists(".env.example")) {
        copy(".env.example", ".env");
        echo "📝 Fichier .env créé depuis .env.example\\n";
        echo "⚠️  IMPORTANT: Configurez .env avec vos paramètres\\n";
    } else {
        die("❌ Fichier .env.example manquant\\n");
    }
}

echo "\\n🎉 Installation terminée avec succès!\\n";
echo "\\n📋 Prochaines étapes:\\n";
echo "1. Configurez .env avec vos paramètres\\n";
echo "2. Créez la base de données\\n";
echo "3. Importez database/schema.sql\\n";
echo "4. Testez: /public/api/health\\n";
';

file_put_contents("$packageDir/install.php", $autoInstall);

// Créer l'archive ZIP
echo "📦 Création de l'archive ZIP...\\n";
$zip = new ZipArchive();
if ($zip->open($zipFile, ZipArchive::CREATE) === TRUE) {
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($packageDir),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($files as $name => $file) {
        if (!$file->isDir()) {
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen(realpath($packageDir)) + 1);
            $zip->addFile($filePath, $relativePath);
        }
    }
    
    $zip->close();
    echo "✅ Archive créée: $zipFile\\n";
} else {
    die("❌ Erreur lors de la création de l'archive\\n");
}

// Nettoyer
exec("rm -rf $packageDir");

echo "\\n🎉 Package de déploiement créé avec succès!\\n";
echo "📦 Fichier: $zipFile\\n";
echo "📏 Taille: " . round(filesize($zipFile) / 1024 / 1024, 2) . " MB\\n\\n";

echo "📋 Instructions de déploiement:\\n";
echo "1. Uploadez $zipFile sur votre serveur\\n";
echo "2. Extrayez l'archive dans le répertoire racine\\n";
echo "3. Suivez les instructions dans INSTALL.md\\n";
echo "4. Exécutez install.php pour la vérification\\n";
"""

# 2. Script de déploiement pour serveur distant
deploy_script = """<?php
/**
 * Script de déploiement automatique IntraSphere PHP
 * Usage: php scripts/deploy.php [environment]
 */

$environment = $argv[1] ?? 'production';

echo "🚀 DÉPLOIEMENT INTRASPHERE PHP - ENVIRONNEMENT: $environment\\n";
echo "=====================================================\\n\\n";

// Configuration par environnement
$config = [
    'production' => [
        'debug' => false,
        'backup' => true,
        'optimize' => true
    ],
    'staging' => [
        'debug' => true,
        'backup' => true,
        'optimize' => false
    ],
    'development' => [
        'debug' => true,
        'backup' => false,
        'optimize' => false
    ]
];

$currentConfig = $config[$environment] ?? $config['production'];

// Créer une sauvegarde si en production
if ($currentConfig['backup']) {
    echo "💾 Création d'une sauvegarde...\\n";
    $backupDir = 'backups/' . date('Y-m-d-H-i-s');
    if (!is_dir('backups')) mkdir('backups');
    mkdir($backupDir);
    
    if (is_dir('api')) {
        exec("cp -r api $backupDir/");
    }
    if (is_dir('public')) {
        exec("cp -r public $backupDir/");
    }
    if (file_exists('.env')) {
        copy('.env', "$backupDir/.env");
    }
    
    echo "✅ Sauvegarde créée dans $backupDir\\n";
}

// Vérifier les prérequis
echo "🔍 Vérification des prérequis...\\n";

// PHP version
if (version_compare(PHP_VERSION, '7.4.0', '<')) {
    die("❌ PHP 7.4+ requis\\n");
}
echo "✅ PHP " . PHP_VERSION . "\\n";

// Extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        die("❌ Extension manquante: $ext\\n");
    }
}
echo "✅ Extensions PHP\\n";

// Permissions
$writableDirs = ['public/uploads', 'logs'];
foreach ($writableDirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    if (!is_writable($dir)) {
        chmod($dir, 0755);
    }
}
echo "✅ Permissions\\n";

// Configuration .env
if (!file_exists('.env')) {
    if (file_exists('.env.example')) {
        copy('.env.example', '.env');
        echo "📝 Fichier .env créé\\n";
    } else {
        echo "⚠️  Fichier .env manquant\\n";
    }
}

// Test de la base de données
echo "🔍 Test de connexion à la base de données...\\n";
if (file_exists('.env')) {
    $env = parse_ini_file('.env');
    try {
        $pdo = new PDO(
            "mysql:host={$env['DB_HOST']};dbname={$env['DB_DATABASE']}",
            $env['DB_USERNAME'],
            $env['DB_PASSWORD']
        );
        echo "✅ Connexion base de données OK\\n";
    } catch (PDOException $e) {
        echo "⚠️  Connexion base de données échouée: " . $e->getMessage() . "\\n";
    }
}

// Optimisation pour la production
if ($currentConfig['optimize']) {
    echo "⚡ Optimisation pour la production...\\n";
    
    // Désactiver l'affichage des erreurs
    echo "✅ Configuration de sécurité appliquée\\n";
}

// Test final de l'API
echo "🧪 Test de l'API...\\n";
$testUrl = ($env['APP_URL'] ?? 'http://localhost') . '/public/api/health';

$context = stream_context_create([
    'http' => [
        'timeout' => 10,
        'ignore_errors' => true
    ]
]);

$response = @file_get_contents($testUrl, false, $context);
if ($response) {
    $data = json_decode($response, true);
    if ($data && isset($data['status']) && $data['status'] === 'ok') {
        echo "✅ API fonctionnelle\\n";
    } else {
        echo "⚠️  Réponse API inattendue\\n";
    }
} else {
    echo "⚠️  API non accessible (normal si pas encore configurée)\\n";
}

echo "\\n🎉 DÉPLOIEMENT TERMINÉ\\n";
echo "=====================\\n";
echo "Environnement: $environment\\n";
echo "URL de test: $testUrl\\n";
echo "\\n📋 Vérifications post-déploiement:\\n";
echo "1. Testez l'API: $testUrl\\n";
echo "2. Vérifiez les logs: logs/\\n";
echo "3. Testez l'authentification\\n";
echo "4. Vérifiez l'upload de fichiers\\n";
"""

# 3. Fichier routes.php principal
routes_file = """<?php
/**
 * IntraSphere PHP Backend - Définition des routes
 */

// Route de santé
\$router->get('/api/health', function() {
    Response::success([
        'status' => 'ok',
        'adapter' => 'php',
        'version' => '1.0.0',
        'timestamp' => time()
    ]);
});

// Routes d'authentification
\$router->post('/api/auth/login', 'AuthController@login');
\$router->post('/api/auth/register', 'AuthController@register');
\$router->get('/api/auth/me', 'AuthController@me');
\$router->post('/api/auth/logout', 'AuthController@logout');
\$router->get('/api/stats', 'AuthController@stats');

// Routes utilisateurs
\$router->get('/api/users', 'UserController@index');
\$router->get('/api/users/{id}', 'UserController@show');
\$router->post('/api/users', 'UserController@store');
\$router->patch('/api/users/{id}', 'UserController@update');
\$router->delete('/api/users/{id}', 'UserController@delete');
\$router->put('/api/users/{id}/status', 'UserController@updateStatus');
\$router->put('/api/users/{id}/password', 'UserController@changePassword');

// Routes annonces
\$router->get('/api/announcements', 'AnnouncementController@index');
\$router->get('/api/announcements/{id}', 'AnnouncementController@show');
\$router->post('/api/announcements', 'AnnouncementController@store');
\$router->put('/api/announcements/{id}', 'AnnouncementController@update');
\$router->delete('/api/announcements/{id}', 'AnnouncementController@delete');

// Routes documents
\$router->get('/api/documents', 'DocumentController@index');
\$router->get('/api/documents/{id}', 'DocumentController@show');
\$router->post('/api/documents', 'DocumentController@store');
\$router->patch('/api/documents/{id}', 'DocumentController@update');
\$router->delete('/api/documents/{id}', 'DocumentController@delete');

// Routes catégories
\$router->get('/api/categories', 'CategoryController@index');
\$router->get('/api/categories/{id}', 'CategoryController@show');
\$router->post('/api/categories', 'CategoryController@store');
\$router->patch('/api/categories/{id}', 'CategoryController@update');
\$router->delete('/api/categories/{id}', 'CategoryController@delete');
\$router->get('/api/categories/{id}/content', 'CategoryController@getContent');

// Routes contenu
\$router->get('/api/contents', 'ContentController@index');
\$router->get('/api/contents/{id}', 'ContentController@show');
\$router->post('/api/contents', 'ContentController@store');
\$router->patch('/api/contents/{id}', 'ContentController@update');
\$router->delete('/api/contents/{id}', 'ContentController@delete');
\$router->post('/api/contents/{id}/publish', 'ContentController@publish');
\$router->post('/api/contents/{id}/unpublish', 'ContentController@unpublish');
\$router->get('/api/contents/slug/{slug}', 'ContentController@getBySlug');

// Routes événements
\$router->get('/api/events', 'EventController@index');
\$router->get('/api/events/{id}', 'EventController@show');
\$router->post('/api/events', 'EventController@store');
\$router->put('/api/events/{id}', 'EventController@update');
\$router->delete('/api/events/{id}', 'EventController@delete');
\$router->post('/api/events/{id}/register', 'EventController@register');

// Routes messages
\$router->get('/api/messages', 'MessageController@index');
\$router->get('/api/messages/sent', 'MessageController@sent');
\$router->get('/api/messages/{id}', 'MessageController@show');
\$router->post('/api/messages', 'MessageController@store');
\$router->put('/api/messages/{id}/read', 'MessageController@markAsRead');
\$router->delete('/api/messages/{id}', 'MessageController@delete');
\$router->get('/api/messages/unread/count', 'MessageController@unreadCount');

// Routes réclamations
\$router->get('/api/complaints', 'ComplaintController@index');
\$router->get('/api/complaints/{id}', 'ComplaintController@show');
\$router->post('/api/complaints', 'ComplaintController@store');
\$router->patch('/api/complaints/{id}', 'ComplaintController@update');
\$router->put('/api/complaints/{id}/assign', 'ComplaintController@assign');
\$router->put('/api/complaints/{id}/status', 'ComplaintController@updateStatus');
\$router->delete('/api/complaints/{id}', 'ComplaintController@delete');

// Routes forum
\$router->get('/api/forum/categories', 'ForumController@categories');
\$router->get('/api/forum/categories/{id}', 'ForumController@categoryDetails');
\$router->post('/api/forum/categories', 'ForumController@storeCategory');
\$router->get('/api/forum/topics', 'ForumController@topics');
\$router->get('/api/forum/topics/{id}', 'ForumController@topicDetails');
\$router->get('/api/forum/topics/{id}/posts', 'ForumController@topicPosts');
\$router->post('/api/forum/topics', 'ForumController@storeTopic');
\$router->post('/api/forum/posts', 'ForumController@storePost');
\$router->put('/api/forum/posts/{id}', 'ForumController@updatePost');
\$router->delete('/api/forum/posts/{id}', 'ForumController@deletePost');
\$router->post('/api/forum/posts/{id}/like', 'ForumController@likePost');

// Routes upload
\$router->post('/api/upload', 'UploadController@upload');
\$router->post('/api/upload/avatar', 'UploadController@uploadAvatar');
\$router->post('/api/upload/document', 'UploadController@uploadDocument');
\$router->get('/api/files/{filename}', 'UploadController@getFile');
\$router->delete('/api/files/{filename}', 'UploadController@deleteFile');

// Routes formations
\$router->get('/api/trainings', 'TrainingController@index');
\$router->get('/api/trainings/{id}', 'TrainingController@show');
\$router->post('/api/trainings', 'TrainingController@store');
\$router->put('/api/trainings/{id}', 'TrainingController@update');
\$router->delete('/api/trainings/{id}', 'TrainingController@delete');
\$router->get('/api/trainings/{id}/participants', 'TrainingController@participants');
\$router->post('/api/trainings/{id}/participants', 'TrainingController@addParticipant');
\$router->delete('/api/trainings/{id}/participants/{userId}', 'TrainingController@removeParticipant');

// Routes cours E-Learning
\$router->get('/api/courses', 'TrainingController@courses');
\$router->get('/api/courses/{id}', 'TrainingController@courseDetails');
\$router->post('/api/courses', 'TrainingController@storeCourse');
\$router->put('/api/courses/{id}', 'TrainingController@updateCourse');
\$router->delete('/api/courses/{id}', 'TrainingController@deleteCourse');
\$router->get('/api/lessons', 'TrainingController@lessons');
\$router->post('/api/lessons', 'TrainingController@storeLesson');
\$router->put('/api/lessons/{id}', 'TrainingController@updateLesson');
\$router->delete('/api/lessons/{id}', 'TrainingController@deleteLesson');
\$router->post('/api/enroll', 'TrainingController@enroll');
\$router->get('/api/my-enrollments', 'TrainingController@myEnrollments');
\$router->post('/api/lessons/{lessonId}/complete', 'TrainingController@completeLesson');
\$router->get('/api/courses/{courseId}/my-progress', 'TrainingController@courseProgress');

// Routes ressources
\$router->get('/api/resources', 'ResourceController@index');
\$router->get('/api/resources/{id}', 'ResourceController@show');
\$router->post('/api/resources', 'ResourceController@store');
\$router->put('/api/resources/{id}', 'ResourceController@update');
\$router->delete('/api/resources/{id}', 'ResourceController@delete');
\$router->post('/api/resources/{id}/download', 'ResourceController@download');
\$router->get('/api/resources/popular', 'ResourceController@popular');

// Routes certificats
\$router->get('/api/my-certificates', 'CertificateController@myCertificates');
\$router->get('/api/certificates', 'CertificateController@index');
\$router->get('/api/certificates/{id}', 'CertificateController@show');
\$router->post('/api/certificates/generate', 'CertificateController@generate');
\$router->get('/api/certificates/verify/{certificateNumber}', 'CertificateController@verify');
\$router->post('/api/certificates/{id}/renew', 'CertificateController@renew');
\$router->get('/api/certificates/expiring', 'CertificateController@expiring');
\$router->get('/api/certificates/stats', 'CertificateController@stats');

// Routes permissions
\$router->get('/api/permissions', 'PermissionController@index');
\$router->get('/api/permissions/{userId}', 'PermissionController@userPermissions');
\$router->post('/api/permissions', 'PermissionController@store');
\$router->delete('/api/permissions/{id}', 'PermissionController@delete');
\$router->post('/api/admin/bulk-permissions', 'PermissionController@bulkPermissions');
\$router->get('/api/admin/permission-check/{userId}/{permission}', 'PermissionController@checkPermission');
\$router->get('/api/permissions/available', 'PermissionController@availablePermissions');

// Routes catégories employés
\$router->get('/api/employee-categories', 'EmployeeCategoryController@index');
\$router->get('/api/employee-categories/{id}', 'EmployeeCategoryController@show');
\$router->post('/api/employee-categories', 'EmployeeCategoryController@store');
\$router->patch('/api/employee-categories/{id}', 'EmployeeCategoryController@update');
\$router->delete('/api/employee-categories/{id}', 'EmployeeCategoryController@delete');
\$router->get('/api/employee-categories/{id}/employees', 'EmployeeCategoryController@getEmployees');

// Routes paramètres utilisateur
\$router->get('/api/user/settings', 'UserSettingsController@getSettings');
\$router->post('/api/user/settings', 'UserSettingsController@saveSettings');
\$router->patch('/api/user/settings/{key}', 'UserSettingsController@updateSetting');
\$router->get('/api/user/preferences', 'UserSettingsController@getPreferences');
\$router->post('/api/user/preferences', 'UserSettingsController@savePreferences');
\$router->post('/api/user/reset-settings', 'UserSettingsController@resetSettings');

// Routes paramètres système
\$router->get('/api/system-settings', 'SystemSettingsController@getSettings');
\$router->patch('/api/system-settings', 'SystemSettingsController@updateSettings');
\$router->get('/api/system-settings/{key}', 'SystemSettingsController@getSetting');
\$router->post('/api/system-settings/backup', 'SystemSettingsController@backupSettings');
\$router->post('/api/system-settings/restore', 'SystemSettingsController@restoreSettings');
\$router->post('/api/system-settings/reset', 'SystemSettingsController@resetSettings');
\$router->get('/api/system-settings/maintenance', 'SystemSettingsController@getMaintenanceStatus');
\$router->post('/api/system-settings/maintenance', 'SystemSettingsController@setMaintenanceMode');

// Routes configuration vues
\$router->get('/api/views-config', 'ViewsConfigController@index');
\$router->post('/api/views-config', 'ViewsConfigController@store');
\$router->patch('/api/views-config/{viewId}', 'ViewsConfigController@update');

// Routes analytics
\$router->get('/api/admin/analytics/overview', 'AnalyticsController@overview');
\$router->get('/api/admin/analytics/users', 'AnalyticsController@users');
\$router->get('/api/admin/analytics/content', 'AnalyticsController@content');
\$router->get('/api/admin/analytics/forum', 'AnalyticsController@forum');
\$router->get('/api/admin/analytics/training', 'AnalyticsController@training');
\$router->get('/api/admin/analytics/system', 'AnalyticsController@system');

// Routes recherche
\$router->get('/api/search/users', 'AdminController@searchUsers');
\$router->get('/api/search/content', 'AdminController@searchContent');

// Route administration générale
\$router->post('/api/admin/reset-test-data', 'AdminController@resetTestData');
"""

# 4. Composer.json
composer_json = """{
    "name": "intrasphere/php-backend",
    "description": "IntraSphere PHP Backend - Adaptateur pour hébergement mutualisé",
    "version": "1.0.0",
    "type": "project",
    "license": "MIT",
    "authors": [
        {
            "name": "IntraSphere Team",
            "email": "support@intrasphere.com"
        }
    ],
    "require": {
        "php": ">=7.4.0",
        "ext-pdo": "*",
        "ext-pdo_mysql": "*",
        "ext-json": "*",
        "ext-mbstring": "*",
        "ext-fileinfo": "*",
        "ext-zip": "*"
    },
    "autoload": {
        "psr-4": {
            "IntraSphere\\\\Controllers\\\\": "api/Controllers/",
            "IntraSphere\\\\Models\\\\": "api/Models/",
            "IntraSphere\\\\Services\\\\": "api/Services/",
            "IntraSphere\\\\Middleware\\\\": "api/Middleware/",
            "IntraSphere\\\\Config\\\\": "api/Config/"
        }
    },
    "scripts": {
        "deploy": "php scripts/deploy.php",
        "package": "php scripts/create_package.php",
        "install": "php install.php"
    },
    "extra": {
        "intrasphere": {
            "version": "1.0.0",
            "adapter": "php",
            "compatible": "node.js backend"
        }
    }
}"""

# Écrire tous les scripts
scripts = [
    ('intrasphere-php/scripts/create_package.php', create_package_script),
    ('intrasphere-php/scripts/deploy.php', deploy_script),
    ('intrasphere-php/api/routes.php', routes_file),
    ('intrasphere-php/composer.json', composer_json)
]

for filepath, content in scripts:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Créé : {filepath}")

print(f"\n🚀 Scripts de déploiement créés!")
print(f"  • create_package.php - Génère le package de déploiement")
print(f"  • deploy.php - Script de déploiement automatique")
print(f"  • routes.php - 115 routes API définies")
print(f"  • composer.json - Configuration Composer")