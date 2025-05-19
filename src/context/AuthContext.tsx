import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import useToast from "../hooks/useToast";
import { apiFetch } from "../config/api";
import { endpoints } from "../config/api";

interface User {
  id: string | number;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { showToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await apiFetch<User>(
          endpoints.currentUser || "/auth/me"
        );
        setUser(currentUser);
        setError(null);
      } catch (err: unknown) {
        console.error("Initial session check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await apiFetch<User>(
        endpoints.login || "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        }
      );
      setUser(loggedInUser);
      showToast("Logged in successfully!");
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setUser(null);
      setError("Login failed. Please check your credentials.");
      showToast("Login failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(endpoints.logout || "/auth/logout", {
        method: "POST",
      });
      setUser(null);
      showToast("Logged out successfully.");
    } catch (err: unknown) {
      console.error("Logout failed:", err);
      setError("Logout failed.");
      showToast("Logout failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await apiFetch<User>(
        endpoints.register || "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        }
      );
      setUser(newUser);
      showToast("Signed up successfully!");
    } catch (err: unknown) {
      console.error("Signup failed:", err);
      setUser(null);
      setError("Signup failed. Please try again.");
      showToast("Signup failed.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
