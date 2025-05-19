import React, { useEffect } from "react";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div className="loading">Checking authentication status...</div>;
  }

  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
