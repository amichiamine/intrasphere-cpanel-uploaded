/**
 * Constantes de sécurité partagées (version TypeScript)
 * Compatible avec la version PHP
 */

// Rate Limiting
export const RATE_LIMIT_LOGIN_ATTEMPTS = 5;
export const RATE_LIMIT_LOGIN_WINDOW = 300; // 5 minutes
export const RATE_LIMIT_FORGOT_PASSWORD_ATTEMPTS = 3;
export const RATE_LIMIT_FORGOT_PASSWORD_WINDOW = 3600; // 1 heure
export const RATE_LIMIT_REGISTER_ATTEMPTS = 3;
export const RATE_LIMIT_REGISTER_WINDOW = 900; // 15 minutes
export const RATE_LIMIT_API_GENERAL_ATTEMPTS = 100;
export const RATE_LIMIT_API_GENERAL_WINDOW = 3600; // 1 heure

// Mots de passe
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIRE_UPPERCASE = true;
export const PASSWORD_REQUIRE_LOWERCASE = true;
export const PASSWORD_REQUIRE_NUMBER = true;
export const PASSWORD_REQUIRE_SPECIAL_CHAR = true;
export const PASSWORD_SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>';

// Sessions
export const SESSION_LIFETIME = 3600 * 24; // 24 heures
export const SESSION_REGENERATE_INTERVAL = 900; // 15 minutes
export const SESSION_COOKIE_SECURE = true;
export const SESSION_COOKIE_HTTPONLY = true;

// Cache
export const CACHE_ENABLED = true;
export const CACHE_TTL = 3600; // 1 heure par défaut
export const CACHE_USER_PERMISSIONS_TTL = 900; // 15 minutes
export const CACHE_STATS_TTL = 600; // 10 minutes

// Logging
export const LOG_ENABLED = true;
export const LOG_LEVEL = 'INFO'; // DEBUG, INFO, WARNING, ERROR, CRITICAL

// Upload
export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const UPLOAD_ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];

// Base de données
export const DB_CONNECTION_TIMEOUT = 30;
export const DB_QUERY_TIMEOUT = 30;
export const DB_MAX_CONNECTIONS = 100;

// API
export const API_VERSION = 'v1';
export const API_RATE_LIMIT_ENABLED = true;
export const API_CORS_ENABLED = true;
export const API_CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5000'];

// Email
export const EMAIL_FROM_NAME = 'IntraSphere';
export const EMAIL_FROM_ADDRESS = 'noreply@intrasphere.com';

// Rôles et permissions
export const USER_ROLES = {
  employee: 'Employé',
  moderator: 'Modérateur',
  admin: 'Administrateur'
} as const;

export const ROLE_HIERARCHY = {
  employee: 1,
  moderator: 2,
  admin: 3
} as const;

export type UserRole = keyof typeof USER_ROLES;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Debug
export const APP_DEBUG = process.env.NODE_ENV === 'development';
export const ENABLE_QUERY_LOG = false;
export const ENABLE_PERFORMANCE_MONITORING = true;

// Validation regex patterns
export const VALIDATION_PATTERNS = {
  username: /^[a-zA-Z0-9_.-]+$/,
  fullName: /^[a-zA-ZÀ-ÿ\s'-]+$/,
  phone: /^(?:\+33|0)[1-9](?:[0-9]{8})$/,
  url: /^https?:\/\/.+/
} as const;

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
} as const;

// Permissions système
export const SYSTEM_PERMISSIONS = {
  'manage_announcements': 'Gérer les annonces',
  'manage_documents': 'Gérer les documents',
  'manage_events': 'Gérer les événements',
  'manage_users': 'Gérer les utilisateurs',
  'manage_trainings': 'Gérer les formations',
  'validate_topics': 'Valider les sujets',
  'validate_posts': 'Valider les posts',
  'manage_employee_categories': 'Gérer les catégories d\'employés',
  'manage_content': 'Gérer le contenu multimédia',
  'manage_complaints': 'Gérer les réclamations',
  'view_admin_stats': 'Voir les statistiques d\'administration',
  'manage_permissions': 'Gérer les permissions utilisateur',
  'system_configuration': 'Configuration système'
} as const;

export type SystemPermission = keyof typeof SYSTEM_PERMISSIONS;