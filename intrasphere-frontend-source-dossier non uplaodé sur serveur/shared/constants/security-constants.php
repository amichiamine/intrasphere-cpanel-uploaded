<?php
/**
 * Constantes de sécurité partagées
 * Compatible avec les configurations TypeScript
 */

// Rate Limiting
define('RATE_LIMIT_LOGIN_ATTEMPTS', 5);
define('RATE_LIMIT_LOGIN_WINDOW', 300); // 5 minutes
define('RATE_LIMIT_FORGOT_PASSWORD_ATTEMPTS', 3);
define('RATE_LIMIT_FORGOT_PASSWORD_WINDOW', 3600); // 1 heure
define('RATE_LIMIT_REGISTER_ATTEMPTS', 3);
define('RATE_LIMIT_REGISTER_WINDOW', 900); // 15 minutes
define('RATE_LIMIT_API_GENERAL_ATTEMPTS', 100);
define('RATE_LIMIT_API_GENERAL_WINDOW', 3600); // 1 heure

// Mots de passe
define('PASSWORD_MIN_LENGTH', 8);
define('PASSWORD_REQUIRE_UPPERCASE', true);
define('PASSWORD_REQUIRE_LOWERCASE', true);
define('PASSWORD_REQUIRE_NUMBER', true);
define('PASSWORD_REQUIRE_SPECIAL_CHAR', true);
define('PASSWORD_SPECIAL_CHARS', '!@#$%^&*(),.?":{}|<>');

// Sessions
define('SESSION_LIFETIME', 3600 * 24); // 24 heures
define('SESSION_REGENERATE_INTERVAL', 900); // 15 minutes
define('SESSION_COOKIE_SECURE', true);
define('SESSION_COOKIE_HTTPONLY', true);

// Cache
define('CACHE_ENABLED', true);
define('CACHE_TTL', 3600); // 1 heure par défaut
define('CACHE_USER_PERMISSIONS_TTL', 900); // 15 minutes
define('CACHE_STATS_TTL', 600); // 10 minutes

// Logging
define('LOG_ENABLED', true);
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR, CRITICAL

// Upload
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_ALLOWED_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx']);

// Base de données
define('DB_CONNECTION_TIMEOUT', 30);
define('DB_QUERY_TIMEOUT', 30);
define('DB_MAX_CONNECTIONS', 100);

// API
define('API_VERSION', 'v1');
define('API_RATE_LIMIT_ENABLED', true);
define('API_CORS_ENABLED', true);
define('API_CORS_ORIGINS', ['http://localhost:3000', 'http://localhost:5000']);

// Email
define('EMAIL_FROM_NAME', 'IntraSphere');
define('EMAIL_FROM_ADDRESS', 'noreply@intrasphere.com');

// Rôles et permissions
define('USER_ROLES', [
    'employee' => 'Employé',
    'moderator' => 'Modérateur',
    'admin' => 'Administrateur'
]);

define('ROLE_HIERARCHY', [
    'employee' => 1,
    'moderator' => 2,
    'admin' => 3
]);

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Debug
define('APP_DEBUG', false);
define('ENABLE_QUERY_LOG', false);
define('ENABLE_PERFORMANCE_MONITORING', true);
?>