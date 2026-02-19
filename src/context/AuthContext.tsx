import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'faculty' | 'admin';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole, email?: string) => {
    // Mock login logic
    const mockUsers: Record<UserRole, User> = {
      student: { id: 1, name: 'John Student', email: email || 'student@campus.edu', role: 'student' },
      faculty: { id: 2, name: 'Dr. Faculty', email: email || 'faculty@campus.edu', role: 'faculty' },
      admin: { id: 3, name: 'System Admin', email: email || 'admin@campus.edu', role: 'admin' },
    };
    setUser(mockUsers[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
