// Application Routes Constants

export const ROUTES = {
  // Public Routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Dashboard Routes
  DASHBOARD: '/',
  PUBLIC_DASHBOARD: '/public',
  EMPLOYEE_DASHBOARD: '/employee',
  
  // Main Feature Routes
  ANNOUNCEMENTS: '/announcements',
  DOCUMENTS: '/documents',
  EVENTS: '/events',
  DIRECTORY: '/directory',
  MESSAGES: '/messages',
  COMPLAINTS: '/complaints',
  FORUM: '/forum',
  
  // Training/Learning Routes
  TRAINING: '/training',
  TRAININGS: '/trainings',
  COURSES: '/courses',
  MY_LEARNING: '/my-learning',
  RESOURCES: '/resources',
  CERTIFICATES: '/certificates',
  
  // Admin Routes
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_PERMISSIONS: '/admin/permissions',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_ANALYTICS: '/admin/analytics',
  VIEWS_MANAGEMENT: '/admin/views',
  
  // Profile/Settings Routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Utility Routes
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
  NOT_FOUND: '/404'
} as const;

export const API_ROUTES = {
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_ME: '/api/auth/me',
  AUTH_LOGOUT: '/api/auth/logout',
  
  // Stats
  STATS: '/api/stats',
  
  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_STATUS: (id: string) => `/api/users/${id}/status`,
  USER_PASSWORD: (id: string) => `/api/users/${id}/password`,
  USER_TRAININGS: (id: string) => `/api/users/${id}/trainings`,
  
  // Announcements
  ANNOUNCEMENTS: '/api/announcements',
  ANNOUNCEMENT_BY_ID: (id: string) => `/api/announcements/${id}`,
  
  // Documents
  DOCUMENTS: '/api/documents',
  DOCUMENT_BY_ID: (id: string) => `/api/documents/${id}`,
  
  // Events
  EVENTS: '/api/events',
  EVENT_BY_ID: (id: string) => `/api/events/${id}`,
  
  // Messages
  MESSAGES: '/api/messages',
  MESSAGES_SENT: '/api/messages/sent',
  MESSAGE_BY_ID: (id: string) => `/api/messages/${id}`,
  MESSAGE_READ: (id: string) => `/api/messages/${id}/read`,
  
  // Complaints
  COMPLAINTS: '/api/complaints',
  COMPLAINT_BY_ID: (id: string) => `/api/complaints/${id}`,
  COMPLAINT_ASSIGN: (id: string) => `/api/complaints/${id}/assign`,
  COMPLAINT_STATUS: (id: string) => `/api/complaints/${id}/status`,
  
  // Permissions
  PERMISSIONS: '/api/permissions',
  PERMISSIONS_BY_USER: (userId: string) => `/api/permissions/${userId}`,
  BULK_PERMISSIONS: '/api/admin/bulk-permissions',
  PERMISSION_CHECK: (userId: string, permission: string) => `/api/admin/permission-check/${userId}/${permission}`,
  
  // Content Management
  CONTENTS: '/api/contents',
  CONTENT_BY_ID: (id: string) => `/api/contents/${id}`,
  CATEGORIES: '/api/categories',
  CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`,
  
  // Employee Categories
  EMPLOYEE_CATEGORIES: '/api/employee-categories',
  EMPLOYEE_CATEGORY_BY_ID: (id: string) => `/api/employee-categories/${id}`,
  
  // System Settings
  SYSTEM_SETTINGS: '/api/system-settings',
  
  // Training
  TRAININGS: '/api/trainings',
  TRAINING_BY_ID: (id: string) => `/api/trainings/${id}`,
  TRAINING_PARTICIPANTS: (id: string) => `/api/trainings/${id}/participants`,
  TRAINING_PARTICIPANT: (trainingId: string, userId: string) => `/api/trainings/${trainingId}/participants/${userId}`,
  
  // E-Learning
  COURSES: '/api/courses',
  COURSE_BY_ID: (id: string) => `/api/courses/${id}`,
  COURSE_LESSONS: (courseId: string) => `/api/courses/${courseId}/lessons`,
  COURSE_PROGRESS: (courseId: string) => `/api/courses/${courseId}/my-progress`,
  
  LESSONS: '/api/lessons',
  LESSON_BY_ID: (id: string) => `/api/lessons/${id}`,
  LESSON_COMPLETE: (id: string) => `/api/lessons/${id}/complete`,
  
  ENROLLMENTS: '/api/my-enrollments',
  ENROLL: (courseId: string) => `/api/enroll/${courseId}`,
  
  RESOURCES: '/api/resources',
  RESOURCE_BY_ID: (id: string) => `/api/resources/${id}`,
  
  CERTIFICATES: '/api/my-certificates',
  
  // Forum
  FORUM_CATEGORIES: '/api/forum/categories',
  FORUM_TOPICS: '/api/forum/topics',
  FORUM_TOPIC_BY_ID: (id: string) => `/api/forum/topics/${id}`,
  FORUM_TOPIC_POSTS: (id: string) => `/api/forum/topics/${id}/posts`,
  FORUM_POSTS: '/api/forum/posts',
  FORUM_POST_LIKE: (id: string) => `/api/forum/posts/${id}/like`,
  
  // Admin & Analytics
  ADMIN_ANALYTICS_OVERVIEW: '/api/admin/analytics/overview',
  ADMIN_ANALYTICS_USERS: '/api/admin/analytics/users',
  ADMIN_ANALYTICS_CONTENT: '/api/admin/analytics/content',
  ADMIN_RESET_DATA: '/api/admin/reset-test-data',
  
  // Views Configuration
  VIEWS_CONFIG: '/api/views-config',
  VIEWS_CONFIG_BY_ID: (viewId: string) => `/api/views-config/${viewId}`,
  
  // User Settings
  USER_SETTINGS: '/api/user/settings',
  
  // Search
  SEARCH_USERS: '/api/search/users',
  SEARCH_CONTENT: '/api/search/content'
} as const;

// Route Groups for Navigation
export const NAVIGATION_GROUPS = {
  MAIN: [
    { route: ROUTES.DASHBOARD, label: 'Tableau de Bord', icon: 'home' },
    { route: ROUTES.ANNOUNCEMENTS, label: 'Annonces', icon: 'megaphone' },
    { route: ROUTES.DOCUMENTS, label: 'Documents', icon: 'file-text' },
    { route: ROUTES.EVENTS, label: 'Événements', icon: 'calendar' },
    { route: ROUTES.DIRECTORY, label: 'Annuaire', icon: 'users' }
  ],
  
  COMMUNICATION: [
    { route: ROUTES.MESSAGES, label: 'Messages', icon: 'mail' },
    { route: ROUTES.COMPLAINTS, label: 'Réclamations', icon: 'alert-circle' },
    { route: ROUTES.FORUM, label: 'Forum', icon: 'message-square' }
  ],
  
  LEARNING: [
    { route: ROUTES.TRAINING, label: 'Formations', icon: 'graduation-cap' },
    { route: ROUTES.COURSES, label: 'Cours', icon: 'book-open' },
    { route: ROUTES.MY_LEARNING, label: 'Mon Apprentissage', icon: 'user-check' },
    { route: ROUTES.RESOURCES, label: 'Ressources', icon: 'folder' },
    { route: ROUTES.CERTIFICATES, label: 'Certificats', icon: 'award' }
  ],
  
  ADMIN: [
    { route: ROUTES.ADMIN, label: 'Administration', icon: 'settings' },
    { route: ROUTES.ADMIN_USERS, label: 'Utilisateurs', icon: 'users', permission: 'admin' },
    { route: ROUTES.ADMIN_PERMISSIONS, label: 'Permissions', icon: 'shield', permission: 'admin' },
    { route: ROUTES.ADMIN_ANALYTICS, label: 'Analytique', icon: 'bar-chart', permission: 'admin' },
    { route: ROUTES.VIEWS_MANAGEMENT, label: 'Vues', icon: 'layout', permission: 'admin' }
  ],
  
  PERSONAL: [
    { route: ROUTES.PROFILE, label: 'Profil', icon: 'user' },
    { route: ROUTES.SETTINGS, label: 'Paramètres', icon: 'cog' }
  ]
} as const;

// Route Permissions
export const ROUTE_PERMISSIONS = {
  [ROUTES.ADMIN]: ['admin'],
  [ROUTES.ADMIN_USERS]: ['admin'],
  [ROUTES.ADMIN_PERMISSIONS]: ['admin'],
  [ROUTES.ADMIN_SETTINGS]: ['admin'],
  [ROUTES.ADMIN_ANALYTICS]: ['admin', 'moderator'],
  [ROUTES.VIEWS_MANAGEMENT]: ['admin']
} as const;

// Public Routes (no authentication required)
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.PUBLIC_DASHBOARD,
  ROUTES.NOT_FOUND
] as const;

// Route Breadcrumbs
export const ROUTE_BREADCRUMBS = {
  [ROUTES.DASHBOARD]: [{ label: 'Tableau de Bord' }],
  [ROUTES.ANNOUNCEMENTS]: [
    { label: 'Tableau de Bord', href: ROUTES.DASHBOARD },
    { label: 'Annonces' }
  ],
  [ROUTES.DOCUMENTS]: [
    { label: 'Tableau de Bord', href: ROUTES.DASHBOARD },
    { label: 'Documents' }
  ],
  [ROUTES.EVENTS]: [
    { label: 'Tableau de Bord', href: ROUTES.DASHBOARD },
    { label: 'Événements' }
  ],
  [ROUTES.ADMIN]: [
    { label: 'Tableau de Bord', href: ROUTES.DASHBOARD },
    { label: 'Administration' }
  ],
  [ROUTES.ADMIN_USERS]: [
    { label: 'Tableau de Bord', href: ROUTES.DASHBOARD },
    { label: 'Administration', href: ROUTES.ADMIN },
    { label: 'Utilisateurs' }
  ]
} as const;