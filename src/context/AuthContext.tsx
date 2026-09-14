import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getToken, setToken, removeToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<User>;
  signup: (userData: any) => Promise<User>;
  loginWithOtp: (data: { mobile_number: string; otp: string }) => Promise<User>;
  signupWithOtp: (data: { mobile_number: string; otp: string; full_name?: string }) => Promise<User>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isSuperAdmin: boolean;
  isContentManager: boolean;
  isBusinessModerator: boolean;
  isBusinessOwner: boolean;
  isTourist: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            removeToken();
            setTokenState(null);
          }
        } catch {
          removeToken();
          setTokenState(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any): Promise<User> => {
    const res = await api.login(credentials);
    if (res.success && res.token) {
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const signup = async (userData: any): Promise<User> => {
    const res = await api.signup(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Signup failed');
  };

  const loginWithOtp = async (data: { mobile_number: string; otp: string }): Promise<User> => {
    const res = await api.verifyOtp({ ...data, purpose: 'LOGIN' });
    if (res.success && res.token) {
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'OTP login failed');
  };

  const signupWithOtp = async (data: { mobile_number: string; otp: string; full_name?: string }): Promise<User> => {
    const res = await api.verifyOtp({ ...data, purpose: 'SIGNUP' });
    if (res.success && res.token) {
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'OTP registration failed');
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch {
      // ignore
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isContentManager = user?.role === 'CONTENT_MANAGER' || isSuperAdmin;
  const isBusinessModerator = user?.role === 'BUSINESS_MODERATOR' || isSuperAdmin;
  const isBusinessOwner = user?.role === 'BUSINESS_OWNER';
  const isTourist = user?.role === 'TOURIST' || !user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        loginWithOtp,
        signupWithOtp,
        refreshUser,
        logout,
        updateUser,
        isSuperAdmin,
        isContentManager,
        isBusinessModerator,
        isBusinessOwner,
        isTourist,
      }}
    >

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
