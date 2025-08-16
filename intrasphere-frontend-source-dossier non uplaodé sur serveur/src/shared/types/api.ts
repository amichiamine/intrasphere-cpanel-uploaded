// API Response Types and Interfaces

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchResponse<T> {
  results: T[];
  query: string;
  total: number;
}

// Auth API Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  message: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

// Stats API Types
export interface StatsResponse {
  totalUsers: number;
  totalAnnouncements: number;
  totalDocuments: number;
  totalEvents: number;
  totalMessages: number;
  totalComplaints: number;
  newAnnouncements: number;
  updatedDocuments: number;
  connectedUsers: number;
  pendingComplaints: number;
}

// Analytics API Types
export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
}

export interface ContentAnalytics {
  announcements: number;
  documents: number;
  events: number;
  trainings: number;
}

// Bulk Operations
export interface BulkPermissionRequest {
  userId: string;
  permissions: string[];
  action: 'grant' | 'revoke';
}

// Search Types
export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  email?: string;
  department?: string;
  role: string;
  isActive: boolean;
}

export interface ContentSearchResults {
  announcements: Array<{
    id: string;
    title: string;
    content?: string;
    createdAt: Date;
  }>;
  documents: Array<{
    id: string;
    title: string;
    description?: string;
    createdAt: Date;
  }>;
  events: Array<{
    id: string;
    title: string;
    description?: string;
    startDate: Date;
  }>;
}

// File Upload Types
export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
}

// WebSocket Message Types
export interface WSMessage {
  type: 'notification' | 'message' | 'system' | 'update';
  payload: any;
  timestamp: Date;
  userId?: string;
}

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actions?: Array<{
    label: string;
    action: string;
  }>;
}