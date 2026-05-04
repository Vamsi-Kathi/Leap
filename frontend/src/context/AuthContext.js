import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { token, id, email: userEmail, fullName, role } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id, email: userEmail, fullName, role }));
    setUser({ id, email: userEmail, fullName, role });
    
    return response.data;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { token, id, email: userEmail, fullName, role } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id, email: userEmail, fullName, role }));
    setUser({ id, email: userEmail, fullName, role });
    
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
