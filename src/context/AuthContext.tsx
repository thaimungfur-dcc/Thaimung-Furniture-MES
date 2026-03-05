import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ApiResponse } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  apiUrl: string | null;
  user: User | null;
  clientName: string | null;
  login: (employeeId: string, idCard: string) => Promise<ApiResponse>;
  logout: () => void;
  isLocked: boolean;
  failedAttempts: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState<string | null>(process.env.CLIENT_API_URL || null);
  const [user, setUser] = useState<User | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    const lockStatus = localStorage.getItem('isLocked');
    if (lockStatus === 'true') {
      setIsLocked(true);
    }

    const attempts = localStorage.getItem('failedAttempts');
    if (attempts) {
      setFailedAttempts(parseInt(attempts));
    }

    // In 1-factory model, clientName could be fetched once or set in env
    setClientName("Factory System"); 
  }, []);

  const login = async (employeeId: string, idCard: string): Promise<ApiResponse> => {
    if (isLocked) {
      return { status: 'error', message: 'Account is locked due to too many failed attempts. Please contact Admin.' };
    }

    // Demo user handling (Move to top so users can test without backend)
    if ((employeeId === 'demo' || employeeId === 'admin') && idCard === '1234567890123') {
      const demoUser: User = {
        employeeId: employeeId.toUpperCase() + '-001',
        name: employeeId === 'admin' ? 'Administrator' : 'Demo User',
        role: 'admin',
        permissions: ['all'],
      };
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      setIsAuthenticated(true);
      setFailedAttempts(0);
      localStorage.setItem('failedAttempts', '0');
      return { status: 'success', message: 'Login successful (Demo Mode)' };
    }

    if (!apiUrl || apiUrl.includes('YOUR_CLIENT_SCRIPT_ID')) {
      return { 
        status: 'error', 
        message: 'API URL is not configured. Please set CLIENT_API_URL in environment variables.' 
      };
    }

    const response = await apiService.request<User>(apiUrl, {
      action: 'login',
      sheet: 'Users',
      data: { employeeId, idCard }, // Changed from password to idCard
    });

    if (response.status === 'success' && response.data) {
      // If user exists but has no role/permissions, they are a Viewer
      const userData = {
        ...response.data,
        role: response.data.role || 'staff',
        permissions: response.data.permissions || ['read_only']
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setFailedAttempts(0);
      localStorage.setItem('failedAttempts', '0');
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('failedAttempts', newAttempts.toString());
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        localStorage.setItem('isLocked', 'true');
        // In a real app, we would send a notification to admin here
        console.warn('ADMIN ALERT: Account lockout triggered for Employee ID:', employeeId);
      }
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        apiUrl,
        user,
        clientName,
        login,
        logout,
        isLocked,
        failedAttempts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
