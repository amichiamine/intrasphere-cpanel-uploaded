// Permissions Constants and Configuration

export const PERMISSIONS = {
  // User Management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  
  // Content Management
  MANAGE_ANNOUNCEMENTS: 'manage_announcements',
  CREATE_ANNOUNCEMENTS: 'create_announcements',
  UPDATE_ANNOUNCEMENTS: 'update_announcements',
  DELETE_ANNOUNCEMENTS: 'delete_announcements',
  
  MANAGE_DOCUMENTS: 'manage_documents',
  CREATE_DOCUMENTS: 'create_documents',
  UPDATE_DOCUMENTS: 'update_documents',
  DELETE_DOCUMENTS: 'delete_documents',
  
  MANAGE_EVENTS: 'manage_events',
  CREATE_EVENTS: 'create_events',
  UPDATE_EVENTS: 'update_events',
  DELETE_EVENTS: 'delete_events',
  
  // Training Management
  MANAGE_TRAININGS: 'manage_trainings',
  CREATE_TRAININGS: 'create_trainings',
  UPDATE_TRAININGS: 'update_trainings',
  DELETE_TRAININGS: 'delete_trainings',
  VIEW_TRAINING_ANALYTICS: 'view_training_analytics',
  
  // Course Management
  MANAGE_COURSES: 'manage_courses',
  CREATE_COURSES: 'create_courses',
  UPDATE_COURSES: 'update_courses',
  DELETE_COURSES: 'delete_courses',
  
  // Forum Management
  MANAGE_FORUM: 'manage_forum',
  CREATE_FORUM_TOPICS: 'create_forum_topics',
  UPDATE_FORUM_TOPICS: 'update_forum_topics',
  DELETE_FORUM_TOPICS: 'delete_forum_topics',
  MODERATE_FORUM: 'moderate_forum',
  
  // Messaging
  SEND_MESSAGES: 'send_messages',
  VIEW_ALL_MESSAGES: 'view_all_messages',
  MANAGE_COMPLAINTS: 'manage_complaints',
  ASSIGN_COMPLAINTS: 'assign_complaints',
  
  // System Administration
  MANAGE_PERMISSIONS: 'manage_permissions',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_CATEGORIES: 'manage_categories',
  RESET_DATA: 'reset_data',
  
  // File Management
  UPLOAD_FILES: 'upload_files',
  MANAGE_FILES: 'manage_files',
  DELETE_FILES: 'delete_files'
} as const;

// Permission Groups
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: {
    label: 'Gestion des Utilisateurs',
    permissions: [
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.UPDATE_USERS,
      PERMISSIONS.DELETE_USERS
    ]
  },
  
  CONTENT_MANAGEMENT: {
    label: 'Gestion du Contenu',
    permissions: [
      PERMISSIONS.MANAGE_ANNOUNCEMENTS,
      PERMISSIONS.CREATE_ANNOUNCEMENTS,
      PERMISSIONS.UPDATE_ANNOUNCEMENTS,
      PERMISSIONS.DELETE_ANNOUNCEMENTS,
      PERMISSIONS.MANAGE_DOCUMENTS,
      PERMISSIONS.CREATE_DOCUMENTS,
      PERMISSIONS.UPDATE_DOCUMENTS,
      PERMISSIONS.DELETE_DOCUMENTS,
      PERMISSIONS.MANAGE_EVENTS,
      PERMISSIONS.CREATE_EVENTS,
      PERMISSIONS.UPDATE_EVENTS,
      PERMISSIONS.DELETE_EVENTS
    ]
  },
  
  TRAINING_MANAGEMENT: {
    label: 'Gestion de la Formation',
    permissions: [
      PERMISSIONS.MANAGE_TRAININGS,
      PERMISSIONS.CREATE_TRAININGS,
      PERMISSIONS.UPDATE_TRAININGS,
      PERMISSIONS.DELETE_TRAININGS,
      PERMISSIONS.VIEW_TRAINING_ANALYTICS,
      PERMISSIONS.MANAGE_COURSES,
      PERMISSIONS.CREATE_COURSES,
      PERMISSIONS.UPDATE_COURSES,
      PERMISSIONS.DELETE_COURSES
    ]
  },
  
  FORUM_MANAGEMENT: {
    label: 'Gestion du Forum',
    permissions: [
      PERMISSIONS.MANAGE_FORUM,
      PERMISSIONS.CREATE_FORUM_TOPICS,
      PERMISSIONS.UPDATE_FORUM_TOPICS,
      PERMISSIONS.DELETE_FORUM_TOPICS,
      PERMISSIONS.MODERATE_FORUM
    ]
  },
  
  COMMUNICATION: {
    label: 'Communication',
    permissions: [
      PERMISSIONS.SEND_MESSAGES,
      PERMISSIONS.VIEW_ALL_MESSAGES,
      PERMISSIONS.MANAGE_COMPLAINTS,
      PERMISSIONS.ASSIGN_COMPLAINTS
    ]
  },
  
  SYSTEM_ADMIN: {
    label: 'Administration Système',
    permissions: [
      PERMISSIONS.MANAGE_PERMISSIONS,
      PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
      PERMISSIONS.VIEW_ANALYTICS,
      PERMISSIONS.MANAGE_CATEGORIES,
      PERMISSIONS.RESET_DATA
    ]
  },
  
  FILE_MANAGEMENT: {
    label: 'Gestion des Fichiers',
    permissions: [
      PERMISSIONS.UPLOAD_FILES,
      PERMISSIONS.MANAGE_FILES,
      PERMISSIONS.DELETE_FILES
    ]
  }
} as const;

