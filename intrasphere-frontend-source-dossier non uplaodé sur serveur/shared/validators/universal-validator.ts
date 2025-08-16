/**
 * Validateur universel TypeScript
 * Compatible avec UniversalValidator.php
 */

import { z } from "zod";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: any;
}

export class UniversalValidator {
  /**
   * Valider un email
   */
  static validateEmail(email: string): ValidationResult {
    try {
      z.string().email().parse(email);
      return { isValid: true, errors: [], data: email };
    } catch (error) {
      return { isValid: false, errors: ["Format d'email invalide"] };
    }
  }

  /**
   * Valider un mot de passe
   */
  static validatePassword(password: string, minLength = 8): ValidationResult {
    const errors: string[] = [];
    
    if (password.length < minLength) {
      errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`);
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une majuscule");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une minuscule");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre");
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un caractère spécial");
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? password : undefined
    };
  }

  /**
   * Valider un nom d'utilisateur
   */
  static validateUsername(username: string): ValidationResult {
    const errors: string[] = [];
    
    if (username.length < 3) {
      errors.push("Le nom d'utilisateur doit contenir au moins 3 caractères");
    }
    
    if (username.length > 20) {
      errors.push("Le nom d'utilisateur ne peut pas dépasser 20 caractères");
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      errors.push("Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points, tirets et underscores");
    }
    
    if (/^[._-]/.test(username) || /[._-]$/.test(username)) {
      errors.push("Le nom d'utilisateur ne peut pas commencer ou finir par un caractère spécial");
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? username : undefined
    };
  }

  /**
   * Valider un numéro de téléphone français
   */
  static validatePhoneNumber(phone: string): ValidationResult {
    // Supprimer les espaces et caractères spéciaux
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    
    // Formats acceptés: 0123456789, +33123456789, 33123456789
    const phoneRegex = /^(\+33|33|0)[1-9](\d{8})$/;
    
    if (phoneRegex.test(cleanPhone)) {
      return { isValid: true, errors: [], data: cleanPhone };
    }
    
    return { 
      isValid: false, 
      errors: ["Format de téléphone invalide (ex: 01 23 45 67 89)"] 
    };
  }

  /**
   * Valider une URL
   */
  static validateUrl(url: string, requireHttps = false): ValidationResult {
    try {
      const parsedUrl = new URL(url);
      
      if (requireHttps && parsedUrl.protocol !== 'https:') {
        return { isValid: false, errors: ["L'URL doit utiliser HTTPS"] };
      }
      
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { isValid: false, errors: ["L'URL doit utiliser HTTP ou HTTPS"] };
      }
      
      return { isValid: true, errors: [], data: url };
    } catch (error) {
      return { isValid: false, errors: ["Format d'URL invalide"] };
    }
  }

  /**
   * Valider une date
   */
  static validateDate(date: string, format = "YYYY-MM-DD"): ValidationResult {
    try {
      const parsedDate = new Date(date);
      
      if (isNaN(parsedDate.getTime())) {
        return { isValid: false, errors: [`Format de date invalide (attendu: ${format})`] };
      }
      
      return { isValid: true, errors: [], data: parsedDate };
    } catch (error) {
      return { isValid: false, errors: [`Format de date invalide (attendu: ${format})`] };
    }
  }

  /**
   * Valider une longueur de texte
   */
  static validateTextLength(
    text: string, 
    minLength = 0, 
    maxLength = 1000,
    fieldName = "Le champ"
  ): ValidationResult {
    const errors: string[] = [];
    
    if (text.length < minLength) {
      errors.push(`${fieldName} doit contenir au moins ${minLength} caractères`);
    }
    
    if (text.length > maxLength) {
      errors.push(`${fieldName} ne peut pas dépasser ${maxLength} caractères`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? text : undefined
    };
  }

  /**
   * Valider un fichier (taille et type)
   */
  static validateFile(
    file: File, 
    allowedTypes: string[] = [], 
    maxSizeBytes = 10485760 // 10MB
  ): ValidationResult {
    const errors: string[] = [];
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`);
    }
    
    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / 1024 / 1024;
      errors.push(`La taille du fichier ne peut pas dépasser ${maxSizeMB}MB`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? file : undefined
    };
  }

  /**
   * Valider plusieurs champs en une fois
   */
  static validateMultiple(validations: Array<() => ValidationResult>): ValidationResult {
    const allErrors: string[] = [];
    let isValid = true;
    
    for (const validation of validations) {
      const result = validation();
      if (!result.isValid) {
        isValid = false;
        allErrors.push(...result.errors);
      }
    }
    
    return {
      isValid,
      errors: allErrors
    };
  }

  /**
   * Nettoyer et valider une entrée utilisateur
   */
  static sanitizeAndValidate(
    input: string,
    maxLength = 1000,
    allowHtml = false
  ): ValidationResult {
    let sanitized = input.trim();
    
    if (!allowHtml) {
      // Échapper les caractères HTML
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
    
    if (sanitized.length > maxLength) {
      return {
        isValid: false,
        errors: [`Le texte ne peut pas dépasser ${maxLength} caractères`]
      };
    }
    
    return {
      isValid: true,
      errors: [],
      data: sanitized
    };
  }

  /**
   * Valider un objet complet avec un schéma Zod
   */
  static validateWithSchema<T>(data: any, schema: z.ZodSchema<T>): ValidationResult {
    try {
      const validated = schema.parse(data);
      return { isValid: true, errors: [], data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return { isValid: false, errors };
      }
      return { isValid: false, errors: ["Erreur de validation inconnue"] };
    }
  }
}

/**
 * Schémas de validation courants
 */
export const CommonSchemas = {
  user: z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2).max(100),
  }),
  
  announcement: z.object({
    title: z.string().min(5).max(200),
    content: z.string().min(10).max(5000),
    type: z.enum(['info', 'warning', 'success', 'error']),
    isImportant: z.boolean().optional(),
  }),
  
  document: z.object({
    title: z.string().min(3).max(200),
    description: z.string().max(1000).optional(),
    category: z.enum(['regulation', 'policy', 'guide', 'procedure']),
    fileUrl: z.string().url().optional(),
  }),
  
  message: z.object({
    recipientId: z.string().uuid(),
    subject: z.string().min(3).max(200),
    content: z.string().min(10).max(5000),
  })
};