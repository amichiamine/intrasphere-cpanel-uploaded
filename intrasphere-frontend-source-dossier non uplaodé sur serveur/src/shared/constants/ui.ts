// UI Constants and Configuration

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

export const THEME_COLORS = {
  primary: '#8B5CF6',
  secondary: '#A78BFA',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
} as const;

// Component Sizes
export const SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  XXL: '2xl'
} as const;

// Button Variants
export const BUTTON_VARIANTS = {
  DEFAULT: 'default',
  DESTRUCTIVE: 'destructive',
  OUTLINE: 'outline',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
  LINK: 'link'
} as const;

// Alert Types
export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

// Modal Sizes
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full'
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

// Breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  XXL: '1536px'
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  TOOLTIP: 1070,
  TOAST: 1080
} as const;

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// Status Colors
export const STATUS_COLORS = {
  active: '#10B981',
  inactive: '#6B7280',
  pending: '#F59E0B',
  completed: '#10B981',
  cancelled: '#EF4444',
  draft: '#6B7280'
} as const;

// Priority Colors
export const PRIORITY_COLORS = {
  low: '#6B7280',
  medium: '#F59E0B',
  high: '#EF4444',
  urgent: '#DC2626'
} as const;

// Role Colors
export const ROLE_COLORS = {
  admin: '#DC2626',
  moderator: '#F59E0B',
  employee: '#10B981',
  guest: '#6B7280'
} as const;

// File Type Icons
export const FILE_TYPE_ICONS = {
  pdf: 'file-text',
  doc: 'file-text',
  docx: 'file-text',
  xls: 'file-spreadsheet',
  xlsx: 'file-spreadsheet',
  ppt: 'presentation',
  pptx: 'presentation',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  svg: 'image',
  mp4: 'video',
  avi: 'video',
  mov: 'video',
  mp3: 'music',
  wav: 'music',
  zip: 'archive',
  rar: 'archive',
  default: 'file'
} as const;

// Content Categories
export const CONTENT_CATEGORIES = {
  ANNOUNCEMENT: 'announcement',
  DOCUMENT: 'document',
  EVENT: 'event',
  TRAINING: 'training',
  COURSE: 'course',
  RESOURCE: 'resource'
} as const;

// Category Colors
export const CATEGORY_COLORS = {
  general: '#6B7280',
  important: '#F59E0B',
  urgent: '#EF4444',
  hr: '#8B5CF6',
  it: '#3B82F6',
  finance: '#10B981',
  marketing: '#F97316',
  operations: '#6366F1'
} as const;

// Table Configuration
export const TABLE_CONFIG = {
  PAGE_SIZES: [10, 25, 50, 100],
  DEFAULT_PAGE_SIZE: 25,
  DEFAULT_SORT_ORDER: 'desc' as const
} as const;

// Form Configuration
export const FORM_CONFIG = {
  VALIDATION_DELAY: 300, // ms
  AUTO_SAVE_DELAY: 1000, // ms
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
} as const;

// Search Configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300, // ms
  MAX_RESULTS: 50,
  HIGHLIGHT_CLASS: 'bg-yellow-200'
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000, // ms
  SUCCESS_DURATION: 3000, // ms
  ERROR_DURATION: 0, // persistent
  MAX_NOTIFICATIONS: 5,
  POSITION: 'top-right' as const
} as const;

// Dashboard Configuration
export const DASHBOARD_CONFIG = {
  REFRESH_INTERVAL: 30000, // ms
  MAX_RECENT_ITEMS: 10,
  MAX_ANNOUNCEMENTS: 5,
  MAX_EVENTS: 3
} as const;

// Calendar Configuration
export const CALENDAR_CONFIG = {
  VIEWS: ['month', 'week', 'day'] as const,
  DEFAULT_VIEW: 'month' as const,
  START_OF_WEEK: 1, // Monday
  TIME_FORMAT: '24h' as const,
  DATE_FORMAT: 'DD/MM/YYYY' as const
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  COLORS: [
    '#8B5CF6',
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#6366F1',
    '#F97316',
    '#06B6D4'
  ],
  DEFAULT_HEIGHT: 300,
  ANIMATION_DURATION: 300
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: true,
  PAGE_SIZE_OPTIONS: ['10', '25', '50', '100']
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion réseau',
  SERVER_ERROR: 'Erreur serveur',
  UNAUTHORIZED: 'Accès non autorisé',
  FORBIDDEN: 'Action interdite',
  NOT_FOUND: 'Ressource introuvable',
  VALIDATION_ERROR: 'Erreur de validation',
  UPLOAD_ERROR: 'Erreur lors du téléchargement',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Enregistré avec succès',
  UPDATED: 'Mis à jour avec succès',
  DELETED: 'Supprimé avec succès',
  CREATED: 'Créé avec succès',
  UPLOADED: 'Téléchargé avec succès',
  SENT: 'Envoyé avec succès'
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING: 'Chargement...',
  SAVING: 'Enregistrement...',
  UPLOADING: 'Téléchargement...',
  PROCESSING: 'Traitement...',
  CONNECTING: 'Connexion...'
} as const;

// Glass Morphism Styles
export const GLASS_STYLES = {
  LIGHT: 'backdrop-blur-md bg-white/80 border border-white/20',
  MEDIUM: 'backdrop-blur-lg bg-white/60 border border-white/30',
  STRONG: 'backdrop-blur-xl bg-white/40 border border-white/40',
  CARD: 'backdrop-blur-sm bg-white/90 border border-gray-200/50 shadow-lg'
} as const;