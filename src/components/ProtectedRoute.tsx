import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: React.ReactElement; // The component to render if authenticated
  redirectTo?: string; // Optional redirect path if not authenticated
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, loading } = useAuth(); // Assuming you have a useAuth hook
  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking auth
  }
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return element;
  }
  // If authenticated, render the protected component
  // You can use a library like react-router-dom to handle redirection
  // For example, using Navigate from react-router-dom:
  return <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
