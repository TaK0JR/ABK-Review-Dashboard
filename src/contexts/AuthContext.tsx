import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  full_name: string | null;
  company_name: string | null;
  is_admin: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// URL de l'API - À adapter selon votre configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/backend/api';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const storedToken = localStorage.getItem('abk_token');
    const storedUser = localStorage.getItem('abk_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Sauvegarder le token et l'utilisateur
        localStorage.setItem('abk_token', data.token);
        localStorage.setItem('abk_user', JSON.stringify(data.user));
        
        setToken(data.token);
        setUser(data.user);
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Nettoyer le localStorage
    localStorage.removeItem('abk_token');
    localStorage.removeItem('abk_user');
    
    // Réinitialiser l'état
    setUser(null);
    setToken(null);
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};