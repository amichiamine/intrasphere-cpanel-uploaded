// Component Props and State Types

import type { ReactNode } from "react";

// Common Component Props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Layout Component Types
export interface LayoutProps extends BaseComponentProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onToggle: () => void;
  navigation: NavigationItem[];
}

export interface HeaderProps extends BaseComponentProps {
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  onMenuToggle: () => void;
  notifications?: NotificationItem[];
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  permission?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  variant?: 'default' | 'destructive';
}

// Dashboard Component Types
export interface StatCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export interface ChartProps extends BaseComponentProps {
  data: any[];
  type: 'bar' | 'line' | 'pie' | 'area';
  title?: string;
  height?: number;
}

// Form Component Types
export interface FormFieldProps extends BaseComponentProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends FormFieldProps {
  options: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
}

export interface FileUploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  progress?: number;
  error?: string;
}

// Table Component Types
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowSelection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
  };
  onRowClick?: (record: T, index: number) => void;
}

// Modal Component Types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
}

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  data?: any;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  borderRadius: number;
  fontSize: number;
}

// Permission Component Types
export interface ProtectedComponentProps extends BaseComponentProps {
  permission?: string;
  role?: string | string[];
  fallback?: ReactNode;
}

// Search Component Types
export interface SearchProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  loading?: boolean;
}

// Filter Component Types
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterProps extends BaseComponentProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  searchable?: boolean;
  multiple?: boolean;
}

// Calendar Component Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  description?: string;
}

export interface CalendarProps extends BaseComponentProps {
  events: CalendarEvent[];
  view: 'month' | 'week' | 'day';
  date: Date;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}