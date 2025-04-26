import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getStoredUsers, getUserByIdentifier, storeUser, setCurrentUser, clearCurrentUser, getCurrentUser } from '../utils/storageUtils';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (user: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  isNewUser: (identifier: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Load user from localStorage on initial load
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    const user = getUserByIdentifier(identifier);
    
    if (user && user.password === password) {
      setUser(user);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  const signup = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    const users = getStoredUsers();
    const userExists = users.some(u => u.email === userData.email || u.meterNo === userData.meterNo);
    
    if (userExists) {
      return false;
    }
    
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    
    storeUser(newUser);
    setUser(newUser);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    
    return true;
  };

  const logout = () => {
    setUser(null);
    clearCurrentUser();
    setIsAuthenticated(false);
  };

  const isNewUser = (identifier: string): boolean => {
    const users = getStoredUsers();
    return !users.some(u => u.email === identifier || u.meterNo === identifier);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      login, 
      signup, 
      logout,
      isNewUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};