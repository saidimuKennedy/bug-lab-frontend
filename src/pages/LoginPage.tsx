// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
// You might want a CSS module for styling the login page layout
// import styles from './LoginPage.module.css';


const LoginPage: React.FC = () => {
  
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // If the user is already authenticated and we are not currently loading
  // (meaning the initial session check is complete), redirect them away
  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Redirect to the home page or another appropriate page after login
      navigate('/');
    }
    // This effect should re-run if isAuthenticated or loading state changes
  }, [isAuthenticated, loading, navigate]);


  // If we are still checking auth status, maybe show a loading indicator
  if (loading) {
      return <div className="loading">Checking authentication status...</div>;
  }

  // If not authenticated and not loading, render the login form
  return (
    <div className="login-page">
      {/* Render the LoginForm component here */}
      <LoginForm />
      {/* You could add a link to a signup page here later */}
      {/* <p>Don't have an account? <Link to="/signup">Sign up</Link></p> */}
    </div>
  );
};

export default LoginPage;