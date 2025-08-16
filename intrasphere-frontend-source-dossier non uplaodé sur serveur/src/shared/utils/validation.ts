// Validation Utility Functions

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation (French format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Password strength validation
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  } else {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score
  };
}

/**
 * Username validation
 */
export function validateUsername(username: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
  }

  if (username.length > 20) {
    errors.push('Le nom d\'utilisateur ne peut pas dépasser 20 caractères');
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    errors.push('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores');
  }

  if (/^[._-]|[._-]$/.test(username)) {
    errors.push('Le nom d\'utilisateur ne peut pas commencer ou finir par un caractère spécial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * File validation
 */
export function validateFile(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Size validation
  if (options.maxSize && file.size > options.maxSize) {
    const maxSizeMB = Math.round(options.maxSize / (1024 * 1024));
    errors.push(`Le fichier est trop volumineux (max: ${maxSizeMB}MB)`);
  }

  // Type validation
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push('Type de fichier non autorisé');
  }

  // Extension validation
  if (options.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(extension)) {
      errors.push('Extension de fichier non autorisée');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Required field validation
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

/**
 * String length validation
 */
export function validateLength(
  value: string, 
  min?: number, 
  max?: number
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const length = value.trim().length;

  if (min !== undefined && length < min) {
    errors.push(`Minimum ${min} caractères requis`);
  }

  if (max !== undefined && length > max) {
    errors.push(`Maximum ${max} caractères autorisés`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Number validation
 */
export function validateNumber(
  value: number,
  min?: number,
  max?: number
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (isNaN(value)) {
    errors.push('Doit être un nombre valide');
    return { isValid: false, errors };
  }

  if (min !== undefined && value < min) {
    errors.push(`Doit être supérieur ou égal à ${min}`);
  }

  if (max !== undefined && value > max) {
    errors.push(`Doit être inférieur ou égal à ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Date validation
 */
export function validateDate(
  date: Date | string,
  minDate?: Date,
  maxDate?: Date
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let dateObj: Date;

  try {
    dateObj = typeof date === 'string' ? new Date(date) : date;
  } catch {
    errors.push('Date invalide');
    return { isValid: false, errors };
  }

  if (isNaN(dateObj.getTime())) {
    errors.push('Date invalide');
    return { isValid: false, errors };
  }

  if (minDate && dateObj < minDate) {
    errors.push(`La date doit être postérieure au ${minDate.toLocaleDateString('fr-FR')}`);
  }

  if (maxDate && dateObj > maxDate) {
    errors.push(`La date doit être antérieure au ${maxDate.toLocaleDateString('fr-FR')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Form data validation
 */
export function validateFormData(
  data: Record<string, any>,
  rules: Record<string, {
    required?: boolean;
    type?: 'string' | 'number' | 'email' | 'url' | 'date';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  }>
): {
  isValid: boolean;
  errors: Record<string, string[]>;
} {
  const errors: Record<string, string[]> = {};

  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    const fieldErrors: string[] = [];

    // Required validation
    if (rule.required && !isRequired(value)) {
      fieldErrors.push('Ce champ est requis');
      errors[field] = fieldErrors;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!isRequired(value) && !rule.required) {
      return;
    }

    // Type validation
    switch (rule.type) {
      case 'email':
        if (!isValidEmail(value)) {
          fieldErrors.push('Adresse email invalide');
        }
        break;
      case 'url':
        if (!isValidUrl(value)) {
          fieldErrors.push('URL invalide');
        }
        break;
      case 'number':
        if (isNaN(Number(value))) {
          fieldErrors.push('Doit être un nombre');
        }
        break;
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        fieldErrors.push(`Minimum ${rule.minLength} caractères`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        fieldErrors.push(`Maximum ${rule.maxLength} caractères`);
      }
    }

    // Number range validation
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value);
      if (rule.min !== undefined && numValue < rule.min) {
        fieldErrors.push(`Doit être supérieur ou égal à ${rule.min}`);
      }
      if (rule.max !== undefined && numValue > rule.max) {
        fieldErrors.push(`Doit être inférieur ou égal à ${rule.max}`);
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      fieldErrors.push('Format invalide');
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        fieldErrors.push(customError);
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}