// Role-based Permission Sets
export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS) as string[],
  moderator: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_ANNOUNCEMENTS,
    PERMISSIONS.CREATE_ANNOUNCEMENTS,
    PERMISSIONS.UPDATE_ANNOUNCEMENTS,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.CREATE_DOCUMENTS,
    PERMISSIONS.UPDATE_DOCUMENTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.CREATE_EVENTS,
    PERMISSIONS.UPDATE_EVENTS,
    PERMISSIONS.MANAGE_TRAININGS,
    PERMISSIONS.CREATE_TRAININGS,
    PERMISSIONS.UPDATE_TRAININGS,
    PERMISSIONS.VIEW_TRAINING_ANALYTICS,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.CREATE_COURSES,
    PERMISSIONS.UPDATE_COURSES,
    PERMISSIONS.MODERATE_FORUM,
    PERMISSIONS.MANAGE_COMPLAINTS,
    PERMISSIONS.ASSIGN_COMPLAINTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.MANAGE_FILES
  ] as string[],
  employee: [
    PERMISSIONS.CREATE_FORUM_TOPICS,
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.UPLOAD_FILES
  ] as string[],
  guest: [] as string[]
} as const;

// Permission Descriptions
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.MANAGE_USERS]: 'Gérer tous les aspects des comptes utilisateurs',
  [PERMISSIONS.VIEW_USERS]: 'Voir la liste des utilisateurs et leurs détails',
  [PERMISSIONS.CREATE_USERS]: 'Créer de nouveaux comptes utilisateurs',
  [PERMISSIONS.UPDATE_USERS]: 'Modifier les informations des utilisateurs',
  [PERMISSIONS.DELETE_USERS]: 'Supprimer ou désactiver des comptes utilisateurs',
  
  [PERMISSIONS.MANAGE_ANNOUNCEMENTS]: 'Gérer toutes les annonces',
  [PERMISSIONS.CREATE_ANNOUNCEMENTS]: 'Créer de nouvelles annonces',
  [PERMISSIONS.UPDATE_ANNOUNCEMENTS]: 'Modifier les annonces existantes',
  [PERMISSIONS.DELETE_ANNOUNCEMENTS]: 'Supprimer des annonces',
  
  [PERMISSIONS.MANAGE_DOCUMENTS]: 'Gérer la bibliothèque de documents',
  [PERMISSIONS.CREATE_DOCUMENTS]: 'Ajouter de nouveaux documents',
  [PERMISSIONS.UPDATE_DOCUMENTS]: 'Modifier les documents existants',
  [PERMISSIONS.DELETE_DOCUMENTS]: 'Supprimer des documents',
  
  [PERMISSIONS.MANAGE_EVENTS]: 'Gérer le calendrier des événements',
  [PERMISSIONS.CREATE_EVENTS]: 'Créer de nouveaux événements',
  [PERMISSIONS.UPDATE_EVENTS]: 'Modifier les événements existants',
  [PERMISSIONS.DELETE_EVENTS]: 'Supprimer des événements',
  
  [PERMISSIONS.MANAGE_TRAININGS]: 'Gérer le système de formation',
  [PERMISSIONS.CREATE_TRAININGS]: 'Créer de nouvelles formations',
  [PERMISSIONS.UPDATE_TRAININGS]: 'Modifier les formations existantes',
  [PERMISSIONS.DELETE_TRAININGS]: 'Supprimer des formations',
  [PERMISSIONS.VIEW_TRAINING_ANALYTICS]: 'Voir les statistiques de formation',
  
  [PERMISSIONS.MANAGE_COURSES]: 'Gérer les cours en ligne',
  [PERMISSIONS.CREATE_COURSES]: 'Créer de nouveaux cours',
  [PERMISSIONS.UPDATE_COURSES]: 'Modifier les cours existants',
  [PERMISSIONS.DELETE_COURSES]: 'Supprimer des cours',
  
  [PERMISSIONS.MANAGE_FORUM]: 'Administration complète du forum',
  [PERMISSIONS.CREATE_FORUM_TOPICS]: 'Créer de nouveaux sujets dans le forum',
  [PERMISSIONS.UPDATE_FORUM_TOPICS]: 'Modifier les sujets du forum',
  [PERMISSIONS.DELETE_FORUM_TOPICS]: 'Supprimer des sujets du forum',
  [PERMISSIONS.MODERATE_FORUM]: 'Modérer le contenu du forum',
  
  [PERMISSIONS.SEND_MESSAGES]: 'Envoyer des messages privés',
  [PERMISSIONS.VIEW_ALL_MESSAGES]: 'Voir tous les messages du système',
  [PERMISSIONS.MANAGE_COMPLAINTS]: 'Gérer les réclamations',
  [PERMISSIONS.ASSIGN_COMPLAINTS]: 'Assigner des réclamations aux utilisateurs',
  
  [PERMISSIONS.MANAGE_PERMISSIONS]: 'Gérer les permissions des utilisateurs',
  [PERMISSIONS.MANAGE_SYSTEM_SETTINGS]: 'Modifier les paramètres système',
  [PERMISSIONS.VIEW_ANALYTICS]: 'Accéder aux analyses et statistiques',
  [PERMISSIONS.MANAGE_CATEGORIES]: 'Gérer les catégories système',
  [PERMISSIONS.RESET_DATA]: 'Réinitialiser les données de test',
  
  [PERMISSIONS.UPLOAD_FILES]: 'Télécharger des fichiers',
  [PERMISSIONS.MANAGE_FILES]: 'Gérer les fichiers uploadés',
  [PERMISSIONS.DELETE_FILES]: 'Supprimer des fichiers'
} as const;

// Permission Validation Helpers
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole);
};

export const getRolePermissions = (role: string): string[] => {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
};