// src/hooks/useAuth.tsx
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/config/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (!cancelled) setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
          console.log('AuthProvider: no token found');
          if (!cancelled) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        // Ensure axios has the header (in case interceptor hasn't run yet)
        try {
          if (api.defaults) {
            api.defaults.headers = api.defaults.headers || {};
            // @ts-ignore - runtime assignment for header object
            api.defaults.headers.common = api.defaults.headers.common || {};
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        } catch (err) {
          console.warn('AuthProvider: could not set api.defaults header', err);
        }

        console.log('AuthProvider: calling /auth/me with token length', token.length);

        const res = await api.get('/auth/me');
        const backendUser = res?.data?.data?.user;
        console.log('AuthProvider: /auth/me response ->', res?.data);

        if (backendUser && !cancelled) {
          const mapped: User = {
            id: String(backendUser.id),
            email: backendUser.email,
            fullName: backendUser.fullName ?? (backendUser.full_name as string) ?? '',
            role: backendUser.role ?? 'user',
          };
          setUser(mapped);
          console.log('AuthProvider: mapped user set ->', mapped);
        } else {
          if (!cancelled) {
            console.log('AuthProvider: no user in response, clearing token');
            try {
              if (typeof window !== 'undefined') localStorage.removeItem('token');
            } catch (e) { /* ignore */ }
            setUser(null);
          }
        }
      } catch (err) {
        console.error('AuthProvider: error during /auth/me', err);
        if (!cancelled) {
          try {
            if (typeof window !== 'undefined') localStorage.removeItem('token');
          } catch (e) { /* ignore */ }
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
        console.log('AuthProvider: loading finished');
      }
    };

    // run on mount
    checkAuth();

    // event listeners to re-check auth across tabs and within same tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        console.log('AuthProvider: storage event token changed', e);
        checkAuth();
      }
    };
    const onAuthChanged = () => {
      console.log('AuthProvider: authChanged event received, re-checking auth');
      checkAuth();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
      window.addEventListener('authChanged', onAuthChanged);
    }

    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('authChanged', onAuthChanged);
      }
    };
  }, []);

  const signOut = async () => {
    try {
      // best-effort notify server
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error (server):', error);
    } finally {
      try {
        if (typeof window !== 'undefined') localStorage.removeItem('token');
      } catch (e) {
        // ignore localStorage errors
      }

      // notify provider and other tabs immediately
      try {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('authChanged'));
      } catch (e) {
        // ignore
      }

      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
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
