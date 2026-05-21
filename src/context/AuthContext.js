import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, isLoggedIn } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn()) {
      setUser({
        token: localStorage.getItem('token'),
        email: localStorage.getItem('email'),
        fullName: localStorage.getItem('fullName'),
        role: localStorage.getItem('role')
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    setUser({
      token: data.token,
      email: data.email,
      fullName: data.user?.fullName || localStorage.getItem('fullName'),
      role: data.user?.role || localStorage.getItem('role')
    });
    return data;
  };

  const register = async (payload) => {
    const data = await apiRegister(payload);
    setUser({
      token: data.token,
      email: data.email,
      fullName: data.user?.fullName || payload.fullName,
      role: data.user?.role || 'USER'
    });
    return data;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
