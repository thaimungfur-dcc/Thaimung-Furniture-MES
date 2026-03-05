export interface User {
  employeeId: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: string[];
}

export interface ClientConfig {
  licenseKey: string;
  clientName: string;
  apiUrl: string;
  isActive: boolean;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface ApiRequest {
  action: 'read' | 'write' | 'update' | 'delete' | 'login' | 'init';
  sheet: string;
  data?: any;
}
