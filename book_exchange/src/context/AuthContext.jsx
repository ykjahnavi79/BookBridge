import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

// Preset accounts available in BookBridge
export const EXISTING_ACCOUNTS = [
  {
    role: "admin",
    roleLabel: "Administrator",
    name: "Platform Administrator",
    email: "admin@bookbridge.com",
    password: "admin123",
    description: "Full access to Administrator Dashboard & platform governance"
  },
  {
    role: "user",
    roleLabel: "Community Reader",
    name: "Priya Sharma",
    email: "priya@example.com",
    password: "user123",
    description: "Active reader with book listings and exchange proposals"
  },
  {
    role: "user",
    roleLabel: "Community Reader",
    name: "Arjun Mehta",
    email: "arjun@example.com",
    password: "user123",
    description: "Computer science student swapping engineering textbooks"
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("bookbridge_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("bookbridge_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("bookbridge_user");
    }
  }, [currentUser]);

  // LOGIN
  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      const response = await API.post("/auth/login", { email: cleanEmail, password });
      setCurrentUser(response.data.user);
      return { success: true };
    } catch (err) {
      // If backend responded with explicit 401 or 403 error
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Also check if user was registered locally in localStorage
        const localUsers = JSON.parse(localStorage.getItem("bookbridge_local_users") || "[]");
        const foundLocal = localUsers.find(u => u.email === cleanEmail);
        if (foundLocal && foundLocal.password === password) {
          setCurrentUser(foundLocal);
          return { success: true };
        }
        return {
          success: false,
          message: err.response?.data?.message || "Invalid email or password."
        };
      }

      // Backend offline / network fallback:
      // 1. Check preset accounts
      const presetMatch = EXISTING_ACCOUNTS.find(a => a.email.toLowerCase() === cleanEmail);
      if (presetMatch) {
        if (presetMatch.password === password) {
          const userSession = {
            id: "user-" + cleanEmail.replace(/[^a-z0-9]/g, ""),
            name: presetMatch.name,
            email: presetMatch.email,
            role: presetMatch.role,
            status: "active"
          };
          setCurrentUser(userSession);
          return { success: true };
        } else {
          return { success: false, message: "Invalid email or password." };
        }
      }

      // 2. Check local registered users in localStorage
      const localUsers = JSON.parse(localStorage.getItem("bookbridge_local_users") || "[]");
      const found = localUsers.find(u => u.email === cleanEmail);
      if (found) {
        if (found.password === password) {
          setCurrentUser(found);
          return { success: true };
        } else {
          return { success: false, message: "Invalid email or password." };
        }
      }

      return {
        success: false,
        message: err.response?.data?.message || "Invalid email or password."
      };
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const register = async (userData) => {
    setLoading(true);
    const cleanEmail = userData.email.toLowerCase().trim();

    try {
      const response = await API.post("/auth/register", {
        ...userData,
        email: cleanEmail
      });
      setCurrentUser(response.data.user);

      // Also save locally
      const localUsers = JSON.parse(localStorage.getItem("bookbridge_local_users") || "[]");
      const updated = localUsers.filter(u => u.email !== cleanEmail);
      updated.push({
        ...response.data.user,
        password: userData.password
      });
      localStorage.setItem("bookbridge_local_users", JSON.stringify(updated));

      return { success: true };
    } catch (err) {
      // If backend gave a validation or duplicate email error, return that error
      if (err.response?.data?.message) {
        return {
          success: false,
          message: err.response.data.message
        };
      }

      // If backend is offline or network error, complete registration locally!
      console.log("Backend offline, completing registration locally:", cleanEmail);
      const localUsers = JSON.parse(localStorage.getItem("bookbridge_local_users") || "[]");
      const exists = localUsers.find(u => u.email === cleanEmail) || EXISTING_ACCOUNTS.find(a => a.email.toLowerCase() === cleanEmail);
      if (exists) {
        return {
          success: false,
          message: "An account with this email already exists."
        };
      }

      const role = userData.role || (cleanEmail.includes("admin") ? "admin" : "user");
      const newUser = {
        id: "user-" + Date.now(),
        name: userData.name.trim(),
        email: cleanEmail,
        password: userData.password,
        role,
        location: userData.location || "",
        status: "active",
        createdAt: new Date().toISOString()
      };

      localUsers.push(newUser);
      localStorage.setItem("bookbridge_local_users", JSON.stringify(localUsers));
      setCurrentUser(newUser);

      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("bookbridge_user");
  };

  // UPDATE PROFILE
  const updateProfile = async (updates) => {
    if (!currentUser) return;
    try {
      if (currentUser.id && !currentUser.id.includes("demo") && !currentUser.id.includes("user-")) {
        const response = await API.put(`/auth/users/${currentUser.id}`, updates);
        setCurrentUser(response.data.user);
      } else {
        setCurrentUser((prev) => ({ ...prev, ...updates }));
      }
      return { success: true };
    } catch {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
      return { success: true };
    }
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
