import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create a context for authentication state management
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // State to store user data and loading status
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize authentication state from localStorage on component mount
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    console.log("AuthContext - Stored user data:", storedUser);

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      console.log("AuthContext - Parsed user:", parsedUser);
      setUser(parsedUser);
      // Configure axios to include authentication token in all requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Handle user login: store user data and token, setup axios headers
  const login = (userData, token) => {
    console.log("AuthContext - Login with data:", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // Handle user logout: clear user data, token, and axios headers
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  // Update user data in state and localStorage
  const updateUser = (userData) => {
    console.log("AuthContext - Updating user with:", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Prepare context value with authentication methods and state
  const value = {
    user, // Current user data
    login, // Function to handle user login
    logout, // Function to handle user logout
    loading, // Loading state during authentication check
    updateUser, // Function to update user data
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only after initial authentication check */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to access authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
