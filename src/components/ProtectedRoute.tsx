import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  element: React.ReactElement;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log(
      "ProtectedRoute: Not authenticated, redirecting to",
      redirectTo
    );
    return <Navigate to={redirectTo} replace />;
  }

  console.log("ProtectedRoute: Authenticated, rendering element");
  return element;
};

export default ProtectedRoute;
