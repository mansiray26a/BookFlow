import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  registerStudent: (data: any) => Promise<void>;
  registerFaculty: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('bookflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res: any = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load authenticated user:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res: any = await api.post('/auth/login', { email, password: pass });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('bookflow_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const registerStudent = async (data: any) => {
    const res: any = await api.post('/auth/register/student', data);
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('bookflow_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const registerFaculty = async (data: any) => {
    const res: any = await api.post('/auth/register/faculty', data);
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('bookflow_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('bookflow_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerStudent, registerFaculty, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
