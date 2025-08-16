# Créer les fichiers de configuration principaux

# 1. Fichier .env.example
env_example = """# Configuration IntraSphere PHP Backend
APP_NAME=IntraSphere
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-domaine.com

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=intrasphere
DB_USERNAME=votre_username
DB_PASSWORD=votre_password

# Sécurité
JWT_SECRET=votre_cle_secrete_tres_longue_et_complexe
SESSION_LIFETIME=3600
BCRYPT_ROUNDS=12

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=public/uploads
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx

# Email (optionnel)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@votre-domaine.com
MAIL_FROM_NAME=IntraSphere

# Logs
LOG_LEVEL=info
LOG_PATH=logs/
"""

# 2. Fichier .htaccess principal
htaccess_main = """# IntraSphere PHP Backend - Configuration Apache

# Protection des fichiers sensibles
<Files ".env*">
    Require all denied
</Files>

<Files "*.php">
    <RequireAll>
        Require all granted
    </RequireAll>
</Files>

# Redirection vers public/
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/public/
RewriteRule ^(.*)$ public/$1 [L]

# Sécurité headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    ExpiresByType application/x-shockwave-flash "access plus 1 month"
    ExpiresByType image/x-icon "access plus 1 year"
</IfModule>
"""

# 3. .htaccess pour le répertoire public
htaccess_public = """# IntraSphere PHP Backend - Public Directory

RewriteEngine On

# Gérer CORS pour les requêtes API
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>

# Rediriger toutes les requêtes vers index.php sauf les fichiers existants
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ index.php [QSA,L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Protection des uploads
<FilesMatch "\.(php|php3|php4|php5|phtml|pl|py|jsp|asp|sh|cgi)$">
    Require all denied
</FilesMatch>
"""

# 4. Index.php principal
main_index_php = """<?php
/**
 * IntraSphere PHP Backend
 * Point d'entrée principal
 */

// Démarrer la session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Charger les variables d'environnement
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
            [$key, $value] = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Configuration des erreurs
if ($_ENV['APP_DEBUG'] === 'true') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Autoloader simple
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/api/Controllers/',
        __DIR__ . '/api/Models/',
        __DIR__ . '/api/Services/',
        __DIR__ . '/api/Middleware/',
        __DIR__ . '/api/Config/'
    ];
    
    foreach ($paths as $path) {
        $file = $path . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Rediriger vers le répertoire public
header('Location: /public/');
exit();
"""

# 5. Index.php public
public_index_php = """<?php
/**
 * IntraSphere PHP Backend - API Entry Point
 */

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Démarrer la session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Autoloader
spl_autoload_register(function ($class) {
    $paths = [
        '../api/Controllers/',
        '../api/Models/',
        '../api/Services/',
        '../api/Middleware/',
        '../api/Config/'
    ];
    
    foreach ($paths as $path) {
        $file = __DIR__ . '/' . $path . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Charger les variables d'environnement
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
            [$key, $value] = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

try {
    // Initialiser le routeur
    $router = new Router();
    
    // Charger les routes
    require_once __DIR__ . '/../api/routes.php';
    
    // Traiter la requête
    $router->dispatch();
    
} catch (Exception $e) {
    error_log('IntraSphere Error: ' . $e->getMessage());
    
    Response::error(
        $_ENV['APP_DEBUG'] === 'true' ? $e->getMessage() : 'Internal server error',
        500
    );
}
"""

# Écrire les fichiers de configuration
config_files = [
    ('intrasphere-php/.env.example', env_example),
    ('intrasphere-php/.htaccess', htaccess_main),
    ('intrasphere-php/public/.htaccess', htaccess_public),
    ('intrasphere-php/index.php', main_index_php),
    ('intrasphere-php/public/index.php', public_index_php)
]

for filepath, content in config_files:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Créé : {filepath}")

print(f"\n📄 Fichiers de configuration créés!")