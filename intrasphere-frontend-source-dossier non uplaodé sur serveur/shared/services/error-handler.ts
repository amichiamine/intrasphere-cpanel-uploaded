/**
 * Gestionnaire d'erreurs universel TypeScript
 * Compatible avec ErrorHandler.php
 */

import { ApiResponseBuilder } from "../utils/api-response";

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  endpoint?: string;
  userAgent?: string;
}

export class ErrorHandler {
  private static logs: ErrorInfo[] = [];
  private static maxLogs = 1000;

  /**
   * Journaliser une erreur
   */
  static logError(error: Error | string, context: any = {}): void {
    const errorInfo: ErrorInfo = {
      code: error instanceof Error ? error.name : "CUSTOM_ERROR",
      message: error instanceof Error ? error.message : error,
      details: context,
      timestamp: new Date(),
      userId: context.userId,
      endpoint: context.endpoint,
      userAgent: context.userAgent
    };

    // Ajouter au journal avec limitation de taille
    this.logs.push(errorInfo);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log en console en développement
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${errorInfo.code}: ${errorInfo.message}`, errorInfo.details);
    }
  }

  /**
   * Gérer une erreur de validation
   */
  static handleValidationError(errors: string[], context: any = {}) {
    this.logError("Erreur de validation", { errors, ...context });
    return ApiResponseBuilder.validationError(errors);
  }

  /**
   * Gérer une erreur d'authentification
   */
  static handleAuthError(message = "Authentification requise", context: any = {}) {
    this.logError(message, context);
    return ApiResponseBuilder.authRequired(message);
  }

  /**
   * Gérer une erreur de permissions
   */
  static handlePermissionError(message = "Permissions insuffisantes", context: any = {}) {
    this.logError(message, context);
    return ApiResponseBuilder.forbidden(message);
  }

  /**
   * Gérer une erreur de ressource non trouvée
   */
  static handleNotFoundError(resource = "Ressource", context: any = {}) {
    const message = `${resource} non trouvée`;
    this.logError(message, context);
    return ApiResponseBuilder.notFound(message);
  }

  /**
   * Gérer une erreur serveur générale
   */
  static handleServerError(error: Error | string, context: any = {}) {
    const message = error instanceof Error ? error.message : error;
    this.logError(error, context);
    
    // En production, ne pas exposer les détails
    const publicMessage = process.env.NODE_ENV === 'production' 
      ? "Erreur serveur interne" 
      : message;
    
    return ApiResponseBuilder.serverError(publicMessage);
  }

  /**
   * Gérer les erreurs de base de données
   */
  static handleDatabaseError(error: Error, context: any = {}) {
    this.logError(`Erreur base de données: ${error.message}`, { 
      stack: error.stack, 
      ...context 
    });

    const publicMessage = process.env.NODE_ENV === 'production'
      ? "Erreur de base de données"
      : `Erreur BD: ${error.message}`;

    return ApiResponseBuilder.serverError(publicMessage, "DATABASE_ERROR");
  }

  /**
   * Gérer les erreurs de limite de taux
   */
  static handleRateLimitError(retryAfter?: number, context: any = {}) {
    this.logError("Limite de taux dépassée", { retryAfter, ...context });
    return ApiResponseBuilder.tooManyRequests("Trop de requêtes", retryAfter);
  }

  /**
   * Middleware Express pour gestion d'erreurs
   */
  static expressMiddleware() {
    return (error: any, req: any, res: any, next: any) => {
      const context = {
        userId: req.session?.userId,
        endpoint: `${req.method} ${req.path}`,
        userAgent: req.get('User-Agent'),
        body: req.body,
        params: req.params,
        query: req.query
      };

      // Gestion spécifique selon le type d'erreur
      if (error.name === 'ValidationError') {
        const response = ErrorHandler.handleValidationError(error.errors || [error.message], context);
        return res.status(400).json(response);
      }

      if (error.name === 'UnauthorizedError' || error.status === 401) {
        const response = ErrorHandler.handleAuthError(error.message, context);
        return res.status(401).json(response);
      }

      if (error.name === 'ForbiddenError' || error.status === 403) {
        const response = ErrorHandler.handlePermissionError(error.message, context);
        return res.status(403).json(response);
      }

      if (error.name === 'NotFoundError' || error.status === 404) {
        const response = ErrorHandler.handleNotFoundError(error.message || "Ressource", context);
        return res.status(404).json(response);
      }

      // Erreur générale
      const response = ErrorHandler.handleServerError(error, context);
      const statusCode = error.status || 500;
      res.status(statusCode).json(response);
    };
  }

  /**
   * Récupérer les logs d'erreurs (pour admin uniquement)
   */
  static getErrorLogs(limit = 100): ErrorInfo[] {
    return this.logs.slice(-limit);
  }

  /**
   * Vider les logs d'erreurs
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Obtenir les statistiques d'erreurs
   */
  static getErrorStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const recent24h = this.logs.filter(log => log.timestamp > last24h);
    const recentHour = this.logs.filter(log => log.timestamp > lastHour);

    const errorsByCode = this.logs.reduce((acc, log) => {
      acc[log.code] = (acc[log.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.logs.length,
      last24h: recent24h.length,
      lastHour: recentHour.length,
      errorsByCode,
      mostCommonErrors: Object.entries(errorsByCode)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([code, count]) => ({ code, count }))
    };
  }

  /**
   * Créer un gestionnaire d'erreur async/await
   */
  static asyncHandler(fn: Function) {
    return (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Wrapper pour les opérations à risque
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    context: any = {}
  ): Promise<{ success: boolean; data?: T; error?: any }> {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      this.logError(error instanceof Error ? error : String(error), context);
      return { success: false, error };
    }
  }
}

/**
 * Codes d'erreur standardisés
 */
export const ErrorCodes = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  DATABASE_ERROR: "DATABASE_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  FILE_ERROR: "FILE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR"
} as const;

/**
 * Types d'erreur pour TypeScript
 */
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];