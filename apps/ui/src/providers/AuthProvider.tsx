'use client';

import { fetchUserInfoClient } from '@/requests/fetchUserInfoClient';
import { createContext, useContext, useEffect, useState } from 'react';
import { UserInfo } from 'schemas';

interface AuthContextValue {
  user: UserInfo | null;
  loading: boolean;
  setUser: (user: UserInfo | null) => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: UserInfo | null;
}

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(initialUser);
  const [loading, setLoading] = useState(true);

  const refetchUser = async () => {
    try {
      setLoading(true);
      const user = await fetchUserInfoClient();
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch ONCE
  useEffect(() => {
    refetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
