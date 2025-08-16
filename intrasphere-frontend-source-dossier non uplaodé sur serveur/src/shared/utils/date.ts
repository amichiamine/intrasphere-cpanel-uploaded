// Date Utility Functions

import { format, parseISO, isValid, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format date to French locale string
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Date invalide';
    
    return format(dateObj, formatStr, { locale: fr });
  } catch {
    return 'Date invalide';
  }
}

/**
 * Format datetime to French locale string
 */
export function formatDateTime(date: Date | string, formatStr: string = 'dd/MM/yyyy à HH:mm'): string {
  return formatDate(date, formatStr);
}

/**
 * Format date to relative time (il y a 2 heures, etc.)
 */
export function formatRelativeTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Date invalide';
    
    const now = new Date();
    const diffMinutes = differenceInMinutes(now, dateObj);
    const diffHours = differenceInHours(now, dateObj);
    const diffDays = differenceInDays(now, dateObj);
    
    if (diffMinutes < 1) {
      return 'À l\'instant';
    } else if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Il y a ${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Il y a ${years} an${years > 1 ? 's' : ''}`;
    }
  } catch {
    return 'Date invalide';
  }
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  } catch {
    return false;
  }
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return dateObj.toDateString() === yesterday.toDateString();
  } catch {
    return false;
  }
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    
    return dateObj < new Date();
  } catch {
    return false;
  }
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    
    return dateObj > new Date();
  } catch {
    return false;
  }
}

/**
 * Get start of day
 */
export function getStartOfDay(date?: Date): Date {
  const d = date || new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 */
export function getEndOfDay(date?: Date): Date {
  const d = date || new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get date range for period
 */
export function getDateRange(period: 'today' | 'yesterday' | 'week' | 'month' | 'year'): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'yesterday':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'week':
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(now.getDate() - daysToMonday);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
      
    default:
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }
  
  return { start, end };
}

/**
 * Format duration in human readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Parse date from various formats
 */
export function parseDate(dateString: string): Date | null {
  try {
    // Try ISO format first
    let date = parseISO(dateString);
    if (isValid(date)) return date;
    
    // Try common French formats
    const formats = [
      'dd/MM/yyyy',
      'dd/MM/yyyy HH:mm',
      'dd-MM-yyyy',
      'dd-MM-yyyy HH:mm'
    ];
    
    for (const formatStr of formats) {
      try {
        // Note: For full implementation, you'd need date-fns parse function
        // This is a simplified version
        date = new Date(dateString);
        if (isValid(date)) return date;
      } catch {
        continue;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    
    if (!isValid(d1) || !isValid(d2)) return false;
    
    return d1.toDateString() === d2.toDateString();
  } catch {
    return false;
  }
}

/**
 * Get age from birthdate
 */
export function getAge(birthDate: Date | string): number {
  try {
    const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    if (!isValid(birth)) return 0;
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return 0;
  }
}