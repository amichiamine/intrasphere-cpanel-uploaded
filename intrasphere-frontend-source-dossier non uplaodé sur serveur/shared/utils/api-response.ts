/**
 * Utilitaire de réponse API unifié pour TypeScript
 * Compatible avec ApiResponse.php
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    hasMore?: boolean;
    timestamp?: string;
    version?: string;
    retryAfter?: number;
    [key: string]: any;
  };
}

export class ApiResponseBuilder {
  /**
   * Créer une réponse de succès
   */
  static success<T>(data?: T, message?: string, meta?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };
  }

  /**
   * Créer une réponse d'erreur
   */
  static error(message: string, error?: string, errors?: any[]): ApiResponse {
    return {
      success: false,
      error: error || message,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };
  }

  /**
   * Créer une réponse paginée
   */
  static paginated<T>(
    data: T[], 
    total: number, 
    page: number, 
    perPage: number,
    message?: string
  ): ApiResponse<T[]> {
    const hasMore = (page * perPage) < total;
    
    return {
      success: true,
      data,
      message,
      meta: {
        total,
        page,
        perPage,
        hasMore,
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };
  }

  /**
   * Créer une réponse de validation échouée
   */
  static validationError(errors: any[], message = "Validation échouée"): ApiResponse {
    return {
      success: false,
      message,
      error: "VALIDATION_FAILED",
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };
  }

  /**
   * Créer une réponse d'authentification requise
   */
  static authRequired(message = "Authentification requise"): ApiResponse {
    return {
      success: false,
      message,
      error: "AUTH_REQUIRED",
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };
  }

  /**
   * Créer une réponse de permissions insuffisantes
   */
  static forbidden(message = "Permissions insuffisantes"): ApiResponse {
    return {
      success: false,
      message,
      error: "FORBIDDEN",
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };
  }

  /**
   * Créer une réponse de ressource non trouvée
   */
  static notFound(message = "Ressource non trouvée"): ApiResponse {
    return {
      success: false,
      message,
      error: "NOT_FOUND",
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };
  }

  /**
   * Créer une réponse d'erreur serveur
   */
  static serverError(message = "Erreur serveur interne", error?: string): ApiResponse {
    return {
      success: false,
      message,
      error: error || "INTERNAL_ERROR",
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };
  }

  /**
   * Créer une réponse de trop de requêtes
   */
  static tooManyRequests(message = "Trop de requêtes", retryAfter?: number): ApiResponse {
    return {
      success: false,
      message,
      error: "TOO_MANY_REQUESTS",
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        retryAfter
      }
    };
  }
}

/**
 * Helper pour les codes de statut HTTP
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * Middleware Express pour formater les réponses
 */
export const formatResponse = (req: any, res: any, next: any) => {
  res.apiSuccess = <T>(data?: T, message?: string, statusCode = HttpStatus.OK) => {
    res.status(statusCode).json(ApiResponseBuilder.success(data, message));
  };

  res.apiError = (message: string, statusCode = HttpStatus.BAD_REQUEST, error?: string) => {
    res.status(statusCode).json(ApiResponseBuilder.error(message, error));
  };

  res.apiPaginated = <T>(data: T[], total: number, page: number, perPage: number, message?: string) => {
    res.status(HttpStatus.OK).json(ApiResponseBuilder.paginated(data, total, page, perPage, message));
  };

  next();
};