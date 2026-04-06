/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading] = useState(false);

  const persistUser = (nextUser) => {
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  // Login
  const login = (userData, tokenValue) => {
    localStorage.setItem("token", tokenValue);
    persistUser(userData);
    setToken(tokenValue);
  };

  // Keep current auth session but refresh user fields (e.g., role/status/profile updates)
  const updateUser = (partialUser) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = {
        ...prev,
        ...(partialUser || {}),
      };
      localStorage.setItem("user", JSON.stringify(merged));
      return merged;
    });
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};
