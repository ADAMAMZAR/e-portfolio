import { createContext, useContext, useState } from "react";

const AuthContext = createContext({
  token: null,
  login: () => {},
  logout: () => {},
  isAdmin: false,
});

const TOKEN_KEY = "admin_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const login = (t) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAdmin: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
