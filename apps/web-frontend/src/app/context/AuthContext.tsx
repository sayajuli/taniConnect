// apps/web-frontend/app/context/AuthContext.tsx
'use client';

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { getCart } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthLoading: boolean;
  cartItemCount: number;
  updateCartCount: (count: number) => void;
  fetchCartCount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    const currentToken = localStorage.getItem('authToken');
    if (currentToken) {
      try {
        const cartData = await getCart(currentToken);
        setCartItemCount(cartData.items?.length || 0);
      } catch (error) {
        console.error("Gagal mengambil jumlah keranjang:", error);
        setCartItemCount(0);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        if (parsedUser.role === 'buyer') {
          fetchCartCount();
        }
      }
    } catch (error) {
      console.error("Gagal memuat sesi dari localStorage", error);
    } finally {
      setIsAuthLoading(false);
    }
  }, [fetchCartCount]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    if (userData.role === 'buyer') {
      fetchCartCount();
    } else {
      setCartItemCount(0);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCartItemCount(0);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const updateCartCount = (count: number) => {
    setCartItemCount(count);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthLoading, cartItemCount, updateCartCount, fetchCartCount }}>
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
