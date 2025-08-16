// Authentication Utilities

import { ROLE_PERMISSIONS, hasPermission, hasRole, getRolePermissions } from '../constants/permissions';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: string;
  isActive: boolean;
  permissions?: string[];
}

/**
 * Check if user has a specific permission
 */
export function userHasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.isActive) return false;
  
  // Get permissions from role
  const rolePermissions = getRolePermissions(user.role);
  
  // Combine role permissions with user-specific permissions
  const allPermissions = [
    ...rolePermissions,
    ...(user.permissions || [])
  ];
  
  return hasPermission(allPermissions, permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function userHasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.isActive) return false;
  
  return permissions.some(permission => userHasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function userHasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.isActive) return false;
  
  return permissions.every(permission => userHasPermission(user, permission));
}

/**
 * Check if user has a specific role
 */
export function userHasRole(user: User | null, role: string | string[]): boolean {
  if (!user || !user.isActive) return false;
  
  const allowedRoles = Array.isArray(role) ? role : [role];
  return hasRole(user.role, allowedRoles);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return userHasRole(user, 'admin');
}

/**
 * Check if user is moderator or higher
 */
export function isModerator(user: User | null): boolean {
  return userHasRole(user, ['admin', 'moderator']);
}

/**
 * Get user's display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Utilisateur inconnu';
  return user.name || user.username || 'Utilisateur';
}

/**
 * Get user's role display name
 */
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    admin: 'Administrateur',
    moderator: 'Modérateur',
    employee: 'Employé',
    guest: 'Invité'
  };
  
  return roleNames[role] || role;
}

/**
 * Get user's initials for avatar
 */
export function getUserInitials(user: User | null): string {
  if (!user) return '?';
  
  const name = user.name || user.username || '';
  const parts = name.trim().split(' ');
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts[0]) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  
  return '?';
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(user: User | null, route: string, routePermissions?: Record<string, string[]>): boolean {
  if (!user || !user.isActive) return false;
  
  // If no specific permissions required, allow access
  if (!routePermissions || !routePermissions[route]) {
    return true;
  }
  
  const requiredRoles = routePermissions[route];
  return userHasRole(user, requiredRoles);
}

/**
 * Get user's available navigation items based on permissions
 */
export function getAvailableNavigation(user: User | null, navigationItems: any[]): any[] {
  if (!user || !user.isActive) return [];
  
  return navigationItems.filter(item => {
    if (item.permission) {
      return userHasPermission(user, item.permission);
    }
    
    if (item.role) {
      const roles = Array.isArray(item.role) ? item.role : [item.role];
      return userHasRole(user, roles);
    }
    
    return true;
  }).map(item => ({
    ...item,
    children: item.children ? getAvailableNavigation(user, item.children) : undefined
  }));
}

/**
 * Format user for session storage
 */
export function serializeUser(user: User): string {
  return JSON.stringify({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    permissions: user.permissions || []
  });
}

/**
 * Parse user from session storage
 */
export function deserializeUser(userData: string): User | null {
  try {
    const parsed = JSON.parse(userData);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number;
  message: string;
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('Utilisez au moins 8 caractères');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Incluez au moins une majuscule');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Incluez au moins une minuscule');
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Incluez au moins un chiffre');
  }
  
  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Incluez au moins un caractère spécial');
  }
  
  let message = '';
  switch (score) {
    case 0:
    case 1:
      message = 'Très faible';
      break;
    case 2:
      message = 'Faible';
      break;
    case 3:
      message = 'Moyen';
      break;
    case 4:
      message = 'Fort';
      break;
    case 5:
      message = 'Très fort';
      break;
    default:
      message = 'Faible';
  }
  
  return { score, message, suggestions };
}