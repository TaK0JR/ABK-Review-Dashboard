import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  is_admin: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('abk_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    console.log('login() called with', email);

    try {
      // Special case: demo account
      if (email === 'demo@abk-review.com') {
        if (password === 'demo123') {
          console.log('Connexion en mode démo');
          const demoUser = {
            id: 'demo',
            email,
            full_name: 'Compte Démo',
            company_name: 'ABK Review',
            is_admin: false,
          };
          setUser(demoUser);
          localStorage.setItem('abk_user', JSON.stringify(demoUser));
          return { success: true, message: 'Connexion réussie (démo)' };
        } else {
          return { success: false, message: 'Mot de passe incorrect (démo)' };
        }
      }

      // Query the auth table directly
      console.log('Fetching user from Supabase...');
      const { data, error } = await supabase
        .from('auth')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { success: false, message: 'Email introuvable' };
      }

      // Verify password using the RPC function
      console.log('Vérification mot de passe via RPC...');
      const { data: verified, error: verifyError } = await supabase
        .rpc('verify_password', {
          input_password: password,
          hashed_password: data.password
        });

      if (verifyError) throw verifyError;

      if (!verified) {
        return { success: false, message: 'Mot de passe incorrect' };
      }

      // Create user object without password
      const userObject = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        company_name: data.company_name,
        is_admin: data.is_admin || false
      };

      console.log('Connexion réussie');
      setUser(userObject);
      localStorage.setItem('abk_user', JSON.stringify(userObject));

      return { success: true, message: 'Connexion réussie' };
    } catch (err) {
      console.error('Erreur de login:', err);
      return { success: false, message: 'Erreur serveur inattendue' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('abk_user');
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};