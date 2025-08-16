// Form Types and Validation Schemas

export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Login Form Types
export interface LoginFormData {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Registration Form Types
export interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

// User Profile Form Types
export interface UserProfileFormData {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Content Forms
export interface AnnouncementFormData {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  targetAudience: string[];
  publishAt?: Date;
  expiresAt?: Date;
  attachments?: string[];
}

export interface DocumentFormData {
  title: string;
  description?: string;
  category: string;
  tags: string[];
  file?: File;
  url?: string;
  version: string;
  accessLevel: 'public' | 'restricted' | 'private';
}

export interface EventFormData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  organizer: string;
  maxParticipants?: number;
  category: string;
  isPrivate: boolean;
}

// Messaging Forms
export interface MessageFormData {
  recipientId: string;
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high';
  attachments?: File[];
}

export interface ComplaintFormData {
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department?: string;
  attachments?: File[];
}

// Forum Forms
export interface ForumTopicFormData {
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  isPinned?: boolean;
  isLocked?: boolean;
}

export interface ForumPostFormData {
  content: string;
  attachments?: File[];
}

// Training Forms
export interface TrainingFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  instructor: string;
  maxParticipants?: number;
  prerequisites?: string;
  materials?: string[];
  category: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  thumbnail?: string;
  isPublished: boolean;
  prerequisites?: string[];
  learningObjectives: string[];
}

export interface LessonFormData {
  title: string;
  description?: string;
  content: string;
  type: 'video' | 'text' | 'interactive' | 'quiz';
  duration: number; // in minutes
  order: number;
  resources?: string[];
  isPreview: boolean;
}

export interface ResourceFormData {
  title: string;
  description?: string;
  type: 'document' | 'video' | 'link' | 'file';
  url?: string;
  file?: File;
  category: string;
  tags: string[];
  accessLevel: 'public' | 'restricted' | 'private';
}

// Admin Forms
export interface PermissionFormData {
  userId: string;
  permissions: string[];
  grantedBy: string;
  expiresAt?: Date;
  reason?: string;
}

export interface EmployeeCategoryFormData {
  name: string;
  description?: string;
  color: string;
  permissions: string[];
  isActive: boolean;
}

export interface SystemSettingsFormData {
  siteName: string;
  siteDescription?: string;
  contactEmail: string;
  allowRegistration: boolean;
  moderationEnabled: boolean;
  maxFileSize: number; // in MB
  allowedFileTypes: string[];
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Search Forms
export interface SearchFormData {
  query: string;
  filters: {
    contentType?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    category?: string[];
    author?: string[];
  };
  sortBy: 'relevance' | 'date' | 'title' | 'author';
  sortOrder: 'asc' | 'desc';
}

// Filter Forms
export interface FilterFormData {
  [key: string]: string | string[] | Date | boolean | number | null | undefined;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Form Configuration Types
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'datetime';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    custom?: (value: any) => string | null;
  };
  conditional?: {
    field: string;
    value: any;
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  };
}

export interface FormConfig {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  submitText?: string;
  cancelText?: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
}