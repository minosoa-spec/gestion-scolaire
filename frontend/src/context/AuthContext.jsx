import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { setAuthData, getStoredUser, clearAuthData } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = async (username, password, rememberMe = false) => {
    const res = await axios.post(`${API_URL}auth/login/`, {
      username,
      password,
    });
    const { access, refresh, role, user_id } = res.data;
    const userData = { username, role, id: user_id };

    setAuthData({ access, refresh, user: userData, rememberMe });
    setUser(userData);
    return userData;
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);