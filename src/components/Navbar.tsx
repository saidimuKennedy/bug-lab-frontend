// src/components/Navbar.tsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal"; // Import the Modal component
import LoginForm from "./LoginForm"; // Import the LoginForm component
import SignupForm from "./SignupForm"; // *** Import the SignupForm component ***

// Define the types of forms the auth modal can display
type AuthFormType = "login" | "signup";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // State to control the modal's open/closed state (Keep this)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false); // Renamed for clarity

  // *** NEW State to track which form is active in the modal ***
  const [authFormType, setAuthFormType] = useState<AuthFormType>("login"); // 'login' or 'signup'
  // *** End NEW State ***

  const { isAuthenticated, logout } = useAuth(); // Get isAuthenticated and logout function

  useEffect(() => {
    const handleScroll = (): void => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Function to open the auth modal and set the initial form type
  const openAuthModal = (type: AuthFormType = "login"): void => {
    setIsAuthModalOpen(true); // Open the modal
    setAuthFormType(type); // Set the desired form ('login' or 'signup')
    setMenuOpen(false); // Close mobile menu when opening modal
  };

  // Function to close the auth modal
  const closeAuthModal = (): void => {
    setIsAuthModalOpen(false);
    // Optional: Reset form type to login when closing
    // setAuthFormType('login');
  };

  // Function to switch the form type within the modal
  const switchAuthForm = (type: AuthFormType): void => {
    setAuthFormType(type);
  };

  // Function to handle actions after successful login/signup (e.g., close modal)
  // This function will be passed as a prop to the LoginForm and SignupForm
  const handleAuthSuccess = (): void => {
    closeAuthModal();
    // AuthContext and ProtectedRoute handle redirection after login/signup
    // No explicit navigate needed here just to close the modal
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout(); // Call the logout function from AuthContext
      setMenuOpen(false); // Close mobile menu after logout
      // No explicit navigate needed here if Logout also clears auth state causing ProtectedRoute to redirect
      // If logout doesn't automatically redirect via ProtectedRoute, add navigate('/login')
    } catch (error) {
      console.error("Logout failed", error);
      // AuthContext logout should handle showing a toast
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <NavLink
          to="/"
          className="navbar-logo"
          onClick={() => setMenuOpen(false)}
        >
          <span className="logo-icon">🐞</span>
          <span className="logo-text">Bug Lab</span>
        </NavLink>

        <div
          className={`mobile-icon ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <li className="nav-item">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
          </li>

          {/* Conditionally render Bugs and Scientists links only if authenticated */}
          {isAuthenticated && (
            <>
              <li className="nav-item">
                <NavLink
                  to="/bugs"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Bugs
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/scientists"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  Scientists
                </NavLink>
              </li>
            </>
          )}

          {/* Conditionally render Login/Signup or Logout based on authentication status */}
          {isAuthenticated ? (
            // If authenticated, show Logout button
            <li className="nav-item">
              <button
                className="nav-link"
                onClick={handleLogout}
                style={{
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
              >
                Logout
              </button>
            </li>
          ) : (
            // If not authenticated, show Login button that OPENS THE MODAL
            <li className="nav-item">
              {/* This button now opens the modal, defaulting to the login form */}
              <button
                className="nav-link"
                onClick={() => openAuthModal("login")} // Explicitly open login form
                style={{
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
              >
                Login
              </button>
            </li>
          )}

          {/* Optional: Add a Signup button/link here if not authenticated that opens the modal to the signup form */}
          {/* You could also have the Login modal itself contain the "Switch to Signup" link */}
          {/* {!isAuthenticated && (
               <li className="nav-item">
                   <button
                     className="nav-link"
                     onClick={() => openAuthModal('signup')} // Explicitly open signup form
                     style={{ cursor: "pointer", background: "none", border: "none", padding: 0, margin: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
                   >
                     Signup
                   </button>
               </li>
           )} */}
        </ul>
      </div>

      {/*
         Render the Modal component here.
         It's hidden by default (isOpen={false}).
         It will open when openAuthModal sets isAuthModalOpen to true.
      */}
      <Modal
        isOpen={isAuthModalOpen} // Control open state with isAuthModalOpen
        onClose={closeAuthModal} // Provide the function to close the modal
      >
        {/* *** Conditionally render LoginForm or SignupForm based on authFormType *** */}
        {authFormType === "login" ? (
          <LoginForm
            onSuccess={handleAuthSuccess} // Close modal on success
            onSwitchToSignup={() => switchAuthForm("signup")} // Pass function to switch form
          />
        ) : (
          // authFormType === 'signup'
          <SignupForm
            onSuccess={handleAuthSuccess} // Close modal on success
            onSwitchToLogin={() => switchAuthForm("login")} // Pass function to switch form
          />
        )}
        {/* *** End Conditional Rendering *** */}
      </Modal>
    </nav>
  );
};

export default Navbar;
