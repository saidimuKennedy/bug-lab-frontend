// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import useToast from "../hooks/useToast"; // Assuming useToast is needed here
import { apiFetch } from "../config/api"; // Your typed API utility
import { endpoints } from "../config/api"; // Your typed endpoints

// 1. Define the type for the User data you expect from the backend
// This should match the structure returned by your backend's user info endpoint (/auth/me or successful login/signup)
interface User {
  id: string | number; // Use string or number based on your backend ID type
  name: string; // Assuming user has a name (from scientist profile)
  email: string;
  // Add other user properties if your backend provides them
}

// 2. Define the type for the login credentials (Keep this)
export interface LoginCredentials {
  email: string;
  password: string;
}

// 3. Define the type for the signup credentials (NEW)
export interface SignupCredentials {
    name: string; // Assuming signup requires a name
    email: string;
    password: string;
    // Add other fields if your signup form/API expects them
}


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  // *** NEW: Add the signup function to the context type ***
  signup: (credentials: SignupCredentials) => Promise<void>;
  // Add functions for social login redirects here later if needed
}

// 4. Create the Context with a default value (Keep this)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 5. Create the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {  showToast } = useToast(); // Assuming useToast is needed here

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // 6. Check for an existing session when the app loads (Keep this)
  useEffect(() => {
    const checkSession = async () => {
      try {
        // This calls your backend's /auth/me endpoint
        const currentUser = await apiFetch<User>(
          endpoints.currentUser || "/auth/me" // Use your actual endpoint
        );
        setUser(currentUser);
        setError(null);
      } catch (err: unknown) {
        console.error("Initial session check failed:", err);
        setUser(null);
        // setError("Failed to verify session."); // Optional: set a specific error
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []); // Empty dependency array means this runs only once on mount

  // 7. Implement login function (credential login example) (Keep this)
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Calls your backend's /auth/login endpoint
      const loggedInUser = await apiFetch<User>(
        endpoints.login || "/auth/login", // Use your actual endpoint
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

   // 8. Implement logout function (Keep this)
  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Calls your backend's /auth/logout endpoint
      await apiFetch(endpoints.logout || "/auth/logout", {
        method: "POST", // Or DELETE
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


  // *** NEW: Implement the signup function ***
  const signup = async (credentials: SignupCredentials): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
           // Calls your backend's /auth/register endpoint
           const newUser = await apiFetch<User>( // Assuming backend returns User object on success
             endpoints.register || "/auth/register", // Use your actual endpoint
             {
               method: "POST",
               body: JSON.stringify(credentials),
             }
           );

           // Optionally log the user in automatically after successful signup
           // This depends on your backend's behavior (does it set a session/token?)
           // If backend sets session/token and /auth/me works, the useEffect might pick it up
           // Or you might explicitly set the user state here:
           setUser(newUser); // Assuming backend returns the new user data

           showToast("Signed up successfully!");

      } catch (err: unknown) {
          console.error("Signup failed:", err);
          setUser(null); // Ensure user is null on failure
          // Refine error message based on backend response if possible
          setError("Signup failed. Please try again.");
          showToast("Signup failed.");
          throw err; // Re-throw so components can handle
      } finally {
          setLoading(false);
      }
  };
  // *** END NEW signup function ***


  // 9. Provide the context value to children (Keep this)
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    signup, // *** Include the new signup function in the context value ***
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// 10. Create a custom hook to easily consume the AuthContext (Keep this)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

